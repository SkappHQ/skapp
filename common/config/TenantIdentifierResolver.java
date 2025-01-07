package com.skapp.enterprise.common.config;

import com.skapp.enterprise.common.constant.EpCommonConstants;
import org.hibernate.context.spi.CurrentTenantIdentifierResolver;

public class TenantIdentifierResolver implements CurrentTenantIdentifierResolver<String> {

	@Override
	public String resolveCurrentTenantIdentifier() {
		String tenant = TenantContext.getCurrentTenant();
		return tenant != null ? tenant : EpCommonConstants.MASTER_DATABASE;
	}

	@Override
	public boolean validateExistingCurrentSessions() {
		return true;
	}

}
