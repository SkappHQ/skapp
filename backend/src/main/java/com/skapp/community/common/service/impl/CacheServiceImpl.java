package com.skapp.community.common.service.impl;

import com.github.benmanes.caffeine.cache.Cache;
import com.skapp.community.common.service.CacheService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class CacheServiceImpl implements CacheService {

	private final Cache<String, String> cache;

	@Override
	public String get(String cacheKey) {
		return cache.getIfPresent(cacheKey);
	}

	@Override
	public void put(String cacheKey, String value, long ttl, TimeUnit timeUnit) {
		cache.put(cacheKey, value);
	}

	@Override
	public void invalidate(String cacheKey) {
		cache.invalidate(cacheKey);
	}

	@Override
	public List<String> getValuesByPattern(String pattern) {
		// Implemented in enterprise version
		return Collections.emptyList();
	}

}
