package com.skapp.enterprise.common.service.impl;

import com.skapp.enterprise.common.util.EpCookieUtil;
import com.skapp.enterprise.common.config.TenantContext;
import com.skapp.enterprise.common.service.TenantCookieService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class TenantCookieServiceImpl implements TenantCookieService {

	private final EpCookieUtil cookieUtil;

	@Override
	public void addTenantCookie(HttpServletResponse response, long cookieMaxAge) {
		String tenantId = TenantContext.getCurrentTenant();
		if (tenantId != null && !tenantId.isEmpty()) {
			Cookie tenantCookie = cookieUtil.createTenantCookie(tenantId, cookieMaxAge);
			response.addCookie(tenantCookie);
			log.info("addTenantCookie: Added tenant cookie with tenantId={}", tenantId);
		}
	}

	@Override
	public void clearTenantCookie(HttpServletResponse response) {
		Cookie tenantCookie = cookieUtil.clearTenantCookie();
		response.addCookie(tenantCookie);
		log.info("clearTenantCookie: Cleared tenant cookie");
	}

}
