package com.skapp.enterprise.pm.service.impl;

import com.skapp.enterprise.common.config.TenantContext;
import com.skapp.enterprise.common.constant.EpAuthConstants;
import com.skapp.enterprise.common.payload.request.ProjectRequestDto;
import com.skapp.enterprise.pm.service.EpProjectService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class EpProjectServiceImpl implements EpProjectService {

	private static final String GRAPHQL_QUERY_KEY = "query";

	private static final String GRAPHQL_ERRORS_KEY = "errors";

	private static final String GRAPHQL_DATA_KEY = "data";

	@Value("${pm.service.url}")
	private String pmServiceUrl;

	@Value("${pm.internal.api.key}")
	private String internalApiKey;

	private final RestTemplate restTemplate;

	@Override
	public List<ProjectRequestDto> getProjectsByIds(List<Long> projectIds) {
		if (projectIds == null || projectIds.isEmpty()) {
			return Collections.emptyList();
		}

		try {
			JsonNode responseJsonNode = fetchAllProjects();

			if (responseJsonNode.has(GRAPHQL_ERRORS_KEY) && !responseJsonNode.get(GRAPHQL_ERRORS_KEY).isEmpty()) {
				log.error("getProjectsByIds: GraphQL errors: {}", responseJsonNode.get(GRAPHQL_ERRORS_KEY));
				return Collections.emptyList();
			}

			return extractProjectsByIds(responseJsonNode, projectIds);
		}
		catch (Exception e) {
			log.error("getProjectsByIds: Error fetching projects: {}", e.getMessage(), e);
			return Collections.emptyList();
		}
	}

	private JsonNode fetchAllProjects() {
		String query = """
				query InternalProjects {
				  internalProjects {
				    id
				    key
				    name
				  }
				}
				""";

		Map<String, Object> graphQLRequest = new HashMap<>();
		graphQLRequest.put(GRAPHQL_QUERY_KEY, query);

		HttpHeaders headers = createHeaders();
		HttpEntity<Map<String, Object>> entity = new HttpEntity<>(graphQLRequest, headers);

		ResponseEntity<String> responseEntity = restTemplate.postForEntity(pmServiceUrl, entity, String.class);

		ObjectMapper objectMapper = new ObjectMapper();
		return objectMapper.readTree(responseEntity.getBody());
	}

	private List<ProjectRequestDto> extractProjectsByIds(JsonNode responseJsonNode, List<Long> projectIds) {
		if (!responseJsonNode.has(GRAPHQL_DATA_KEY)
				|| !responseJsonNode.get(GRAPHQL_DATA_KEY).has("internalProjects")) {
			return Collections.emptyList();
		}

		JsonNode projectsArray = responseJsonNode.get(GRAPHQL_DATA_KEY).get("internalProjects");
		if (projectsArray == null || !projectsArray.isArray()) {
			return Collections.emptyList();
		}

		Set<Long> projectIdSet = new HashSet<>(projectIds);
		List<ProjectRequestDto> result = new ArrayList<>();

		for (JsonNode projectNode : projectsArray) {
			if (!projectNode.has("id") || projectNode.get("id").isNull()) {
				continue;
			}
			Long id = projectNode.get("id").asLong();
			if (projectIdSet.contains(id)) {
				result.add(mapProjectNode(projectNode, id));
			}
		}

		return result;
	}

	private ProjectRequestDto mapProjectNode(JsonNode projectNode, Long id) {
		ProjectRequestDto dto = new ProjectRequestDto();
		dto.setProjectId(id);
		if (projectNode.has("name") && !projectNode.get("name").isNull()) {
			dto.setProjectName(projectNode.get("name").asString());
		}
		if (projectNode.has("key") && !projectNode.get("key").isNull()) {
			dto.setProjectKey(projectNode.get("key").asString());
		}
		return dto;
	}

	private HttpHeaders createHeaders() {
		HttpHeaders headers = new HttpHeaders();
		headers.set(EpAuthConstants.TENANT_HEADER, TenantContext.getCurrentTenant());
		headers.set(EpAuthConstants.API_KEY_HEADER, internalApiKey);
		headers.setContentType(MediaType.APPLICATION_JSON);
		return headers;
	}

}
