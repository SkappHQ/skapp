package com.skapp.enterprise.common.service.impl;

import com.skapp.community.common.constant.CommonMessageConstant;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.type.LoginMethod;
import com.skapp.enterprise.common.config.TenantContext;
import com.skapp.enterprise.common.constant.EPCommonMessageConstant;
import com.skapp.enterprise.common.masterrepository.TenantDao;
import com.skapp.enterprise.common.model.master.Tenant;
import com.skapp.enterprise.common.service.TenantMigrationService;
import com.skapp.enterprise.common.service.TenantService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class TenantServiceImpl implements TenantService {

	private final TenantDao tenantDao;

	private final TenantMigrationService tenantMigrationService;

	private final TenantContext tenantContext;

	@Transactional
	public void createTenant(String tenantName, LoginMethod loginMethod) {

		List<String> tenants = tenantMigrationService.getAllTenantIds();
		if (tenants.contains(tenantName)) {
			log.error("Tenant already exists: {}", tenantName);
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_TENANT_ALREADY_EXISTS,
					new String[] { tenantName });
		}

		Tenant tenant = new Tenant();
		tenant.setTenantName(tenantName);
		tenant.setActive(true);
		tenant.setLoginMethod(loginMethod);
		tenantDao.save(tenant);

		tenantMigrationService.runMigration(tenantName);
	}

	@Override
	public void deleteTenant(String companyDomain) {
		Tenant tenant = tenantDao.findByTenantName(companyDomain);
		if (tenant == null) {
			log.error("Tenant not found: {}", companyDomain);
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_TENANT_NOT_FOUND,
					new String[] { companyDomain });
		}

		tenantDao.delete(tenant);
		tenantContext.removeTenant(companyDomain);
	}

	@Override
	public ResponseEntityDto getTenant(String tenantName) {
		Tenant tenant = tenantDao.findByTenantName(tenantName);

		return switch (tenant.getLoginMethod().name()) {
			case "CREDENTIALS" -> new ResponseEntityDto(false, LoginMethod.CREDENTIALS);
			case "GOOGLE" -> new ResponseEntityDto(false, LoginMethod.GOOGLE);
			default -> throw new ModuleException(CommonMessageConstant.COMMON_ERROR_ENTITY_NOT_FOUND);
		};
	}

}
