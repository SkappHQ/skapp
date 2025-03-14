package com.skapp.enterprise.common.config;

import com.skapp.enterprise.common.constant.EpCommonConstants;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import org.slf4j.MDC;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Configuration
public class LoggingContextFilter extends OncePerRequestFilter {

	@Override
	protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response,
			@NonNull FilterChain filterChain) throws ServletException, IOException {
		try {
			String tenantId = TenantContext.getCurrentTenant();
			MDC.put(EpCommonConstants.TENANT_ID_KEY, tenantId);

			Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
			if (authentication != null && authentication.getName() != null) {
				MDC.put(EpCommonConstants.EMAIL_KEY, authentication.getName());
			}

			filterChain.doFilter(request, response);
		}
		finally {
			MDC.remove(EpCommonConstants.TENANT_ID_KEY);
			MDC.remove(EpCommonConstants.EMAIL_KEY);
		}
	}

}
