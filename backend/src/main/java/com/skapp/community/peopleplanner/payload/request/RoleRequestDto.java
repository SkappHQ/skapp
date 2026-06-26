package com.skapp.community.peopleplanner.payload.request;

import com.skapp.community.common.type.Role;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RoleRequestDto {

	private Boolean isSuperAdmin;

	private Role attendanceRole;

	private Role peopleRole;

	private Role leaveRole;

	private Role esignRole;

}
