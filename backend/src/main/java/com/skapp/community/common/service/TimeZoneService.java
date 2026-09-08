package com.skapp.community.common.service;

import java.time.LocalDate;
import java.time.Instant;
import java.time.ZoneId;

public interface TimeZoneService {

	ZoneId organizationTimezone();

	LocalDate currentOrganizationDate();

	int currentOrganizationYear();

	Instant currentOrganizationDayStart();

}
