package com.skapp.community.common.util;

import jakarta.servlet.http.Cookie;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CookieUtil {

	@Value("${domain.base}")
	private String baseDomain;

	/**
	 * Creates a secure HTTP-only refresh token cookie with the specified token and max
	 * age.
	 * @param refreshToken The refresh token value
	 * @param cookieMaxAge The maximum age of the cookie in milliseconds
	 * @return A configured Cookie object
	 */
	public Cookie createRefreshTokenCookie(String refreshToken, long cookieMaxAge) {
		Cookie cookie = new Cookie("refreshToken", refreshToken);
		cookie.setHttpOnly(true);
		cookie.setSecure(true);
		cookie.setPath("/");
		cookie.setMaxAge((int) (cookieMaxAge / 1000));
		cookie.setDomain(baseDomain);
		cookie.setAttribute("SameSite", "Lax");
		return cookie;
	}

	/**
	 * Clears the refresh token cookie by setting its max age to 0.
	 * @return A configured Cookie object with max age set to 0 to delete the cookie
	 */
	public Cookie clearRefreshTokenCookie() {
		Cookie cookie = new Cookie("refreshToken", null);
		cookie.setHttpOnly(true);
		cookie.setSecure(true);
		cookie.setPath("/");
		cookie.setMaxAge(0);
		cookie.setDomain(baseDomain);
		cookie.setAttribute("SameSite", "Lax");
		return cookie;
	}

}
