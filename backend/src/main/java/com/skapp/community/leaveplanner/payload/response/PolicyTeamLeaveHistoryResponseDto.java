package com.skapp.community.leaveplanner.payload.response;

import com.skapp.community.peopleplanner.payload.request.EmployeeBasicDetailsResponseDto;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PolicyTeamLeaveHistoryResponseDto {

	private EmployeeBasicDetailsResponseDto employeeResponseDto;

	private PolicyLeaveHistoryResponseDto leaveRequestResponseDto;

}
