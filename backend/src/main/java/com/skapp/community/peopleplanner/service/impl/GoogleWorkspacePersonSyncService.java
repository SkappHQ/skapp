package com.skapp.community.peopleplanner.service.impl;

import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.HttpRequestInitializer;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.directory.Directory;
import com.google.api.services.directory.DirectoryScopes;
import com.google.api.services.directory.model.Channel;
import com.google.api.services.directory.model.Group;
import com.google.api.services.directory.model.Groups;
import com.google.api.services.directory.model.Member;
import com.google.api.services.directory.model.Members;
import com.google.api.services.directory.model.Users;
import com.google.auth.http.HttpCredentialsAdapter;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.auth.oauth2.ServiceAccountCredentials;
import com.google.cloud.secretmanager.v1.AccessSecretVersionResponse;
import com.google.cloud.secretmanager.v1.SecretManagerServiceClient;
import com.google.cloud.secretmanager.v1.SecretVersionName;
import com.skapp.community.common.model.Organization;
import com.skapp.community.common.model.OrganizationConfig;
import com.skapp.community.common.model.User;
import com.skapp.community.common.repository.OrganizationConfigDao;
import com.skapp.community.common.repository.OrganizationDao;
import com.skapp.community.common.repository.UserDao;
import com.skapp.community.common.service.*;
import com.skapp.community.common.type.LoginMethod;
import com.skapp.community.common.type.OrganizationConfigType;
import com.skapp.community.common.util.CommonModuleUtils;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.EmployeeTeam;
import com.skapp.community.peopleplanner.model.Team;
import com.skapp.community.peopleplanner.payload.email.PeopleEmailDynamicFields;
import com.skapp.community.peopleplanner.repository.*;
import com.skapp.community.peopleplanner.service.ExternalPersonSyncService;
import com.skapp.community.peopleplanner.service.PeopleEmailService;
import com.skapp.community.peopleplanner.service.RolesService;
import com.skapp.community.peopleplanner.type.AccountStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.skapp.community.common.service.NotificationService;
import com.skapp.community.common.type.EmailBodyTemplates;
import com.skapp.community.common.type.NotificationCategory;
import com.skapp.community.common.type.NotificationType;
import com.skapp.community.peopleplanner.model.EmployeeRole;
import org.springframework.transaction.annotation.Transactional;


import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@Qualifier("google")
@ConditionalOnProperty(prefix = "external-sync", name = "provider", havingValue = "google", matchIfMissing = true)
@RequiredArgsConstructor
public class GoogleWorkspacePersonSyncService implements ExternalPersonSyncService {

    private static final String WATCH_HANDSHAKE_STATE = "sync";
    private static final String WEBHOOK_CHANNEL_TYPE = "web_hook";
    private static final String WORKSPACE_CUSTOMER_ALIAS = "my_customer";
    // FIX: thumbnailPhotoUrl added to fields mask so getThumbnailPhotoUrl()
    // returns a value — without it Google strips the field from the response.
    private static final String DIRECTORY_LIST_FIELDS = "users(id,name,primaryEmail,suspended,etag,thumbnailPhotoUrl),nextPageToken";
    private static final String SECRET_LATEST_VERSION = "latest";
    private static final String APPLICATION_NAME = "skapp-integration-poc";
    private final NotificationService notificationService;
    private final GoogleWorkspaceConnectionDao connectionDao;


    private static final Duration WATCH_RENEWAL_THRESHOLD = Duration.ofHours(48);
    private static final int MAX_BACKOFF_SECONDS = 32;
    private static final int BACKOFF_JITTER_BOUND_MS = 1000;
    private static final int HTTP_TOO_MANY_REQUESTS = 429;
    private static final int HTTP_FORBIDDEN = 403;
    private volatile Instant lastSyncCompletedAt = null;
    private static final Duration SYNC_DEBOUNCE_WINDOW = Duration.ofSeconds(30);

    @Value("${google.project-id:}")
    private String projectId;

    @Value("${google.secret-name:}")
    private String secretName;

    @Value("${google.admin-email:}")
    private String adminEmail;

    @Value("${google.max-results:500}")
    private int maxResults;

    @Value("${google.max-backoff-attempts:5}")
    private int maxBackoffAttempts;

    @Value("${google.credentials-path:}")
    private String credentialsPath;

    @Value("${google.webhook-url:}")
    private String webhookUrl;

    @Value("${google.channel-token:}")
    private String channelToken;

    @Value("${domain.base}")
    private String baseDomain;

    @Value("${domain.scheme:https}")
    private String domainScheme;

