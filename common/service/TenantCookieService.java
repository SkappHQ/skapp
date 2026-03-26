package com.skapp.enterprise.common.service;

import jakarta.servlet.http.HttpServletResponse;

public interface TenantCookieService {

	void addTenantCookie(HttpServletResponse response, long cookieMaxAge);

	void clearTenantCookie(HttpServletResponse response);

}
