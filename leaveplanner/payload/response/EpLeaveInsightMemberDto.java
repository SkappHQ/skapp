package com.skapp.enterprise.leaveplanner.payload.response;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class EpLeaveInsightMemberDto {

	private Long employeeId;

	private Boolean isOnLeave;

	private LocalDate leaveStartDate;

	private LocalDate leaveEndDate;

	private Long leaveStartDaysFromNow;

	private Long leaveEndDaysFromNow;

	private Float leaveDurationDays;

}
