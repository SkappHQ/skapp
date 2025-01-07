package com.skapp.enterprise.common.service.impl;

import com.skapp.community.common.service.BulkContextService;
import com.skapp.enterprise.common.config.TenantContext;
import lombok.AllArgsConstructor;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
@Primary
public class EpBulkContextServiceImpl implements BulkContextService {

	@Override
	public String getContext() {
		return TenantContext.getCurrentTenant();
	}

	@Override
	public void setContext(String context) {
		TenantContext.setCurrentTenant(context);
	}

}
