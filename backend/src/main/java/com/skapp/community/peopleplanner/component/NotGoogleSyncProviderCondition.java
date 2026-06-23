package com.skapp.community.peopleplanner.component;

import org.springframework.context.annotation.Condition;
import org.springframework.context.annotation.ConditionContext;
import org.springframework.core.type.AnnotatedTypeMetadata;

/**
 * Condition that is true when external-sync.provider is absent or
 * set to any value other than "google".
 * Used to activate the no-op fallback sync service.
 */
public class NotGoogleSyncProviderCondition implements Condition {

    @Override
    public boolean matches(ConditionContext context, AnnotatedTypeMetadata metadata) {
        String provider = context.getEnvironment()
                .getProperty("external-sync.provider", "");
        return !provider.equalsIgnoreCase("google");
    }
}