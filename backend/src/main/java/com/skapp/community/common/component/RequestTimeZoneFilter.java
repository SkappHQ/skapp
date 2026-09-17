package com.skapp.community.common.component;

import com.skapp.community.common.constant.CommonConstants;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.ZoneId;
import java.util.Set;

@Component
public class RequestTimeZoneFilter extends OncePerRequestFilter {

	private static final Set<String> AVAILABLE_ZONE_IDS = Set.copyOf(ZoneId.getAvailableZoneIds());

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {
		String timezone = request.getHeader(CommonConstants.TIMEZONE_HEADER);
		if (timezone != null && AVAILABLE_ZONE_IDS.contains(timezone)) {
			request.setAttribute(CommonConstants.REQUEST_TIMEZONE_ATTRIBUTE, ZoneId.of(timezone));
		}
		filterChain.doFilter(request, response);
	}

}
