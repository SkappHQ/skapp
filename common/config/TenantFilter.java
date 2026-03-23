package com.skapp.enterprise.common.config;

import com.skapp.community.common.constant.CommonMessageConstant;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.enterprise.common.constant.EPCommonMessageConstant;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Objects;
import java.util.Set;

@Component
@Slf4j
@RequiredArgsConstructor
public class TenantFilter extends OncePerRequestFilter {

	private static final String TENANT_HEADER = "X-Tenant-ID";

	private static final Set<String> EXCLUDED_PATHS = Set.of("/v3/api-docs", "/v3/api-docs.yaml", "/swagger-ui.html",
			"/swagger-ui", "/swagger-resources", "/swagger-ui/index.html", "/swagger-ui/index.css",
			"/swagger-ui/swagger-ui-standalone-preset.js", "/swagger-ui/swagger-ui.css", "/v3/api-docs/swagger-config",
			"/swagger-ui/swagger-ui-bundle.js", "/swagger-ui/swagger-initializer.js", "/swagger-ui/favicon-16x16.png",
			"/swagger-ui/favicon-32x32.png", "/robots.txt", "/favicon.ico", "/error", "/v1/ep/tenant/create",
			"/v1/ep/organization", "/v1/ep/auth/signup/super-admin", "/v1/ep/auth/signup/super-admin/sso/google",
			"/v1/ep/auth/otp/generate", "/v1/ep/auth/otp/verify", "/v1/ep/auth/otp/resend", "/v1/ep/auth/domain/verify",
			"/v1/ep/auth/recaptcha", "/health", "/deployment", "/v1/ep/auth/password-reset",
			"/v1/ep/auth/password-reset/verify-otp", "/v1/ep/auth/password-reset/send-otp",
			"/v1/ep/auth/password-reset/resend-otp", "/v1/ep/organization/login-method",
			"/v1/ep/auth/tenant/availability", "/v1/google-calendar/redirect", "/v1/validate/email",
			"/v1/ep/stripe/webhook", "/v2/ep/auth/sso/google/auth-url", "/v2/ep/auth/sso/google/redirect",
			"/v2/ep/auth/signup/super-admin/sso/google", "/v2/ep/auth/sso/microsoft/auth-url",
			"/v2/ep/auth/sso/microsoft/redirect", "/v2/ep/auth/signup/super-admin/sso/microsoft",
			"/v1/ep/esign/document-link/token-exchange", "/v1/ep/s3/files/organization-setup/signed-url",
			"/v1/microsoft-calendar/redirect", "/v1/ep/esign/document-link/send-otp",
			"/v1/ep/esign/document-link/resend-otp", "/v1/ep/esign/document-link/verify-otp", "/v1/announcement", "/v1/announcement/list",
			"/v1/announcement/image/signed-url");

	@Override
	protected boolean shouldNotFilter(@NonNull HttpServletRequest request) {
		String requestURI = request.getRequestURI();
		return EXCLUDED_PATHS.stream().anyMatch(requestURI::equals);
	}

	@Override
	protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response,
			@NonNull FilterChain filterChain) {

		String tenantId = request.getHeader(TENANT_HEADER);

		logRequestDetails(request, Objects.requireNonNullElse(tenantId, "Not Provided"));

		if (tenantId == null || tenantId.isBlank()) {
			log.error("Tenant header missing in the request.");
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_TENANT_HEADER_MISSING);
		}

		tenantId = tenantId.strip();

		try {
			TenantContext.setCurrentTenant(tenantId.toLowerCase());
			filterChain.doFilter(request, response);
		}
		catch (ServletException e) {
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_SERVLET_EXCEPTION,
					new String[] { e.getMessage() });
		}
		catch (IOException e) {
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_IO_EXCEPTION, new String[] { e.getMessage() });
		}
		finally {
			TenantContext.clearCurrentTenant();
		}
	}

	private void logRequestDetails(HttpServletRequest request, String tenantId) {
		String remoteAddr = request.getHeader("X-Forwarded-For");
		String userAgent = request.getHeader("User-Agent");
		String method = request.getMethod();
		String contentType = request.getContentType();
		String acceptHeader = request.getHeader("Accept");
		String referer = request.getHeader("Referer");

		String originAddress;
		if (remoteAddr == null) {
			originAddress = "N/A";
		}
		else {
			originAddress = remoteAddr.contains(",") ? remoteAddr.split(",")[0] : remoteAddr;
		}

		String greenColor = "\u001B[32m";
		String resetColor = "\u001B[0m";

		String requestLog = "\n" + greenColor + "==================== Request Details ====================\n"
				+ String.format("Remote Address:      %s%n", request.getRemoteAddr())
				+ String.format("Origin Address:      %s%n", originAddress)
				+ String.format("Host:                %s%n", request.getRemoteHost())
				+ String.format("Method:              %s%n", method)
				+ String.format("URI:                 %s%n", request.getRequestURI())
				+ String.format("Protocol:            %s%n", request.getProtocol())
				+ String.format("Content Type:        %s%n", contentType != null ? contentType : "N/A")
				+ String.format("Accept Types:        %s%n", acceptHeader != null ? acceptHeader : "N/A")
				+ String.format("User Agent:          %s%n", userAgent != null ? userAgent : "N/A")
				+ String.format("Referer:             %s%n", referer != null ? referer : "N/A")
				+ String.format("Tenant ID:           %s%n", tenantId)
				+ "=========================================================" + resetColor;

		log.info(requestLog);
	}

}
