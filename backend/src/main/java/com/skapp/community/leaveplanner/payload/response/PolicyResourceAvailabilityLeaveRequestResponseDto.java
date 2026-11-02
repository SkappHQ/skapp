package com.skapp.community.leaveplanner.payload.response;

import com.skapp.community.leaveplanner.type.LeaveState;
import com.skapp.community.peopleplanner.payload.request.EmployeeBasicDetailsResponseDto;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class PolicyResourceAvailabilityLeaveRequestResponseDto {

	private Long leaveRequestId;

	private EmployeeBasicDetailsResponseDto employee;

	private String policyName;

	private PolicyLeaveTypeDetailResponseDto leaveType;

	private LocalDate startDate;

	private LocalDate endDate;

	private LeaveState leaveState;

}
