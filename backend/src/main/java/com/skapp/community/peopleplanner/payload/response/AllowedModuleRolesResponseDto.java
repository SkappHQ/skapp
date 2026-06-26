package com.skapp.community.peopleplanner.payload.response;

import com.skapp.community.common.type.ModuleType;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class AllowedModuleRolesResponseDto {

	private ModuleType module;

	private List<AllowedRoleDto> roles;

}
