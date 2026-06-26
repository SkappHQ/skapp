package com.skapp.community.leaveplanner.payload.response;

import com.skapp.community.leaveplanner.type.LeaveRequestStatus;
import com.skapp.community.leaveplanner.type.LeaveState;
import com.skapp.community.peopleplanner.payload.request.EmployeeBasicDetailsResponseDto;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class LeaveRequestWithEmployeeResponseDto {

	private Long leaveRequestId;

	private LeaveState leaveState;

	private LeaveRequestStatus status;

	private LocalDate startDate;

	private LocalDate endDate;

	private LeaveTypeBasicDetailsResponseDto leaveType;

	private EmployeeBasicDetailsResponseDto employee;

	private EmployeeBasicDetailsResponseDto reviewer;

}
