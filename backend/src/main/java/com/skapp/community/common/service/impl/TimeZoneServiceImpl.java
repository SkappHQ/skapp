package com.skapp.community.common.service.impl;

import com.skapp.community.common.constant.CommonConstants;
import com.skapp.community.common.service.OrganizationService;
import com.skapp.community.common.service.TimeZoneService;
import com.skapp.community.common.util.DateTimeUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TimeZoneServiceImpl implements TimeZoneService {

	private final ObjectProvider<OrganizationService> organizationServiceProvider;

	@Override
	public ZoneId organizationTimezone() {
		return organizationServiceProvider.getObject().getOrganizationZoneId();
	}

	@Override
	public LocalDate currentOrganizationDate() {
		return DateTimeUtils.currentDateAt(organizationTimezone());
	}

	@Override
	public int currentOrganizationYear() {
		return DateTimeUtils.currentDateAt(organizationTimezone()).getYear();
	}

	@Override
	public ZoneId requestTimezone() {
		String timezone = requestHeader(CommonConstants.TIMEZONE_HEADER);
		if (timezone != null && DateTimeUtils.isValidTimeZone(timezone)) {
			return ZoneId.of(timezone);
		}
		return organizationTimezone();
	}

	@Override
	public Instant currentRequestDayStart() {
		ZoneId requestZone = requestTimezone();
		return DateTimeUtils.currentDateAt(requestZone).atStartOfDay(requestZone).toInstant();
	}

	private String requestHeader(String name) {
		if (RequestContextHolder.getRequestAttributes() instanceof ServletRequestAttributes servletRequestAttributes) {
			return servletRequestAttributes.getRequest().getHeader(name);
		}
		return null;
	}

}
