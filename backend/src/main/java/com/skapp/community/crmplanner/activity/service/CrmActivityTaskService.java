package com.skapp.community.crmplanner.activity.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.activity.payload.request.CrmActivityTaskCompleteRequestDto;
import com.skapp.community.crmplanner.activity.payload.request.CrmActivityTaskEditRequestDto;
import com.skapp.community.crmplanner.activity.payload.request.CrmActivityTaskRelatedFilterDto;

public interface CrmActivityTaskService {

	ResponseEntityDto completeTask(Long id, CrmActivityTaskCompleteRequestDto requestDto);

	ResponseEntityDto getTaskById(Long id);

	ResponseEntityDto editTask(Long id, CrmActivityTaskEditRequestDto requestDto);

	ResponseEntityDto deleteTask(Long id);

	ResponseEntityDto getRelatedTasks(Long id, CrmActivityTaskRelatedFilterDto filterDto);

}
