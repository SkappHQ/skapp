package com.skapp.enterprise.invoice.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skapp.community.common.exception.EntityNotFoundException;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.common.constant.EpAuthConstants;
import com.skapp.enterprise.invoice.constant.InvoiceCommonConstant;
import com.skapp.enterprise.invoice.constant.InvoiceMessageConstant;
import com.skapp.enterprise.invoice.constant.graphql.ProjectGraphQLQueries;
import com.skapp.enterprise.invoice.model.Customer;
import com.skapp.enterprise.invoice.model.Project;
import com.skapp.enterprise.invoice.payload.response.TenantProjectListResponseDto;
import com.skapp.enterprise.invoice.repository.CustomerDao;
import com.skapp.enterprise.invoice.repository.ProjectDao;
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

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProjectServiceImpl implements ProjectService {

	@Value("${pm.service.url}")
	private String pmServiceUrl;

	@Value("${internal.api.key}")
	private String internalApiKey;

	private final RestTemplate restTemplate;

	private final ProjectDao projectDao;

	private final CustomerDao customerDao;

	@Override
	public ResponseEntityDto getAllProjects(HttpServletRequest request) {

		List<TenantProjectListResponseDto> internalProjects = callExternalAPItoGetProjects(request);

		// Sort the internalProjects list by the 'name' field in ascending order
		List<TenantProjectListResponseDto> sortedInternalProjects = internalProjects.stream()
			.sorted(Comparator.comparing(TenantProjectListResponseDto::getName))
			.toList();

		return new ResponseEntityDto(false, sortedInternalProjects);
	}

	@Override
	public ResponseEntityDto getProjectsByCustomer(HttpServletRequest request, Long customerId) {

		List<TenantProjectListResponseDto> internalProjects = callExternalAPItoGetProjects(request);

		if (customerId == null) {
			List<TenantProjectListResponseDto> sortedInternalProjects = internalProjects.stream()
				.sorted(Comparator.comparing(TenantProjectListResponseDto::getName))
				.toList();

			return new ResponseEntityDto(false, sortedInternalProjects);
		}
		else {

			Customer customer = customerDao.findById(customerId)
				.orElseThrow(
						() -> new EntityNotFoundException(InvoiceMessageConstant.INVOICE_ERROR_CUSTOMER_NOT_FOUND));

			List<Project> customerProjectList = projectDao.findByCustomer_Id(customerId);

			List<TenantProjectListResponseDto> filteredProjects = internalProjects.stream()
				.filter(internalProject -> customerProjectList.stream()
					.allMatch(customerProject -> customerProject.getProjectId().equals(internalProject.getId())))
				.sorted(Comparator.comparing(TenantProjectListResponseDto::getName))
				.toList();

			return new ResponseEntityDto(false, filteredProjects);
		}
	}

	private String extractTenantId(HttpServletRequest request) {
		return request.getHeader(EpAuthConstants.TENANT_HEADER);
	}

	private HttpHeaders createHeaders(HttpServletRequest request) {
		HttpHeaders headers = new HttpHeaders();
		headers.set(EpAuthConstants.TENANT_HEADER, extractTenantId(request));
		headers.set(EpAuthConstants.API_KEY_HEADER, internalApiKey);
		headers.setContentType(MediaType.APPLICATION_JSON);
		return headers;
	}

	private List<TenantProjectListResponseDto> callExternalAPItoGetProjects(HttpServletRequest request) {

		// Define the GraphQL query
		String query = ProjectGraphQLQueries.INTERNAL_PROJECTS;

		Map<String, Object> graphQLRequest = new HashMap<>();
		graphQLRequest.put("query", query);

		HttpHeaders headers = createHeaders(request);

		HttpEntity<Map<String, Object>> entity = new HttpEntity<>(graphQLRequest, headers);

		try {
			ResponseEntity<String> responseEntity = restTemplate.postForEntity(pmServiceUrl, entity, String.class);

			ObjectMapper objectMapper = new ObjectMapper();
			JsonNode responseEntityJsonNode = objectMapper.readTree(responseEntity.getBody());

			if (responseEntityJsonNode.has(InvoiceCommonConstant.ERRORS)
					&& !responseEntityJsonNode.get(InvoiceCommonConstant.ERRORS).isEmpty()) {
				throw new ModuleException(InvoiceMessageConstant.INVOICE_ERROR_FETCHING_PROJECTS);
			}

			if (responseEntityJsonNode.has(InvoiceCommonConstant.DATA)
					&& responseEntityJsonNode.get(InvoiceCommonConstant.DATA)
						.has(InvoiceCommonConstant.INTERNAL_PROJECTS)) {

				List<TenantProjectListResponseDto> internalProjects = objectMapper.convertValue(
						responseEntityJsonNode.get(InvoiceCommonConstant.DATA)
							.get(InvoiceCommonConstant.INTERNAL_PROJECTS),
						objectMapper.getTypeFactory()
							.constructCollectionType(List.class, TenantProjectListResponseDto.class));

				return internalProjects;
			}
		}
		catch (RestClientException e) {
			log.error("Error making HTTP request to {}: {}", pmServiceUrl, e.getMessage());
			throw new ModuleException(InvoiceMessageConstant.INVOICE_ERROR_FETCHING_PROJECTS_FROM_SOURCE);
		}
		catch (Exception e) {
			log.error("Error parsing JSON response: ", e);

		}

		return new ArrayList<>();
	}

}
