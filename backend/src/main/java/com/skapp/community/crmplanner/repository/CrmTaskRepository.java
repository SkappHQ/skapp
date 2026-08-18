package com.skapp.community.crmplanner.repository;

import com.skapp.community.crmplanner.model.CrmTask;
import com.skapp.community.crmplanner.payload.request.CrmTaskCompletedFilterDto;
import com.skapp.community.crmplanner.payload.request.CrmTaskFilterDto;
import com.skapp.community.crmplanner.payload.request.CrmTaskRelatedFilterDto;
import com.skapp.community.crmplanner.payload.response.v2.CrmTaskResponseDtoV2;
import com.skapp.community.crmplanner.type.CrmContactTaskMetrics;
import com.skapp.community.crmplanner.type.CrmTaskSummary;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface CrmTaskRepository {

	List<CrmTaskSummary> findOpenTaskSummaryByContactIds(List<Long> contactIds);

	List<CrmTask> findTasks(Long ownerId, CrmTaskFilterDto filterDto);

	List<CrmTaskResponseDtoV2> findTasksV2(Long ownerId, CrmTaskFilterDto filterDto);

	Optional<CrmTask> findByIdWithAssociations(Long id);

	List<CrmTask> findByContactIdWithAssociations(Long contactId);

	CrmContactTaskMetrics findTaskMetricsByContactId(Long contactId);

	Page<CrmTask> findCompletedTasks(Long ownerId, CrmTaskCompletedFilterDto filterDto, Pageable pageable);

	Page<CrmTaskResponseDtoV2> findCompletedTasksV2(Long ownerId, CrmTaskCompletedFilterDto filterDto,
			Pageable pageable);

	Map<Long, Long> countTasksByDealIds(List<Long> dealIds);

	Page<CrmTask> findRelatedTasks(CrmTaskRelatedFilterDto filterDto, Long ownerId, Pageable pageable);

	Page<CrmTaskResponseDtoV2> findRelatedTasksV2(CrmTaskRelatedFilterDto filterDto, Long ownerId, Pageable pageable);

}
