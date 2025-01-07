package com.skapp.enterprise.common.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Configuration
public class TenantConfig {

	@Value("${ep.pro.tenants}")
	private String proTenantsString;

	@Bean
	public List<String> proTenants() {
		if (proTenantsString == null || proTenantsString.isEmpty()) {
			return Collections.emptyList();
		}

		return Arrays.stream(proTenantsString.trim().split(",")).filter(tenant -> !tenant.isEmpty()).toList();
	}

	@Bean
	public TenantValidator tenantValidator() {
		return new TenantValidator(proTenants());
	}

}
