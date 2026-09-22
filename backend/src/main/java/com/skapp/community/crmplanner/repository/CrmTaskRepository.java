package com.skapp.community.crmplanner.repository;

import com.skapp.community.crmplanner.model.CrmTask;
import com.skapp.community.crmplanner.payload.request.CrmTaskCompletedFilterDto;
import com.skapp.community.crmplanner.payload.request.CrmTaskFilterDto;
import com.skapp.community.crmplanner.payload.request.CrmTaskFilterDtoV2;
import com.skapp.community.crmplanner.payload.request.CrmTaskRelatedFilterDto;
import com.skapp.community.crmplanner.payload.response.v2.CrmTaskResponseDtoV2;
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

	List<CrmTask> findTasks(Long ownerId, CrmTaskFilterDto filterDto);

	Page<CrmTaskResponseDtoV2> findTasksV2(Long ownerId, CrmTaskFilterDtoV2 filterDto, Pageable pageable);

	Optional<CrmTask> findByIdWithAssociations(Long id);

	Optional<CrmTaskLinkRefs> findTaskLinkRefsById(Long id);

	List<CrmTask> findByContactIdWithAssociations(Long contactId);

	CrmContactTaskMetrics findTaskMetricsByContactId(Long contactId);

	Page<CrmTask> findCompletedTasks(Long ownerId, CrmTaskCompletedFilterDto filterDto, Pageable pageable);

	Map<Long, Long> countTasksByDealIds(List<Long> dealIds, Long ownerId);

	Page<CrmTask> findRelatedTasks(CrmTaskRelatedFilterDto filterDto, Long ownerId, Pageable pageable);

	Page<CrmTaskResponseDtoV2> findRelatedTasksV2(Long taskId, CrmTaskRelatedParams params, Pageable pageable);

}
