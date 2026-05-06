package com.skapp.enterprise.pm.service;

import com.skapp.enterprise.common.payload.request.ProjectRequestDto;
import tools.jackson.databind.JsonNode;

import java.util.List;

public interface EpGuestUserInternalService {

	boolean assignGuestToProjects(Long userId, List<ProjectRequestDto> projects, Long adminUserId);

	boolean updateGuestUserProjects(Long userId, List<ProjectRequestDto> projects, Long adminUserId);

	List<JsonNode> loadProjectsFromMicroservice();

}
