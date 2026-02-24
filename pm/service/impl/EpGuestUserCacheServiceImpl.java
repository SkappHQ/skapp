package com.skapp.enterprise.pm.service.impl;

import com.skapp.community.common.service.CacheService;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.enterprise.common.payload.request.ProjectRequestDto;
import com.skapp.enterprise.common.type.EpCacheKeys;
import com.skapp.enterprise.pm.service.EpGuestUserCacheService;
import com.skapp.enterprise.pm.service.EpGuestUserInternalService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Primary
@RequiredArgsConstructor
@Slf4j
public class EpGuestUserCacheServiceImpl implements EpGuestUserCacheService {

	private final CacheService cacheService;

	private final JsonMapper objectMapper;

	private final EpGuestUserInternalService epGuestUserInternalService;

	@Override
	public List<ProjectRequestDto> getUserAssignedProjects(Long userId) {
		List<ProjectRequestDto> userProjects = new ArrayList<>();

		EpCacheKeys cacheKey = EpCacheKeys.ALL_PROJECT_DETAILS_CACHE_KEY;
		String cachedData = cacheService.get(cacheKey.getKey());

		if (cachedData == null) {
			List<JsonNode> projectsData = epGuestUserInternalService.loadProjectsFromMicroservice();

			if (projectsData == null || projectsData.isEmpty()) {
				return Collections.emptyList();
			}

			cacheProjects(projectsData);

			for (JsonNode projectData : projectsData) {
				ProjectRequestDto project = extractProjectForUserFromNode(projectData, userId);
				if (project != null) {
					userProjects.add(project);
				}
			}

			return userProjects;
		}

		JsonNode projectsMapNode = objectMapper.readTree(cachedData);

		if (projectsMapNode != null && projectsMapNode.isObject()) {
			projectsMapNode.properties().forEach(entry -> {
				JsonNode projectData = entry.getValue();

				ProjectRequestDto project = extractProjectForUserFromNode(projectData, userId);
				if (project != null) {
					userProjects.add(project);
				}
			});
		}

		return userProjects;
	}

	@Override
	public Map<Long, List<ProjectRequestDto>> getAllGuestUsersWithProjects(List<Employee> guestEmployees) {

		Map<Long, List<ProjectRequestDto>> guestUsersProjectsMap = new HashMap<>();

		for (Employee employee : guestEmployees) {
			guestUsersProjectsMap.put(employee.getUser().getUserId(), new ArrayList<>());
		}

		EpCacheKeys cacheKey = EpCacheKeys.ALL_PROJECT_DETAILS_CACHE_KEY;
		String cachedData = cacheService.get(cacheKey.getKey());

		if (cachedData == null) {
			List<JsonNode> projectsData = epGuestUserInternalService.loadProjectsFromMicroservice();

			if (projectsData == null || projectsData.isEmpty()) {
				return guestUsersProjectsMap;
			}

			cacheProjects(projectsData);

			for (JsonNode projectData : projectsData) {
				mapProjectToGuestUsersFromNode(projectData, guestUsersProjectsMap);
			}

			return guestUsersProjectsMap;
		}

		JsonNode projectsMapNode = objectMapper.readTree(cachedData);

		if (projectsMapNode != null && projectsMapNode.isObject()) {
			projectsMapNode.properties().forEach(entry -> {
				JsonNode projectData = entry.getValue();

				mapProjectToGuestUsersFromNode(projectData, guestUsersProjectsMap);
			});
		}

		return guestUsersProjectsMap;
	}

	private void cacheProjects(List<JsonNode> projectsData) {
		EpCacheKeys cacheKey = EpCacheKeys.ALL_PROJECT_DETAILS_CACHE_KEY;
		Map<String, JsonNode> projectsMap = new HashMap<>();

		for (JsonNode projectNode : projectsData) {
			JsonNode projectInfo = projectNode.get("projectInfo");
			if (projectInfo != null && projectInfo.has("id")) {
				String projectId = projectInfo.get("id").asString();
				projectsMap.put(projectId, projectNode);
			}
		}

		String projectsJson = objectMapper.writeValueAsString(projectsMap);
		cacheService.put(cacheKey.format(""), projectsJson, cacheKey.getTtl(), cacheKey.getTimeUnit());
		log.info("cacheProjects: Cached {} projects", projectsData.size());
	}

	private ProjectRequestDto extractProjectForUserFromNode(JsonNode projectNode, Long userId) {
		JsonNode membersNode = projectNode.get("members");
		if (membersNode != null && membersNode.isArray()) {
			for (JsonNode member : membersNode) {
				int memberUserId = member.get("userId").asInt();
				if (memberUserId == userId) {
					return createProjectDto(projectNode.get("projectInfo"));
				}
			}
		}
		return null;
	}

	private void mapProjectToGuestUsersFromNode(JsonNode projectNode,
			Map<Long, List<ProjectRequestDto>> guestUsersProjectsMap) {
		JsonNode membersNode = projectNode.get("members");

		if (membersNode != null && membersNode.isArray()) {
			ProjectRequestDto projectDto = createProjectDto(projectNode.get("projectInfo"));

			if (projectDto != null) {
				for (JsonNode member : membersNode) {
					Long memberUserId = member.get("userId").asLong();
					if (guestUsersProjectsMap.containsKey(memberUserId)) {
						guestUsersProjectsMap.get(memberUserId).add(projectDto);
					}
				}
			}
		}
	}

	private ProjectRequestDto createProjectDto(JsonNode projectInfoNode) {
		if (projectInfoNode == null) {
			return null;
		}

		ProjectRequestDto dto = new ProjectRequestDto();

		if (projectInfoNode.has("id")) {
			dto.setProjectId(Long.parseLong(projectInfoNode.get("id").asString()));
		}

		if (projectInfoNode.has("key")) {
			dto.setProjectKey(projectInfoNode.get("key").asString());
		}

		if (projectInfoNode.has("name")) {
			dto.setProjectName(projectInfoNode.get("name").asString());
		}

		return dto;
	}

}
