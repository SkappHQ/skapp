package com.skapp.community.crmplanner.service.v2;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.payload.request.CrmDealBatchRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmDealCreateRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmDealEditRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmDealFilterDto;

public interface CrmDealServiceV2 {

	ResponseEntityDto getDeals(CrmDealFilterDto filterDto);

	ResponseEntityDto getDealsByIds(CrmDealBatchRequestDto requestDto);

	ResponseEntityDto getDealById(Long id);

	ResponseEntityDto createDeal(CrmDealCreateRequestDto requestDto);

	ResponseEntityDto editDeal(Long id, CrmDealEditRequestDto requestDto);

}
