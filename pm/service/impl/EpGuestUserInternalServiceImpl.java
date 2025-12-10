package com.skapp.enterprise.pm.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.enterprise.common.constant.EPCommonMessageConstant;
import com.skapp.enterprise.common.constant.EpAuthConstants;
import com.skapp.enterprise.common.payload.request.ProjectRequestDto;
import com.skapp.enterprise.pm.service.EpGuestUserInternalService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Primary
@RequiredArgsConstructor
@Slf4j
public class EpGuestUserInternalServiceImpl implements EpGuestUserInternalService {

	@Value("${pm.service.url}")
	private String pmServiceUrl;

	@Value("${pm.internal.api.key}")
	private String internalApiKey;

	private final RestTemplate restTemplate;

	@Override
	@Transactional
	public boolean assignGuestToProjects(Long userId, List<ProjectRequestDto> projects) {

		if (projects == null || projects.isEmpty()) {
			return true;
		}

		List<Long> projectIds = projects.stream().map(ProjectRequestDto::getProjectId).collect(Collectors.toList());

		return callAssignGuestToProjectsMutation(userId, projectIds);
	}

	private boolean callAssignGuestToProjectsMutation(Long userId, List<Long> projectIds) {
		String mutation = """
				mutation InternalAssignGuestToProjects($input: AssignGuestToItemsInput!) {
				  internalAssignGuestToProjects(input: $input)
				}
				""";

		Map<String, Object> input = new HashMap<>();
		input.put("userId", userId);
		input.put("projectIds", projectIds);

		Map<String, Object> variables = new HashMap<>();
		variables.put("input", input);

		Map<String, Object> graphQLRequest = new HashMap<>();
		graphQLRequest.put("query", mutation);
		graphQLRequest.put("variables", variables);

		HttpHeaders headers = createHeaders();
		HttpEntity<Map<String, Object>> entity = new HttpEntity<>(graphQLRequest, headers);

		try {
			ResponseEntity<String> responseEntity = restTemplate.postForEntity(pmServiceUrl, entity, String.class);

			ObjectMapper objectMapper = new ObjectMapper();
			JsonNode responseJsonNode = objectMapper.readTree(responseEntity.getBody());

			if (responseJsonNode.has("errors") && !responseJsonNode.get("errors").isEmpty()) {
				return false;
			}

			if (responseJsonNode.has("data") && responseJsonNode.get("data").has("internalAssignGuestToProjects")) {
				return responseJsonNode.get("data").get("internalAssignGuestToProjects").asBoolean();
			}

			return false;

		}
		catch (JsonProcessingException e) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_GUEST_USER_PROJECT_ASSIGNMENT_FAILED);
		}
	}

	@Override
	@Transactional
	public boolean updateGuestUserProjects(Long userId, List<ProjectRequestDto> projects) {

		if (projects == null || projects.isEmpty()) {
			return true;
		}

		List<Long> projectIds = projects.stream().map(ProjectRequestDto::getProjectId).collect(Collectors.toList());

		return callUpdateGuestUserProjectsMutation(userId, projectIds);
	}

	private boolean callUpdateGuestUserProjectsMutation(Long userId, List<Long> projectIds) {
		String mutation = """
				mutation InternalUpdateGuestUserProjects($input: UpdateGuestProjectsInput!) {
				  internalUpdateGuestUserProjects(input: $input)
				}
				""";

		Map<String, Object> input = new HashMap<>();
		input.put("userId", userId);
		input.put("projectIds", projectIds);

		Map<String, Object> variables = new HashMap<>();
		variables.put("input", input);

		Map<String, Object> graphQLRequest = new HashMap<>();
		graphQLRequest.put("query", mutation);
		graphQLRequest.put("variables", variables);

		HttpHeaders headers = createHeaders();
		HttpEntity<Map<String, Object>> entity = new HttpEntity<>(graphQLRequest, headers);

		try {
			ResponseEntity<String> responseEntity = restTemplate.postForEntity(pmServiceUrl, entity, String.class);

			ObjectMapper objectMapper = new ObjectMapper();
			JsonNode responseJsonNode = objectMapper.readTree(responseEntity.getBody());

			if (responseJsonNode.has("errors") && !responseJsonNode.get("errors").isEmpty()) {
				return false;
			}

			if (responseJsonNode.has("data") && responseJsonNode.get("data").has("internalUpdateGuestUserProjects")) {
				return responseJsonNode.get("data").get("internalUpdateGuestUserProjects").asBoolean();
			}

			return false;

		}
		catch (JsonProcessingException e) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_GUEST_USER_PROJECT_UPDATE_FAILED);
		}
	}

	private HttpHeaders createHeaders() {
		HttpHeaders headers = new HttpHeaders();
		headers.set(EpAuthConstants.API_KEY_HEADER, internalApiKey);
		headers.setContentType(MediaType.APPLICATION_JSON);
		return headers;
	}

	@Override
	public List<JsonNode> loadProjectsFromMicroservice() {
		try {
			String query = """
					query InternalLoadProjectsToCache {
					  internalLoadProjectsToCache {
					    members {
					      role
					      userId
					    }
					    projectInfo {
					      access
					      id
					      key
					      name
					    }
					  }
					}
					""";

			Map<String, Object> graphQLRequest = new HashMap<>();
			graphQLRequest.put("query", query);

			HttpHeaders headers = createHeaders();
			HttpEntity<Map<String, Object>> entity = new HttpEntity<>(graphQLRequest, headers);

			ResponseEntity<String> responseEntity = restTemplate.postForEntity(pmServiceUrl, entity, String.class);

			ObjectMapper objectMapper = new ObjectMapper();
			JsonNode responseJsonNode = objectMapper.readTree(responseEntity.getBody());

			if (responseJsonNode.has("errors") && !responseJsonNode.get("errors").isEmpty()) {
				log.error("loadProjectsFromMicroservice: GraphQL errors: {}", responseJsonNode.get("errors"));
				return Collections.emptyList();
			}

			if (responseJsonNode.has("data") && responseJsonNode.get("data").has("internalLoadProjectsToCache")) {
				JsonNode projectsArray = responseJsonNode.get("data").get("internalLoadProjectsToCache");

				if (projectsArray != null && projectsArray.isArray()) {
					List<JsonNode> projects = new ArrayList<>();

					for (JsonNode projectNode : projectsArray) {
						projects.add(projectNode);
					}

					log.info("loadProjectsFromMicroservice: Loaded {} projects", projects.size());
					return projects;
				}
			}

			return Collections.emptyList();

		}
		catch (Exception e) {
			log.error("loadProjectsFromMicroservice: Error loading projects: {}", e.getMessage(), e);
			return Collections.emptyList();
		}
	}

}
