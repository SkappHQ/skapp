package com.skapp.enterprise.common.config;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.enterprise.common.constant.EPCommonMessageConstant;
import com.skapp.enterprise.common.constant.EpCommonConstants;
import com.skapp.enterprise.common.util.TenantKeyExtractor;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.datasource.lookup.AbstractRoutingDataSource;

import javax.sql.DataSource;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.ConcurrentHashMap;

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

				dataSources.put(lookupKey, dataSource);
				return dataSource;
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

}
