package com.skapp.community.peopleplanner.service;

import com.skapp.community.common.service.AsyncEmailSender;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

public interface ExternalPersonalSyncService {
    Logger log = LoggerFactory.getLogger(ExternalPersonalSyncService.class);
    void authenticate() throws Exception;
    void bulkSync(String callerEmail);
    default void sendSummaryEmail(AsyncEmailSender asyncEmailSender, String toEmail,
                                  int synced, int failed, List<String> failures, String fatalError) {

        log.info("sendSummaryEmail: sending summary to {}", toEmail);
        try {
            asyncEmailSender.sendMail(toEmail, "Google Workspace Sync - Completed",
                    buildEmailBody(synced, failed, failures, fatalError), null);
            log.info("sendSummaryEmail: summary email sent to {}", toEmail);
        }
        catch (Exception e) {
            log.error("sendSummaryEmail: failed to send to {}: {}", toEmail, e.getMessage());
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
