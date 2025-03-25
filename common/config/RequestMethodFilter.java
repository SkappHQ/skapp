package com.skapp.enterprise.common.config;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@Slf4j
public class RequestMethodFilter implements Filter {

	@Override
	public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
			throws IOException, ServletException {
		if (!(request instanceof HttpServletRequest httpRequest)) {
			chain.doFilter(request, response);
			return;
		}

		try {
			RequestMethodContext.determineReadOnly();

			if (log.isDebugEnabled()) {
				log.debug("Processing {} request for {}, readOnly: {}", httpRequest.getMethod(),
						httpRequest.getRequestURI(), RequestMethodContext.isReadOnly());
			}

			chain.doFilter(request, response);
		}
		finally {
			RequestMethodContext.clear();
			MultiTenantDataSourceConfig.clearLookupKey();
		}
	}

}
