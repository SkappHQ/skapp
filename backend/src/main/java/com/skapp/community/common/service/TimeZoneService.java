package com.skapp.community.common.service;

import java.time.LocalDate;
import java.time.Instant;
import java.time.ZoneId;

public interface TimeZoneService {

	ZoneId business();

	LocalDate currentBusinessDate();

	int currentBusinessYear();

	Instant currentBusinessDayStart();

}
