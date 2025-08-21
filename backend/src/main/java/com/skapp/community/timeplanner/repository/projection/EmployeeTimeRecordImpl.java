package com.skapp.community.timeplanner.repository.projection;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@RequiredArgsConstructor
@Getter
@Setter
public class EmployeeTimeRecordImpl implements EmployeeTimeRecord {

	private final Long timeRecordId;

	private final Long employeeId;

	private final LocalDate date;

	private final Float workedHours;

	private final Float breakHours;

	private final String timeSlots;

}
