package com.skapp.enterprise.common.config;

import com.skapp.enterprise.common.constant.EpCommonConstants;
import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
@Data
public class SpecialTenantConfig {

	@Value("${special.tenants}")
	private String tenants;

	@Value("${special.tenant-limits}")
	private String tenantLimits;

	private List<TenantInfo> tenantInfoList;

	@Data
	public static class TenantInfo {

		private String name;

		private Integer userCount;

	}

	private void parseTenantInfo() {
		tenantInfoList = new ArrayList<>();

		if (tenants != null && tenantLimits != null) {
			String[] tenantNames = tenants.split("\\s*,\\s*");
			String[] limits = tenantLimits.split("\\s*,\\s*");

			for (int i = 0; i < tenantNames.length && i < limits.length; i++) {
				TenantInfo info = new TenantInfo();
				info.setName(tenantNames[i].trim());
				try {
					info.setUserCount(Integer.parseInt(limits[i].trim()));
				}
				catch (NumberFormatException e) {
					info.setUserCount(EpCommonConstants.ENTERPRISE_FREE_MAX_EMPLOYEE_COUNT);
				}
				tenantInfoList.add(info);
			}
		}
	}

	public List<TenantInfo> getTenantInfoList() {
		if (tenantInfoList == null) {
			parseTenantInfo();
		}
		return tenantInfoList;
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

		return getTenantInfoList().stream()
			.filter(t -> tenantName.equals(t.getName()))
			.findFirst()
			.map(TenantInfo::getUserCount)
			.orElse(defaultMaxCount);
	}

	public TenantInfo getCurrentTenantInfo() {
		String currentTenant = TenantContext.getCurrentTenant();
		return getTenantInfoList().stream().filter(t -> t.getName().equals(currentTenant)).findFirst().orElse(null);
	}

}