package com.skapp.enterprise.pm.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skapp.community.common.service.CacheService;
import com.skapp.community.common.type.Role;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.repository.EmployeeDao;
import com.skapp.enterprise.common.payload.request.ProjectRequestDto;
import com.skapp.enterprise.common.type.EpCacheKeys;
import com.skapp.enterprise.pm.service.EpGuestUserCacheService;
import com.skapp.enterprise.pm.service.EpGuestUserInternalService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

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

	private final EmployeeDao employeeDao;

	private final ObjectMapper objectMapper;

	private final EpGuestUserInternalService epGuestUserInternalService;

	@Override
	public List<ProjectRequestDto> getUserAssignedProjects(Long userId) {
		List<ProjectRequestDto> userProjects = new ArrayList<>();

		EpCacheKeys cacheKey = EpCacheKeys.PROJECT_DETAILS_CACHE_KEY;
		List<String> values = cacheService.getValuesByPattern(cacheKey.format("*"));

		if (values == null || values.isEmpty()) {
			log.info("getUserAssignedProjects: Cache miss, loading from microservice");
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

		for (String projectData : values) {
			if (projectData != null) {
				ProjectRequestDto project = extractProjectForUser(projectData, userId);
				if (project != null) {
					userProjects.add(project);
				}
			}
		}

		return userProjects;
	}

	@Override
	public Map<Long, List<ProjectRequestDto>> getAllGuestUsersWithProjects() {
		List<Employee> guestEmployees = employeeDao.findAll()
			.stream()
			.filter(emp -> emp.getEmployeeRole() != null && emp.getEmployeeRole().getPmRole() == Role.PM_GUEST_EMPLOYEE)
			.toList();

		Map<Long, List<ProjectRequestDto>> guestUsersProjectsMap = new HashMap<>();

		EpCacheKeys cacheKey = EpCacheKeys.PROJECT_DETAILS_CACHE_KEY;
		List<String> values = cacheService.getValuesByPattern(cacheKey.format("*"));

		if (values == null || values.isEmpty()) {
			log.info("getAllGuestUsersWithProjects: Cache miss, loading from microservice");
			List<JsonNode> projectsData = epGuestUserInternalService.loadProjectsFromMicroservice();

			if (projectsData == null || projectsData.isEmpty()) {
				return Collections.emptyMap();
			}

			cacheProjects(projectsData);

			for (Employee employee : guestEmployees) {
				guestUsersProjectsMap.put(employee.getUser().getUserId(), new ArrayList<>());
			}

			for (JsonNode projectData : projectsData) {
				mapProjectToGuestUsersFromNode(projectData, guestUsersProjectsMap);
			}

			return guestUsersProjectsMap;
		}

		for (Employee employee : guestEmployees) {
			guestUsersProjectsMap.put(employee.getUser().getUserId(), new ArrayList<>());
		}

		for (String projectData : values) {
			if (projectData != null) {
				mapProjectToGuestUsers(projectData, guestUsersProjectsMap);
			}
		}

		return guestUsersProjectsMap;
	}

	private void cacheProjects(List<JsonNode> projectsData) {
		EpCacheKeys cacheKey = EpCacheKeys.PROJECT_DETAILS_CACHE_KEY;
		for (JsonNode projectNode : projectsData) {
			try {
				JsonNode projectInfo = projectNode.get("projectInfo");
				if (projectInfo != null && projectInfo.has("key")) {
					String projectKey = projectInfo.get("key").asText();
					String projectJson = objectMapper.writeValueAsString(projectNode);
					cacheService.put(cacheKey.format(projectKey), projectJson, cacheKey.getTtl(),
							cacheKey.getTimeUnit());
				}
			}
			catch (JsonProcessingException e) {
				log.error("cacheProjects: Error caching project: {}", e.getMessage());
			}
		}
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

	private ProjectRequestDto extractProjectForUser(String projectData, Long userId) {
		try {
			JsonNode rootNode = objectMapper.readTree(projectData);

			JsonNode membersNode = rootNode.get("members");
			if (membersNode != null && membersNode.isArray()) {
				for (JsonNode member : membersNode) {
					String memberUserId = member.get("userId").asText();
					if (memberUserId.equals(userId.toString())) {
						return createProjectDto(rootNode.get("projectInfo"));
					}
				}
			}
		}
		catch (JsonProcessingException e) {
			log.error("extractProjectForUser: Error parsing project data: {}", e.getMessage());
		}
		return null;
	}

	private void mapProjectToGuestUsers(String projectData, Map<Long, List<ProjectRequestDto>> guestUsersProjectsMap) {
		try {
			JsonNode rootNode = objectMapper.readTree(projectData);
			JsonNode membersNode = rootNode.get("members");

			if (membersNode != null && membersNode.isArray()) {
				ProjectRequestDto projectDto = createProjectDto(rootNode.get("projectInfo"));

				if (projectDto != null) {
					for (JsonNode member : membersNode) {
						Long memberUserId = Long.parseLong(member.get("userId").asText());
						if (guestUsersProjectsMap.containsKey(memberUserId)) {
							guestUsersProjectsMap.get(memberUserId).add(projectDto);
						}
					}
				}
			}
		}
		catch (JsonProcessingException e) {
			log.error("mapProjectToGuestUsers: Error parsing project data: {}", e.getMessage());
		}
	}

	private ProjectRequestDto createProjectDto(JsonNode projectInfoNode) {
		if (projectInfoNode == null) {
			return null;
		}

		ProjectRequestDto dto = new ProjectRequestDto();

		if (projectInfoNode.has("id")) {
			dto.setProjectId(Long.parseLong(projectInfoNode.get("id").asText()));
		}

		if (projectInfoNode.has("key")) {
			dto.setProjectKey(projectInfoNode.get("key").asText());
		}

		if (projectInfoNode.has("name")) {
			dto.setProjectName(projectInfoNode.get("name").asText());
		}

		return dto;
	}

}
