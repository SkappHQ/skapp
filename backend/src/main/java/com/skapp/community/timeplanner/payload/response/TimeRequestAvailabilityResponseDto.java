package com.skapp.community.timeplanner.payload.response;

import com.skapp.community.leaveplanner.payload.response.LeaveRequestResponseDto;
import com.skapp.community.peopleplanner.payload.response.HolidayResponseDto;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class TimeRequestAvailabilityResponseDto {

	private LocalDate date;

	private Boolean timeSlotsExists;

	private List<EmployeeTimeRequestResponseDto> manualEntryRequests;

	private EmployeeTimeRequestResponseDto editTimeRequests;

	private List<LeaveRequestResponseDto> leaveRequest;

	private List<HolidayResponseDto> holiday;

}
