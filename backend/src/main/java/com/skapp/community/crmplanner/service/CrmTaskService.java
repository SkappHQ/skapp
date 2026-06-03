package com.skapp.community.crmplanner.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.payload.request.CrmTaskEditRequestDto;

public interface CrmTaskService {

	ResponseEntityDto editTask(Long id, CrmTaskEditRequestDto requestDto);

}
