package com.skapp.community.peopleplanner.service.impl;

import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.directory.Directory;
import com.google.api.services.directory.DirectoryScopes;
import com.google.api.services.directory.model.Channel;
import com.google.api.services.directory.model.Users;
import com.google.auth.http.HttpCredentialsAdapter;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.auth.oauth2.ServiceAccountCredentials;
import com.google.cloud.secretmanager.v1.AccessSecretVersionResponse;
import com.google.cloud.secretmanager.v1.SecretManagerServiceClient;
import com.google.cloud.secretmanager.v1.SecretVersionName;
import com.skapp.community.common.model.OrganizationConfig;
import com.skapp.community.common.model.User;
import com.skapp.community.common.repository.OrganizationConfigDao;
import com.skapp.community.common.repository.UserDao;
import com.skapp.community.common.service.AsyncEmailSender;
import com.skapp.community.common.service.PushNotificationService;
import com.skapp.community.common.type.LoginMethod;
import com.skapp.community.common.type.OrganizationConfigType;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.repository.EmployeeDao;
import com.skapp.community.peopleplanner.repository.EmployeeRoleDao;
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
import org.springframework.stereotype.Service;
import com.skapp.community.common.service.NotificationService;
import com.skapp.community.common.type.EmailBodyTemplates;
import com.skapp.community.common.type.NotificationCategory;
import com.skapp.community.common.type.NotificationType;
import com.skapp.community.peopleplanner.model.EmployeeRole;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.Duration;
import java.time.Instant;
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
    private static final String DIRECTORY_LIST_FIELDS = "users(id,name,primaryEmail,suspended,etag),nextPageToken";
    private static final String SECRET_LATEST_VERSION = "latest";
    private static final String APPLICATION_NAME = "skapp-integration-poc";
    private final NotificationService notificationService;

    private static final Duration WATCH_RENEWAL_THRESHOLD = Duration.ofHours(48);
    private static final int MAX_BACKOFF_SECONDS = 32;
    private static final int BACKOFF_JITTER_BOUND_MS = 1000;
    private static final int HTTP_TOO_MANY_REQUESTS = 429;
    private static final int HTTP_FORBIDDEN = 403;

    @Value("${google.project-id}")
    private String projectId;

    @Value("${google.secret-name}")
    private String secretName;

    @Value("${google.admin-email}")
    private String adminEmail;

    @Value("${google.max-results:500}")
    private int maxResults;

    @Value("${google.max-backoff-attempts:5}")
    private int maxBackoffAttempts;

    @Value("${google.credentials-path:}")
    private String credentialsPath;

    @Value("${google.webhook-url}")
    private String webhookUrl;

    @Value("${google.channel-token:}")
    private String channelToken;

    private final UserDao userDao;
    private final EmployeeDao employeeDao;
    private final AsyncEmailSender asyncEmailSender;
    private final PeopleEmailService peopleEmailService;
    private final RolesService rolesService;
    private final OrganizationConfigDao organizationConfigDao;
    private final PushNotificationService pushNotificationService;
    private final EmployeeRoleDao employeeRoleDao;

    private Directory directoryService;
    private volatile Long channelExpiration;

    // -------------------------------------------------------------------------
    // authenticate() — local file (dev) or Secret Manager (prod) → Directory
    // -------------------------------------------------------------------------
    @Override
    public void authenticate() throws Exception {
        String secretJson;
        if (credentialsPath != null && !credentialsPath.isBlank()) {
            log.info("Authenticating via local credentials file: {}", credentialsPath);
            secretJson = Files.readString(Paths.get(credentialsPath));
        } else {
            log.info("Authenticating via Secret Manager...");
            secretJson = getSecret(projectId, secretName);
        }

        GoogleCredentials credentials = ServiceAccountCredentials
                .fromStream(new ByteArrayInputStream(secretJson.getBytes(StandardCharsets.UTF_8)))
                .createScoped(List.of(DirectoryScopes.ADMIN_DIRECTORY_USER_READONLY))
                .createDelegated(adminEmail);

        directoryService = new Directory.Builder(
                GoogleNetHttpTransport.newTrustedTransport(),
                GsonFactory.getDefaultInstance(),
                new HttpCredentialsAdapter(credentials))
                .setApplicationName(APPLICATION_NAME)
                .build();

        log.info("Authentication successful.");
    }

    // -------------------------------------------------------------------------
    // registerWatch() — subscribe to push notifications for user changes
    // -------------------------------------------------------------------------
    @Override
    public void registerWatch() throws Exception {
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
    @Override
    public void processWatchNotification(String resourceState, String resourceUri) {
        if (WATCH_HANDSHAKE_STATE.equals(resourceState)) {
            log.info("Watch sync handshake received — no action needed.");
            return;
        }

        String callerEmail = "sudam.manudith@rootcode.io";

        log.info("Watch notification ({}) received for {} — resyncing all users.", resourceState, resourceUri);
        try {
            SyncResult result = performFullSync();
            log.info("Resync complete. Synced: {}, Failed: {}", result.synced(), result.failed());
            // All users+employees are persisted — now send invitation emails
            sendInviteEmailsToNewUsers(result.newUserEmails());

            sendSummaryEmail(asyncEmailSender, callerEmail,
                    result.synced(), result.failed(), result.failures(), null);
            notifySuperAdminsOfSyncResult(result.synced(), result.failed(), null);
        }
        catch (Exception e) {
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
        log.info("bulkSync started for caller: {}", callerEmail);

        try {
            SyncResult result = performFullSync();
            log.info("Sync complete. Synced: {}, Failed: {}, New users: {}",
                    result.synced(), result.failed(), result.newUserEmails().size());

            // All users+employees are persisted — now send invitation emails
            sendInviteEmailsToNewUsers(result.newUserEmails());

            sendSummaryEmail(asyncEmailSender, callerEmail,
                    result.synced(), result.failed(), result.failures(), null);
            notifySuperAdminsOfSyncResult(result.synced(), result.failed(), null);
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
//    private void notifySuperAdminsOfSyncResult(int synced, int failed, String fatalError) {
//        String title = "Google Workspace Sync";
//        String message = fatalError != null
//                ? "Google Workspace sync failed: " + fatalError
//                : "Google Workspace sync completed. Synced: " + synced + ", Failed: " + failed;
//
//        notifySuperAdmins(employeeRoleDao, pushNotificationService, title, message);
//    }
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
                        dynamicFields,   // ← changed from message to dynamicFields
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

            if (users == null || users.isEmpty()) {
                break;
            }

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
                }
                catch (Exception e) {
                    String msg = "Failed to persist user: " + wsUser.getPrimaryEmail() + " — " + e.getMessage();
                    log.error(msg, e);
                    failures.add(msg);
                    totalFailed++;
                }
            }

            pageToken = result.getNextPageToken();
            log.info("Page processed. Next page token: {}", pageToken != null ? "present" : "none");

        } while (pageToken != null);

        deactivateUsersMissingFrom(googleEmails);

        return new SyncResult(totalSynced, totalFailed, failures, newUserEmails);
    }

    // -------------------------------------------------------------------------
    // deactivateUsersMissingFrom() — deactivate skapp users (and their employee
    // records) that came from Google but no longer appear in the Workspace
    // response, e.g. they were removed/suspended-and-deleted in Workspace.
    // Candidates are fetched in a single query rather than looked up per-user.
    // -------------------------------------------------------------------------
    private void deactivateUsersMissingFrom(Set<String> googleEmails) {
        List<User> activeGoogleUsers = userDao.findAllByLoginMethodAndIsActiveTrue(LoginMethod.GOOGLE);

        List<User> staleUsers = activeGoogleUsers.stream()
                .filter(user -> !googleEmails.contains(user.getEmail()))
                .toList();

        if (staleUsers.isEmpty()) {
            return;
        }

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

        log.info("Deactivated {} user(s) no longer present in Google Workspace: {}",
                staleUsers.size(),
                staleUsers.stream().map(User::getEmail).toList());
    }

    private record SyncResult(int synced, int failed, List<String> failures, List<String> newUserEmails) {}

    // -------------------------------------------------------------------------
    // upsertUser() — create or update User + Employee from a Workspace user
    // -------------------------------------------------------------------------
    private boolean upsertUser(com.google.api.services.directory.model.User wsUser) {
        String email = wsUser.getPrimaryEmail();
        String firstName = wsUser.getName() != null ? wsUser.getName().getGivenName() : "";
        String lastName = wsUser.getName() != null ? wsUser.getName().getFamilyName() : "";
        boolean suspended = Boolean.TRUE.equals(wsUser.getSuspended());

        Optional<User> existingUser = userDao.findByEmail(email);
        boolean isNew = existingUser.isEmpty();

        User user = existingUser.orElseGet(User::new);
        user.setEmail(email);
        user.setIsActive(!suspended);
        user.setLoginMethod(LoginMethod.GOOGLE);
        User savedUser = userDao.save(user);

        Employee employee = employeeDao.findEmployeeByEmail(email);
        if (employee == null) {
            employee = new Employee();
        }
        employee.setUser(savedUser);
        employee.setFirstName(firstName);
        employee.setLastName(lastName);
        employee.setAccountStatus(suspended ? AccountStatus.DEACTIVATED : AccountStatus.ACTIVE);
        Employee savedEmployee = employeeDao.save(employee);
        rolesService.saveEmployeeRoles(savedEmployee);


        return isNew;
    }

    // -------------------------------------------------------------------------
    // fetchPageWithBackoff() — exponential backoff + jitter on rate limit errors
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
        }
        catch (com.google.api.client.googleapis.json.GoogleJsonResponseException e) {
            int status = e.getStatusCode();

            if (status != HTTP_TOO_MANY_REQUESTS && status != HTTP_FORBIDDEN) {
                throw e;
            }

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
            SecretVersionName versionName = SecretVersionName.of(projectId, secretName, SECRET_LATEST_VERSION);
            AccessSecretVersionResponse response = client.accessSecretVersion(versionName);
            return response.getPayload().getData().toStringUtf8();
        }
    }

    private void sendInviteEmailsToNewUsers(List<String> newUserEmails) {
        if (newUserEmails == null || newUserEmails.isEmpty()) {
            log.info("sendInviteEmailsToNewUsers: no new users to invite.");
            return;
        }

        log.info("sendInviteEmailsToNewUsers: sending invites to {} new user(s).",
                newUserEmails.size());

        for (String email : newUserEmails) {
            try {
                userDao.findByEmail(email).ifPresentOrElse(
                        user -> {

                            Employee employee = employeeDao.findEmployeeByEmail(email);

                            if (employee == null) {
                                log.warn("Skipping {} — employee record not found.", email);
                                return;
                            }

                            // manually attach employee because entity mapping is unavailable
                            user.setEmployee(employee);

                            peopleEmailService.sendUserInvitationEmail(user);

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

}
