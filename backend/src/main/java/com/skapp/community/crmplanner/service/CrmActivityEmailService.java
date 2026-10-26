package com.skapp.community.crmplanner.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.payload.request.CrmActivityEmailFilterDto;

public interface CrmActivityEmailService {

	ResponseEntityDto getEmails(CrmActivityEmailFilterDto filterDto);

}
