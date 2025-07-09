package com.skapp.enterprise.common.type;

import com.skapp.community.common.type.CacheKey;
import com.skapp.enterprise.common.constant.EpCommonConstants;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.util.concurrent.TimeUnit;

@Getter
@RequiredArgsConstructor
public enum EpCacheKeys implements CacheKey {

	CODE_CHALLENGE_CACHE_KEY("code_challenge_cache:%s", EpCommonConstants.REDIS_TTL_CODE_CHALLENGE_CACHE_KEY,
			TimeUnit.MINUTES),
	USER_DATA_CACHE_KEY("user_data_cache:%s:employee_data", EpCommonConstants.REDIS_TTL_USER_DATA_CACHE_KEY,
			TimeUnit.DAYS);

	private final String key;

	private final long ttl;

	private final TimeUnit timeUnit;

	public String format(Object... values) {
		return key.formatted(values);
	}

}
