package com.skapp.community.common.util;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CookieUtil {

	private static final String REFRESH_TOKEN_COOKIE_SUFFIX = "_refreshToken";

	private static final String REFRESH_TOKEN_COOKIE_NAME = "refreshToken";

	private static final String TENANT_COOKIE_NAME = "tenant";

	private static final String COOKIE_PATH = "/";

	private static final String SAME_SITE_VALUE = "Lax";

	private static final String SAME_SITE_ATTRIBUTE = "SameSite";

	@Value("${domain.base}")
	private String baseDomain;

	private String getRefreshTokenCookieName(String tenantId) {
		return (tenantId != null && !tenantId.isEmpty()) ? tenantId + REFRESH_TOKEN_COOKIE_SUFFIX
				: REFRESH_TOKEN_COOKIE_NAME;
	}

	/**
	 * Creates a secure HTTP-only refresh token cookie with the specified token and max
	 * age.
	 * @param tenantId The tenant ID used to namespace the cookie
	 * @param refreshToken The refresh token value
	 * @param cookieMaxAge The maximum age of the cookie in milliseconds
	 * @return A configured Cookie object
	 */
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
	 * Clears the refresh token cookie by setting its max age to 0.
	 * @param tenantId The tenant ID used to namespace the cookie
	 * @return A configured Cookie object with max age set to 0 to delete the cookie
	 */
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
	 * Extracts the refresh token value from the incoming request cookies.
	 * @param request The HTTP servlet request
	 * @param tenantId The tenant ID used to namespace the cookie (null for community)
	 * @return The refresh token value, or null if not found
	 */
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
