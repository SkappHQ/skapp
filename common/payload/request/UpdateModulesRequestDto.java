package com.skapp.enterprise.common.payload.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class UpdateModulesRequestDto {

	@NotNull
	private String moduleName;

	private Boolean isToggled;

}
