package com.skapp.community.crmplanner.repository;

import com.skapp.community.crmplanner.model.CrmTask;
import com.skapp.community.crmplanner.type.CrmTaskSummary;

import java.time.LocalDateTime;
import java.util.List;

public interface CrmTaskRepository {

	List<CrmTaskSummary> findOpenTaskSummaryByContactIds(List<Long> contactIds, LocalDateTime now);

	List<CrmTask> findByContactIdWithAssociations(Long contactId);

}
