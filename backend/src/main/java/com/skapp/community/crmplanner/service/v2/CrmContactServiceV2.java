package com.skapp.community.crmplanner.service.v2;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.payload.request.CrmContactCreateRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmContactEditRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmContactFilterDto;
import com.skapp.community.crmplanner.payload.request.CrmContactMetricRequestDto;

public interface CrmContactServiceV2 {

	ResponseEntityDto getContactMetrics(CrmContactMetricRequestDto filterDto);

	ResponseEntityDto getContactById(Long id);

	ResponseEntityDto createContact(CrmContactCreateRequestDto requestDto);

	ResponseEntityDto editContact(Long id, CrmContactEditRequestDto requestDto);

	ResponseEntityDto getContactsLookup(CrmContactFilterDto filterDto);

}
