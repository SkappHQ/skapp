package com.skapp.enterprise.common.config;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.enterprise.common.constant.EPCommonMessageConstant;
import com.skapp.enterprise.common.constant.EpCommonConstants;
import com.zaxxer.hikari.HikariDataSource;
import jakarta.persistence.EntityManagerFactory;
import lombok.NonNull;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.context.spi.CurrentTenantIdentifierResolver;
import org.hibernate.engine.jdbc.connections.spi.MultiTenantConnectionProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.jdbc.datasource.lookup.AbstractRoutingDataSource;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.orm.jpa.vendor.HibernateJpaVendorAdapter;
import org.springframework.transaction.PlatformTransactionManager;

import javax.sql.DataSource;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Configuration
@EnableJpaRepositories(
		basePackages = { "com.skapp.enterprise.common.masterrepository", "com.skapp.enterprise.common.repository",
				"com.skapp.community.common.repository", "com.skapp.community.peopleplanner.repository",
				"com.skapp.community.leaveplanner.repository", "com.skapp.community.timeplanner.repository",
				"com.skapp.enterprise.esignature.repository", "com.skapp.enterprise.leaveplanner.repository" })
public class MultiTenantDataSourceConfig {

	@Value("${spring.datasource.url}")
	private String masterUrl;

	@Value("${spring.datasource.username}")
	private String masterUsername;

	@Value("${spring.datasource.password}")
	private String masterPassword;

	@Value("${spring.datasource.driver-class-name}")
	private String driverClassName;

	@Value("${spring.master.hikari.maximum-pool-size:30}")
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

	@Value("${spring.tenant.hikari.maximum-pool-size:20}")
	private int tenantMaxPoolSize;

	@Value("${spring.tenant.hikari.minimum-idle:3}")
	private int tenantMinIdle;

	@Value("${spring.tenant.hikari.idle-timeout:300000}")
	private long tenantIdleTimeout;

	@Value("${spring.tenant.hikari.max-lifetime:1800000}")
	private long tenantMaxLifetime;

	@Value("${spring.tenant.hikari.connection-timeout:30000}")
	private long tenantConnectionTimeout;

	@Value("${spring.tenant.hikari.validation-timeout:5000}")
	private long tenantValidationTimeout;

	private final Map<String, DataSource> dataSources = new ConcurrentHashMap<>();

	private final Set<String> validTenants = ConcurrentHashMap.newKeySet();

	@Bean
	@Primary
	public DataSource dataSource() {
		AbstractRoutingDataSource multiTenantDataSource = new AbstractRoutingDataSource() {
			@Override
			protected Object determineCurrentLookupKey() {
				String tenantId = TenantContext.getCurrentTenant();
				return tenantId != null ? tenantId : EpCommonConstants.MASTER_DATABASE;
			}

			@Override
			@NonNull
			protected DataSource determineTargetDataSource() {
				String lookupKey = (String) determineCurrentLookupKey();

				if (!EpCommonConstants.MASTER_DATABASE.equals(lookupKey) && !validTenants.contains(lookupKey)) {
					log.error("Attempt to access invalid tenant: {}", lookupKey);
					throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_INVALID_TENANT,
							new String[] { lookupKey });
				}

				return dataSources.computeIfAbsent(lookupKey,
						key -> key != null && key.equals(EpCommonConstants.MASTER_DATABASE) ? createMasterDataSource()
								: createTenantDataSource(key));
			}
		};

		DataSource masterDataSource = createMasterDataSource();
		multiTenantDataSource.setDefaultTargetDataSource(masterDataSource);
		multiTenantDataSource.setTargetDataSources(new HashMap<>());
		multiTenantDataSource.afterPropertiesSet();

		validTenants.add(EpCommonConstants.MASTER_DATABASE);
		dataSources.put(EpCommonConstants.MASTER_DATABASE, masterDataSource);

