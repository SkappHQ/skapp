package com.skapp.enterprise.common.config;

import com.skapp.enterprise.common.constant.EpCommonConstants;
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
		TenantRoutingDataSource routingDataSource = new TenantRoutingDataSource(dataSourceFactory);

		DataSource masterWriteDS = dataSourceFactory.createMasterWriteDataSource();
		DataSource masterReadDS = dataSourceFactory.createMasterReadDataSource();

		Map<Object, Object> targetDataSources = new HashMap<>();
		targetDataSources.put(EpCommonConstants.MASTER_DATABASE + "-write", masterWriteDS);
		targetDataSources.put(EpCommonConstants.MASTER_DATABASE + "-read", masterReadDS);

		routingDataSource.setDefaultTargetDataSource(masterWriteDS);
		routingDataSource.setTargetDataSources(targetDataSources);
		routingDataSource.afterPropertiesSet();

		return routingDataSource;
	}

}
