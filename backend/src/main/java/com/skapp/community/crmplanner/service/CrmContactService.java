package com.skapp.community.crmplanner.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.payload.request.CrmContactCreateRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmContactFilterDto;
import com.skapp.community.crmplanner.payload.request.CrmContactOwnerFilterDto;
import com.skapp.community.crmplanner.payload.request.CrmContactUpdateRequestDto;

public interface CrmContactService {

	ResponseEntityDto createContact(CrmContactCreateRequestDto requestDto);

	ResponseEntityDto getContacts(CrmContactFilterDto filterDto);

	ResponseEntityDto getContactById(Long id);

	ResponseEntityDto getContactMetrics(Long id);

	ResponseEntityDto getContactDeals(Long contactId);

	ResponseEntityDto getContactTasks(Long contactId);

	ResponseEntityDto updateContact(Long id, CrmContactUpdateRequestDto requestDto);

	ResponseEntityDto deleteContact(Long id);

	ResponseEntityDto getContactOwners(CrmContactOwnerFilterDto filterDto);

}
