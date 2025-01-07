package com.skapp.enterprise.common.config;

import com.skapp.enterprise.common.service.TenantMigrationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class LiquibaseStartupConfig {

	private final TenantMigrationService tenantMigrationService;

	@Bean
	public ApplicationRunner runLiquibaseOnStartup() {
		return args -> {
			log.info("Starting Liquibase migrations on application startup...");
			tenantMigrationService.runMigrationsForAllTenants();
			log.info("Liquibase migrations completed successfully.");
		};
	}

}
