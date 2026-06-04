package com.skapp.community.crmplanner.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.payload.request.CrmContactCreateRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmContactFilterDto;
import com.skapp.community.crmplanner.payload.request.CrmContactEditRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmContactOwnerFilterDto;
import com.skapp.community.crmplanner.payload.request.CrmContactMetricRequestDto;

public interface CrmContactService {

	ResponseEntityDto createContact(CrmContactCreateRequestDto requestDto);

	ResponseEntityDto editContact(Long id, CrmContactEditRequestDto requestDto);

	ResponseEntityDto getContactOwners(CrmContactOwnerFilterDto filterDto);

	ResponseEntityDto deleteContact(Long id);

	ResponseEntityDto getContactMetrics(CrmContactMetricRequestDto filterDto);

	ResponseEntityDto getContactsLookup(CrmContactFilterDto filterDto);

}
