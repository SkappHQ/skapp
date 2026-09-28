package com.skapp.community.crmplanner.repository;

import com.skapp.community.crmplanner.model.CrmTask;
import com.skapp.community.crmplanner.payload.request.CrmTaskFilterDto;
import com.skapp.community.crmplanner.payload.response.CrmTaskResponseDto;
import com.skapp.community.crmplanner.type.CrmContactTaskMetrics;
import com.skapp.community.crmplanner.type.CrmTaskLinkRefs;
import com.skapp.community.crmplanner.type.CrmTaskRelatedParams;
import com.skapp.community.crmplanner.type.CrmTaskSummary;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface CrmTaskRepository {

	List<CrmTaskSummary> findOpenTaskSummaryByContactIds(List<Long> contactIds);

	Page<CrmTaskResponseDto> findTasks(Long ownerId, CrmTaskFilterDto filterDto, Pageable pageable);

	Optional<CrmTask> findByIdWithAssociations(Long id);

	Optional<CrmTaskLinkRefs> findTaskLinkRefsById(Long id);

	List<CrmTask> findByContactIdWithAssociations(Long contactId);

	CrmContactTaskMetrics findTaskMetricsByContactId(Long contactId);

	Map<Long, Long> countTasksByDealIds(List<Long> dealIds, Long ownerId);

	Page<CrmTaskResponseDto> findRelatedTasks(Long taskId, CrmTaskRelatedParams params, Pageable pageable);

}
