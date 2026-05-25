package com.skapp.community.timeplanner.payload.response;

import com.skapp.community.leaveplanner.payload.response.LeaveRequestResponseDto;

import java.time.LocalDate;

public interface TimeRecordChipResponse {

	Long getTimeRecordId();

	LocalDate getDate();

	Float getWorkedHours();

	LeaveRequestResponseDto getLeaveRequest();

}
