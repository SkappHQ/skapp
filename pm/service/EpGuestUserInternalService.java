package com.skapp.enterprise.pm.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.skapp.enterprise.common.payload.request.ProjectRequestDto;

import java.util.List;

public interface EpGuestUserInternalService {

	boolean assignGuestToProjects(Long userId, List<ProjectRequestDto> projects);

	boolean updateGuestUserProjects(Long userId, List<ProjectRequestDto> projects);

	List<JsonNode> loadProjectsFromMicroservice();

}
