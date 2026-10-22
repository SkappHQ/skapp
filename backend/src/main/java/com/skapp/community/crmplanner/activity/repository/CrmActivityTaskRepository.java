package com.skapp.community.crmplanner.activity.repository;

import com.skapp.community.crmplanner.model.CrmActivityTask;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Set;

public interface CrmActivityTaskRepository {

	Page<CrmActivityTask> findRelatedTasks(CrmActivityTask sourceTask, Set<Long> ownerIds, Pageable pageable);

}
