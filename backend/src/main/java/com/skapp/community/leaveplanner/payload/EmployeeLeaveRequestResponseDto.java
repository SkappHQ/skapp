package com.skapp.community.leaveplanner.payload;

import com.skapp.community.leaveplanner.payload.response.LeaveRequestResponseDto;
import com.skapp.community.peopleplanner.payload.request.EmployeeBasicDetailsResponseDto;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EmployeeLeaveRequestResponseDto {

	private EmployeeBasicDetailsResponseDto employeeResponseDto;

	private LeaveRequestResponseDto leaveRequestResponseDto;

}
