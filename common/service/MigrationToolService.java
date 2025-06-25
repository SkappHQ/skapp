package com.skapp.enterprise.common.service;

public interface MigrationToolService {

	void createMySqlTenantDatabase(String tenantId);

	void createPostgresqlTenantDatabase(String tenantId);

}
