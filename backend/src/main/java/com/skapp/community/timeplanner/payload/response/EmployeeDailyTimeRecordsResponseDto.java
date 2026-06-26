package com.skapp.community.timeplanner.payload.response;

import com.skapp.community.leaveplanner.payload.response.LeaveRequestResponseDto;
import com.skapp.community.peopleplanner.payload.response.HolidayResponseDto;
import lombok.Getter;
import lombok.Setter;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class EmployeeDailyTimeRecordsResponseDto {

	private Long timeRecordId;

	private LocalDate date;

	private DayOfWeek day;

	private Float workedHours;

	private Float breakHours;

	private List<EmployeeDailyRecordsTimeSlotResponseDto> timeSlots;

	private LeaveRequestResponseDto leaveRequest;

	private HolidayResponseDto holiday;

}
