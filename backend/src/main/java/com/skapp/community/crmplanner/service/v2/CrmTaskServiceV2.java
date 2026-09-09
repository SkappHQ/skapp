package com.skapp.community.crmplanner.service.v2;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.payload.request.CrmTaskCreateRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmTaskEditRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmTaskFilterDtoV2;
import com.skapp.community.crmplanner.payload.request.CrmTaskRelatedFilterDtoV2;

public interface CrmTaskServiceV2 {

	ResponseEntityDto getTasks(CrmTaskFilterDtoV2 filterDto);

	ResponseEntityDto getRelatedTasks(Long id, CrmTaskRelatedFilterDtoV2 filterDto);

	ResponseEntityDto getTaskById(Long id);

	ResponseEntityDto createTask(CrmTaskCreateRequestDto requestDto);

	ResponseEntityDto editTask(Long id, CrmTaskEditRequestDto requestDto);

}
