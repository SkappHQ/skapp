package com.skapp.community.crmplanner.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.payload.request.CrmTaskCompletedFilterDto;
import com.skapp.community.crmplanner.payload.request.CrmTaskCreateRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmTaskEditRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmTaskFilterDto;

public interface CrmTaskService {

	ResponseEntityDto getTasks(CrmTaskFilterDto filterDto);

	ResponseEntityDto createTask(CrmTaskCreateRequestDto requestDto);

	ResponseEntityDto editTask(Long id, CrmTaskEditRequestDto requestDto);

	ResponseEntityDto deleteTask(Long id);

	ResponseEntityDto getCompletedTasks(CrmTaskCompletedFilterDto filterDto);

}
