package com.skapp.community.crmplanner.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.payload.request.CrmDealCreateRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmDealFilterDto;
import com.skapp.community.crmplanner.payload.request.CrmDealReorderRequestDto;
import com.skapp.community.crmplanner.payload.request.board.CrmDealsByStagesRequestDto;

public interface CrmDealService {

	ResponseEntityDto createDeal(CrmDealCreateRequestDto requestDto);

	ResponseEntityDto getDeals(CrmDealFilterDto filterDto);

	ResponseEntityDto getDealsByStages(CrmDealsByStagesRequestDto requestDto);

	ResponseEntityDto getBoardInitData();

	ResponseEntityDto reorderDeal(CrmDealReorderRequestDto requestDto);

}
