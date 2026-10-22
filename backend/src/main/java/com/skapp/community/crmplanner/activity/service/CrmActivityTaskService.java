package com.skapp.community.crmplanner.activity.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.activity.payload.request.CrmActivityTaskCompleteRequestDto;

public interface CrmActivityTaskService {

	ResponseEntityDto completeTask(Long id, CrmActivityTaskCompleteRequestDto requestDto);

}
