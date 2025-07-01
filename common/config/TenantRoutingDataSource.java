package com.skapp.enterprise.common.config;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.enterprise.common.constant.EPCommonMessageConstant;
import com.skapp.enterprise.common.constant.EpCommonConstants;
import com.skapp.enterprise.common.util.TenantKeyExtractor;
import com.zaxxer.hikari.HikariDataSource;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.datasource.lookup.AbstractRoutingDataSource;

import javax.sql.DataSource;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@RequiredArgsConstructor
public class TenantRoutingDataSource extends AbstractRoutingDataSource {

	private final Map<Object, DataSource> dataSources = new ConcurrentHashMap<>();

	private final DataSourceFactory dataSourceFactory;

	@Override
	protected Object determineCurrentLookupKey() {
		String tenantId = TenantContext.getCurrentTenant();
		boolean isRead = RequestMethodContext.isReadOnly();

		if (tenantId == null || tenantId.equals(EpCommonConstants.MASTER_DATABASE)) {
			return EpCommonConstants.MASTER_DATABASE + "-" + (isRead ? "read" : "write");
		}

		return tenantId + "-" + (isRead ? "read" : "write");
	}

	@Override
	@NonNull
	protected DataSource determineTargetDataSource() {
		String lookupKey = (String) determineCurrentLookupKey();
		DataSource dataSource = dataSources.get(lookupKey);
		if (dataSource != null) {
			return dataSource;
		}

		if (lookupKey != null && lookupKey.contains("-")) {
			TenantDataSourceKey key = TenantKeyExtractor.extractTenantKey(lookupKey);
			if (Objects.equals(key.getTenantId(), EpCommonConstants.MASTER_DATABASE)) {
				if (key.isRead()) {
					dataSource = dataSourceFactory.getDataSource(true);
				}
				else {
					dataSource = dataSourceFactory.getDataSource(false);
				}

			}
			else {
				if (key.isRead()) {
					dataSource = dataSourceFactory.getDataSource(key.getTenantId(), true);
				}
				else {
					dataSource = dataSourceFactory.getDataSource(key.getTenantId(), false);
				}
			}

			dataSources.put(lookupKey, dataSource);
			return dataSource;
		}

		DataSource defaultDataSource = getResolvedDefaultDataSource();
		if (defaultDataSource == null) {
			throw new ModuleException(
					EPCommonMessageConstant.EP_COMMON_ERROR_CANNOT_DETERMINE_TARGET_DATASOURCE_FOR_LOOKUP_KEY,
					new String[] { lookupKey });
		}
		return defaultDataSource;
	}

	public void closeTenantDataSource(String tenantId) {
		List<String> keysToRemove = new ArrayList<>();

		dataSources.entrySet().removeIf(entry -> {
			String key = entry.getKey().toString();
			if (key.startsWith(tenantId + "-")) {
				closeDataSource(entry.getValue());
				keysToRemove.add(key);
				return true;
			}
			return false;
		});

		if (!keysToRemove.isEmpty()) {
			log.debug("Closed {} datasource(s) for tenant: {}", keysToRemove.size(), tenantId);
		}
	}

	private void closeDataSource(DataSource dataSource) {
		if (dataSource instanceof HikariDataSource hikariDataSource) {
			if (!hikariDataSource.isClosed()) {
				try {
					hikariDataSource.close();
					log.debug("Closed HikariDataSource: {}", hikariDataSource.getPoolName());
				}
				catch (Exception e) {
					log.error("Error closing HikariDataSource: {}", hikariDataSource.getPoolName(), e);
				}
			}
		}
	}

}
