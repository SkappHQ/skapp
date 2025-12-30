package com.skapp.community.common.util;

import jakarta.servlet.http.Cookie;
import lombok.experimental.UtilityClass;

@UtilityClass
public class CookieUtil {

	/**
	 * Creates a secure HTTP-only refresh token cookie with the specified token and max age.
	 * 
	 * @param refreshToken The refresh token value
	 * @param cookieMaxAge The maximum age of the cookie in milliseconds
	 * @return A configured Cookie object
	 */
    public static Cookie createRefreshTokenCookie(String refreshToken, long cookieMaxAge) {
        Cookie cookie = new Cookie("refreshToken", refreshToken);
        cookie.setHttpOnly(true);
        cookie.setSecure(true);
        cookie.setPath("/");
        cookie.setMaxAge((int) (cookieMaxAge / 1000));
        cookie.setDomain("skapp.dev");
        cookie.setAttribute("SameSite", "Lax");
        return cookie;
    }

}
