package com.skapp.enterprise.common.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.type.LoginMethod;
import com.skapp.enterprise.common.model.master.Tenant;

public interface TenantService {

	void createTenant(String tenantName, LoginMethod loginMethod, String email);

	ResponseEntityDto getTenant(String tenantName);

	Tenant getCurrentTenantFromSwitchingSchemas();

}
