package com.skapp.community.common.service.impl;

import com.skapp.community.common.service.OrganizationService;
import com.skapp.community.common.service.TimeZoneService;
import com.skapp.community.common.util.DateTimeUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;

@Service
@RequiredArgsConstructor
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
	public Instant currentOrganizationDayStart() {
		ZoneId organizationZone = organizationTimezone();
		return DateTimeUtils.currentDateAt(organizationZone).atStartOfDay(organizationZone).toInstant();
	}

}
