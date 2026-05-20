package com.skapp;

import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.persistence.autoconfigure.EntityScan;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.retry.annotation.EnableRetry;
import org.springframework.scheduling.annotation.AsyncConfigurer;
import org.springframework.scheduling.annotation.EnableAsync;

@EnableAsync
@SpringBootApplication(scanBasePackages = "com.skapp.community")
@EnableCaching
@EnableRetry
@EntityScan(basePackages = { "com.skapp.community.peopleplanner.model", "com.skapp.community.common.model",
		"com.skapp.community.timeplanner.model", "com.skapp.community.leaveplanner.model",
		"com.skapp.community.okrplanner.model", "com.skapp.community.crmplanner.model" })
@EnableJpaRepositories(
		basePackages = { "com.skapp.community.common.repository", "com.skapp.community.peopleplanner.repository",
				"com.skapp.community.leaveplanner.repository", "com.skapp.community.timeplanner.repository",
				"com.skapp.community.okrplanner.repository", "com.skapp.community.crmplanner.repository" })
public class TestSkappApplication implements AsyncConfigurer {

}
