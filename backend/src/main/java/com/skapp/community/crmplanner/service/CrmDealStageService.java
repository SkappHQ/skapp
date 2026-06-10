package com.skapp.community.crmplanner.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.payload.request.CrmDealStageCreateRequestDto;

public interface CrmDealStageService {

	ResponseEntityDto getDealStages();

	ResponseEntityDto createDealStage(CrmDealStageCreateRequestDto requestDto);

}
