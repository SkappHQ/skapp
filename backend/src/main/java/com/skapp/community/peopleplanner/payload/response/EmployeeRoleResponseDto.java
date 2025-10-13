package com.skapp.community.peopleplanner.payload.response;

import com.skapp.community.common.type.Role;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EmployeeRoleResponseDto {

	private Role peopleRole;

	private Role leaveRole;

	private Role attendanceRole;

	private Role esignRole;

	private Role okrRole;

	private Role invoiceRole;

	private Boolean isSuperAdmin;

}
