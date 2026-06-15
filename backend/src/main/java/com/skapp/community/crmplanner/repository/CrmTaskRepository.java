package com.skapp.community.crmplanner.repository;

import com.skapp.community.crmplanner.model.CrmTask;
import com.skapp.community.crmplanner.type.CrmContactTaskMetrics;
import com.skapp.community.crmplanner.type.CrmTaskSummary;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface CrmTaskRepository {

	List<CrmTaskSummary> findOpenTaskSummaryByContactIds(List<Long> contactIds);

	List<CrmTask> findAllWithTypeAndOwner();

	List<CrmTask> findAllWithTypeAndOwnerByOwnerId(Long ownerId);

	List<CrmTask> findByContactIdWithAssociations(Long contactId);

	CrmContactTaskMetrics findTaskMetricsByContactId(Long contactId);

	Page<CrmTask> findCompletedTasks(Pageable pageable);

	Page<CrmTask> findCompletedTasksByOwnerId(Long ownerId, Pageable pageable);

}
