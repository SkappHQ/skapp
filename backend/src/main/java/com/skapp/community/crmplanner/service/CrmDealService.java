package com.skapp.community.crmplanner.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.payload.request.CrmDealCreateRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmDealFilterDto;
import com.skapp.community.crmplanner.payload.request.CrmDealsByStagesRequestDto;

public interface CrmDealService {

	ResponseEntityDto createDeal(CrmDealCreateRequestDto requestDto);

	ResponseEntityDto getDeals(CrmDealFilterDto filterDto);

	ResponseEntityDto getDealsByStages(CrmDealsByStagesRequestDto requestDto);

}
