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
    default String buildEmailBody(int synced, int failed, List<String> failures, String fatalError) {
        boolean hasFailures = !failures.isEmpty();
        boolean hasFatalError = fatalError != null;
        String statusColor  = (hasFatalError || hasFailures) ? "#ef4444" : "#22c55e";
        String statusLabel  = hasFatalError ? "Completed with errors" : hasFailures ? "Completed with failures" : "Completed successfully";
        String statusIcon   = (hasFatalError || hasFailures) ? "&#10007;" : "&#10003;";

        StringBuilder rows = new StringBuilder();
        if (hasFailures) {
            for (String f : failures) {
                rows.append(
                        "<tr>" +
                                "<td style=\"padding:8px 12px;border-bottom:1px solid #f4f4f5;font-size:13px;" +
                                "color:#ef4444;word-break:break-all;\">&#8226; " + escapeHtml(f) + "</td>" +
                                "</tr>"
                );
            }
        }

        return "<!DOCTYPE html><html><head><meta charset=\"UTF-8\"></head><body " +
                "style=\"margin:0;padding:0;background:#f4f4f5;font-family:'Inter',Arial,sans-serif;\">" +

                "<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"background:#f4f4f5;padding:40px 0;\">" +
                "<tr><td align=\"center\">" +
                "<table width=\"600\" cellpadding=\"0\" cellspacing=\"0\" " +
                "style=\"background:#ffffff;border-radius:12px;overflow:hidden;" +
                "box-shadow:0 1px 4px rgba(0,0,0,0.08);max-width:600px;width:100%;\">" +

                // Header
                "<tr><td style=\"background:#18181b;padding:28px 36px;\">" +
                "<p style=\"margin:0;font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;\">" +
                "Skapp</p></td></tr>" +

                // Title
                "<tr><td style=\"padding:32px 36px 0;\">" +
                "<p style=\"margin:0 0 4px;font-size:22px;font-weight:700;color:#18181b;\">Google Workspace Sync</p>" +
                "<p style=\"margin:0;font-size:14px;color:#71717a;\">Bulk person synchronisation report</p>" +
                "</td></tr>" +

                // Status badge
                "<tr><td style=\"padding:20px 36px 0;\">" +
                "<span style=\"display:inline-block;padding:6px 14px;border-radius:999px;font-size:13px;" +
                "font-weight:600;color:#ffffff;background:" + statusColor + ";\">" +
                statusIcon + "&nbsp;&nbsp;" + statusLabel +
                "</span></td></tr>" +

                // Stats cards
                "<tr><td style=\"padding:24px 36px 0;\">" +
                "<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\"><tr>" +
                "<td width=\"48%\" style=\"background:#f4f4f5;border-radius:10px;padding:18px 20px;\">" +
                "<p style=\"margin:0 0 6px;font-size:12px;font-weight:600;color:#71717a;" +
                "text-transform:uppercase;letter-spacing:0.6px;\">Persons synced</p>" +
                "<p style=\"margin:0;font-size:32px;font-weight:700;color:#18181b;\">" + synced + "</p>" +
                "</td><td width=\"4%\"></td>" +
                "<td width=\"48%\" style=\"background:#f4f4f5;border-radius:10px;padding:18px 20px;\">" +
                "<p style=\"margin:0 0 6px;font-size:12px;font-weight:600;color:#71717a;" +
                "text-transform:uppercase;letter-spacing:0.6px;\">Failures</p>" +
                "<p style=\"margin:0;font-size:32px;font-weight:700;color:" +
                (failed > 0 ? "#ef4444" : "#18181b") + ";\">" + failed + "</p>" +
                "</td></tr></table></td></tr>" +

                // Fatal error block
                (hasFatalError ?
                        "<tr><td style=\"padding:24px 36px 0;\">" +
                        "<div style=\"background:#fef2f2;border-left:4px solid #ef4444;" +
                        "border-radius:6px;padding:14px 16px;\">" +
                        "<p style=\"margin:0 0 4px;font-size:13px;font-weight:600;color:#ef4444;\">Fatal error</p>" +
                        "<p style=\"margin:0;font-size:13px;color:#7f1d1d;word-break:break-all;\">" +
                                escapeHtml(fatalError) + "</p></div></td></tr>" : "") +

                // Failed records table
                (hasFailures ?
                        "<tr><td style=\"padding:24px 36px 0;\">" +
                        "<p style=\"margin:0 0 10px;font-size:14px;font-weight:600;color:#18181b;\">Failed records</p>" +
                        "<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" " +
                        "style=\"background:#fef2f2;border-radius:8px;overflow:hidden;\">" +
                                rows.toString() +
                        "</table></td></tr>" : "") +

                // Divider + footer
                "<tr><td style=\"padding:32px 36px;\">" +
                "<hr style=\"border:none;border-top:1px solid #f4f4f5;margin:0 0 24px;\">" +
                "<p style=\"margin:0;font-size:12px;color:#a1a1aa;\">" +
                "This is an automated message from Skapp Integration Service. Please do not reply.</p>" +
                "</td></tr>" +

                "</table></td></tr></table></body></html>";
    }

    private static String escapeHtml(String input) {
        if (input == null) return "";
        return input.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;");
    }


}
