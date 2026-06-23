package com.skapp.community.peopleplanner.service.impl;

import com.skapp.community.peopleplanner.component.NotGoogleSyncProviderCondition;
import com.skapp.community.peopleplanner.service.ExternalPersonSyncService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Conditional;
import org.springframework.stereotype.Service;

/**
 * No-op fallback — active when EXTERNAL_SYNC_PROVIDER is absent or not "google".
 * Prevents startup failure when Google integration env vars are not configured.
 */
@Slf4j
@Service
@Conditional(NotGoogleSyncProviderCondition.class)
public class NoOpExternalPersonSyncService implements ExternalPersonSyncService {

    private static final String NOT_CONFIGURED_MSG =
            "External sync provider is not configured — operation skipped.";

    @Override public void authenticate() { log.info(NOT_CONFIGURED_MSG); }

    @Override public void registerWatch() { log.info(NOT_CONFIGURED_MSG); }

    @Override public void renewWatchIfExpiring() { log.info(NOT_CONFIGURED_MSG); }

    @Override
    public void processWatchNotification(String resourceState, String resourceUri) {
        log.info(NOT_CONFIGURED_MSG);
    }

    @Override
    public void bulkSync(String callerEmail) {
        log.warn("bulkSync called but {}.", NOT_CONFIGURED_MSG);
    }

    @Override
    public boolean isValidChannelToken(String token) {
        log.info(NOT_CONFIGURED_MSG);
        return false;
    }
}