    private final EmailService emailService;
    private final OrganizationDao organizationDao;
    private final UserDao userDao;
    private final EmployeeDao employeeDao;
    private final AsyncEmailSender asyncEmailSender;
    private final PeopleEmailService peopleEmailService;
    private final EncryptionDecryptionService encryptionDecryptionService;
    private final PasswordEncoder passwordEncoder;
    private final RolesService rolesService;
    private final OrganizationConfigDao organizationConfigDao;
    private final PushNotificationService pushNotificationService;
    private final EmployeeRoleDao employeeRoleDao;
    private final TeamDao teamDao;
    private final EmployeeTeamDao employeeTeamDao;

    private Directory directoryService;
    private volatile Long channelExpiration;

    // isConfigured() — returns false when required Google env vars are absent.
    // Allows the app to start without crashing when integration is not configured.
    private boolean isConfigured() {
        boolean configured = adminEmail != null && !adminEmail.isBlank()
                && webhookUrl != null && !webhookUrl.isBlank()
                && ((credentialsPath != null && !credentialsPath.isBlank())
                || (projectId != null && !projectId.isBlank()
                && secretName != null && !secretName.isBlank()));
        if (!configured) {
            log.warn("Google Workspace integration is not configured — skipping.");
        }
        return configured;
    }

    // -------------------------------------------------------------------------
    // authenticate() — local file (dev) or Secret Manager (prod) → Directory
    // -------------------------------------------------------------------------
    // Inject this alongside your existing dependencies
    private final GoogleWorkspaceOAuthService oAuthService;

    @Override
    public void authenticate() throws Exception {
        // No role check here — authenticate() is called internally by the sync engine
        // and also runs at startup. Role guard is enforced at the controller level only.

        String accessToken = oAuthService.getValidAccessToken();

        HttpRequestInitializer requestInit = request ->
                request.getHeaders().setAuthorization("Bearer " + accessToken);

        directoryService = new Directory.Builder(
                GoogleNetHttpTransport.newTrustedTransport(),
                GsonFactory.getDefaultInstance(),
                requestInit)
                .setApplicationName(APPLICATION_NAME)
                .build();

        log.info("Authentication successful via OAuth 2.0 token.");
    }

    // -------------------------------------------------------------------------
    // registerWatch() — subscribe to push notifications for user changes
    // -------------------------------------------------------------------------
    @Override
    public void registerWatch() throws Exception {
        if (!isConfigured()) { return; }
        if (directoryService == null) {
            authenticate();
        }

        Channel channel = new Channel()
                .setId(UUID.randomUUID().toString())
                .setType(WEBHOOK_CHANNEL_TYPE)
                .setAddress(webhookUrl);

        if (channelToken != null && !channelToken.isBlank()) {
            channel.setToken(channelToken);
        }

        Channel registered = directoryService.users()
                .watch(channel)
                .setCustomer(WORKSPACE_CUSTOMER_ALIAS)
                .execute();

        channelExpiration = registered.getExpiration();
        log.info("Watch registered. Channel ID: {}, expires at: {}",
                registered.getId(),
                channelExpiration != null ? Instant.ofEpochMilli(channelExpiration) : "unknown");
    }

    // -------------------------------------------------------------------------
    // renewWatchIfExpiring() — re-register the watch if it expires within 48 h
    // -------------------------------------------------------------------------
    @Override
    public void renewWatchIfExpiring() throws Exception {
        if (!isConfigured()) { return; }
        if (channelExpiration == null) {
            log.info("No active watch channel found — registering...");
            registerWatch();
            return;
        }

        Instant expiresAt = Instant.ofEpochMilli(channelExpiration);
        Duration timeUntilExpiry = Duration.between(Instant.now(), expiresAt);

        if (timeUntilExpiry.compareTo(WATCH_RENEWAL_THRESHOLD) < 0) {
            log.info("Watch channel expires in {}h — renewing...", timeUntilExpiry.toHours());
            registerWatch();
        } else {
            log.debug("Watch channel still valid. Expires at: {}", expiresAt);
        }
    }

    // -------------------------------------------------------------------------
    // isValidChannelToken() — verify the X-Goog-Channel-Token on incoming
    // webhook calls matches the token we registered the watch channel with.
    // If no token is configured, validation is skipped (treated as disabled).
    // -------------------------------------------------------------------------
    @Override
    public boolean isValidChannelToken(String token) {
        if (channelToken == null || channelToken.isBlank()) {
            return true;
        }
        return channelToken.equals(token);
    }

