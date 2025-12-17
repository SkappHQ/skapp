package com.skapp.enterprise.pm.service;

import com.skapp.enterprise.common.payload.request.ProjectRequestDto;

import java.util.List;
import java.util.Map;

public interface EpGuestUserCacheService {

	List<ProjectRequestDto> getUserAssignedProjects(Long userId);

	Map<Long, List<ProjectRequestDto>> getAllGuestUsersWithProjects();

}
