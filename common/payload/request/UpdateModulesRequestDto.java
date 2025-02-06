package com.skapp.enterprise.common.payload.request;

import com.skapp.community.common.type.ModuleType;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class UpdateModulesRequestDto {

	@NotNull
	private ModuleType moduleName;

	private Boolean isToggled;

}
