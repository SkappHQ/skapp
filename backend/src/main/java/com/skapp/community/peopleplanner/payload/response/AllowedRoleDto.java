package com.skapp.community.peopleplanner.payload.response;

import com.skapp.community.common.type.Role;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AllowedRoleDto {

	private String name;

	private Role role;

}
