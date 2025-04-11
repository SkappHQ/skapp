package com.skapp.enterprise.common.service;

public interface TenantDatabaseCreationService {

	void createTenantDatabase(String tenantId);

	boolean doesTenantDatabaseExist(String tenantId);

}