    // -------------------------------------------------------------------------
    // processWatchNotification() — handle a push notification from Google
    //
    // The watch is registered on the Users.list collection (setCustomer), not on
    // an individual user resource. Google's push notifications for a collection
    // watch only ever report resourceState "sync" (handshake) or "exists" (the
    // collection changed) — there is no per-user resourceUri to parse out, so we
    // can't know which user changed and must resync the whole directory.
    // -------------------------------------------------------------------------
    private static final Duration GOOGLE_PROPAGATION_DELAY = Duration.ofSeconds(10);

    @Override
    @Async("syncTaskExecutor")
    public void processWatchNotification(String resourceState, String resourceUri) {
        if (!isConfigured()) { return; }
        if (WATCH_HANDSHAKE_STATE.equals(resourceState)) {
            log.info("Watch sync handshake received — no action needed.");
            return;
        }

        synchronized (this) {
            Instant now = Instant.now();
            if (lastSyncCompletedAt != null
                    && Duration.between(lastSyncCompletedAt, now).compareTo(SYNC_DEBOUNCE_WINDOW) < 0) {
                log.info("Debounce active — suppressing duplicate sync.");
                return;
            }
            lastSyncCompletedAt = now;
        }

        String callerEmail = "sudam.manudith@rootcode.io";

        log.info("Watch notification ({}) received — waiting {}s for Google propagation before syncing.",
                resourceState, GOOGLE_PROPAGATION_DELAY.getSeconds());

        // ← KEY FIX: wait for Google's internal replication to finish
        try {
            Thread.sleep(GOOGLE_PROPAGATION_DELAY.toMillis());
        } catch (InterruptedException ie) {
            Thread.currentThread().interrupt();
            log.warn("Propagation delay interrupted — proceeding anyway.");
        }

        log.info("Propagation delay done — resyncing all users.");
        try {
            SyncResult result = performFullSync();
            log.info("Resync complete. Synced: {}, Failed: {}", result.synced(), result.failed());
            // All users+employees are persisted — now send invitation emails
            sendInviteEmailsToNewUsers(result.newUserEmails());

            sendSummaryEmail(asyncEmailSender, callerEmail,
                    result.synced(), result.failed(), result.failures(), null);
            notifySuperAdminsOfSyncResult(result.synced(), result.failed(), null);
            if (!result.removedUserEmails().isEmpty()) {
                notifySuperAdminsOfRemovedUsers(result.removedUserEmails());
            }
        } catch (Exception e) {
            log.error("Resync triggered by watch notification failed: {}", e.getMessage(), e);
            sendSummaryEmail(asyncEmailSender, callerEmail, 0, 0, new ArrayList<>(), e.getMessage());
            notifySuperAdminsOfSyncResult(0, 0, e.getMessage());
        }
    }

    // -------------------------------------------------------------------------
    // bulkSync() — async full sync of all users, then send summary email
    // -------------------------------------------------------------------------
    @Override
    @Async("syncTaskExecutor")
    public void bulkSync(String callerEmail) {
        if (!isConfigured()) {
            log.warn("bulkSync called but Google Workspace integration is not configured — skipping.");
            return;
        }
        log.info("bulkSync started for caller: {}", callerEmail);

        try {
            SyncResult result = performFullSync();
            log.info("Sync complete. Synced: {}, Failed: {}, New users: {}",
                    result.synced(), result.failed(), result.newUserEmails().size());

            sendInviteEmailsToNewUsers(result.newUserEmails());
            sendSummaryEmail(asyncEmailSender, callerEmail,
                    result.synced(), result.failed(), result.failures(), null);
            notifySuperAdminsOfSyncResult(result.synced(), result.failed(), null);
            if (!result.removedUserEmails().isEmpty()) {
                notifySuperAdminsOfRemovedUsers(result.removedUserEmails());
            }
        } catch (Exception e) {
            log.error("Sync failed: {}", e.getMessage(), e);
            sendSummaryEmail(asyncEmailSender, callerEmail, 0, 0, new ArrayList<>(), e.getMessage());
            notifySuperAdminsOfSyncResult(0, 0, e.getMessage());
        }
    }

    // -------------------------------------------------------------------------
    // notifySuperAdminsOfSyncResult() — builds the title/message for a sync
    // outcome and delegates to the shared notifySuperAdmins() default method
    // on the interface, so every integration reports the same way.
    // -------------------------------------------------------------------------
    private void notifySuperAdminsOfSyncResult(int synced, int failed, String fatalError) {
        String message = fatalError != null
                ? "Google Workspace sync failed: " + fatalError
                : "Google Workspace sync completed. Synced: " + synced + ", Failed: " + failed;

        List<EmployeeRole> superAdminRoles = employeeRoleDao.findByIsSuperAdminTrue();

        for (EmployeeRole role : superAdminRoles) {
            try {
                Employee employee = role.getEmployee();
                if (employee == null) continue;

                Map<String, String> dynamicFields = new HashMap<>();
                dynamicFields.put("message", message);

                notificationService.createNotification(
                        employee,
                        null,
                        NotificationType.EXTERNAL_SYNC_COMPLETED,
                        EmailBodyTemplates.PEOPLE_MODULE_EXTERNAL_SYNC_COMPLETED,
                        dynamicFields,
                        NotificationCategory.PEOPLE_SYNC
                );
            } catch (Exception e) {
                log.error("Failed to notify super admin: {}", e.getMessage());
            }
        }
    }

