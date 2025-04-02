package com.skapp.enterprise.common.util;

import com.skapp.enterprise.common.config.TenantDataSourceKey;
import lombok.experimental.UtilityClass;

@UtilityClass
public class TenantKeyExtractor {

	public static TenantDataSourceKey extractTenantKey(String lookupKey) {
		if (lookupKey.endsWith("-read")) {
			String tenantId = lookupKey.substring(0, lookupKey.length() - 5);
			return new TenantDataSourceKey(tenantId, true);
		}
		else if (lookupKey.endsWith("-write")) {
			String tenantId = lookupKey.substring(0, lookupKey.length() - 6);
			return new TenantDataSourceKey(tenantId, false);
		}

		throw new IllegalArgumentException("Invalid lookup key format: " + lookupKey);
	}

}
