package com.skapp.community.peopleplanner.service;

import com.skapp.community.common.model.Notification;
import com.skapp.community.common.service.AsyncEmailSender;
import com.skapp.community.common.service.PushNotificationService;
import com.skapp.community.common.type.NotificationType;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.EmployeeRole;
import com.skapp.community.peopleplanner.repository.EmployeeRoleDao;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

public interface ExternalPersonSyncService {
    Logger log = LoggerFactory.getLogger(ExternalPersonSyncService.class);
    String SYNC_SUMMARY_EMAIL_SUBJECT = "External Sync - Completed";

    void authenticate() throws Exception;

    void registerWatch() throws Exception;
    void renewWatchIfExpiring() throws Exception;
    void processWatchNotification(String resourceState, String resourceUri);
    void bulkSync(String callerEmail);
    boolean isValidChannelToken(String token);
    default void sendSummaryEmail(AsyncEmailSender asyncEmailSender, String toEmail,
                                  int synced, int failed, List<String> failures, String fatalError) {

        log.info("sendSummaryEmail: sending summary to {}", toEmail);
        try {
            asyncEmailSender.sendMail(toEmail, SYNC_SUMMARY_EMAIL_SUBJECT,
                    buildEmailBody(synced, failed, failures, fatalError), null);
            log.info("sendSummaryEmail: summary email sent to {}", toEmail);
        }
        catch (Exception e) {
            log.error("sendSummaryEmail: failed to send to {}: {}", toEmail, e.getMessage());
        }
    }

    // -------------------------------------------------------------------------
    // notifySuperAdmins() — push a notification to every super admin once a
    // sync run completes. Shared across all external sync integrations
    // (Google Workspace today, Microsoft Teams etc. later) since they all
    // need to surface sync outcomes the same way.
    // -------------------------------------------------------------------------
    default void notifySuperAdmins(EmployeeRoleDao employeeRoleDao,
                                   PushNotificationService pushNotificationService,
                                   String title,
                                   String message) {

        List<EmployeeRole> superAdminRoles = employeeRoleDao.findByIsSuperAdminTrue();

        for (EmployeeRole employeeRole : superAdminRoles) {
            try {
                Employee employee = employeeRole.getEmployee();

                if (employee == null) {
                    continue;
                }

                // Force Hibernate proxy initialization while object is available
                employee.getEmployeeId();

                if (employee.getUser() == null) {
                    continue;
                }

                Long userId = employee.getUser().getUserId();

                Notification notification = new Notification();
                notification.setEmployee(employee);
                notification.setBody(message);
                notification.setNotificationType(NotificationType.EXTERNAL_SYNC_COMPLETED);

                pushNotificationService.sendNotification(userId, notification, title);

            }
            catch (Exception e) {
                log.error("notifySuperAdmins: failed to notify super admin: {}",
                        e.getMessage());
            }
        }
    }
    default String buildEmailBody(int synced, int failed,
                                  List<String> failures, String fatalError) {
        StringBuilder body = new StringBuilder();
        body.append("Hello,\n\n");
        body.append("Your Google Workspace bulk person sync has completed.\n\n");
        body.append("=== SYNC SUMMARY ===\n");
        body.append("Persons synced : ").append(synced).append("\n");
        body.append("Failures       : ").append(failed).append("\n");

        if (fatalError != null) {
            body.append("\nSync ended early due to an error:\n")
                    .append(fatalError).append("\n");
        }

        if (!failures.isEmpty()) {
            body.append("\n--- Failed Records ---\n");
            failures.forEach(f -> body.append("  - ").append(f).append("\n"));
        }

        body.append("\nRegards,\nSkapp Integration Service");
        return body.toString();
    }

}
