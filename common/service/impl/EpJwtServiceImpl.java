package com.skapp.enterprise.common.service.impl;

import com.skapp.community.common.constant.AuthConstants;
import com.skapp.community.common.service.impl.JwtServiceImpl;
import com.skapp.enterprise.common.config.TenantValidator;
import com.skapp.enterprise.common.type.Tier;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Primary;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
@Primary
public class EpJwtServiceImpl extends JwtServiceImpl {

	private final TenantValidator tenantValidator;

	@Override
	protected Map<String, Object> createAccessTokenClaims(UserDetails userDetails, Long userId) {
		Map<String, Object> claims = super.createAccessTokenClaims(userDetails, userId);

		claims.put(AuthConstants.TIER, tenantValidator.isCurrentTenantPro() ? Tier.PRO.name() : Tier.FREE.name());

		return claims;
	}

}
