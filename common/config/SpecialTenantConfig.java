package com.skapp.enterprise.common.config;

import com.skapp.enterprise.common.constant.EpCommonConstants;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
@ConfigurationProperties(prefix = "special-tenants")
@Data
public class SpecialTenantConfig {

	private List<TenantInfo> tenants = new ArrayList<>();

	@Data
	public static class TenantInfo {

		private String name;

		private Integer userCount;

	}

	public int getMaxEmployeeCountForTenant() {
		String currentTenant = TenantContext.getCurrentTenant();
		return getMaxEmployeeCountForTenant(currentTenant);
	}

	public int getMaxEmployeeCountForTenant(String tenantName) {
		int defaultMaxCount = EpCommonConstants.ENTERPRISE_FREE_MAX_EMPLOYEE_COUNT;

		if (tenantName == null || tenantName.equals(EpCommonConstants.MASTER_DATABASE)) {
			return defaultMaxCount;
		}

		return getTenants().stream()
			.filter(t -> tenantName.equals(t.getName()))
			.findFirst()
			.map(SpecialTenantConfig.TenantInfo::getUserCount)
			.orElse(defaultMaxCount);
	}

	public TenantInfo getCurrentTenantInfo() {
		String currentTenant = TenantContext.getCurrentTenant();
		return getTenants().stream().filter(t -> t.getName().equals(currentTenant)).findFirst().orElse(null);
	}

}
