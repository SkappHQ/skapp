package com.skapp.community.crmplanner.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.model.CrmDeal;
import com.skapp.community.crmplanner.payload.request.CrmDealCreateRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmDealEditRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmDealFilterDto;
import com.skapp.community.crmplanner.payload.request.CrmDealUpdateStageRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmDealReorderRequestDto;
import com.skapp.community.crmplanner.payload.request.board.CrmDealsByStagesRequestDto;

public interface CrmDealService {

	ResponseEntityDto createDeal(CrmDealCreateRequestDto requestDto);

	CrmDeal persistNewDeal(CrmDealCreateRequestDto requestDto);

	ResponseEntityDto checkDealNameExists(String name);

	ResponseEntityDto getDeals(CrmDealFilterDto filterDto);

	ResponseEntityDto getDealsByStages(CrmDealsByStagesRequestDto requestDto);

	ResponseEntityDto getBoardInitData();

	ResponseEntityDto getBoardInitDataV2();

	ResponseEntityDto updateDealStage(CrmDealUpdateStageRequestDto requestDto);

	ResponseEntityDto reorderDeal(CrmDealReorderRequestDto requestDto);

	ResponseEntityDto editDeal(Long id, CrmDealEditRequestDto requestDto);

	CrmDeal applyDealEdit(Long id, CrmDealEditRequestDto requestDto);

	ResponseEntityDto getDealById(Long id);

	ResponseEntityDto deleteDeal(Long id);

}
