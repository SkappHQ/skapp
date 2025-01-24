package com.skapp.enterprise.common.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.common.payload.request.SaveModulesRequestDto;
import com.skapp.enterprise.common.payload.request.UpdateModulesRequestDto;

public interface ModuleService {

	ResponseEntityDto saveModules(SaveModulesRequestDto saveModulesRequestDto);

	ResponseEntityDto getActiveModules();

	ResponseEntityDto hasSelectedModules();

	ResponseEntityDto updateModules(UpdateModulesRequestDto updateModulesRequestDto);

}
