package com.skapp.community.peopleplanner.component;

import com.skapp.community.peopleplanner.repository.GoogleWorkspaceConnectionDao;
import com.skapp.community.peopleplanner.service.ExternalPersonSyncService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@ConditionalOnProperty(prefix = "external-sync", name = "provider", havingValue = "google", matchIfMissing = false)
@RequiredArgsConstructor
public class GoogleWorkspaceWatchInitializer {

    private final ExternalPersonSyncService externalPersonSyncService;
    private final GoogleWorkspaceConnectionDao googleWorkspaceConnectionDao;

    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        if (!isConfigured()) {          // ← add this check
            return;
        }
        try {
            log.info("Application ready — registering Google Workspace users watch...");
            externalPersonSyncService.registerWatch();
        }
        catch (Exception e) {
            log.error("Failed to register Google Workspace watch on startup: {}", e.getMessage(), e);
        }
    }

    // Runs daily at 02:00 — renews the channel if it expires within 48 hours.
    // Google watch channels last a maximum of 7 days.
    @Scheduled(cron = "0 0 2 * * ?")
    public void renewWatch() {
        if (!isConfigured()) {
            return;
        }
        try {
            externalPersonSyncService.renewWatchIfExpiring();
        }
        catch (Exception e) {
            log.error("Failed to renew Goog  le Workspace watch: {}", e.getMessage(), e);
        }
    }
    private boolean isConfigured() {

        try {
            boolean connected = googleWorkspaceConnectionDao.findFirstByActiveTrue().isPresent();
            if (!connected) {
                log.info("Google Workspace OAuth not connected yet — skipping.");
            }
            return connected;
        } catch (Exception e) {
            log.warn("Could not check Google Workspace connection status: {}", e.getMessage());
            return false;
        }
    }

}