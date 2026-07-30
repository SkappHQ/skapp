package com.skapp.community.peopleplanner.payload.request;

import com.skapp.community.common.type.ModuleType;
import com.skapp.community.common.type.RoleLevel;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ModuleRoleRestrictionRequestDto {

	private ModuleType module;

	private List<RoleLevel> add;

	private List<RoleLevel> remove;

}
