package com.skapp.enterprise.common.config;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.enterprise.common.constant.EPCommonMessageConstant;
import com.skapp.enterprise.common.type.OperationType;
import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.util.ArrayList;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
public class DataSourceFactory {

	private final Map<Object, DataSource> dataSources = new ConcurrentHashMap<>();

	@Value("${spring.datasource.master.write.url}")
	private String masterWriteUrl;

	@Value("${spring.datasource.master.read.url}")
	private String masterReadUrl;

	@Value("${spring.datasource.username}")
	private String masterUsername;

	@Value("${spring.datasource.password}")
	private String masterPassword;

	@Value("${spring.master.hikari.maximum-pool-size:20}")
	private int masterMaxPoolSize;

	@Value("${spring.master.hikari.minimum-idle:5}")
	private int masterMinIdle;

	@Value("${spring.master.hikari.idle-timeout:300000}")
	private long masterIdleTimeout;

	@Value("${spring.master.hikari.max-lifetime:1800000}")
	private long masterMaxLifetime;

	@Value("${spring.master.hikari.connection-timeout:30000}")
	private long masterConnectionTimeout;

	@Value("${spring.master.hikari.validation-timeout:5000}")
	private long masterValidationTimeout;

	@Value("${spring.tenant.hikari.maximum-pool-size:30}")
	private int tenantMaxPoolSize;

	@Value("${spring.tenant.hikari.minimum-idle:5}")
	private int tenantMinIdle;

	@Value("${spring.tenant.hikari.idle-timeout:300000}")
	private long tenantIdleTimeout;

	@Value("${spring.tenant.hikari.max-lifetime:1800000}")
	private long tenantMaxLifetime;

	@Value("${spring.tenant.hikari.connection-timeout:30000}")
	private long tenantConnectionTimeout;

	@Value("${spring.tenant.hikari.validation-timeout:5000}")
	private long tenantValidationTimeout;

	@Value("${spring.datasource.driver-class-name}")
	private String driverClassName;

	public DataSource getTenantDataSource(OperationType operationType, String tenantId) {
		if (tenantId == null || tenantId.isEmpty()) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_TENANT_ID_REQUIRED);
		}
		return operationType == OperationType.READ ? createTenantReadDataSource(tenantId)
				: createTenantWriteDataSource(tenantId);
	}

	public DataSource getMasterDataSource(OperationType operationType) {
		return operationType == OperationType.READ ? createMasterReadDataSource() : createMasterWriteDataSource();
	}

	public DataSource createMasterWriteDataSource() {
		return dataSources.computeIfAbsent("master-write",
				k -> new HikariDataSource(createBaseHikariConfig(masterWriteUrl, masterUsername, masterPassword,
						"Master-Write-Pool", masterMaxPoolSize, masterMinIdle, masterIdleTimeout, masterMaxLifetime,
						masterConnectionTimeout, masterValidationTimeout, false)));
	}

	public DataSource createMasterReadDataSource() {
		return dataSources.computeIfAbsent("master-read",
				k -> new HikariDataSource(createBaseHikariConfig(masterReadUrl, masterUsername, masterPassword,
						"Master-Read-Pool", masterMaxPoolSize, masterMinIdle, masterIdleTimeout, masterMaxLifetime,
						masterConnectionTimeout, masterValidationTimeout, true)));
	}

	public DataSource createTenantWriteDataSource(String tenantId) {
		String dbUrl = extractBaseDbUrl(masterWriteUrl) + tenantId;

		return dataSources.computeIfAbsent(tenantId + "-write",
				k -> new HikariDataSource(createBaseHikariConfig(dbUrl, masterUsername, masterPassword,
						"Tenant-" + tenantId + "-Write-Pool", tenantMaxPoolSize, tenantMinIdle, tenantIdleTimeout,
						tenantMaxLifetime, tenantConnectionTimeout, tenantValidationTimeout, false)));
	}

	public DataSource createTenantReadDataSource(String tenantId) {
		String dbUrl = extractBaseDbUrl(masterReadUrl) + tenantId;

		return dataSources.computeIfAbsent(tenantId + "-read",
				k -> new HikariDataSource(createBaseHikariConfig(dbUrl, masterUsername, masterPassword,
						"Tenant-" + tenantId + "-Read-Pool", tenantMaxPoolSize, tenantMinIdle, tenantIdleTimeout,
						tenantMaxLifetime, tenantConnectionTimeout, tenantValidationTimeout, true)));
	}

	private HikariConfig createBaseHikariConfig(String jdbcUrl, String username, String password, String poolName,
			int maxPoolSize, int minIdle, long idleTimeout, long maxLifetime, long connectionTimeout,
			long validationTimeout, boolean readOnly) {

		HikariConfig config = new HikariConfig();
		config.setJdbcUrl(jdbcUrl);
		config.setUsername(username);
		config.setPassword(password);
		config.setDriverClassName(driverClassName);
		config.setPoolName(poolName);
		config.setMaximumPoolSize(maxPoolSize);
		config.setMinimumIdle(minIdle);
		config.setIdleTimeout(idleTimeout);
		config.setMaxLifetime(maxLifetime);
		config.setConnectionTimeout(connectionTimeout);
		config.setValidationTimeout(validationTimeout);
		config.setReadOnly(readOnly);

		return config;
	}

	public void closeTenantDataSource(String tenantId) {
		if (tenantId == null || tenantId.isEmpty()) {
			return;
		}

		for (Object keyObj : new ArrayList<>(dataSources.keySet())) {
			String key = keyObj.toString();
			if (key.startsWith(tenantId + "-")) {
				DataSource dataSource = dataSources.remove(key);
				if (dataSource != null) {
					closeDataSource(dataSource);
				}
			}
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

	private String extractBaseDbUrl(String url) {
		String baseUrl = url.substring(0, url.lastIndexOf("/") + 1);
		if (baseUrl.contains("?")) {
			baseUrl = baseUrl.substring(0, baseUrl.indexOf("?"));
		}
		return baseUrl;
	}

}
