package com.skapp.enterprise.common.config;

import com.skapp.enterprise.common.constant.EpCommonConstants;
import com.skapp.enterprise.common.type.OperationType;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.util.HashMap;
import java.util.Map;

@Configuration
@RequiredArgsConstructor
public class DataSourceConfig {

	private final DataSourceFactory dataSourceFactory;

	@Bean
	@Primary
	public DataSource dataSource() {
		TenantRoutingDataSource tenantRoutingDataSource = new TenantRoutingDataSource(dataSourceFactory);

		DataSource masterWriteDS = dataSourceFactory.getMasterDataSource(OperationType.WRITE);
		DataSource masterReadDS = dataSourceFactory.getMasterDataSource(OperationType.READ);

		Map<Object, Object> targetDataSources = new HashMap<>();
		targetDataSources.put(EpCommonConstants.MASTER_DATABASE + "-write", masterWriteDS);
		targetDataSources.put(EpCommonConstants.MASTER_DATABASE + "-read", masterReadDS);

		tenantRoutingDataSource.setDefaultTargetDataSource(masterWriteDS);
		tenantRoutingDataSource.setTargetDataSources(targetDataSources);
		tenantRoutingDataSource.afterPropertiesSet();

		return tenantRoutingDataSource;
	}

	public void closeTenantDataSource(String tenantId) {
		dataSourceFactory.closeTenantDataSource(tenantId);
	}

}
