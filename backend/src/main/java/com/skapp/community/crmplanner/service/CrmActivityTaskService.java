package com.skapp.community.crmplanner.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.payload.request.CrmActivityTaskCreateRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmActivityTaskEditRequestDto;

public interface CrmActivityTaskService {

	ResponseEntityDto createTask(CrmActivityTaskCreateRequestDto requestDto);

	ResponseEntityDto getTaskById(Long id);

	ResponseEntityDto editTask(Long id, CrmActivityTaskEditRequestDto requestDto);

	ResponseEntityDto deleteTask(Long id);

}
