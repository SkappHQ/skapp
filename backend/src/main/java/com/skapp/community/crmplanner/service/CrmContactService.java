package com.skapp.community.crmplanner.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.payload.request.*;

public interface CrmContactService {

	ResponseEntityDto createContact(CrmContactCreateRequestDto requestDto);

	ResponseEntityDto getContacts(CrmContactFilterDto filterDto);

	ResponseEntityDto getContactById(Long id);

	ResponseEntityDto getContactMetrics(Long id);

	ResponseEntityDto getContactDeals(Long contactId);

	ResponseEntityDto createContactTask(Long contactId, CrmTaskCreateRequestDto requestDto);

	ResponseEntityDto createContactDeal(Long contactId, CrmDealCreateRequestDto requestDto);

	ResponseEntityDto getContactTasks(Long contactId);

	ResponseEntityDto updateContact(Long id, CrmContactUpdateRequestDto requestDto);

	ResponseEntityDto deleteContact(Long id);

	ResponseEntityDto getContactOwners(CrmContactOwnerFilterDto filterDto);

	ResponseEntityDto getContactsLookup(CrmContactLookupFilterDto filterDto);

}
