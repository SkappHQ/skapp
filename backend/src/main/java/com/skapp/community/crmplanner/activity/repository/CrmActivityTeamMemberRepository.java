package com.skapp.community.crmplanner.activity.repository;

import com.skapp.community.crmplanner.activity.payload.response.CrmActivityPersonResponseDto;

import java.util.Collection;
import java.util.List;

public interface CrmActivityTeamMemberRepository {

	List<CrmActivityPersonResponseDto> findAllCrmMembers(String searchPattern);

	List<CrmActivityPersonResponseDto> findCrmMembersByEmployeeIds(Collection<Long> employeeIds, String searchPattern);

}
