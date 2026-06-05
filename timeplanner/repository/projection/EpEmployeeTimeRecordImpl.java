package com.skapp.enterprise.timeplanner.repository.projection;

import com.skapp.enterprise.timeplanner.type.RecordLocationStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@AllArgsConstructor
public class EpEmployeeTimeRecordImpl implements EpEmployeeTimeRecord {

	private final Long timeRecordId;

	private final Long employeeId;

	private final LocalDate date;

	private final Float workedHours;

	private final Float breakHours;

	private final String timeSlots;

	private final RecordLocationStatus clockInLocationStatus;

	private final RecordLocationStatus clockOutLocationStatus;

}
