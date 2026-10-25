package com.skapp.community.crmplanner.repository;

import com.skapp.community.crmplanner.payload.response.CrmActivityTaskResponseDto;
import com.skapp.community.crmplanner.type.CrmActivityTaskFilterParams;

import java.util.List;

public interface CrmActivityTaskRepository {

	List<CrmActivityTaskResponseDto> findTasks(CrmActivityTaskFilterParams params);

}
