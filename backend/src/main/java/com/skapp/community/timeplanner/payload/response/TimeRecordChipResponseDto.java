package com.skapp.community.timeplanner.payload.response;

import com.skapp.community.leaveplanner.payload.response.LeaveRequestResponseDto;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Setter
@Getter
public class TimeRecordChipResponseDto {

	private Long timeRecordId;

	private LocalDate date;

	private Float workedHours;

	private LeaveRequestResponseDto leaveRequest;

}
