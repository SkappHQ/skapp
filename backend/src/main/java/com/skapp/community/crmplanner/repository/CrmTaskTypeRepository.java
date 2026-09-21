package com.skapp.community.crmplanner.repository;

import com.skapp.community.crmplanner.model.CrmTaskType;

import java.util.List;

public interface CrmTaskTypeRepository {

	void insertAll(List<CrmTaskType> taskTypes);

}
