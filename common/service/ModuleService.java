package com.skapp.enterprise.common.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.type.ModuleType;
import com.skapp.enterprise.common.model.ModuleConfig;
import com.skapp.enterprise.common.payload.request.UpdateModulesRequestDto;

public interface ModuleService {

	ResponseEntityDto updateModules(UpdateModulesRequestDto updateModulesRequestDto);

	ResponseEntityDto getActiveModules();

	boolean getCurrentModuleState(ModuleConfig moduleConfig, ModuleType moduleType);

	void setDefaultModules();

}
