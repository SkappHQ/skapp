package com.skapp.enterprise.invoice.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.common.constant.EpAuthConstants;
import com.skapp.enterprise.invoice.constant.InvoiceCommonConstant;
import com.skapp.enterprise.invoice.constant.InvoiceMessageConstant;
import com.skapp.enterprise.invoice.constant.graphql.ProjectGraphQLQueries;
import com.skapp.enterprise.invoice.payload.response.TenantProjectListResponseDto;
import com.skapp.enterprise.invoice.service.ProjectService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProjectServiceImpl implements ProjectService {

	@Value("${pm.service.url}")
	private String pmServiceUrl;

	@Value("${internal.api.key}")
	private String internalApiKey;

	private final RestTemplate restTemplate;

	@Override
	public ResponseEntityDto getAllProjects(HttpServletRequest request) {

		// Define the GraphQL query
		String query = ProjectGraphQLQueries.INTERNAL_PROJECTS;

		Map<String, Object> graphQLRequest = new HashMap<>();
		graphQLRequest.put("query", query);

		HttpHeaders headers = createHeaders(request);

		HttpEntity<Map<String, Object>> entity = new HttpEntity<>(graphQLRequest, headers);

		try {
			ResponseEntity<String> responseEntity = restTemplate.postForEntity(pmServiceUrl, entity, String.class);

			if (responseEntity.getStatusCode().value() != InvoiceCommonConstant.SUCCESS_STATUS_CODE) {
				throw new ModuleException(InvoiceMessageConstant.INVOICE_ERROR_FETCHING_PROJECTS);
			}

			ObjectMapper objectMapper = new ObjectMapper();
			JsonNode jsonNode = objectMapper.readTree(responseEntity.getBody());

			if (jsonNode.has(InvoiceCommonConstant.DATA)
					&& jsonNode.get(InvoiceCommonConstant.DATA).has(InvoiceCommonConstant.INTERNAL_PROJECTS)) {

				List<TenantProjectListResponseDto> internalProjects = objectMapper.convertValue(
						jsonNode.get(InvoiceCommonConstant.DATA).get(InvoiceCommonConstant.INTERNAL_PROJECTS),
						objectMapper.getTypeFactory()
							.constructCollectionType(List.class, TenantProjectListResponseDto.class));

				// Sort the internalProjects list by the 'name' field in ascending order
				List<TenantProjectListResponseDto> sortedInternalProjects = internalProjects.stream()
					.sorted(Comparator.comparing(TenantProjectListResponseDto::getName))
					.toList();

				return new ResponseEntityDto(false, sortedInternalProjects);
			}
		}
		catch (RestClientException e) {
			log.error("Error making HTTP request to {}: {}", pmServiceUrl, e.getMessage());
			throw new ModuleException(InvoiceMessageConstant.INVOICE_ERROR_FETCHING_PROJECTS_FROM_SOURCE);
		}
		catch (Exception e) {
			log.error("Error parsing JSON response: ", e);

		}
		return new ResponseEntityDto(true, InvoiceCommonConstant.DEFAULT_ERROR_MESSAGE);
	}

	private String extractTenantId(HttpServletRequest request) {
		return request.getHeader(EpAuthConstants.TENANT_HEADER);
	}

	private HttpHeaders createHeaders(HttpServletRequest request) {
		HttpHeaders headers = new HttpHeaders();
		headers.set("x-tenant-id", extractTenantId(request));
		headers.set("x-api-key", internalApiKey);
		headers.setContentType(MediaType.APPLICATION_JSON);
		return headers;
	}

}
