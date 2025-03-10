package com.skapp.enterprise.common.service.impl;

import com.skapp.community.common.constant.CommonMessageConstant;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.type.LoginMethod;
import com.skapp.enterprise.common.config.TenantContext;
import com.skapp.enterprise.common.constant.EPCommonMessageConstant;
import com.skapp.enterprise.common.constant.EpCommonConstants;
import com.skapp.enterprise.common.masterrepository.TenantDao;
import com.skapp.enterprise.common.model.master.StripeSubscription;
import com.skapp.enterprise.common.model.master.Tenant;
import com.skapp.enterprise.common.service.TenantMigrationService;
import com.skapp.enterprise.common.service.TenantService;
import com.skapp.enterprise.common.type.TenantStatus;
import com.skapp.enterprise.common.type.Tier;
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
	public void createTenant(String tenantName, LoginMethod loginMethod, String email) {

		List<String> tenants = tenantMigrationService.getAllTenantIds();
		if (tenants.contains(tenantName)) {
			log.error("Tenant already exists: {}", tenantName);
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_TENANT_ALREADY_EXISTS,
					new String[] { tenantName });
		}

		Tenant tenant = new Tenant();
		tenant.setTenantName(tenantName);
		tenant.setTenantStatus(TenantStatus.ACTIVE);
		tenant.setLoginMethod(loginMethod);
		tenant.setCreatedByEmail(email);
		tenant.setTier(Tier.FREE);

		StripeSubscription stripeSubscription = new StripeSubscription();
		stripeSubscription.setTenantName(tenantName);
		stripeSubscription.setTenant(tenant);

		tenant.setStripeSubscription(stripeSubscription);

		tenantDao.save(tenant);

		tenantMigrationService.runMigration(tenantName);
	}

	@Override
	public void deleteTenant(String companyDomain) {
		Tenant tenant = tenantDao.findByTenantName(companyDomain);
		if (tenant == null) {
			log.error("deleteTenant: Tenant not found: {}", companyDomain);
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_TENANT_NOT_FOUND,
					new String[] { companyDomain });
		}

		tenantDao.delete(tenant);
		tenantContext.removeTenant(companyDomain);
	}

	@Override
	public ResponseEntityDto getTenant(String tenantName) {
		if (tenantName == null || tenantName.isEmpty()) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_TENANT_NAME_REQUIRED);
		}

		Tenant tenant = tenantDao.findByTenantName(tenantName);
		if (tenant == null) {
			log.error("getTenant: Tenant not found: {}", tenantName);
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_TENANT_NOT_FOUND,
					new String[] { tenantName });
		}

		return switch (tenant.getLoginMethod().name()) {
			case "CREDENTIALS" -> new ResponseEntityDto(false, LoginMethod.CREDENTIALS);
			case "GOOGLE" -> new ResponseEntityDto(false, LoginMethod.GOOGLE);
			default -> throw new ModuleException(CommonMessageConstant.COMMON_ERROR_ENTITY_NOT_FOUND);
		};
	}

	@Override
	public Tenant getCurrentTenantFromSwitchingSchemas() {
		String currentTenantId = TenantContext.getCurrentTenant();
		tenantContext.setTenantAndSwitchSchema(EpCommonConstants.MASTER_DATABASE);
		Tenant tenant = tenantDao.findByTenantName(currentTenantId);
		tenantContext.setTenantAndSwitchSchema(currentTenantId);
		return tenant;
	}

	@Override
	public boolean validateTenantExist(String tenantId) {
		tenantContext.setTenantAndSwitchSchema(EpCommonConstants.MASTER_DATABASE);
		Tenant tenant = tenantDao.findById(tenantId).orElse(null);
		tenantContext.setTenantAndSwitchSchema(tenantId);
		return tenant != null;
	}

}
