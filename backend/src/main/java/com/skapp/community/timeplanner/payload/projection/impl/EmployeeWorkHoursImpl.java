package com.skapp.community.timeplanner.payload.projection.impl;

import com.skapp.community.timeplanner.payload.projection.EmployeeWorkHours;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@RequiredArgsConstructor
@Getter
@Setter
public class EmployeeWorkHoursImpl implements EmployeeWorkHours {

	private final LocalDate date;

	private final Double workedHours;

}
