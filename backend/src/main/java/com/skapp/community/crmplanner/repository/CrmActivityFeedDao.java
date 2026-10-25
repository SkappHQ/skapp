package com.skapp.community.crmplanner.repository;

import com.skapp.community.crmplanner.model.CrmActivityFeedItem;
import com.skapp.community.crmplanner.model.CrmActivityFeedItemId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CrmActivityFeedDao
		extends JpaRepository<CrmActivityFeedItem, CrmActivityFeedItemId>, CrmActivityFeedRepository {

}
