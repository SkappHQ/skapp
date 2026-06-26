package com.skapp.community.timeplanner.payload.projection;

import java.time.LocalDate;

public interface TimeRecordsByEmployeesDto {

	Long getTimeRecordId();

	LocalDate getDate();

	Long getEmployeeId();

	float getWorkedHours();

}
