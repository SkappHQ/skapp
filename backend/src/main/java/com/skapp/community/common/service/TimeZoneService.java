package com.skapp.community.common.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;

public interface TimeZoneService {

	ZoneId business();

	LocalDate currentBusinessDate();

	int currentBusinessYear();

	LocalDateTime currentBusinessDayStartUtc();

}
