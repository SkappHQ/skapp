package com.skapp.community.common.config;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

@Configuration
@ConditionalOnMissingBean(name = "RedisConfig")
public class CaffeineCacheConfig {

	@Bean
	public Cache<String, String> userVersionCache() {
		return Caffeine.newBuilder().expireAfterWrite(7, TimeUnit.DAYS).maximumSize(10000).build();
	}

}
