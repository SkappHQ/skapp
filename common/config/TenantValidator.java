package com.skapp.enterprise.common.config;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class TenantValidator {

	private final List<String> proTenants;

	public boolean isCurrentTenantPro() {
		String currentTenant = TenantContext.getCurrentTenant();
		return currentTenant != null && proTenants.contains(currentTenant.trim());
	}

}
