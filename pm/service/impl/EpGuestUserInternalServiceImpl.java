package com.skapp.enterprise.pm.service.impl;

import com.skapp.enterprise.common.config.TenantContext;
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
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Primary
@RequiredArgsConstructor
@Slf4j
public class EpGuestUserInternalServiceImpl implements EpGuestUserInternalService {

	private static final String GRAPHQL_QUERY_KEY = "query";

	private static final String GRAPHQL_ERRORS_KEY = "errors";

	private static final String GRAPHQL_DATA_KEY = "data";

	private static final String GRAPHQL_VARIABLES_KEY = "variables";

	@Value("${pm.service.url}")
	private String pmServiceUrl;

	@Value("${pm.internal.api.key}")
	private String internalApiKey;

	private final RestTemplate restTemplate;

	@Override
	@Transactional
	public boolean assignGuestToProjects(Long userId, List<ProjectRequestDto> projects, Long adminUserId) {

		if (projects == null || projects.isEmpty()) {
			return true;
		}

		List<Long> projectIds = projects.stream().map(ProjectRequestDto::getProjectId).toList();

		return callAssignGuestToProjectsMutation(userId, projectIds, adminUserId);
	}

	private boolean callAssignGuestToProjectsMutation(Long userId, List<Long> projectIds, Long adminUserId) {
		String mutation = """
				mutation InternalAssignGuestToProjects($input: AssignGuestToItemsInput!) {
				  internalAssignGuestToProjects(input: $input)
				}
				""";

		Map<String, Object> input = new HashMap<>();
		input.put("userId", userId);
		input.put("projectIds", projectIds);
		input.put("createdBy", adminUserId);
		input.put("updatedBy", adminUserId);

		Map<String, Object> variables = new HashMap<>();
		variables.put("input", input);

		Map<String, Object> graphQLRequest = new HashMap<>();
		graphQLRequest.put(GRAPHQL_QUERY_KEY, mutation);
		graphQLRequest.put(GRAPHQL_VARIABLES_KEY, variables);

		HttpHeaders headers = createHeaders();
		HttpEntity<Map<String, Object>> entity = new HttpEntity<>(graphQLRequest, headers);

		ResponseEntity<String> responseEntity = restTemplate.postForEntity(pmServiceUrl, entity, String.class);

		ObjectMapper objectMapper = new ObjectMapper();
		JsonNode responseJsonNode = objectMapper.readTree(responseEntity.getBody());

		if (responseJsonNode.has(GRAPHQL_ERRORS_KEY) && !responseJsonNode.get(GRAPHQL_ERRORS_KEY).isEmpty()) {
			return false;
		}

		if (responseJsonNode.has(GRAPHQL_DATA_KEY)
				&& responseJsonNode.get(GRAPHQL_DATA_KEY).has("internalAssignGuestToProjects")) {
			return responseJsonNode.get(GRAPHQL_DATA_KEY).get("internalAssignGuestToProjects").asBoolean();
		}

		return false;

	}

	@Override
	@Transactional
	public boolean updateGuestUserProjects(Long userId, List<ProjectRequestDto> projects, Long adminUserId) {

		if (projects == null) {
			return true;
		}

		List<Long> projectIds = projects.stream().map(ProjectRequestDto::getProjectId).toList();

		return callUpdateGuestUserProjectsMutation(userId, projectIds, adminUserId);
	}

	private boolean callUpdateGuestUserProjectsMutation(Long userId, List<Long> projectIds, Long adminUserId) {
		String mutation = """
				mutation InternalUpdateGuestUserProjects($input: UpdateGuestProjectsInput!) {
				  internalUpdateGuestUserProjects(input: $input)
				}
				""";

		Map<String, Object> input = new HashMap<>();
		input.put("userId", userId);
		input.put("projectIds", projectIds);
		input.put("updatedBy", adminUserId);

		Map<String, Object> variables = new HashMap<>();
		variables.put("input", input);

		Map<String, Object> graphQLRequest = new HashMap<>();
		graphQLRequest.put(GRAPHQL_QUERY_KEY, mutation);
		graphQLRequest.put(GRAPHQL_VARIABLES_KEY, variables);

		HttpHeaders headers = createHeaders();
		HttpEntity<Map<String, Object>> entity = new HttpEntity<>(graphQLRequest, headers);

		ResponseEntity<String> responseEntity = restTemplate.postForEntity(pmServiceUrl, entity, String.class);

		ObjectMapper objectMapper = new ObjectMapper();
		JsonNode responseJsonNode = objectMapper.readTree(responseEntity.getBody());

		if (responseJsonNode.has(GRAPHQL_ERRORS_KEY) && !responseJsonNode.get(GRAPHQL_ERRORS_KEY).isEmpty()) {
			return false;
		}

		if (responseJsonNode.has(GRAPHQL_DATA_KEY)
				&& responseJsonNode.get(GRAPHQL_DATA_KEY).has("internalUpdateGuestUserProjects")) {
			return responseJsonNode.get(GRAPHQL_DATA_KEY).get("internalUpdateGuestUserProjects").asBoolean();
		}

		return false;
	}

	private HttpHeaders createHeaders() {
		HttpHeaders headers = new HttpHeaders();
		headers.set(EpAuthConstants.TENANT_HEADER, TenantContext.getCurrentTenant());
		headers.set(EpAuthConstants.API_KEY_HEADER, internalApiKey);
		headers.setContentType(MediaType.APPLICATION_JSON);
		return headers;
	}

	@Override
	public List<JsonNode> loadProjectsFromMicroservice() {
		try {
			String query = """
					query internalLoadGuestUserProjectsToCache {
					  internalLoadGuestUserProjectsToCache {
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
			graphQLRequest.put(GRAPHQL_QUERY_KEY, query);

			HttpHeaders headers = createHeaders();
			HttpEntity<Map<String, Object>> entity = new HttpEntity<>(graphQLRequest, headers);

			ResponseEntity<String> responseEntity = restTemplate.postForEntity(pmServiceUrl, entity, String.class);

			ObjectMapper objectMapper = new ObjectMapper();
			JsonNode responseJsonNode = objectMapper.readTree(responseEntity.getBody());

			if (responseJsonNode.has(GRAPHQL_ERRORS_KEY) && !responseJsonNode.get(GRAPHQL_ERRORS_KEY).isEmpty()) {
				log.error("loadProjectsFromMicroservice: GraphQL errors: {}", responseJsonNode.get(GRAPHQL_ERRORS_KEY));
				return Collections.emptyList();
			}

			if (responseJsonNode.has(GRAPHQL_DATA_KEY)
					&& responseJsonNode.get(GRAPHQL_DATA_KEY).has("internalLoadGuestUserProjectsToCache")) {
				JsonNode projectsArray = responseJsonNode.get(GRAPHQL_DATA_KEY)
					.get("internalLoadGuestUserProjectsToCache");

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
