package com.skapp.community.timeplanner.repository.projection;

import java.time.LocalDate;

public interface EmployeeTimeRecord {

	Long getTimeRecordId();

	Long getEmployeeId();

	LocalDate getDate();

	Float getWorkedHours();

	Float getBreakHours();

	String getTimeSlots();

}
