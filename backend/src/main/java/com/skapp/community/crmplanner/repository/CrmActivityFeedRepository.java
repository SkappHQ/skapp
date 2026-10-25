package com.skapp.community.crmplanner.repository;

import com.skapp.community.crmplanner.payload.request.CrmActivityFeedFilterDto;
import com.skapp.community.crmplanner.payload.response.CrmActivityFeedResponseDto;
import com.skapp.community.crmplanner.payload.response.CrmActivityTeamMemberResponseDto;

import java.time.ZoneId;
import java.util.Collection;
import java.util.List;
import java.util.Set;

public interface CrmActivityFeedRepository {

	CrmActivityFeedResponseDto findActivityFeed(Set<Long> ownerIds, CrmActivityFeedFilterDto filterDto, ZoneId zone);

	List<CrmActivityTeamMemberResponseDto> findCrmMembers(Collection<Long> employeeIds);

}
