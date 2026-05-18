package com.skapp.community.crmplanner.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.payload.request.CrmContactCreateRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmContactOwnerFilterDto;

public interface CrmContactService {

	ResponseEntityDto createContact(CrmContactCreateRequestDto requestDto);

	ResponseEntityDto getContactOwners(CrmContactOwnerFilterDto filterDto);

}
