package com.skapp.enterprise.invoice.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.skapp.community.common.constant.AuthConstants;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.JwtService;
import com.skapp.enterprise.common.constant.EpAuthConstants;
import com.skapp.enterprise.invoice.constant.graphql.ProjectGraphQLQueries;
import com.skapp.enterprise.invoice.payload.graphql.paginated.PaginationInput;
import com.skapp.enterprise.invoice.payload.graphql.ProjectsWithPaginated;
import com.skapp.enterprise.invoice.payload.request.ProjectFilterDto;
import com.skapp.enterprise.invoice.payload.response.TenantProjectListResponseDto;
import com.skapp.enterprise.invoice.service.ProjectService;
import graphql.kickstart.spring.webclient.boot.GraphQLRequest;
import graphql.kickstart.spring.webclient.boot.GraphQLResponse;
import graphql.kickstart.spring.webclient.boot.GraphQLWebClient;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectServiceImpl implements ProjectService {

	@Value("${graphql.client.url}")
	private String graphqlServiceUrl;

	@Autowired
	private GraphQLWebClient graphQLWebClient;

	private final ObjectMapper objectMapper;

	private final JwtService jwtService;

	@Override
	public ResponseEntityDto getAllProjects(ProjectFilterDto projectFilterDto, HttpServletRequest request) {

		// Define the GraphQL query
		String query = ProjectGraphQLQueries.PROJECTS_WITH_PAGINATED;

		PaginationInput pagination = new PaginationInput();
		pagination.setLimit(projectFilterDto.getLimit());
		pagination.setCursor(projectFilterDto.getCursor());
		pagination.setSearch(projectFilterDto.getSearch());

		ObjectNode paginationNode = objectMapper.valueToTree(pagination);

		Map<String, Object> variables = new HashMap<>();
		variables.put("pagination", paginationNode);

		GraphQLRequest graphQLRequest = GraphQLRequest.builder().query(query).variables(variables).build();

		GraphQLResponse graphQLResponse = sendGraphQLRequest(graphQLRequest, request);

		ProjectsWithPaginated result = graphQLResponse.get("projectsWithPaginated", ProjectsWithPaginated.class);

		List<TenantProjectListResponseDto> projects = result.getEdges().stream().map(edge -> {
			TenantProjectListResponseDto dto = new TenantProjectListResponseDto();
			dto.setId(Long.parseLong(edge.getNode().getId()));
			dto.setKey(edge.getNode().getKey());
			dto.setName(edge.getNode().getName());
			return dto;
		}).collect(Collectors.toList());

		return new ResponseEntityDto(false, projects);
	}

	private String extractAuthHeader(HttpServletRequest request) {
		return request.getHeader(AuthConstants.AUTHORIZATION);
	}

	private String extractTenantId(HttpServletRequest request) {
		return request.getHeader(EpAuthConstants.TENANT_HEADER);
	}

	private WebClient createWebClient(HttpServletRequest request) {
		return WebClient.builder()
			.baseUrl(graphqlServiceUrl)
			.defaultHeader("Authorization", extractAuthHeader(request))
			.defaultHeader("x-tenant-id", extractTenantId(request))
			.build();
	}

	private GraphQLResponse sendGraphQLRequest(GraphQLRequest graphQLRequest, HttpServletRequest request) {
		WebClient webClient = createWebClient(request);
		GraphQLWebClient customGraphQLWebClient = GraphQLWebClient.newInstance(webClient, objectMapper);
		return customGraphQLWebClient.post(graphQLRequest).block();
	}

}