    // -------------------------------------------------------------------------
    // performFullSync() — paginate through all Workspace users and upsert them
    // -------------------------------------------------------------------------
    private SyncResult performFullSync() throws Exception {
        int totalSynced = 0;
        int totalFailed = 0;
        List<String> failures = new ArrayList<>();
        Set<String> googleEmails = new HashSet<>();
        List<String> newUserEmails = new ArrayList<>();

        authenticate();

        String pageToken = null;

        do {
            Users result = fetchPageWithBackoff(pageToken, 0);
            var users = result.getUsers();

            if (users == null || users.isEmpty()) break;

            for (var wsUser : users) {
                try {
                    String email = wsUser.getPrimaryEmail();
                    Boolean suspended = wsUser.getSuspended();

                    List<String> missing = new ArrayList<>();
                    if (email == null) missing.add("primaryEmail");
                    if (suspended == null) missing.add("suspended");

                    if (!missing.isEmpty()) {
                        String msg = "User " + email + " missing fields: " + missing;
                        log.warn(msg);
                        failures.add(msg);
                        totalFailed++;
                        continue;
                    }

                    googleEmails.add(email);
                    boolean isNew = upsertUser(wsUser);
                    totalSynced++;
                    log.debug("Synced: <{}>", email);
                    if (isNew) {
                        newUserEmails.add(email);
                        log.debug("New user queued for invite: <{}>", email);
                    }
                } catch (Exception e) {
                    String msg = "Failed to persist user: " + wsUser.getPrimaryEmail()
                            + " — " + e.getMessage();
                    log.error(msg, e);
                    failures.add(msg);
                    totalFailed++;
                }
            }

            pageToken = result.getNextPageToken();
            log.info("Page processed. Next token: {}", pageToken != null ? "present" : "none");

        } while (pageToken != null);

        List<String> removedUserEmails = deactivateUsersMissingFrom(googleEmails);

        // ── Phase 2: sync Google groups → Skapp teams ────────────────────────
        // Runs after all users are committed so every member email resolves
        // to an existing Employee row.
        try {
            syncGroupsToTeams();
        } catch (Exception e) {
            String msg = "Group→Team sync failed: " + e.getMessage();
            log.error(msg, e);
            failures.add(msg);
            totalFailed++;
        }

        return new SyncResult(totalSynced, totalFailed, failures, newUserEmails, removedUserEmails);
    }

