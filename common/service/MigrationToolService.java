package com.skapp.enterprise.common.service;

public interface MigrationToolService {

	boolean createMySqlTenantDatabase(String tenantId);

	boolean createPostgresqlTenantDatabase(String tenantId);

}
