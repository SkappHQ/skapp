package com.skapp.enterprise.common.config;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;

@Service
@RequiredArgsConstructor
public class TenantDataSourceManager {

	private final DataSource dataSource;

	public void closeTenantDataSource(String tenantId) {
		if (dataSource instanceof TenantRoutingDataSource routingDs) {
			routingDs.closeTenantDataSource(tenantId);
		}
	}

}