		return multiTenantDataSource;
	}

	public DataSource createMasterDataSource() {
		HikariDataSource dataSource = new HikariDataSource();
		dataSource.setJdbcUrl(masterUrl + "?createDatabaseIfNotExist=true");
		dataSource.setUsername(masterUsername);
		dataSource.setPassword(masterPassword);
		dataSource.setDriverClassName(driverClassName);

		dataSource.setPoolName("Master-Pool");
		dataSource.setMaximumPoolSize(masterMaxPoolSize);
		dataSource.setMinimumIdle(masterMinIdle);
		dataSource.setIdleTimeout(masterIdleTimeout);
		dataSource.setMaxLifetime(masterMaxLifetime);
		dataSource.setConnectionTimeout(masterConnectionTimeout);
		dataSource.setValidationTimeout(masterValidationTimeout);

		return dataSource;
	}

	private DataSource createTenantDataSource(String tenantId) {
		String dbUrl = masterUrl.substring(0, masterUrl.lastIndexOf("/") + 1) + tenantId;
		if (dbUrl.contains("?")) {
			dbUrl = dbUrl.substring(0, dbUrl.indexOf("?"));
		}

		HikariDataSource dataSource = new HikariDataSource();
		dataSource.setJdbcUrl(dbUrl + "?createDatabaseIfNotExist=true");
		dataSource.setUsername(masterUsername);
		dataSource.setPassword(masterPassword);
		dataSource.setDriverClassName(driverClassName);

		dataSource.setPoolName("Tenant-" + tenantId + "-Pool");
		dataSource.setMaximumPoolSize(tenantMaxPoolSize);
		dataSource.setMinimumIdle(tenantMinIdle);
		dataSource.setIdleTimeout(tenantIdleTimeout);
		dataSource.setMaxLifetime(tenantMaxLifetime);
		dataSource.setConnectionTimeout(tenantConnectionTimeout);
		dataSource.setValidationTimeout(tenantValidationTimeout);

		return dataSource;
	}

	@Bean
	@Primary
	public LocalContainerEntityManagerFactoryBean entityManagerFactory(DataSource dataSource,
			MultiTenantConnectionProvider<String> multiTenantConnectionProvider,
			CurrentTenantIdentifierResolver<String> currentTenantIdentifierResolver) {

		LocalContainerEntityManagerFactoryBean entityManagerFactoryBean = new LocalContainerEntityManagerFactoryBean();
		entityManagerFactoryBean.setDataSource(dataSource);
		entityManagerFactoryBean.setPackagesToScan("com.skapp.enterprise.common.model",
				"com.skapp.enterprise.common.model.master", "com.skapp.community.common.model",
				"com.skapp.community.peopleplanner.model", "com.skapp.community.leaveplanner.model",
				"com.skapp.community.timeplanner.model", "com.skapp.enterprise.esignature.model",
				"com.skapp.enterprise.leaveplanner.model");

		HibernateJpaVendorAdapter vendorAdapter = new HibernateJpaVendorAdapter();
		entityManagerFactoryBean.setJpaVendorAdapter(vendorAdapter);

		Map<String, Object> properties = new HashMap<>();
		properties.put("hibernate.multiTenancy", "DATABASE");
		properties.put("hibernate.tenant_identifier_resolver", currentTenantIdentifierResolver);
		properties.put("hibernate.multi_tenant_connection_provider", multiTenantConnectionProvider);

		entityManagerFactoryBean.setJpaPropertyMap(properties);
		return entityManagerFactoryBean;
	}

	@Bean
	@Primary
	public PlatformTransactionManager transactionManager(EntityManagerFactory entityManagerFactory) {
		JpaTransactionManager transactionManager = new JpaTransactionManager();
		transactionManager.setEntityManagerFactory(entityManagerFactory);
		return transactionManager;
	}

	@Bean
	public MultiTenantConnectionProvider<String> multiTenantConnectionProvider() {
		return new MultiTenantConnectionProviderImpl(dataSource());
	}

	@Bean
	public CurrentTenantIdentifierResolver<String> currentTenantIdentifierResolver() {
		return new TenantIdentifierResolver();
	}

	public void addTenant(String tenantId) {
		validTenants.add(tenantId);
		log.info("Tenant {} registered successfully", tenantId);
	}

	public void removeTenant(String tenantId) {
		validTenants.remove(tenantId);
		DataSource dataSource = dataSources.remove(tenantId);
		if (dataSource instanceof HikariDataSource hikariDataSource) {
			hikariDataSource.close();
		}
		log.info("Tenant {} unregistered and connections closed", tenantId);
	}

}
