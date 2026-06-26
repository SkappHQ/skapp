package com.skapp.community.peopleplanner.payload.request;

import com.skapp.community.common.type.Role;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EmployeeRolesRequestDto {

	private Role leaveRole;

	private Role peopleRole;

	private Role attendanceRole;

	private Boolean isSuperAdmin;

}
