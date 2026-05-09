package com.skapp.community.leaveplanner.payload.response;

import com.skapp.community.leaveplanner.type.LeaveState;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
public class EmployeeLeaveStatusResponseDto {

	private Long employeeId;

	private LeaveState leaveState;

	private LocalDate startDate;

	private LocalDate endDate;

}
