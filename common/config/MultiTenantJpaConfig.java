package com.skapp.enterprise.common.config;

import jakarta.persistence.EntityManagerFactory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.context.spi.CurrentTenantIdentifierResolver;
import org.hibernate.engine.jdbc.connections.spi.MultiTenantConnectionProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.orm.jpa.vendor.HibernateJpaVendorAdapter;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import javax.sql.DataSource;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Configuration
@RequiredArgsConstructor
@EnableJpaRepositories(
		basePackages = { "com.skapp.enterprise.common.masterrepository", "com.skapp.enterprise.common.repository",
				"com.skapp.community.common.repository", "com.skapp.community.leaveplanner.repository",
				"com.skapp.community.peopleplanner.repository", "com.skapp.community.timeplanner.repository",
				"com.skapp.community.okrplanner.repository", "com.skapp.community.crmplanner.repository",
				"com.skapp.enterprise.esignature.repository",
				"com.skapp.enterprise.leaveplanner.repository", "com.skapp.enterprise.people.repository",
				"com.skapp.enterprise.invoice.repository", "com.skapp.enterprise.ai.repository" })
@EnableTransactionManagement
public class MultiTenantJpaConfig {

	private final DataSource dataSource;

	@Bean
	@Primary
	public LocalContainerEntityManagerFactoryBean entityManagerFactory(
			MultiTenantConnectionProvider<String> multiTenantConnectionProvider,
			CurrentTenantIdentifierResolver<String> currentTenantIdentifierResolver) {

		LocalContainerEntityManagerFactoryBean entityManagerFactoryBean = new LocalContainerEntityManagerFactoryBean();
		entityManagerFactoryBean.setDataSource(dataSource);
		entityManagerFactoryBean.setPackagesToScan("com.skapp.enterprise.common.model",
				"com.skapp.enterprise.common.model.master", "com.skapp.community.common.model",
				"com.skapp.community.peopleplanner.model", "com.skapp.community.leaveplanner.model",
				"com.skapp.community.timeplanner.model", "com.skapp.community.okrplanner.model",
				"com.skapp.community.crmplanner.model",
				"com.skapp.enterprise.esignature.model", "com.skapp.enterprise.leaveplanner.model",
				"com.skapp.enterprise.people.model", "com.skapp.enterprise.invoice.model",
				"com.skapp.enterprise.ai.model");

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
	public CurrentTenantIdentifierResolver<String> currentTenantIdentifierResolver() {
		return new TenantIdentifierResolver();
	}

}