    // -------------------------------------------------------------------------
    // syncGroupsToTeams() — maps each Google group to a Skapp Team and keeps
    // memberships in sync.
    //
    // Strategy per group:
    //   1. Find or create a Team whose name matches the Google group name.
    //   2. Fetch current EmployeeTeam rows for that team.
    //   3. For each group member whose email exists as an Employee in Skapp,
    //      add an EmployeeTeam row if one doesn't already exist.
    //   4. Remove EmployeeTeam rows for members who are no longer in the group.
    //
    // Groups API requires setCustomer("my_customer") — omitting it causes a
    // 400 Bad Request. Members are fetched per group using the group email.
    // -------------------------------------------------------------------------
    private void syncGroupsToTeams() throws Exception {
        log.info("syncGroupsToTeams: starting group→team sync");

        String groupPageToken = null;
        int teamsCreated = 0;
        int membersAdded = 0;
        int membersRemoved = 0;

        do {
            // FIX: must pass setCustomer() — omitting it causes 400 Bad Request
            Groups groupsPage = directoryService.groups()
                    .list()
                    .setCustomer(WORKSPACE_CUSTOMER_ALIAS)
                    .setMaxResults(200)
                    .setPageToken(groupPageToken)
                    .execute();

            List<Group> groups = groupsPage.getGroups();
            if (groups == null || groups.isEmpty()) break;

            for (Group group : groups) {
                try {
                    String groupName  = group.getName();
                    String groupEmail = group.getEmail();
                    log.info("syncGroupsToTeams: processing group '{}' ({})", groupName, groupEmail);

                    // 1. Find or create the Skapp Team
                    Team team = teamDao.findByTeamNameAndIsActiveTrue(groupName)
                            .orElseGet(() -> {
                                Team t = new Team();
                                t.setTeamName(groupName);
                                t.setActive(true);
                                return teamDao.save(t);
                            });

                    if (team.getTeamId() == null) {
                        // freshly saved — force flush to get DB-generated ID
                        team = teamDao.saveAndFlush(team);
                        teamsCreated++;
                        log.info("syncGroupsToTeams: created team '{}'", groupName);
                    }

                    // 2. Collect emails of current Google group members
                    Set<String> memberEmails = fetchGroupMemberEmails(groupEmail);

                    // 3. Existing EmployeeTeam rows for this team
                    List<EmployeeTeam> existingMemberships =
                            employeeTeamDao.findEmployeeTeamsByTeam(team);

                    Set<String> alreadyMapped = new HashSet<>();
                    List<Long> toRemove = new ArrayList<>();

                    for (EmployeeTeam et : existingMemberships) {
                        String empEmail = et.getEmployee() != null
                                && et.getEmployee().getUser() != null
                                ? et.getEmployee().getUser().getEmail()
                                : null;

                        if (empEmail != null && memberEmails.contains(empEmail)) {
                            // still a member — keep
                            alreadyMapped.add(empEmail);
                        } else {
                            // no longer in the group — remove
                            toRemove.add(et.getId());
                        }
                    }

                    if (!toRemove.isEmpty()) {
                        employeeTeamDao.deleteAllByIdIn(toRemove);
                        membersRemoved += toRemove.size();
                        log.info("syncGroupsToTeams: removed {} stale member(s) from team '{}'",
                                toRemove.size(), groupName);
                    }

                    // 4. Add new members
                    for (String memberEmail : memberEmails) {
                        if (alreadyMapped.contains(memberEmail)) continue;

                        Employee employee = employeeDao.findEmployeeByEmail(memberEmail);
                        if (employee == null) {
                            log.debug("syncGroupsToTeams: skipping {} — not a Skapp employee", memberEmail);
                            continue;
                        }

                        EmployeeTeam et = new EmployeeTeam();
                        et.setTeam(team);
                        et.setEmployee(employee);
                        et.setIsSupervisor(false);
                        employeeTeamDao.save(et);
                        membersAdded++;
                        log.debug("syncGroupsToTeams: added {} to team '{}'", memberEmail, groupName);
                    }

                } catch (Exception e) {
                    log.error("syncGroupsToTeams: failed to process group '{}': {}",
                            group.getName(), e.getMessage(), e);
                }
            }

            groupPageToken = groupsPage.getNextPageToken();

        } while (groupPageToken != null);

        log.info("syncGroupsToTeams: done. Teams created: {}, Members added: {}, Members removed: {}",
                teamsCreated, membersAdded, membersRemoved);
    }

    // -------------------------------------------------------------------------
    // fetchGroupMemberEmails() — returns all member emails for a given group,
    // handling pagination. Uses group email as the key (not group ID).
    // -------------------------------------------------------------------------
    private Set<String> fetchGroupMemberEmails(String groupEmail) throws Exception {
        Set<String> emails = new HashSet<>();
        String memberPageToken = null;

        do {
            Members membersPage = directoryService.members()
                    .list(groupEmail)
                    .setPageToken(memberPageToken)
                    .execute();

            List<Member> members = membersPage.getMembers();
            if (members != null) {
                for (Member m : members) {
                    if (m.getEmail() != null) {
                        emails.add(m.getEmail());
                    }
                }
            }

            memberPageToken = membersPage.getNextPageToken();

        } while (memberPageToken != null);

        return emails;
    }

