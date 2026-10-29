package com.skapp.community.crmplanner.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.payload.request.CrmActivityCallCreateRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmActivityCallEditRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmActivityCallFilterDto;

public interface CrmActivityCallService {

	ResponseEntityDto getCalls(CrmActivityCallFilterDto filterDto);

	ResponseEntityDto getCallById(Long id);

	ResponseEntityDto createCall(CrmActivityCallCreateRequestDto requestDto);

	ResponseEntityDto editCall(Long id, CrmActivityCallEditRequestDto requestDto);

}
