package com.skapp.community.crmplanner.repository;

import com.skapp.community.crmplanner.model.CrmActivityTask;
import org.springframework.data.repository.Repository;

public interface CrmActivityFeedDao extends Repository<CrmActivityTask, Long>, CrmActivityFeedRepository {

}
