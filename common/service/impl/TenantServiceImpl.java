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
import com.skapp.enterprise.common.service.MigrationToolService;
import com.skapp.enterprise.common.service.TenantService;
import com.skapp.enterprise.common.type.TenantStatus;
import com.skapp.enterprise.common.type.Tier;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
public class TenantServiceImpl implements TenantService {

	private final TenantDao tenantDao;

	private final TenantContext tenantContext;

	private final MigrationToolService migrationToolService;

	@Transactional
	public void createTenant(String tenantName, LoginMethod loginMethod, String email) {
		migrationToolService.createMySqlTenantDatabase(tenantName);
		migrationToolService.createPostgresqlTenantDatabase(tenantName);

		Tenant tenant = new Tenant();

		StripeSubscription stripeSubscription = new StripeSubscription();
		stripeSubscription.setTenantName(tenantName);
		stripeSubscription.setTenant(tenant);

		tenant.setTenantName(tenantName);
		tenant.setTenantStatus(TenantStatus.ACTIVE);
		tenant.setLoginMethod(loginMethod);
		tenant.setCreatedByEmail(email);
		tenant.setTier(Tier.FREE);
		tenant.setStripeSubscription(stripeSubscription);

		tenantDao.save(tenant);

	}

	@Override
	public ResponseEntityDto getTenant(String tenantName) {
		if (tenantName == null || tenantName.isEmpty()) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_TENANT_NAME_REQUIRED);
		}

		String currentTenant = TenantContext.getCurrentTenant();
		tenantContext.setTenantAndSwitchSchema(EpCommonConstants.MASTER_DATABASE);

		Tenant tenant = tenantDao.findByTenantName(tenantName);

		if (currentTenant != null) {
			tenantContext.setTenantAndSwitchSchema(currentTenant);
		}

		if (tenant == null) {
			log.error("getTenant: Tenant not found: {}", tenantName);
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_TENANT_NOT_FOUND,
					new String[] { tenantName });
		}

		return switch (tenant.getLoginMethod().name()) {
			case "CREDENTIALS" -> new ResponseEntityDto(false, LoginMethod.CREDENTIALS);
			case "GOOGLE" -> new ResponseEntityDto(false, LoginMethod.GOOGLE);
			case "MICROSOFT" -> new ResponseEntityDto(false, LoginMethod.MICROSOFT);
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

}
