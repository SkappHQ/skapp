package com.skapp.community.crmplanner.activity.repository;

import com.skapp.community.crmplanner.activity.type.CrmActivityFeedCriteria;
import com.skapp.community.crmplanner.activity.type.CrmActivityFeedRecord;
import com.skapp.community.crmplanner.activity.type.CrmActivityLinkedContact;

import java.util.Collection;
import java.util.List;

public interface CrmActivityFeedRepository {

	List<CrmActivityFeedRecord> findDueActivities(CrmActivityFeedCriteria criteria);

	List<CrmActivityFeedRecord> findHistoryActivities(CrmActivityFeedCriteria criteria, int offset, int limit);

	List<CrmActivityLinkedContact> findMeetingContacts(Collection<Long> meetingIds);

	List<CrmActivityLinkedContact> findEmailContacts(Collection<Long> emailIds);

}
