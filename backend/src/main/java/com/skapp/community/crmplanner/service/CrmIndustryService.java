package com.skapp.community.crmplanner.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.payload.request.CrmIndustryFilterDto;

public interface CrmIndustryService {

	ResponseEntityDto getIndustriesLookup(CrmIndustryFilterDto filterDto);

}
