package com.skapp.community.leaveplanner.payload;

import com.skapp.community.leaveplanner.model.LeaveRequest;
import com.skapp.community.peopleplanner.model.Employee;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class EmployeeLeaveRequestDto {

	private Employee employee;

	private LeaveRequest leaveRequest;

}
