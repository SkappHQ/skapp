package com.skapp.community.peopleplanner.payload.request.employee;

import com.skapp.community.common.type.Role;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EmployeeSystemPermissionsDto {

	private Boolean isSuperAdmin;

	private Role peopleRole;

	private Role leaveRole;

	private Role attendanceRole;

	private Role esignRole;

	private Role pmRole;

	private Role okrRole;

	private Role invoiceRole;

}
