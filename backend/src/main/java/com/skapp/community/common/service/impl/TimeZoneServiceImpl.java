package com.skapp.community.common.service.impl;

import com.skapp.community.common.service.OrganizationService;
import com.skapp.community.common.service.TimeZoneService;
import com.skapp.community.common.util.DateTimeUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;

@Service
@RequiredArgsConstructor
public class TimeZoneServiceImpl implements TimeZoneService {

	@Lazy
	private final OrganizationService organizationService;

	@Override
	public ZoneId business() {
		return organizationService.getOrganizationZoneId();
	}

	@Override
	public LocalDate currentBusinessDate() {
		return DateTimeUtils.currentDateAt(business());
	}

	@Override
	public int currentBusinessYear() {
		return DateTimeUtils.currentDateAt(business()).getYear();
	}

	@Override
	public LocalDateTime currentBusinessDayStartUtc() {
		ZoneId businessZone = business();
		return DateTimeUtils.currentDateAt(businessZone)
			.atStartOfDay(businessZone)
			.withZoneSameInstant(ZoneOffset.UTC)
			.toLocalDateTime();
	}

}
