package com.skapp.community.crmplanner.repository;

import com.skapp.community.crmplanner.model.CrmActivityTask;
import com.skapp.community.crmplanner.payload.response.CrmActivityTaskResponseDto;
import com.skapp.community.crmplanner.type.CrmActivityTaskFilterParams;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;

public interface CrmActivityTaskRepository {

	Page<CrmActivityTaskResponseDto> findTasks(CrmActivityTaskFilterParams params, Pageable pageable);

	CrmActivityTask findTaskById(Long id);

	Map<Long, Long> countTasksByDealIds(List<Long> dealIds, Long ownerId);

}
