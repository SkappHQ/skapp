package com.skapp.enterprise.common.service.impl;

import com.skapp.community.common.constant.AuthConstants;
import com.skapp.community.common.repository.SystemVersionDao;
import com.skapp.community.common.repository.UserVersionDao;
import com.skapp.community.common.service.impl.JwtServiceImpl;
import com.skapp.enterprise.common.config.TenantContext;
import com.skapp.enterprise.common.constant.EpCommonConstants;
import com.skapp.enterprise.common.masterrepository.TenantDao;
import com.skapp.enterprise.common.model.master.Tenant;
import com.skapp.enterprise.common.type.Tier;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Primary;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
@Primary
public class EpJwtServiceImpl extends JwtServiceImpl {

	private final TenantDao tenantDao;

	private final TenantContext tenantContext;

	public EpJwtServiceImpl(SystemVersionDao systemVersionDao, UserVersionDao userVersionDao, TenantDao tenantDao,
			TenantContext tenantContext) {
		super(systemVersionDao, userVersionDao);
		this.tenantDao = tenantDao;
		this.tenantContext = tenantContext;
	}

	@Override
	protected Map<String, Object> createAccessTokenClaims(UserDetails userDetails, Long userId) {
		Map<String, Object> claims = super.createAccessTokenClaims(userDetails, userId);
		String currentTenant = TenantContext.getCurrentTenant();

		try {
			tenantContext.setTenantAndSwitchSchema(EpCommonConstants.MASTER_DATABASE);
			Tenant tenant = tenantDao.findByTenantName(currentTenant);
			Tier tier = Optional.ofNullable(tenant).map(Tenant::getTier).orElse(Tier.FREE);

			claims.put(AuthConstants.TIER, tier.name());
		}
		finally {
			tenantContext.setTenantAndSwitchSchema(currentTenant);
		}

		return claims;
	}

}
