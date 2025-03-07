package com.skapp.enterprise.common.config;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.enterprise.common.constant.EPCommonMessageConstant;
import com.skapp.enterprise.common.constant.EpCommonConstants;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.engine.jdbc.connections.spi.MultiTenantConnectionProvider;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;

@Component
@Slf4j
@RequiredArgsConstructor
public class MultiTenantConnectionProviderImpl implements MultiTenantConnectionProvider<String> {

	private final transient DataSource dataSource;

	@Override
	public Connection getAnyConnection() throws SQLException {
		return dataSource.getConnection();
	}

	@Override
	public void releaseAnyConnection(Connection connection) throws SQLException {
		connection.close();
	}

	@Override
	public Connection getConnection(String tenantIdentifier) throws SQLException {
		Connection connection = getAnyConnection();
		try {
			connection.setCatalog(tenantIdentifier);
			return connection;
		}
		catch (SQLException e) {
			connection.close();
			throw new ModuleException(
					EPCommonMessageConstant.EP_COMMON_ERROR_COULD_NOT_ALTER_CONNECTION_TO_SPECIFIED_TENANT,
					new String[] { tenantIdentifier, e.getMessage() });
		}
	}

	@Override
	public void releaseConnection(String tenantIdentifier, Connection connection) {
		try {
			if (connection != null && !connection.isClosed()) {
				connection.setCatalog(EpCommonConstants.MASTER_DATABASE);
				log.info("Reset catalog to default after releasing connection for tenant: {}", tenantIdentifier);
			}
		}
		catch (SQLException e) {
			log.error("Failed to reset catalog to master database for tenant: {}. Error: {}", tenantIdentifier,
					e.getMessage(), e);
		}
		finally {
			try {
				if (connection != null && !connection.isClosed()) {
					connection.close();
				}
			}
			catch (SQLException e) {
				log.error("Failed to close connection for tenant: {}. Error: {}", tenantIdentifier, e.getMessage(), e);
			}
		}
	}

	@Override
	public boolean supportsAggressiveRelease() {
		return false;
	}

	@Override
	public boolean isUnwrappableAs(@NonNull Class<?> unwrapType) {
		return false;
	}

	@Override
	public <T> T unwrap(@NonNull Class<T> unwrapType) {
		if (unwrapType.isInstance(this)) {
			return unwrapType.cast(this);
		}
		throw new UnsupportedOperationException("Cannot unwrap to " + unwrapType);
	}

}
