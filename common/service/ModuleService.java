package com.skapp.enterprise.common.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.common.payload.request.SaveModulesRequestDto;

public interface ModuleService {

	ResponseEntityDto saveModules(SaveModulesRequestDto saveModulesRequestDto);

	ResponseEntityDto getActiveModules();

	ResponseEntityDto hasSelectedModules();

}
