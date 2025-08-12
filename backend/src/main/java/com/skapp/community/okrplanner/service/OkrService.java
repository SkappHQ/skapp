package com.skapp.community.okrplanner.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.okrplanner.payload.OkrConfigDto;

public interface OkrService {

	ResponseEntityDto getOkrConfiguration();

	ResponseEntityDto upsertOkrConfiguration(OkrConfigDto okrConfigDto);

}
