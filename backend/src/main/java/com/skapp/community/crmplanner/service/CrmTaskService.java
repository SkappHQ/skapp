package com.skapp.community.crmplanner.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.payload.request.CrmTaskCreateRequestDto;

public interface CrmTaskService {

	ResponseEntityDto getTasks();

	ResponseEntityDto createTask(CrmTaskCreateRequestDto requestDto);

}
