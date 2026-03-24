package com.skapp.enterprise.common.util;

import com.skapp.community.common.util.CookieUtil;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

/**
 * Enterprise extension of {@link CookieUtil} that adds tenant-namespaced refresh-token
 * cookies and a dedicated tenant cookie. Declared {@code @Primary} so all injection
 * points that depend on {@link CookieUtil} automatically receive this bean when the
 * enterprise module is present.
 */
@Primary
@Component
public class EpCookieUtil extends CookieUtil {

	private static final String TENANT_COOKIE_NAME = "tenant";

	private String getRefreshTokenCookieName(String tenantId) {
		return (tenantId != null && !tenantId.isEmpty()) ? tenantId + REFRESH_TOKEN_COOKIE_SUFFIX
				: REFRESH_TOKEN_COOKIE_NAME;
	}

	/**
	 * Creates a secure HTTP-only refresh token cookie namespaced by tenant.
	 * @param tenantId The tenant ID used to namespace the cookie
	 * @param refreshToken The refresh token value
	 * @param cookieMaxAge The maximum age of the cookie in milliseconds
	 * @return A configured Cookie object
	 */
	@Override
	public Cookie createRefreshTokenCookie(String tenantId, String refreshToken, long cookieMaxAge) {
		String cookieName = getRefreshTokenCookieName(tenantId);
		Cookie cookie = new Cookie(cookieName, refreshToken);
		cookie.setHttpOnly(true);
		cookie.setSecure(true);
		cookie.setPath(COOKIE_PATH);
		cookie.setMaxAge((int) (cookieMaxAge / 1000));
		cookie.setDomain(baseDomain);
		cookie.setAttribute(SAME_SITE_ATTRIBUTE, SAME_SITE_VALUE);
		return cookie;
	}

	/**
	 * Clears the tenant-namespaced refresh token cookie by setting its max age to 0.
	 * @param tenantId The tenant ID used to namespace the cookie
	 * @return A configured Cookie object with max age set to 0 to delete the cookie
	 */
	@Override
	public Cookie clearRefreshTokenCookie(String tenantId) {
		String cookieName = getRefreshTokenCookieName(tenantId);
		Cookie cookie = new Cookie(cookieName, null);
		cookie.setHttpOnly(true);
		cookie.setSecure(true);
		cookie.setPath(COOKIE_PATH);
		cookie.setMaxAge(0);
		cookie.setDomain(baseDomain);
		cookie.setAttribute(SAME_SITE_ATTRIBUTE, SAME_SITE_VALUE);
		return cookie;
	}

	/**
	 * Creates a secure tenant cookie with the specified tenant ID and max age.
	 * @param tenantId The tenant ID value
	 * @param cookieMaxAge The maximum age of the cookie in milliseconds
	 * @return A configured Cookie object
	 */
	public Cookie createTenantCookie(String tenantId, long cookieMaxAge) {
		Cookie cookie = new Cookie(TENANT_COOKIE_NAME, tenantId);
		cookie.setHttpOnly(false);
		cookie.setSecure(true);
		cookie.setPath(COOKIE_PATH);
		cookie.setMaxAge((int) (cookieMaxAge / 1000));
		cookie.setDomain(baseDomain);
		cookie.setAttribute(SAME_SITE_ATTRIBUTE, SAME_SITE_VALUE);
		return cookie;
	}

	/**
	 * Clears the tenant cookie by setting its max age to 0.
	 * @return A configured Cookie object with max age set to 0 to delete the cookie
	 */
	public Cookie clearTenantCookie() {
		Cookie cookie = new Cookie(TENANT_COOKIE_NAME, null);
		cookie.setHttpOnly(false);
		cookie.setSecure(true);
		cookie.setPath(COOKIE_PATH);
		cookie.setMaxAge(0);
		cookie.setDomain(baseDomain);
		cookie.setAttribute(SAME_SITE_ATTRIBUTE, SAME_SITE_VALUE);
		return cookie;
	}

	/**
	 * Extracts the refresh token value from the incoming request cookies using the
	 * tenant-namespaced cookie name.
	 * @param request The HTTP servlet request
	 * @param tenantId The tenant ID used to resolve the cookie name
	 * @return The refresh token value, or null if not found
	 */
	@Override
	public String getRefreshTokenFromCookies(HttpServletRequest request, String tenantId) {
		String cookieName = getRefreshTokenCookieName(tenantId);
		if (request.getCookies() != null) {
			for (Cookie cookie : request.getCookies()) {
				if (cookieName.equals(cookie.getName())) {
					return cookie.getValue();
				}
			}
		}
		return null;
	}

}
