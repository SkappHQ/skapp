package com.skapp.community.common.service.impl;

import com.skapp.community.common.model.User;
import com.skapp.community.common.service.OrganizationService;
import com.skapp.community.common.service.TimeZoneService;
import com.skapp.community.common.service.UserService;
import com.skapp.community.common.util.DateTimeUtils;
import com.skapp.community.common.util.StringUtils;
import com.skapp.community.peopleplanner.model.Employee;
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

	@Lazy
	private final UserService userService;

	@Override
	public ZoneId business() {
		return organizationService.getOrganizationZoneId();
	}

	@Override
	public ZoneId display() {
		User currentUser = userService.getCurrentUser();
		return displayFor(currentUser == null ? null : currentUser.getEmployee());
	}

	@Override
	public ZoneId displayFor(Employee employee) {
		String employeeTimeZone = employee == null ? null : employee.getTimeZone();
		if (StringUtils.isNullOrBlank(employeeTimeZone) || !DateTimeUtils.isValidTimeZone(employeeTimeZone)) {
			return business();
		}
		return ZoneId.of(employeeTimeZone);
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
