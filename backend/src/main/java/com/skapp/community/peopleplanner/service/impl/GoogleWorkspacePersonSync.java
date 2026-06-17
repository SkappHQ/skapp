package com.skapp.community.peopleplanner.service.impl;

import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.directory.Directory;
import com.google.api.services.directory.DirectoryScopes;
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
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

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

    private final UserDao userDao;

    private final AsyncEmailSender asyncEmailSender;

    private Directory directoryService;

    private PeopleEmailService peopleEmailService;

    private final EmployeeDao employeeDao;

    // -------------------------------------------------------------------------
    // authenticate() — local file (dev) or Secret Manager (prod) → Directory
    // -------------------------------------------------------------------------
    @Override
    public void authenticate() throws Exception {
        String secretJson;
        if (credentialsPath != null && !credentialsPath.isBlank()) {
            log.info("Authenticating with Google Workspace via local credentials file: {}", credentialsPath);
            secretJson = Files.readString(Paths.get(credentialsPath));
        } else {
            log.info("Authenticating with Google Workspace via Secret Manager...");
            secretJson = getSecret(projectId, secretName);
        }

        GoogleCredentials credentials = ServiceAccountCredentials
                .fromStream(new ByteArrayInputStream(secretJson.getBytes(StandardCharsets.UTF_8)))
                .createScoped(Collections.singletonList(DirectoryScopes.ADMIN_DIRECTORY_USER_READONLY))
                .createDelegated(adminEmail);

        directoryService = new Directory.Builder(GoogleNetHttpTransport.newTrustedTransport(),
                GsonFactory.getDefaultInstance(), new HttpCredentialsAdapter(credentials))
                .setApplicationName("skapp-integration-poc")
                .build();

        log.info("Authentication successful.");
    }

    // -------------------------------------------------------------------------
    // bulkSync() — async: fetch all users, persist to DB, send summary email
    // -------------------------------------------------------------------------
    @Override
    @Async("syncTaskExecutor")
    public void bulkSync(String callerEmail) {
        log.info("bulkSync started for caller: {}", callerEmail);

        int totalSynced = 0;
        int totalFailed = 0;
        List<String> failures = new ArrayList<>();

        try {
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
                        String googleId = wsUser.getId();
                        String email = wsUser.getPrimaryEmail();
                        String firstName = wsUser.getName() != null ? wsUser.getName().getGivenName() : null;
                        String lastName = wsUser.getName() != null ? wsUser.getName().getFamilyName() : null;
                        Boolean suspended = wsUser.getSuspended();
                        String etag = wsUser.getEtag();

                        // Validate required fields (mirrors Python Script 1)
                        List<String> missing = new ArrayList<>();
                        if (googleId == null)
                            missing.add("id");
                        if (firstName == null)
                            missing.add("givenName");
                        if (lastName == null)
                            missing.add("familyName");
                        if (email == null)
                            missing.add("primaryEmail");
                        if (suspended == null)
                            missing.add("suspended");
                        if (etag == null)
                            missing.add("etag");

                        if (!missing.isEmpty()) {
                            String msg = "User " + email + " missing fields: " + missing;
                            log.warn(msg);
                            failures.add(msg);
                            totalFailed++;
                            continue;
                        }

                        User user = userDao.findByEmail(email).orElseGet(User::new);
                        user.setEmail(email);
                        user.setIsActive(!Boolean.TRUE.equals(suspended));
                        user.setLoginMethod(LoginMethod.GOOGLE);

                        // Save or update Employee using EmployeeDao (has JpaRepository.save())
                        Employee employee = employeeDao.findEmployeeByEmail(email);
                        if (employee == null) {
                            employee = new Employee();
                        }

                        // Map suspended → AccountStatus
                        AccountStatus status = Boolean.TRUE.equals(suspended) ? AccountStatus.DEACTIVATED
                                : AccountStatus.ACTIVE;

                        employee.setUser(user);
                        employee.setFirstName(firstName);
                        employee.setLastName(lastName);
                        employee.setAccountStatus(status);

                        User savedUser = userDao.save(user);

                        peopleEmailService.sendUserInvitationEmail(savedUser);


                        totalSynced++;
                        log.debug("Saved user: <{}>", email);

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

            }
            while (pageToken != null);

            log.info("Sync complete. Synced: {}, Failed: {}", totalSynced, totalFailed);
            sendSummaryEmail(asyncEmailSender, callerEmail, totalSynced, totalFailed, failures, null);
        }
        catch (Exception e) {
            log.error("Sync failed: {}", e.getMessage(), e);
            sendSummaryEmail(asyncEmailSender, callerEmail, totalSynced, totalFailed, failures, e.getMessage());
        }
    }

    // -------------------------------------------------------------------------
    // fetchPageWithBackoff() — exponential backoff + jitter (mirrors Python Script 2)
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
            log.warn("Rate limited ({}). Backoff attempt {}/{}, waiting {}ms...", status, attempt + 1,
                    maxBackoffAttempts, waitMs);

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