package com.skapp.community.crmplanner.service;

import com.skapp.community.crmplanner.payload.request.CrmContactCreateRequestDto;

public interface CrmContactValidationService {

	void validateCreateContactRequest(CrmContactCreateRequestDto requestDto);

}
