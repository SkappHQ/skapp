package com.skapp.community.crmplanner.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.payload.request.CrmDealStageCreateRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmDealStageEditRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmDealStageReorderRequestDto;

import java.util.List;

public interface CrmDealStageService {

	ResponseEntityDto getDealStages();

	ResponseEntityDto createDealStage(CrmDealStageCreateRequestDto requestDto);

	ResponseEntityDto editDealStage(Long id, CrmDealStageEditRequestDto requestDto);

	ResponseEntityDto deleteDealStage(Long id);

	ResponseEntityDto reorderDealStages(List<CrmDealStageReorderRequestDto> stages);

}
