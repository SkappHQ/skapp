package com.skapp.community.leaveplanner.payload.request;

import com.skapp.community.leaveplanner.payload.response.LeaveRequestResponseDto;
import com.skapp.community.peopleplanner.payload.request.EmployeeBasicDetailsResponseDto;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AllLeaveRequestsResponseDto extends LeaveRequestResponseDto {

	private EmployeeBasicDetailsResponseDto employee;

}
