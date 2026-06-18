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
import com.skapp.community.common.model.User;
import com.skapp.community.common.repository.UserDao;
import com.skapp.community.common.service.AsyncEmailSender;
import com.skapp.community.common.type.LoginMethod;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.repository.EmployeeDao;
import com.skapp.community.peopleplanner.service.ExternalPersonalSyncService;
import com.skapp.community.peopleplanner.service.PeopleEmailService;
import com.skapp.community.peopleplanner.type.AccountStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class GoogleWorkspacePersonSync implements ExternalPersonalSyncService {

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
                .createScoped(Collections.singletonList(DirectoryScopes.ADMIN_DIRECTORY_USER_READONLY))
                .createDelegated(adminEmail);

        directoryService = new Directory.Builder(
                GoogleNetHttpTransport.newTrustedTransport(),
                GsonFactory.getDefaultInstance(),
                new HttpCredentialsAdapter(credentials))
                .setApplicationName("skapp-integration-poc")
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
                .setType("web_hook")
                .setAddress(webhookUrl);

        if (channelToken != null && !channelToken.isBlank()) {
            channel.setToken(channelToken);
        }

        Channel registered = directoryService.users()
                .watch(channel)
                .setCustomer("my_customer")
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

        long millisUntilExpiry = channelExpiration - System.currentTimeMillis();
        long fortyEightHoursMs = 48L * 60 * 60 * 1000;

        if (millisUntilExpiry < fortyEightHoursMs) {
            log.info("Watch channel expires in {}h — renewing...", millisUntilExpiry / 3_600_000);
            registerWatch();
        } else {
            log.debug("Watch channel still valid. Expires at: {}", Instant.ofEpochMilli(channelExpiration));
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
        if ("sync".equals(resourceState)) {
            log.info("Watch sync handshake received — no action needed.");
            return;
        }

        log.info("Watch notification ({}) received for {} — resyncing all users.", resourceState, resourceUri);
        try {
            SyncResult result = performFullSync();
            log.info("Resync complete. Synced: {}, Failed: {}", result.synced(), result.failed());
        }
        catch (Exception e) {
            log.error("Resync triggered by watch notification failed: {}", e.getMessage(), e);
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
            log.info("Sync complete. Synced: {}, Failed: {}", result.synced(), result.failed());
            sendSummaryEmail(asyncEmailSender, callerEmail, result.synced(), result.failed(), result.failures(), null);
        }
        catch (Exception e) {
            log.error("Sync failed: {}", e.getMessage(), e);
            sendSummaryEmail(asyncEmailSender, callerEmail, 0, 0, new ArrayList<>(), e.getMessage());
        }
    }

    // -------------------------------------------------------------------------
    // performFullSync() — paginate through all Workspace users and upsert them
    // -------------------------------------------------------------------------
    private SyncResult performFullSync() throws Exception {
        int totalSynced = 0;
        int totalFailed = 0;
        List<String> failures = new ArrayList<>();

        authenticate();

        String pageToken = null;

        do {
            Users result = fetchPageWithBackoff(pageToken, 0);
            List<com.google.api.services.directory.model.User> users = result.getUsers();

            if (users == null || users.isEmpty()) {
                break;
            }

            for (com.google.api.services.directory.model.User wsUser : users) {
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

                    upsertUser(wsUser);
                    totalSynced++;
                    log.debug("Synced: <{}>", email);
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

        return new SyncResult(totalSynced, totalFailed, failures);
    }

    private record SyncResult(int synced, int failed, List<String> failures) {
    }

    // -------------------------------------------------------------------------
    // upsertUser() — create or update User + Employee from a Workspace user
    // -------------------------------------------------------------------------
    private void upsertUser(com.google.api.services.directory.model.User wsUser) {
        String email = wsUser.getPrimaryEmail();
        String firstName = wsUser.getName() != null ? wsUser.getName().getGivenName() : "";
        String lastName = wsUser.getName() != null ? wsUser.getName().getFamilyName() : "";
        boolean suspended = Boolean.TRUE.equals(wsUser.getSuspended());

        boolean isNew = userDao.findByEmail(email).isEmpty();

        User user = userDao.findByEmail(email).orElseGet(User::new);
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
        employeeDao.save(employee);

        if (isNew) {
            peopleEmailService.sendUserInvitationEmail(savedUser);
        }
    }

    // -------------------------------------------------------------------------
    // fetchPageWithBackoff() — exponential backoff + jitter on rate limit errors
    // -------------------------------------------------------------------------
    private Users fetchPageWithBackoff(String pageToken, int attempt) throws Exception {
        try {
            Directory.Users.List request = directoryService.users()
                    .list()
                    .setCustomer("my_customer")
                    .setMaxResults(maxResults)
                    .setFields("users(id,name,primaryEmail,suspended,etag),nextPageToken");

            if (pageToken != null) {
                request.setPageToken(pageToken);
            }

            return request.execute();
        }
        catch (com.google.api.client.googleapis.json.GoogleJsonResponseException e) {
            int status = e.getStatusCode();

            if (status != 429 && status != 403) {
                throw e;
            }

            if (attempt >= maxBackoffAttempts) {
                log.error("Max retries ({}) reached. Aborting.", maxBackoffAttempts);
                throw e;
            }

            long waitMs = (long) (Math.min(32, Math.pow(2, attempt)) * 1000 + Math.random() * 1000);
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
            SecretVersionName versionName = SecretVersionName.of(projectId, secretName, "latest");
            AccessSecretVersionResponse response = client.accessSecretVersion(versionName);
            return response.getPayload().getData().toStringUtf8();
        }
    }

}
