package com.skapp.enterprise.common.type;

import com.skapp.community.common.type.CacheKey;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.util.concurrent.TimeUnit;

@Getter
@RequiredArgsConstructor
public enum EpCacheKeys implements CacheKey {

	CODE_CHALLENGE_CACHE_KEY("code_challenge_cache:%s", 5, TimeUnit.MINUTES);

	private final String key;

	private final long ttl;

	private final TimeUnit timeUnit;

	public String format(Object... values) {
		return key.formatted(values);
	}

}
