package com.skapp.enterprise.common.service.impl;

import com.skapp.community.common.constant.AuthConstants;
import com.skapp.community.common.constant.CommonMessageConstant;
import com.skapp.community.common.exception.AuthenticationException;
import com.skapp.community.common.model.User;
import com.skapp.community.common.repository.UserDao;
import com.skapp.community.common.service.SystemVersionService;
import com.skapp.community.common.service.UserVersionService;
import com.skapp.community.common.service.impl.JwtServiceImpl;
import com.skapp.community.common.type.Role;
import com.skapp.enterprise.common.config.TenantContext;
import com.skapp.enterprise.common.constant.EpAuthConstants;
import com.skapp.enterprise.common.constant.EpCommonConstants;
import com.skapp.enterprise.common.masterrepository.TenantDao;
import com.skapp.enterprise.common.model.EpOrganization;
import com.skapp.enterprise.common.model.master.Tenant;
import com.skapp.enterprise.common.repository.EpOrganizationDao;
import com.skapp.enterprise.common.type.Country;
import com.skapp.enterprise.common.type.LanguageCode;
import com.skapp.enterprise.common.type.TenantStatus;
import com.skapp.enterprise.common.type.Tier;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

@Slf4j
@Service
@Primary
public class EpJwtServiceImpl extends JwtServiceImpl {

	private final TenantDao tenantDao;

	private final TenantContext tenantContext;

	private final EpOrganizationDao epOrganizationDao;

	private final UserDao userDao;

	@Value("${jwt.access-token.signing-key}")
	private String jwtSigningKey;

	public EpJwtServiceImpl(SystemVersionService systemVersionService, UserVersionService userVersionService,
			TenantContext tenantContext, TenantDao tenantDao, EpOrganizationDao epOrganizationDao, UserDao userDao) {
		super(systemVersionService, userVersionService);
		this.tenantContext = tenantContext;
		this.tenantDao = tenantDao;
		this.epOrganizationDao = epOrganizationDao;
		this.userDao = userDao;
	}

	@Override
	protected Map<String, Object> createAccessTokenClaims(UserDetails userDetails, Long userId) {
		Map<String, Object> claims = super.createAccessTokenClaims(userDetails, userId);
		String currentTenant = TenantContext.getCurrentTenant();

		try {
			tenantContext.setTenantAndSwitchSchema(EpCommonConstants.MASTER_DATABASE);
			Tenant tenant = tenantDao.findByTenantName(currentTenant);
			Tier tier = Optional.ofNullable(tenant).map(Tenant::getTier).orElse(Tier.FREE);
			TenantStatus status = Optional.ofNullable(tenant).map(Tenant::getTenantStatus).orElse(TenantStatus.ACTIVE);

			claims.put(EpAuthConstants.TIER, tier.name());
			claims.put(EpAuthConstants.TENANT_STATUS, status.name());
		}
		finally {
			tenantContext.setTenantAndSwitchSchema(currentTenant);
			EpOrganization organization = epOrganizationDao.findTopByOrderByOrganizationIdDesc();
			User user = userDao.findById(userId)
				.orElseThrow(() -> new AuthenticationException(CommonMessageConstant.COMMON_ERROR_USER_NOT_FOUND));

			String lang = Optional.ofNullable(user.getLang())
				.orElseGet(() -> Country.SWEDEN.getCountry().equalsIgnoreCase(organization.getCountry())
						? LanguageCode.SWEDISH.getCode() : LanguageCode.ENGLISH.getCode());

			claims.put(EpAuthConstants.LANG, lang);
		}

		return claims;
	}

	@Override
	public SecretKey getSigningKey() {
		String tenant = TenantContext.getCurrentTenant();
		if (tenant == null) {
			return Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSigningKey));
		}

		byte[] masterKeyBytes = Decoders.BASE64.decode(jwtSigningKey);
		byte[] derivedKeyBytes = deriveTenantKey(masterKeyBytes, tenant);
		return Keys.hmacShaKeyFor(derivedKeyBytes);
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

	@Override
	public void checkVersionMismatch(Long userId, String accessToken) {
		String tenantId = extractClaim(accessToken, claims -> claims.get(EpAuthConstants.TENANT_ID, String.class));
		if (EpCommonConstants.MASTER_DATABASE.equals(tenantId)) {
			return;
		}

		super.checkVersionMismatch(userId, accessToken);
	}

	@Override
	protected Set<String> getShortDurationRoles() {
		Set<String> roles = super.getShortDurationRoles();
		roles.add(AuthConstants.AUTH_ROLE + Role.ESIGN_ADMIN);
		roles.add(AuthConstants.AUTH_ROLE + Role.PM_ADMIN);
		roles.add(AuthConstants.AUTH_ROLE + Role.INVOICE_ADMIN);
		return roles;
	}

}
