package com.skapp.community.crmplanner.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.payload.request.CrmActivityEmailCreateRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmActivityEmailEditRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmActivityEmailFilterDto;

public interface CrmActivityEmailService {

	ResponseEntityDto getEmails(CrmActivityEmailFilterDto filterDto);

	ResponseEntityDto createEmail(CrmActivityEmailCreateRequestDto requestDto);

	ResponseEntityDto getEmailById(Long id);

	ResponseEntityDto editEmail(Long id, CrmActivityEmailEditRequestDto requestDto);

	ResponseEntityDto deleteEmail(Long id);

}
