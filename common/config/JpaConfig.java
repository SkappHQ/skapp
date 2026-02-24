package com.skapp.enterprise.common.config;

import org.springframework.boot.hibernate.autoconfigure.HibernatePropertiesCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class JpaConfig {

	@Bean
	public HibernatePropertiesCustomizer hibernatePropertiesCustomizer() {
		return hibernateProperties -> {
			hibernateProperties.put("hibernate.connection.provider_disables_autocommit", true);
			hibernateProperties.put("hibernate.temp.use_jdbc_metadata_defaults", false);
			hibernateProperties.put("hibernate.jdbc.lob.non_contextual_creation", true);
			hibernateProperties.put("hibernate.dialect", "org.hibernate.dialect.MySQLDialect");
			hibernateProperties.put("hibernate.hbm2ddl.auto", "none");
			hibernateProperties.put("hibernate.boot.allow_jdbc_metadata_access", false);
		};
	}

}
