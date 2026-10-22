package com.skapp.community.crmplanner.activity.repository;

import com.skapp.community.crmplanner.activity.payload.response.CrmActivityPersonResponseDto;

import java.util.Collection;
import java.util.List;

public interface CrmActivityTeamMemberRepository {

	List<CrmActivityPersonResponseDto> findCrmMembers(Collection<Long> employeeIds);

}