    // -------------------------------------------------------------------------
    // deactivateUsersMissingFrom()
    // Returns the list of emails that were deactivated so callers can notify
    // admins about users removed from Google Workspace.
    // -------------------------------------------------------------------------
    private List<String> deactivateUsersMissingFrom(Set<String> googleEmails) {
        // POC NOTE: Super admins are excluded from deactivation because they exist in Skapp
        // but may not be in Google Workspace. In production, this should be handled by
        // matching users based on login method (CREDENTIALS/GOOGLE) and org-specific rules
        // rather than a blanket exclusion.
        List<User> candidateUsers = userDao.findAll(); // includes both active and inactive users

        List<User> staleUsers = candidateUsers.stream()
                .filter(user -> !googleEmails.contains(user.getEmail()))
                .filter(user -> {
                    Employee emp = employeeDao.findEmployeeByEmail(user.getEmail());
                    if (emp == null) return false;
                    Optional<EmployeeRole> role = employeeRoleDao.findById(emp.getEmployeeId());
                    // TODO (Production): Replace with login-method-based filtering instead
                    // of super admin exclusion. Super admins provisioned via Google Workspace
                    // should also be deactivatable.
                    return role.isEmpty() || !Boolean.TRUE.equals(role.get().getIsSuperAdmin());
                })
                .toList();

        if (staleUsers.isEmpty()) return new ArrayList<>();

        List<Employee> staleEmployees = new ArrayList<>();
        for (User user : staleUsers) {
            user.setIsActive(false);
            Employee employee = employeeDao.findEmployeeByEmail(user.getEmail());
            if (employee != null) {
                employee.setAccountStatus(AccountStatus.DEACTIVATED);
                staleEmployees.add(employee);
            }
        }

        userDao.saveAll(staleUsers);
        employeeDao.saveAll(staleEmployees);

        List<String> removedEmails = staleUsers.stream().map(User::getEmail).toList();
        log.info("Deactivated {} user(s) no longer in Google Workspace: {}",
                removedEmails.size(), removedEmails);
        return removedEmails;
    }

    // -------------------------------------------------------------------------
    // notifySuperAdminsOfRemovedUsers() — fires an in-app notification to every
    // super admin when users have been removed from Google Workspace and
    // deactivated in Skapp, asking whether to keep or permanently remove them.
    //
    // FIX: previously the "employee.getUser() == null" check sat in front of
    // BOTH the in-app notification AND the email send, so if a super admin's
    // Employee.getUser() was null/not-yet-loaded (e.g. lazy association
    // accessed outside an active transaction), the whole iteration was
    // skipped — including the notification, which doesn't even need
    // getUser(). The notification and the email are now gated independently.
    // -------------------------------------------------------------------------
    @Transactional
    private void notifySuperAdminsOfRemovedUsers(List<String> removedEmails) {
        if (removedEmails == null || removedEmails.isEmpty()) return;

        String emailList = String.join(", ", removedEmails);
        String message = removedEmails.size() == 1
                ? "The following user has been removed from Google Workspace and deactivated in Skapp: "
                  + emailList + ". Do you wish to keep or permanently remove this account?"
                : "The following " + removedEmails.size() + " users have been removed from Google Workspace "
                  + "and deactivated in Skapp: " + emailList
                  + ". Do you wish to keep or permanently remove these accounts?";

        List<EmployeeRole> superAdminRoles = employeeRoleDao.findByIsSuperAdminTrue();

        for (EmployeeRole role : superAdminRoles) {
            try {
                Employee employee = role.getEmployee();
                // Only this guards the notification — getUser() is NOT
                // required to create the in-app notification.
                if (employee == null) continue;

                Map<String, String> dynamicFields = new HashMap<>();
                dynamicFields.put("message", message);
                dynamicFields.put("removedEmails", emailList);

                notificationService.createNotification(
                        employee,
                        null,
                        NotificationType.GOOGLE_WORKSPACE_USER_REMOVED,
                        EmailBodyTemplates.PEOPLE_MODULE_GOOGLE_WORKSPACE_USER_REMOVED,
                        dynamicFields,
                        NotificationCategory.PEOPLE_SYNC
                );

                // Email is a secondary channel — only attempt it if we
                // actually have a linked user/email. A missing user here
                // should never block the in-app notification above.
                if (employee.getUser() != null && employee.getUser().getEmail() != null) {
                    asyncEmailSender.sendMail(
                            employee.getUser().getEmail(),
                            "Users removed from Google Workspace",
                            buildRemovedUsersEmailBody(removedEmails),
                            null
                    );
                } else {
                    log.warn("Skipping removed-users email for super admin (employeeId={}) — no linked user/email.",
                            employee.getEmployeeId());
                }

            } catch (Exception e) {
                log.error("Failed to notify super admin of removed users: {}", e.getMessage(), e);
            }
        }

        log.info("Notified super admins of {} removed Google Workspace user(s): {}",
                removedEmails.size(), removedEmails);
    }

    private String buildRemovedUsersEmailBody(List<String> removedEmails) {
        StringBuilder rows = new StringBuilder();
        for (String email : removedEmails) {
            rows.append("<li style=\"color:#7f1d1d;font-size:14px;margin-bottom:4px;\">").append(email).append("</li>");
        }

        return "<!DOCTYPE html><html><body style=\"font-family:Arial,sans-serif;\">" +
                "<h3>Users removed from Google Workspace</h3>" +
                "<p>The following " + removedEmails.size() + " account(s) were deactivated in Skapp:</p>" +
                "<ul>" + rows + "</ul>" +
                "<p>Review their status and decide whether to keep them deactivated or remove them permanently.</p>" +
                "</body></html>";
    }
    private record SyncResult(int synced, int failed, List<String> failures, List<String> newUserEmails, List<String> removedUserEmails) {}

