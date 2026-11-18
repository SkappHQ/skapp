package com.skapp.community.crmplanner.repository;

import com.skapp.community.crmplanner.model.CrmActivityTask;
import com.skapp.community.crmplanner.payload.response.CrmActivityTaskResponseDto;
import com.skapp.community.crmplanner.type.CrmActivityTaskFilterParams;

import java.util.List;
import java.util.Map;

public interface CrmActivityTaskRepository {

	List<CrmActivityTaskResponseDto> findTasks(CrmActivityTaskFilterParams params);

	CrmActivityTask findTaskById(Long id);

	Map<Long, Long> countTasksByDealIds(List<Long> dealIds, Long ownerId);

}
