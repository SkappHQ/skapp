package com.skapp.enterprise.common.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;

@Configuration
@RequiredArgsConstructor
public class DataSourceConfig {

	private final DataSourceFactory dataSourceFactory;

	@Bean
	@Primary
	public DataSource dataSource() {
		return new TenantRoutingDataSource(dataSourceFactory);
	}

	public void closeTenantDataSource(String tenantId) {
		dataSourceFactory.closeTenantDataSource(tenantId);
	}

}
