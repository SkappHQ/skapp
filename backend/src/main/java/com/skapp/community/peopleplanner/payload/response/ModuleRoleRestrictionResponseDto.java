package com.skapp.community.peopleplanner.payload.response;

import com.skapp.community.common.type.ModuleType;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ModuleRoleRestrictionResponseDto {

	private ModuleType module;

	private Boolean isAdmin;

	private Boolean isManager;

}
