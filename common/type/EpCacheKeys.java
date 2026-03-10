package com.skapp.enterprise.common.type;

import com.skapp.community.common.type.CacheKey;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.util.concurrent.TimeUnit;

@Getter
@RequiredArgsConstructor
public enum EpCacheKeys implements CacheKey {

	CODE_CHALLENGE_CACHE_KEY("code_challenge_cache:%s", 5, TimeUnit.MINUTES),
	TENANT_ALL_USERS_CACHE_KEY("users_cache:all_users", 7, TimeUnit.DAYS),
	TENANT_ALL_USERS_AUTH_PICS_CACHE_KEY("users_cache:all_users_auth_pics", 7, TimeUnit.DAYS),
	TENANT_ALL_JOBS_CACHE_KEY("jobs_cache:all_jobs", 5, TimeUnit.DAYS),
	ALL_PROJECT_DETAILS_CACHE_KEY("project_details_cache:all_projects", 7, TimeUnit.DAYS),
	AI_TOKEN_USER_CACHE_KEY("ai_token_cache:user:%s", 1, TimeUnit.DAYS),
	ORGANIZATION_TIMEZONE_CACHE_KEY("organization_cache:timezone", 365, TimeUnit.DAYS),
	FAILED_SIGN_IN_ATTEMPT_BY_USER_CACHE_KEY("failed_sign_in_attempts:%s", 5, TimeUnit.MINUTES);

	private final String key;

	private final long ttl;

	private final TimeUnit timeUnit;

	public String format(Object... values) {
		return key.formatted(values);
	}

}
