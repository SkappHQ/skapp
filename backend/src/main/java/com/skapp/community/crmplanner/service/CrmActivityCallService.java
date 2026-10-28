package com.skapp.community.crmplanner.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.payload.request.CrmActivityCallFilterDto;

public interface CrmActivityCallService {

	ResponseEntityDto getCalls(CrmActivityCallFilterDto filterDto);

	ResponseEntityDto getCallById(Long id);

}
