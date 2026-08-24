package com.skapp.community.crmplanner.service.v2;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.payload.request.CrmDealCreateRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmDealEditRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmDealFilterDto;
import com.skapp.community.crmplanner.payload.request.CrmDealListReorderRequestDto;

public interface CrmDealServiceV2 {

	ResponseEntityDto getDeals(CrmDealFilterDto filterDto);

	ResponseEntityDto getDealById(Long id);

	ResponseEntityDto createDeal(CrmDealCreateRequestDto requestDto);

	ResponseEntityDto editDeal(Long id, CrmDealEditRequestDto requestDto);

	ResponseEntityDto reorderDealInList(CrmDealListReorderRequestDto requestDto);

}
