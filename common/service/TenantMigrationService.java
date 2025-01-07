package com.skapp.enterprise.common.service;

import java.util.List;

public interface TenantMigrationService {

	void runMigration(String dbName);

	void runMigrationsForAllTenants();

	List<String> getAllTenantIds();

}
