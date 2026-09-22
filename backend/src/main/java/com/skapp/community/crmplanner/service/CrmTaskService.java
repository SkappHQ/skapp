package com.skapp.community.crmplanner.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.model.CrmTask;
import com.skapp.community.crmplanner.payload.request.CrmTaskCompletedFilterDto;
import com.skapp.community.crmplanner.payload.request.CrmTaskCreateRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmTaskEditRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmTaskFilterDto;
import com.skapp.community.crmplanner.payload.request.CrmTaskRelatedFilterDto;

public interface CrmTaskService {

	ResponseEntityDto getTasks(CrmTaskFilterDto filterDto);

	ResponseEntityDto getTaskById(Long id);

	ResponseEntityDto createTask(CrmTaskCreateRequestDto requestDto);

	CrmTask persistNewTask(CrmTaskCreateRequestDto requestDto);

	ResponseEntityDto editTask(Long id, CrmTaskEditRequestDto requestDto);

	CrmTask applyTaskEdit(Long id, CrmTaskEditRequestDto requestDto);

	ResponseEntityDto deleteTask(Long id);

	ResponseEntityDto getCompletedTasks(CrmTaskCompletedFilterDto filterDto);

	ResponseEntityDto getRelatedTasks(CrmTaskRelatedFilterDto filterDto);

}
