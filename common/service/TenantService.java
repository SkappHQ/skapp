package com.skapp.enterprise.common.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.type.LoginMethod;

public interface TenantService {

	void createTenant(String tenantName, LoginMethod loginMethod, String email);

	void deleteTenant(String companyDomain);

	ResponseEntityDto getTenant(String tenantName);

}
