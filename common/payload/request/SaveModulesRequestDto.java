package com.skapp.enterprise.common.payload.request;

import com.skapp.community.common.type.ModuleType;
import lombok.Getter;
import lombok.Setter;

import java.util.Set;

@Getter
@Setter
public class SaveModulesRequestDto {

	private Set<ModuleType> selectedModules;

}
