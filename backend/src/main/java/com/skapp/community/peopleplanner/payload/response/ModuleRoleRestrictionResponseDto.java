package com.skapp.community.peopleplanner.payload.response;

import com.skapp.community.common.type.ModuleType;
import com.skapp.community.common.type.RoleLevel;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ModuleRoleRestrictionResponseDto {

	private ModuleType module;

	private Boolean isAdmin;

	private Boolean isManager;

	private List<RoleLevel> restrictions;

	private List<RoleLevel> restrictableRoles;

}
