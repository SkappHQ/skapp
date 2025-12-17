package com.skapp.enterprise.common.service.impl;

import com.github.benmanes.caffeine.cache.Cache;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.service.impl.CacheServiceImpl;
import com.skapp.enterprise.common.config.TenantContext;
import com.skapp.enterprise.common.constant.EPCommonMessageConstant;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Primary;
import org.springframework.data.redis.RedisConnectionFailureException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.concurrent.TimeUnit;

@Service
@Slf4j
@Primary
public class EpCacheServiceImpl extends CacheServiceImpl {

	private final StringRedisTemplate redisTemplate;

	public EpCacheServiceImpl(Cache<String, String> cache, StringRedisTemplate redisTemplate) {
		super(cache);
		this.redisTemplate = redisTemplate;
	}

	@Override
	public String get(String cacheKey) {
		try {
			log.info("get: Cache key {}", cacheKey);
			return redisTemplate.opsForValue().get(generateTenantKey(cacheKey));
		}
		catch (RedisConnectionFailureException e) {
			log.error("get: Redis connection failed: {}", e.getMessage());
			return null;
		}
	}

	@Override
	public void put(String cacheKey, String value, long ttl, TimeUnit timeUnit) {
		try {
			redisTemplate.opsForValue().set(generateTenantKey(cacheKey), value, ttl, timeUnit);
			log.info("put: Cache key {} set with value {}", cacheKey, value);
		}
		catch (RedisConnectionFailureException e) {
			log.error("put: Redis connection failed: {}", e.getMessage());
		}
	}

	@Override
	public void invalidate(String cacheKey) {
		try {
			redisTemplate.delete(generateTenantKey(cacheKey));
			log.info("invalidate: Cache key {} deleted", cacheKey);
		}
		catch (RedisConnectionFailureException e) {
			log.error("invalidate: Redis connection failed: {}", e.getMessage());
		}
	}

	@Override
	public List<String> getValuesByPattern(String pattern) {
		Set<String> keys = redisTemplate.keys(generateTenantKey(pattern));

		if (keys.isEmpty()) {
			return Collections.emptyList();
		}

		List<String> values = redisTemplate.opsForValue().multiGet(keys);
		return values != null ? values : Collections.emptyList();
	}

	private String generateTenantKey(String cacheKey) {
		int firstColonIndex = cacheKey.indexOf(":");
		if (firstColonIndex == -1) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_INVALID_CACHE_KEY);
		}

		return cacheKey.substring(0, firstColonIndex + 1) + TenantContext.getCurrentTenant() + ":"
				+ cacheKey.substring(firstColonIndex + 1);
	}

}
