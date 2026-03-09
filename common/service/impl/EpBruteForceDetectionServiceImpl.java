package com.skapp.enterprise.common.service.impl;

import com.skapp.community.common.service.CacheService;
import com.skapp.enterprise.common.constant.EpAuthConstants;
import com.skapp.enterprise.common.service.BruteForceDetectionService;
import com.skapp.enterprise.common.service.TelemetryService;
import com.skapp.enterprise.common.config.TenantContext;
import com.skapp.enterprise.common.type.EpCacheKeys;
import com.skapp.enterprise.common.type.TelemetrySeverity;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
// Tracks failed sign-in attempts per user in cache (TTL-based sliding window).
// When attempts reach the threshold, reports a warning via telemetry and resets the
// counter.
public class EpBruteForceDetectionServiceImpl implements BruteForceDetectionService {

	private final CacheService cacheService;

	private final TelemetryService telemetryService;

	@Override
	public void handleFailedSignInAttempt(String email) {
		try {
			EpCacheKeys cacheKey = EpCacheKeys.FAILED_SIGN_IN_ATTEMPT_BY_USER_CACHE_KEY;
			String formattedKey = cacheKey.format(email);
			String currentCount = cacheService.get(formattedKey);
			int attempts = (currentCount != null) ? Integer.parseInt(currentCount) + 1 : 1;
			cacheService.put(formattedKey, String.valueOf(attempts), cacheKey.getTtl(), cacheKey.getTimeUnit());

			if (attempts >= EpAuthConstants.BRUTE_FORCE_LOGIN_ATTEMPT_THRESHOLD) {
				log.warn("handleFailedSignInAttempt: Brute-force login detected for email={}", email);
				String tenant = TenantContext.getCurrentTenant();
				telemetryService.report("Potential brute-force login detected for email: " + email,
						TelemetrySeverity.WARNING, Map.of("alert.type", "brute_force_login"),
						Map.of("email", email, "attempts", String.valueOf(attempts), "tenant", tenant));
				cacheService.invalidate(formattedKey);
			}
		}
		catch (Exception e) {
			log.error("handleFailedSignInAttempt: Error tracking failed login attempt for email={}", email, e);
		}
	}

	@Override
	public void resetFailedSignInAttempts(String email) {
		try {
			String formattedKey = EpCacheKeys.FAILED_SIGN_IN_ATTEMPT_BY_USER_CACHE_KEY.format(email);
			cacheService.invalidate(formattedKey);
		}
		catch (Exception e) {
			log.error("resetFailedSignInAttempts: Error resetting failed login attempts for email={}", email, e);
		}
	}

}
