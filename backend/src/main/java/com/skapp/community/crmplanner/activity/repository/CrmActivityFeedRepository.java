package com.skapp.community.crmplanner.activity.repository;

import com.skapp.community.crmplanner.activity.type.CrmActivityFeedCriteria;
import com.skapp.community.crmplanner.activity.type.CrmActivityFeedRecord;
import com.skapp.community.crmplanner.activity.type.CrmActivityLinkedContact;
import com.skapp.community.crmplanner.activity.type.CrmActivityType;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface CrmActivityFeedRepository {

	List<CrmActivityFeedRecord> findDueActivities(CrmActivityFeedCriteria criteria);

	List<CrmActivityFeedRecord> findHistoryActivities(CrmActivityFeedCriteria criteria, int offset, int limit);

	Optional<CrmActivityFeedRecord> findActivityById(CrmActivityType type, Long id);

	List<CrmActivityLinkedContact> findMeetingContacts(Collection<Long> meetingIds);

	List<CrmActivityLinkedContact> findEmailContacts(Collection<Long> emailIds);

}
