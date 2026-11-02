package com.skapp.community.leaveplanner.payload.response;

import com.skapp.community.peopleplanner.payload.request.EmployeeBasicDetailsResponseDto;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class PolicyEmployeeOnLeaveResponseDto {

	private EmployeeBasicDetailsResponseDto employee;

	private List<PolicyOnLeaveRequestResponseDto> leaveRequests;

}
