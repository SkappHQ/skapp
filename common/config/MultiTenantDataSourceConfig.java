package com.skapp.enterprise.common.config;

import com.skapp.enterprise.common.constant.EpCommonConstants;
import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import jakarta.persistence.EntityManagerFactory;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
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
import org.springframework.transaction.annotation.EnableTransactionManagement;

import javax.sql.DataSource;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Configuration
@RequiredArgsConstructor
@EnableJpaRepositories(basePackages = { "com.skapp.enterprise.common.masterrepository",
        "com.skapp.enterprise.common.repository", "com.skapp.community.common.repository",
        "com.skapp.community.leaveplanner.repository", "com.skapp.community.peopleplanner.repository",
        "com.skapp.community.timeplanner.repository", "com.skapp.enterprise.esignature.repository" })
@EnableTransactionManagement
public class MultiTenantDataSourceConfig {

    private static final String CREATE_DB_PARAM = "?createDatabaseIfNotExist=true";

    private static final String READ_SUFFIX = "-read";

    private static final String WRITE_SUFFIX = "-write";

    @Value("${spring.datasource.master.write.url}")
    private String masterWriteUrl;

    @Value("${spring.datasource.master.read.url}")
    private String masterReadUrl;

    @Value("${spring.datasource.username}")
    private String masterUsername;

    @Value("${spring.datasource.password}")
    private String masterPassword;

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

    @Value("${spring.datasource.driver-class-name}")
    private String driverClassName;

    private final Map<String, DataSource> writeDataSources = new ConcurrentHashMap<>();

    private final Map<String, DataSource> readDataSources = new ConcurrentHashMap<>();

    @Bean
    @Primary
    public DataSource dataSource() {
        AbstractRoutingDataSource multiTenantDataSource = new AbstractRoutingDataSource() {
            @Override
            protected Object determineCurrentLookupKey() {
                String tenantId = TenantContext.getCurrentTenant();
                boolean isReadOnly = RequestMethodContext.isReadOnly();

                return (tenantId != null ? tenantId : EpCommonConstants.MASTER_DATABASE)
                        + (isReadOnly ? READ_SUFFIX : WRITE_SUFFIX);
            }

            @Override
            @NonNull
            protected DataSource determineTargetDataSource() {
                String lookupKey = (String) determineCurrentLookupKey();

                boolean isReadOnly;
                String tenantId;

                if (lookupKey.endsWith(READ_SUFFIX)) {
                    isReadOnly = true;
                    tenantId = lookupKey.substring(0, lookupKey.length() - READ_SUFFIX.length());
                }
                else if (lookupKey.endsWith(WRITE_SUFFIX)) {
                    isReadOnly = false;
                    tenantId = lookupKey.substring(0, lookupKey.length() - WRITE_SUFFIX.length());
                }
                else {
                    log.error("Invalid lookup key format: {}", lookupKey);
                    throw new IllegalStateException("Invalid lookup key format: " + lookupKey);
                }

                Map<String, DataSource> dsMap = isReadOnly ? readDataSources : writeDataSources;

                return dsMap.computeIfAbsent(tenantId, key -> {
                    if (key.equals(EpCommonConstants.MASTER_DATABASE)) {
                        return isReadOnly ? createMasterReadDataSource() : createMasterWriteDataSource();
                    }
                    else {
                        return isReadOnly ? createTenantReadDataSource(key) : createTenantWriteDataSource(key);
                    }
                });
            }
        };

        DataSource masterWriteDataSource = createMasterWriteDataSource();
        DataSource masterReadDataSource = createMasterReadDataSource();

        Map<Object, Object> targetDataSources = new HashMap<>();
        targetDataSources.put(EpCommonConstants.MASTER_DATABASE + WRITE_SUFFIX, masterWriteDataSource);
        targetDataSources.put(EpCommonConstants.MASTER_DATABASE + READ_SUFFIX, masterReadDataSource);

        multiTenantDataSource.setDefaultTargetDataSource(masterWriteDataSource);
        multiTenantDataSource.setTargetDataSources(targetDataSources);
        multiTenantDataSource.afterPropertiesSet();

        writeDataSources.put(EpCommonConstants.MASTER_DATABASE, masterWriteDataSource);
        readDataSources.put(EpCommonConstants.MASTER_DATABASE, masterReadDataSource);

        return multiTenantDataSource;
    }

    public DataSource createMasterWriteDataSource() {
        HikariConfig config = createBaseHikariConfig(masterWriteUrl + CREATE_DB_PARAM, masterUsername, masterPassword,
                "Master-Write-Pool", masterMaxPoolSize, masterMinIdle, masterIdleTimeout, masterMaxLifetime,
                masterConnectionTimeout, masterValidationTimeout, false);
        return new HikariDataSource(config);
    }

    public DataSource createMasterReadDataSource() {
        HikariConfig config = createBaseHikariConfig(masterReadUrl + CREATE_DB_PARAM, masterUsername, masterPassword,
                "Master-Read-Pool", masterMaxPoolSize, masterMinIdle, masterIdleTimeout, masterMaxLifetime,
                masterConnectionTimeout, masterValidationTimeout, true);
        return new HikariDataSource(config);
    }

    private DataSource createTenantWriteDataSource(String tenantId) {
        String dbUrl = extractBaseDbUrl(masterWriteUrl) + tenantId;

        HikariConfig config = createBaseHikariConfig(dbUrl + CREATE_DB_PARAM, masterUsername, masterPassword,
                "Tenant-" + tenantId + "-Write-Pool", tenantMaxPoolSize, tenantMinIdle, tenantIdleTimeout,
                tenantMaxLifetime, tenantConnectionTimeout, tenantValidationTimeout, false);
        return new HikariDataSource(config);
    }

    private DataSource createTenantReadDataSource(String tenantId) {
        String dbUrl = extractBaseDbUrl(masterReadUrl) + tenantId;

        HikariConfig config = createBaseHikariConfig(dbUrl + CREATE_DB_PARAM, masterUsername, masterPassword,
                "Tenant-" + tenantId + "-Read-Pool", tenantMaxPoolSize, tenantMinIdle, tenantIdleTimeout,
                tenantMaxLifetime, tenantConnectionTimeout, tenantValidationTimeout, true);
        return new HikariDataSource(config);
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

    private String extractBaseDbUrl(String url) {
        String baseUrl = url.substring(0, url.lastIndexOf("/") + 1);
        if (baseUrl.contains("?")) {
            baseUrl = baseUrl.substring(0, baseUrl.indexOf("?"));
        }
        return baseUrl;
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
                "com.skapp.enterprise.leaveplanner.model", "com.skapp.enterprise.people.model");

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

    public void removeTenant(String tenantId) {
        if (EpCommonConstants.MASTER_DATABASE.equals(tenantId)) {
            return;
        }

        DataSource writeDataSource = writeDataSources.remove(tenantId);
        if (writeDataSource instanceof HikariDataSource hikariDataSource) {
            hikariDataSource.close();
        }

        DataSource readDataSource = readDataSources.remove(tenantId);
        if (readDataSource instanceof HikariDataSource hikariDataSource) {
            hikariDataSource.close();
        }
    }

}
