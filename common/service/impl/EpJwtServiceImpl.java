package com.skapp.enterprise.common.service.impl;

import com.skapp.community.common.constant.AuthConstants;
import com.skapp.community.common.constant.CommonMessageConstant;
import com.skapp.community.common.exception.AuthenticationException;
import com.skapp.community.common.service.impl.JwtServiceImpl;
import com.skapp.enterprise.common.config.TenantContext;
import com.skapp.enterprise.common.constant.EpCommonConstants;
import com.skapp.enterprise.common.masterrepository.TenantDao;
import com.skapp.enterprise.common.model.master.Tenant;
import com.skapp.enterprise.common.type.Tier;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
@Primary
public class EpJwtServiceImpl extends JwtServiceImpl {

	private final TenantDao tenantDao;

	private final TenantContext tenantContext;

	@Value("${jwt.access-token.signing-key}")
	private String jwtSigningKey;

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

	@Override
	public Key getSigningKey() {

		return Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSigningKey));

		// String tenant = TenantContext.getCurrentTenant();
		// byte[] masterKeyBytes = Decoders.BASE64.decode(jwtSigningKey);
		// byte[] derivedKeyBytes = deriveTenantKey(masterKeyBytes, tenant);
		// return Keys.hmacShaKeyFor(derivedKeyBytes);
	}

	private byte[] deriveTenantKey(byte[] masterKey, String tenantId) {
		try {
			Mac hmacSha256 = Mac.getInstance("HmacSHA256");
			SecretKeySpec keySpec = new SecretKeySpec(masterKey, "HmacSHA256");
			hmacSha256.init(keySpec);
			return hmacSha256.doFinal(tenantId.getBytes(StandardCharsets.UTF_8));
		}
		catch (Exception e) {
			throw new AuthenticationException(CommonMessageConstant.COMMON_ERROR_JWT_SIGNIN_KEY_GENERATION_ISSUE);
		}
	}

}
