package com.skapp.community.peopleplanner.component;

import com.skapp.community.peopleplanner.service.ExternalPersonalSyncService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class GoogleWorkspaceWatchInitializer {

    private final ExternalPersonalSyncService externalPersonalSyncService;

    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        try {
            log.info("Application ready — registering Google Workspace users watch...");
            externalPersonalSyncService.registerWatch();
        }
        catch (Exception e) {
            log.error("Failed to register Google Workspace watch on startup: {}", e.getMessage(), e);
        }
    }

    // Runs daily at 02:00 — renews the channel if it expires within 48 hours.
    // Google watch channels last a maximum of 7 days.
    @Scheduled(cron = "0 0 2 * * ?")
    public void renewWatch() {
        try {
            externalPersonalSyncService.renewWatchIfExpiring();
        }
        catch (Exception e) {
            log.error("Failed to renew Google Workspace watch: {}", e.getMessage(), e);
        }
    }

}