    // -------------------------------------------------------------------------
    // upsertUser() — create or update User + Employee from a Workspace user
    //
    // FIX: restored @Transactional (it was present in the earlier working
    // version but dropped here). Without it, the User save/flush and the
    // subsequent Employee/EmployeeRole reads+writes run as separate
    // auto-commits outside one Hibernate session, which is the most likely
    // cause of LazyInitializationException when role.getEmployee().getUser()
    // (or similar associations) are accessed later in
    // notifySuperAdminsOfRemovedUsers() — that exception gets swallowed by
    // the surrounding catch(Exception) blocks and just logged, which is why
    // the deletion notification looked like it silently "didn't work".
    // -------------------------------------------------------------------------
    @Transactional
    boolean upsertUser(com.google.api.services.directory.model.User wsUser) {
        String email     = wsUser.getPrimaryEmail();
        String firstName = wsUser.getName() != null ? wsUser.getName().getGivenName() : "";
        String lastName  = wsUser.getName() != null ? wsUser.getName().getFamilyName() : "";
        boolean suspended = Boolean.TRUE.equals(wsUser.getSuspended());

        Optional<User> existingUser = userDao.findByEmail(email);
        boolean isNew = existingUser.isEmpty();

        User user = existingUser.orElseGet(User::new);
        user.setEmail(email);
        user.setIsActive(!suspended);

        if (isNew) {
            // Provision with credentials so the standard invitation email
            // (PEOPLE_MODULE_USER_INVITATION_V1) is sent, which includes the
            // temporary password. On first login the app detects
            // isPasswordChangedForTheFirstTime=false and forces a password reset.
            String tempPassword = CommonModuleUtils.generateSecureRandomPassword();
            CommonModuleUtils.setIfExists(
                    () -> encryptionDecryptionService.encrypt(tempPassword),
                    user::setTempPassword);
            CommonModuleUtils.setIfExists(
                    () -> passwordEncoder.encode(tempPassword),
                    user::setPassword);
            user.setLoginMethod(LoginMethod.CREDENTIALS);
            user.setIsPasswordChangedForTheFirstTime(false);
        }
        // Existing users: never overwrite loginMethod, password, or tempPassword.

        User savedUser = userDao.saveAndFlush(user);

        Employee employee = employeeDao.findEmployeeByEmail(email);
        if (employee == null) {
            employee = new Employee();
        }
        employee.setUser(savedUser);
        employee.setFirstName(firstName);
        employee.setLastName(lastName);
        employee.setAccountStatus(suspended ? AccountStatus.DEACTIVATED : AccountStatus.ACTIVE);
        // Sync Google profile photo URL into authPic.
        // thumbnailPhotoUrl is returned by the Directory API and is a direct
        // link to the user's profile picture. We only overwrite if Google
        // provides a value — never blank out an existing pic if it's missing.
        String photoUrl = wsUser.getThumbnailPhotoUrl();
        if (photoUrl != null && !photoUrl.isBlank()) {
            employee.setAuthPic(photoUrl);
        }
        // Set joinDate for new employees so they appear in the directory.
        // The directory query excludes employees with no join date on some views.
        if (employee.getJoinDate() == null) {
            employee.setJoinDate(LocalDate.now());
        }
        Employee savedEmployee = employeeDao.save(employee);

        // Guard: EmployeeRole shares PK with Employee via @MapsId — skip if
        // a role row already exists (e.g. existing super admin) to avoid a
        // duplicate-key INSERT.
        if (!employeeRoleDao.existsById(savedEmployee.getEmployeeId())) {
            // setupBulkEmployeeRoles() only sets peopleRole/leaveRole/attendanceRole.
            // We patch the remaining fields with the same defaults that
            // getDefaultEmployeeRoles() uses, so the employee_role row is fully
            // populated (no null columns for okrRole, pmRole, esignRole, etc.)
            EmployeeRole role = rolesService.setupBulkEmployeeRoles(savedEmployee);
            role.setEsignRole(com.skapp.community.common.type.Role.ESIGN_EMPLOYEE);
            role.setOkrRole(com.skapp.community.common.type.Role.OKR_EMPLOYEE);
            role.setPmRole(com.skapp.community.common.type.Role.PM_EMPLOYEE);
            role.setInvoiceRole(com.skapp.community.common.type.Role.INVOICE_NONE);
            role.setCrmRole(com.skapp.community.common.type.Role.CRM_NONE);
            employeeRoleDao.save(role);
            savedEmployee.setEmployeeRole(role);
            log.debug("Roles assigned for {}.", email);
        } else {
            log.debug("Skipping role creation for {} — role already exists.", email);
        }

        return isNew;
    }

