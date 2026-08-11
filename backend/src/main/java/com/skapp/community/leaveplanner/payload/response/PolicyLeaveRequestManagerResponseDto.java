package com.skapp.community.leaveplanner.payload.response;

import com.skapp.community.leaveplanner.type.LeaveRequestStatus;
import com.skapp.community.leaveplanner.type.LeaveState;
import com.skapp.community.peopleplanner.payload.request.EmployeeBasicDetailsResponseDto;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
public class PolicyLeaveRequestManagerResponseDto {

	private Long leaveRequestId;

	private EmployeeBasicDetailsResponseDto employee;

	private EmployeeBasicDetailsResponseDto reviewer;

	private Long policyId;

	private String policyName;

	private PolicyLeaveTypeDetailResponseDto leaveType;

	private LocalDate startDate;

	private LocalDate endDate;

	private LeaveState leaveState;

	private LeaveRequestStatus status;

	private Float durationDays;

	private String requestDesc;

	private String reviewerComment;

	private LocalDateTime reviewedDate;

	private Boolean isAutoApproved;

	private LocalDateTime createdDate;

}
