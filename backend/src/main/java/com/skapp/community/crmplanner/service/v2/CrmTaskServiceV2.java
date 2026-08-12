package com.skapp.community.crmplanner.service.v2;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.payload.request.CrmTaskCompletedFilterDto;
import com.skapp.community.crmplanner.payload.request.CrmTaskCreateRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmTaskEditRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmTaskFilterDto;
import com.skapp.community.crmplanner.payload.request.CrmTaskRelatedFilterDto;

public interface CrmTaskServiceV2 {

	ResponseEntityDto getTasks(CrmTaskFilterDto filterDto);

	ResponseEntityDto getCompletedTasks(CrmTaskCompletedFilterDto filterDto);

	ResponseEntityDto getRelatedTasks(CrmTaskRelatedFilterDto filterDto);

	ResponseEntityDto getTaskById(Long id);

	ResponseEntityDto createTask(CrmTaskCreateRequestDto requestDto);

	ResponseEntityDto editTask(Long id, CrmTaskEditRequestDto requestDto);

}
