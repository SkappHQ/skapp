package com.skapp.community.crmplanner.service.v2;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.payload.request.CrmIndustryCreateDto;

public interface CrmIndustryServiceV2 {

	ResponseEntityDto createIndustry(CrmIndustryCreateDto requestDto);

}
