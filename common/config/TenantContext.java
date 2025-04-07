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

	@PersistenceContext
	private EntityManager entityManager;

	private static final ThreadLocal<String> currentTenant = new ThreadLocal<>();

	public static void setCurrentTenant(String tenant) {
		currentTenant.set(tenant);
	}

	public static String getCurrentTenant() {
		return currentTenant.get();
	}

	public static void clearCurrentTenant() {
		currentTenant.remove();
	}

	@Transactional
	public void setTenantAndSwitchSchema(String tenant) {
		if (!tenant.equals(getCurrentTenant())) {
			try {
				setCurrentTenant(tenant);
				switchDatabaseSchema(tenant);
			}
			catch (Exception e) {
				clearCurrentTenant();
				throw new ModuleException(
						EPCommonMessageConstant.EP_COMMON_ERROR_COULD_NOT_ALTER_CONNECTION_TO_SPECIFIED_TENANT,
						new String[] { tenant, e.getMessage() });
			}
		}
	}

	private void switchDatabaseSchema(String tenant) {
		try {
			Session session = entityManager.unwrap(Session.class);
			session.doWork(connection -> {
				connection.setCatalog(tenant);
				log.info("Switched connection to tenant: {}", tenant);
			});

			entityManager.clear();
		}
		catch (Exception e) {
			log.error("Error switching database schema for tenant {}: {}", tenant, e.getMessage());
			throw new ModuleException(
					EPCommonMessageConstant.EP_COMMON_ERROR_COULD_NOT_ALTER_CONNECTION_TO_SPECIFIED_TENANT,
					new String[] { tenant, e.getMessage() });
		}
	}

}
