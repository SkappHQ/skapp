package com.skapp.community.leaveplanner.payload.response;

import com.skapp.community.peopleplanner.payload.response.HolidayResponseDto;
import lombok.Getter;
import lombok.Setter;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class PolicyResourceAvailabilityResponseDto {

	private LocalDate date;

	private DayOfWeek dayOfWeek;

	private Boolean isNonWorkingDay;

	private List<HolidayResponseDto> holidays;

	private Long leaveCount;

	private Long availableCount;

	private List<PolicyResourceAvailabilityLeaveRequestResponseDto> leaveRequests;

}
