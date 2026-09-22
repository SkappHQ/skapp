package com.skapp.community.peopleplanner.payload.response;

import com.skapp.community.common.type.ModuleType;
import com.skapp.community.common.type.RoleLevel;
import lombok.Getter;
import lombok.Setter;

import java.util.Set;

@Getter
@Setter
public class ModuleRoleRestrictionResponseDto {

	private ModuleType module;

	private Set<RoleLevel> restrictions;

	private Set<RoleLevel> restrictableRoles;

}
