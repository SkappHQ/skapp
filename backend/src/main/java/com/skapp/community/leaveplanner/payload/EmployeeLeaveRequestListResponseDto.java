package com.skapp.community.leaveplanner.payload;

import com.skapp.community.leaveplanner.payload.response.LeaveRequestResponseDto;
import com.skapp.community.peopleplanner.payload.response.EmployeeResponseDto;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class EmployeeLeaveRequestListResponseDto {

	private EmployeeResponseDto employeeResponseDto;

	private List<LeaveRequestResponseDto> leaveRequestResponseDto;

}
