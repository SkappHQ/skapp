package com.skapp.community.common.util;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class CookieUtil {

	protected static final String REFRESH_TOKEN_COOKIE_NAME = "refreshToken";

	protected static final String REFRESH_TOKEN_COOKIE_SUFFIX = "_refreshToken";

	protected static final String COOKIE_PATH = "/";

	protected static final String SAME_SITE_VALUE = "Lax";

	protected static final String SAME_SITE_ATTRIBUTE = "SameSite";

	@Value("${domain.base}")
	protected String baseDomain;

	/**
	 * Creates a secure HTTP-only refresh token cookie. In the community context the
	 * tenantId parameter is unused; override in enterprise to apply tenant namespacing.
	 * @param tenantId The tenant ID (ignored in community)
	 * @param refreshToken The refresh token value
	 * @param cookieMaxAge The maximum age of the cookie in milliseconds
	 * @return A configured Cookie object
	 */
	public Cookie createRefreshTokenCookie(String tenantId, String refreshToken, long cookieMaxAge) {
		Cookie cookie = new Cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken);
		cookie.setHttpOnly(true);
		cookie.setSecure(true);
		cookie.setPath(COOKIE_PATH);
		cookie.setMaxAge((int) (cookieMaxAge / 1000));
		cookie.setDomain(baseDomain);
		cookie.setAttribute(SAME_SITE_ATTRIBUTE, SAME_SITE_VALUE);
		return cookie;
	}

	/**
	 * Clears the refresh token cookie by setting its max age to 0. In the community
	 * context the tenantId parameter is unused; override in enterprise to apply tenant
	 * namespacing.
	 * @param tenantId The tenant ID (ignored in community)
	 * @return A configured Cookie object with max age set to 0 to delete the cookie
	 */
	public Cookie clearRefreshTokenCookie(String tenantId) {
		Cookie cookie = new Cookie(REFRESH_TOKEN_COOKIE_NAME, null);
		cookie.setHttpOnly(true);
		cookie.setSecure(true);
		cookie.setPath(COOKIE_PATH);
		cookie.setMaxAge(0);
		cookie.setDomain(baseDomain);
		cookie.setAttribute(SAME_SITE_ATTRIBUTE, SAME_SITE_VALUE);
		return cookie;
	}

	/**
	 * Extracts the refresh token value from the incoming request cookies. In the
	 * community context the tenantId parameter is unused; override in enterprise to apply
	 * tenant namespacing.
	 * @param request The HTTP servlet request
	 * @param tenantId The tenant ID (ignored in community)
	 * @return The refresh token value, or null if not found
	 */
	public String getRefreshTokenFromCookies(HttpServletRequest request, String tenantId) {
		if (request.getCookies() != null) {
			for (Cookie cookie : request.getCookies()) {
				if (REFRESH_TOKEN_COOKIE_NAME.equals(cookie.getName())) {
					return cookie.getValue();
				}
			}
		}
		return null;
	}

}
