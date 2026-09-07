package com.skapp.community.leaveplanner.payload.response;

import com.skapp.community.leaveplanner.type.LeaveRequestStatus;
import com.skapp.community.leaveplanner.type.LeaveState;
import com.skapp.community.peopleplanner.payload.request.EmployeeBasicDetailsResponseDto;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
public class LeaveRequestManagerResponseDto {

	private EmployeeBasicDetailsResponseDto employee;

	private Long leaveRequestId;

	private String startDate;

	private String endDate;

	private LeaveTypeBasicDetailsResponseDto leaveType;

	private LeaveState leaveState;

	private LeaveRequestStatus status;

	private Integer durationHours;

	private Float durationDays;

	private Instant createdDate;

	private String requestDesc;

}
