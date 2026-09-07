package com.skapp.community.common.service;

import com.skapp.community.peopleplanner.model.Employee;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;

public interface TimeZoneService {

	ZoneId business();

	ZoneId display();

	ZoneId displayFor(Employee employee);

	LocalDate currentBusinessDate();

	int currentBusinessYear();

	LocalDateTime currentBusinessDayStartUtc();

}
