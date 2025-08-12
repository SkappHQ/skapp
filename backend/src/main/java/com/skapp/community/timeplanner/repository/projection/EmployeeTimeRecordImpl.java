package com.skapp.community.timeplanner.repository.projection;

import java.time.LocalDate;

public class EmployeeTimeRecordImpl implements EmployeeTimeRecord {

	private final Long timeRecordId;

	private final Long employeeId;

	private final LocalDate date;

	private final Float workedHours;

	private final Float breakHours;

	private final String timeSlots;

	public EmployeeTimeRecordImpl(Long timeRecordId, Long employeeId, LocalDate date, Float workedHours,
			Float breakHours, String timeSlots) {
		this.timeRecordId = timeRecordId;
		this.employeeId = employeeId;
		this.date = date;
		this.workedHours = workedHours;
		this.breakHours = breakHours;
		this.timeSlots = timeSlots;
	}

	@Override
	public Long getTimeRecordId() {
		return timeRecordId;
	}

	@Override
	public Long getEmployeeId() {
		return employeeId;
	}

	@Override
	public LocalDate getDate() {
		return date;
	}

	@Override
	public Float getWorkedHours() {
		return workedHours;
	}

	@Override
	public Float getBreakHours() {
		return breakHours;
	}

	@Override
	public String getTimeSlots() {
		return timeSlots;
	}

}