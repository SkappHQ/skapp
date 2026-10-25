package com.skapp.community.crmplanner.repository;

import com.skapp.community.crmplanner.payload.response.CrmActivityTeamMemberResponseDto;

import java.util.Collection;
import java.util.List;

public interface CrmActivityTeamMemberRepository {

	List<CrmActivityTeamMemberResponseDto> findCrmMembers(Collection<Long> employeeIds);

}