    // -------------------------------------------------------------------------
    // sendInviteEmailsToNewUsers()
    // -------------------------------------------------------------------------
    private void sendInviteEmailsToNewUsers(List<String> newUserEmails) {
        if (newUserEmails == null || newUserEmails.isEmpty()) {
            log.info("sendInviteEmailsToNewUsers: no new users to invite.");
            return;
        }

        Optional<OrganizationConfig> emailConfig = organizationConfigDao
                .findOrganizationConfigByOrganizationConfigType(
                        OrganizationConfigType.EMAIL_CONFIGS.name());

        if (emailConfig.isEmpty()) {
            log.error("sendInviteEmailsToNewUsers: SMTP not configured — " +
                    "Fix: POST /api/v1/org/email-server");
            return;
        }

        log.info("sendInviteEmailsToNewUsers: sending invites to {} new user(s).", newUserEmails.size());

        for (String email : newUserEmails) {
            try {
                userDao.findByEmail(email).ifPresentOrElse(
                        user -> {
                            Employee employee = employeeDao.findEmployeeByEmail(email);
                            if (employee == null) {
                                log.warn("Skipping {} — employee record not found.", email);
                                return;
                            }
                            user.setEmployee(employee);
                            sendGoogleSyncInvitationEmail(user);
                            log.info("Invite sent to {}.", email);
                        },
                        () -> log.warn("User not found for {}.", email)
                );
            } catch (Exception e) {
                log.error("Failed to send invite to {}: {}", email, e.getMessage());
            }
        }

        log.info("sendInviteEmailsToNewUsers: done.");
    }

    private void sendGoogleSyncInvitationEmail(User user) {
        PeopleEmailDynamicFields fields = new PeopleEmailDynamicFields();
        fields.setEmployeeOrManagerName(user.getEmployee().getFirstName() + " " + user.getEmployee().getLastName());
        fields.setOrganizationName(organizationDao.findTopByOrderByOrganizationIdDesc()
                .map(Organization::getOrganizationName).orElse(""));
        fields.setWorkEmail(user.getEmail());
        fields.setTemporaryPassword(encryptionDecryptionService.decrypt(user.getTempPassword()));
        fields.setAppUrl("http://localhost:3000/signin");

        emailService.sendEmail(EmailBodyTemplates.PEOPLE_MODULE_GOOGLE_SYNC_INVITATION, fields, user.getEmail());
    }

    // -------------------------------------------------------------------------
    // fetchPageWithBackoff()
    // -------------------------------------------------------------------------
    private Users fetchPageWithBackoff(String pageToken, int attempt) throws Exception {
        try {
            Directory.Users.List request = directoryService.users()
                    .list()
                    .setCustomer(WORKSPACE_CUSTOMER_ALIAS)
                    .setMaxResults(maxResults)
                    .setFields(DIRECTORY_LIST_FIELDS);

            if (pageToken != null) {
                request.setPageToken(pageToken);
            }

            return request.execute();

        } catch (com.google.api.client.googleapis.json.GoogleJsonResponseException e) {
            int status = e.getStatusCode();
            if (status != HTTP_TOO_MANY_REQUESTS && status != HTTP_FORBIDDEN) throw e;
            if (attempt >= maxBackoffAttempts) {
                log.error("Max retries ({}) reached. Aborting.", maxBackoffAttempts);
                throw e;
            }
            long waitMs = (long) (Math.min(MAX_BACKOFF_SECONDS, Math.pow(2, attempt)) * 1000
                    + Math.random() * BACKOFF_JITTER_BOUND_MS);
            log.warn("Rate limited ({}). Backoff attempt {}/{}, waiting {}ms...",
                    status, attempt + 1, maxBackoffAttempts, waitMs);
            Thread.sleep(waitMs);
            return fetchPageWithBackoff(pageToken, attempt + 1);
        }
    }

    // -------------------------------------------------------------------------
    // getSecret() — pull JSON key from GCP Secret Manager
    // -------------------------------------------------------------------------
    private String getSecret(String projectId, String secretName) throws Exception {
        try (SecretManagerServiceClient client = SecretManagerServiceClient.create()) {
            SecretVersionName versionName =
                    SecretVersionName.of(projectId, secretName, SECRET_LATEST_VERSION);
            AccessSecretVersionResponse response = client.accessSecretVersion(versionName);
            return response.getPayload().getData().toStringUtf8();
        }
    }


}