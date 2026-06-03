package com.skapp.community.crmplanner.repository;

import com.skapp.community.crmplanner.type.CrmTaskSummary;

import java.util.List;

public interface CrmTaskRepository {

	List<CrmTaskSummary> findOpenTaskSummaryByContactIds(List<Long> contactIds);

}
