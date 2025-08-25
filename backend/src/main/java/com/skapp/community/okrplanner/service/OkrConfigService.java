package com.skapp.community.okrplanner.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.okrplanner.payload.OkrConfigDto;

public interface OkrConfigService {

	ResponseEntityDto getOkrConfiguration();

	ResponseEntityDto updateOkrConfiguration(OkrConfigDto okrConfigDto);

	void setOkrDefaultConfig();

}
