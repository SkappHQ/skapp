package com.skapp.community.crmplanner.repository;

import com.skapp.community.crmplanner.payload.response.CrmActivityFeedResponseDto;
import com.skapp.community.crmplanner.payload.response.CrmActivityTeamMemberResponseDto;
import com.skapp.community.crmplanner.type.CrmActivityFeedCriteria;

import java.util.Collection;
import java.util.List;

public interface CrmActivityFeedRepository {

	CrmActivityFeedResponseDto findActivityFeed(CrmActivityFeedCriteria criteria);

	List<CrmActivityTeamMemberResponseDto> findCrmMembers(Collection<Long> employeeIds);

}
