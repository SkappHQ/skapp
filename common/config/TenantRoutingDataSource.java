package com.skapp.enterprise.common.config;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.enterprise.common.constant.EPCommonMessageConstant;
import com.skapp.enterprise.common.constant.EpCommonConstants;
import com.skapp.enterprise.common.type.OperationType;
import com.skapp.enterprise.common.util.TenantKeyExtractor;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.datasource.lookup.AbstractRoutingDataSource;

import javax.sql.DataSource;
import java.util.Objects;

@Slf4j
@RequiredArgsConstructor
public class TenantRoutingDataSource extends AbstractRoutingDataSource {

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

		if (lookupKey != null && lookupKey.contains("-")) {
			TenantDataSourceKey key = TenantKeyExtractor.extractTenantKey(lookupKey);
			if (Objects.equals(key.getTenantId(), EpCommonConstants.MASTER_DATABASE)) {
				if (key.isRead()) {
					return dataSourceFactory.getMasterDataSource(OperationType.READ);
				}
				else {
					return dataSourceFactory.getMasterDataSource(OperationType.WRITE);
				}

			}
			else {
				if (key.isRead()) {
					return dataSourceFactory.getTenantDataSource(OperationType.READ, key.getTenantId());
				}
				else {
					return dataSourceFactory.getTenantDataSource(OperationType.WRITE, key.getTenantId());
				}
			}
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
