package com.skapp.enterprise.common.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.common.payload.request.SaveOrUpdateModuleRequestDto;

public interface ModuleService {

	ResponseEntityDto saveOrUpdateModules(SaveOrUpdateModuleRequestDto saveOrUpdateModuleRequestDto);

	ResponseEntityDto getActiveModules();

	ResponseEntityDto hasSelectedModules();

}
