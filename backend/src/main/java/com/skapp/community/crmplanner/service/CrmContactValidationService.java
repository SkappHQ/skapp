package com.skapp.community.crmplanner.service;

import com.skapp.community.crmplanner.payload.request.CrmContactCreateRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmContactUpdateRequestDto;

public interface CrmContactValidationService {

	void validateCreateContactRequest(CrmContactCreateRequestDto requestDto);

	void validateUpdateContactRequest(CrmContactUpdateRequestDto requestDto, Long contactId);

}
