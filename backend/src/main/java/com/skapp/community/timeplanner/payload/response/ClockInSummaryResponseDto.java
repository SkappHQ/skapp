package com.skapp.community.timeplanner.payload.response;

import com.skapp.community.peopleplanner.payload.request.EmployeeBasicDetailsResponseDto;
import com.skapp.community.peopleplanner.payload.response.HolidayResponseDto;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ClockInSummaryResponseDto {

	private EmployeeBasicDetailsResponseDto employee;

	private Long timeRecordId;

	private String clockInTime;

	private String clockOutTime;

	private String workedHours;

	private ClockInSummaryLeaveRequestResponseDto leave;

	private HolidayResponseDto holiday;

	private Boolean isLateArrival;

}
