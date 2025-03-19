package com.skapp.enterprise.common.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.enterprise.common.config.MultiTenantDataSourceConfig;
import com.skapp.enterprise.common.config.TenantContext;
import com.skapp.enterprise.common.constant.EPCommonMessageConstant;
import com.skapp.enterprise.common.masterrepository.TenantDao;
import com.skapp.enterprise.common.model.master.Tenant;
import com.skapp.enterprise.common.service.TenantMigrationService;
import liquibase.Liquibase;
import liquibase.database.Database;
import liquibase.database.DatabaseFactory;
import liquibase.database.jvm.JdbcConnection;
import liquibase.exception.LiquibaseException;
import liquibase.resource.ClassLoaderResourceAccessor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class TenantMigrationServiceImpl implements TenantMigrationService {

	private final TenantDao tenantDao;

	private final MultiTenantDataSourceConfig multiTenantDataSourceConfig;

	@Override
	public void runMigration(String tenantId) {
		log.debug("Starting migration for tenant: {}", tenantId);

		try {
			multiTenantDataSourceConfig.addTenant(tenantId);
			performLiquibaseMigration(tenantId);
			log.debug("Migration completed for tenant: {}", tenantId);
		}
		catch (Exception e) {
			handleMigrationError(tenantId, e);
		}
		finally {
			cleanup(tenantId);
		}
	}

	private void performLiquibaseMigration(String tenantId) throws SQLException, LiquibaseException {
		TenantContext.setCurrentTenant(tenantId);
		DataSource dataSource = multiTenantDataSourceConfig.dataSource();

		Database database;
		Liquibase liquibase = null;
		try (Connection connection = dataSource.getConnection()) {
			try {
				database = DatabaseFactory.getInstance()
					.findCorrectDatabaseImplementation(new JdbcConnection(connection));
				liquibase = new Liquibase("enterprise/db/changelog/db.changelog.yml", new ClassLoaderResourceAccessor(),
						database);
				liquibase.update();
			}
			finally {
				if (liquibase != null) {
					try {
						liquibase.close();
					}
					catch (LiquibaseException e) {
						log.error("Error closing Liquibase for tenant: {}", tenantId, e);
					}
				}
			}
		}
	}

	private void cleanup(String tenantId) {
		try {
			TenantContext.clearCurrentTenant();
		}
		finally {
			try {
				multiTenantDataSourceConfig.removeTenant(tenantId);
			}
			catch (Exception e) {
				log.error("Error removing tenant: {}", tenantId, e);
			}
		}
	}

	@Override
	public void runMigrationsForAllTenants() {
		long startTime = System.currentTimeMillis();
		List<String> tenantIds = getAllTenantIds();
		List<String> successfulTenants = new ArrayList<>();
		List<String> failedTenants = new ArrayList<>();
		Map<String, String> failureReasons = new HashMap<>();

		log.info("Starting migration for {} tenants", tenantIds.size());

		for (String tenantId : tenantIds) {
			try {
				runMigration(tenantId);
				successfulTenants.add(tenantId);
				multiTenantDataSourceConfig.addTenant(tenantId);
			}
			catch (Exception e) {
				failedTenants.add(tenantId);
				failureReasons.put(tenantId, e.getMessage());
			}
		}

		printMigrationSummary(startTime, successfulTenants, failedTenants, failureReasons);
	}

	private void printMigrationSummary(long startTime, List<String> successfulTenants, List<String> failedTenants,
			Map<String, String> failureReasons) {
		long duration = System.currentTimeMillis() - startTime;
		StringBuilder summary = new StringBuilder();
		summary.append(String.format("%n========== Migration Summary ==========%n"));
		summary.append(String.format("Total Execution Time: %d seconds%n", duration / 1000));
		summary.append(String.format("Total Tenants: %d%n", successfulTenants.size() + failedTenants.size()));
		summary.append(String.format("Successful Migrations: %d%n", successfulTenants.size()));
		summary.append(String.format("Failed Migrations: %d%n", failedTenants.size()));

		if (!failedTenants.isEmpty()) {
			summary.append(String.format("%nFailed Migrations:%n"));
			failedTenants
				.forEach(tenant -> summary.append(String.format("- %s: %s%n", tenant, failureReasons.get(tenant))));
		}

		summary.append("=====================================");
		log.info(summary.toString());
	}

	@Override
	public List<String> getAllTenantIds() {
		return tenantDao.findAll().stream().map(Tenant::getTenantName).toList();
	}

	private void handleMigrationError(String tenantId, Exception e) {
		log.error("Migration failed for tenant: {}", tenantId, e);
		throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_MIGRATION_FAILED_TO_TENANT,
				new String[] { tenantId, e.getMessage() });
	}

}
