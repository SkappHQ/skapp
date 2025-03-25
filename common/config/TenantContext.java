package com.skapp.enterprise.common.config;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.enterprise.common.constant.EPCommonMessageConstant;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.Session;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class TenantContext {

	private static final ThreadLocal<String> currentTenant = new ThreadLocal<>();

	private final MultiTenantDataSourceConfig multiTenantDataSourceConfig;

	@PersistenceContext
	private EntityManager entityManager;

	public static void setCurrentTenant(String tenant) {
		currentTenant.set(tenant);
		log.info("Tenant set to: {}", tenant);
	}

	public static String getCurrentTenant() {
		return currentTenant.get();
	}

	public static void clearCurrentTenant() {
		currentTenant.remove();
		MultiTenantDataSourceConfig.clearLookupKey();
	}

	@Transactional
	public void setTenantAndSwitchSchema(String tenant) {
		if (!tenant.equals(getCurrentTenant())) {
			try {
				multiTenantDataSourceConfig.addTenant(tenant);
				setCurrentTenant(tenant);
				switchDatabaseSchema(tenant);
			}
			catch (Exception e) {
				clearCurrentTenant();
				multiTenantDataSourceConfig.removeTenant(tenant);
				throw new ModuleException(
						EPCommonMessageConstant.EP_COMMON_ERROR_COULD_NOT_ALTER_CONNECTION_TO_SPECIFIED_TENANT,
						new String[] { tenant, e.getMessage() });
			}
		}
	}

	private void switchDatabaseSchema(String tenant) {
		log.info("Switching database schema to tenant: {}", tenant);
		try {
			entityManager.unwrap(Session.class).doWork(connection -> {
				connection.setCatalog(tenant);
				log.info("Successfully switched database to: {}", tenant);
			});
		}
		catch (Exception e) {
			log.error("Error switching database schema for tenant {}: {}", tenant, e.getMessage());
			throw new ModuleException(
					EPCommonMessageConstant.EP_COMMON_ERROR_COULD_NOT_ALTER_CONNECTION_TO_SPECIFIED_TENANT,
					new String[] { tenant, e.getMessage() });
		}
	}

	public void removeTenant(String tenant) {
		try {
			multiTenantDataSourceConfig.removeTenant(tenant);
			if (tenant.equals(getCurrentTenant())) {
				clearCurrentTenant();
			}
			log.info("Tenant {} removed successfully", tenant);
		}
		catch (Exception e) {
			log.error("Error removing tenant {}: {}", tenant, e.getMessage());
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_COULD_NOT_REMOVE_TENANT,
					new String[] { tenant, e.getMessage() });
		}
	}

}
