package com.skapp.enterprise.invoice.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skapp.community.common.exception.EntityNotFoundException;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.payload.response.PageDto;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.repository.EmployeeDao;
import com.skapp.enterprise.common.constant.EpAuthConstants;
import com.skapp.enterprise.invoice.constant.InvoiceCommonConstant;
import com.skapp.enterprise.invoice.constant.InvoiceMessageConstant;
import com.skapp.enterprise.invoice.constant.graphql.ProjectGraphQLQueries;
import com.skapp.enterprise.invoice.mapper.ProjectMapper;
import com.skapp.enterprise.invoice.model.BillableRate;
import com.skapp.enterprise.invoice.model.Customer;
import com.skapp.enterprise.invoice.model.Project;
import com.skapp.enterprise.invoice.payload.request.ProjectFilterRequestDto;
import com.skapp.enterprise.invoice.payload.request.ProjectMemberFilterDto;
import com.skapp.enterprise.invoice.payload.request.invoice.TeamMemberBillableRateUpdateRequestDto;
import com.skapp.enterprise.invoice.payload.response.TenantProjectListResponseDto;
import com.skapp.enterprise.invoice.payload.response.TenantProjectUserResponseDto;
import com.skapp.enterprise.invoice.payload.response.ProjectAdminResponseDto;
import com.skapp.enterprise.invoice.payload.response.ProjectMembersResponseDto;
import com.skapp.enterprise.invoice.payload.response.ProjectSummaryResponseDto;
import com.skapp.enterprise.invoice.payload.response.ProjectUsersResponseDto;
import com.skapp.enterprise.invoice.repository.CustomerDao;
import com.skapp.enterprise.invoice.repository.ProjectDao;
import com.skapp.enterprise.invoice.service.BillableRateService;
import com.skapp.enterprise.invoice.service.InvoiceService;
import com.skapp.enterprise.invoice.service.ProjectService;
import com.skapp.enterprise.invoice.type.ProjectUserRole;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Sort;
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
import java.util.Optional;
import java.util.ArrayList;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

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

	private final InvoiceService invoiceService;

	private final BillableRateService billableRateService;

	private final ProjectMapper projectMapper;

	private final EmployeeDao employeeDao;

	@Override
	public ResponseEntityDto getAllProjects(HttpServletRequest request) {

		// Define the GraphQL query
		String query = ProjectGraphQLQueries.INTERNAL_PROJECTS_BASE_DATA;

		List<TenantProjectListResponseDto> internalProjects = callExternalAPItoGetProjects(request, query);

		// Sort the internalProjects list by the 'name' field in ascending order
		List<TenantProjectListResponseDto> sortedInternalProjects = internalProjects.stream()
			.sorted(Comparator.comparing(TenantProjectListResponseDto::getName))
			.toList();

		return new ResponseEntityDto(false, sortedInternalProjects);
	}

	@Override
	public ResponseEntityDto getProjectsByCustomer(HttpServletRequest request, Long customerId) {

		// Define the GraphQL query
		String query = ProjectGraphQLQueries.INTERNAL_PROJECTS_BASE_DATA;

		List<TenantProjectListResponseDto> internalProjects = callExternalAPItoGetProjects(request, query);

		if (customerId == null) {
			List<TenantProjectListResponseDto> sortedInternalProjects = internalProjects.stream()
				.sorted(Comparator.comparing(TenantProjectListResponseDto::getName))
				.toList();

			return new ResponseEntityDto(false, sortedInternalProjects);
		}
		else {

			List<Project> customerProjectList = getCustomerProjects(customerId);

			List<TenantProjectListResponseDto> filteredProjects = internalProjects.stream()
				.filter(internalProject -> customerProjectList.stream()
					.anyMatch(
							customerProject -> customerProject.getId().getProjectId().equals(internalProject.getId())))
				.sorted(Comparator.comparing(TenantProjectListResponseDto::getName))
				.toList();

			return new ResponseEntityDto(false, filteredProjects);
		}
	}

	@Override
	public ResponseEntityDto getProjectsSummaryByCustomer(HttpServletRequest request,
			ProjectFilterRequestDto projectFilterRequestDto) {

		if (projectFilterRequestDto.getCustomerId() == null) {
			throw new ModuleException(InvoiceMessageConstant.INVOICE_ERROR_CUSTOMER_ID_REQUIRED);
		}

		List<Project> customerProjectList = getCustomerProjects(projectFilterRequestDto.getCustomerId());

		if (customerProjectList.isEmpty()) {
			return new ResponseEntityDto(false, customerProjectList);
		}

		// Define the GraphQL query
		String query = ProjectGraphQLQueries.INTERNAL_PROJECTS_MEMBERS_COUNT;

		List<TenantProjectUserResponseDto> internalProjects = callExternalAPItoGetProjectsWithUser(request, query);

		List<TenantProjectUserResponseDto> filteredCustomerProjects = internalProjects.stream()
			.filter(internalProject -> customerProjectList.stream()
				.anyMatch(customerProject -> customerProject.getId().getProjectId().equals(internalProject.getId())))
			.filter(internalProject -> projectFilterRequestDto.getSearchKeyword() == null || internalProject.getName()
				.toLowerCase()
				.contains(projectFilterRequestDto.getSearchKeyword().toLowerCase()))
			.peek(filProj -> filProj.setKey(filProj.getKey()))
			.toList();

		List<TenantProjectUserResponseDto> sortedInternalProjects = new ArrayList<>();

		if (projectFilterRequestDto.getSortOrder() == Sort.Direction.ASC) {
			sortedInternalProjects = filteredCustomerProjects.stream()
				.sorted(Comparator.comparing(TenantProjectUserResponseDto::getName))
				.toList();
		}
		else {
			sortedInternalProjects = filteredCustomerProjects.stream()
				.sorted(Comparator.comparing(TenantProjectUserResponseDto::getName).reversed())
				.toList();
		}

		int page = projectFilterRequestDto.getPage();
		int size = projectFilterRequestDto.getSize();
		int totalItems = sortedInternalProjects.size();
		int totalPages = 1;

		List<ProjectSummaryResponseDto> paginatedProjects = new ArrayList<>();

		// get the count ProjectSummaryResponseDto
		List<ProjectSummaryResponseDto> projectSummaryResponseList = new ArrayList<>();

		sortedInternalProjects.forEach(proj -> {
			ProjectSummaryResponseDto projectSummaryResponseDto = new ProjectSummaryResponseDto();

			projectSummaryResponseDto.setProjectId(proj.getId());
			projectSummaryResponseDto.setProjectKey(proj.getKey());
			projectSummaryResponseDto.setProjectName(proj.getName());
			projectSummaryResponseDto
				.setMemberCount(proj.getProjectUsers() != null ? proj.getProjectUsers().size() : 0);

			List<ProjectAdminResponseDto> adminUserList = findProjectAdminUser(proj.getProjectUsers());

			if (adminUserList != null && !adminUserList.isEmpty()) {

				projectSummaryResponseDto.setAdmins(adminUserList);
			}

			projectSummaryResponseDto.setLastInvoiceDate(invoiceService
				.getCustomerProjectLastInvoiceDate(projectFilterRequestDto.getCustomerId(), proj.getId()));

			projectSummaryResponseList.add(projectSummaryResponseDto);

		});

		if (projectFilterRequestDto.getSize() == -1) {
			paginatedProjects = projectSummaryResponseList;

		}

		else {
			int fromIndex = Math.min(page * size, totalItems);
			int toIndex = Math.min(fromIndex + size, totalItems);
			paginatedProjects = projectSummaryResponseList.subList(fromIndex, toIndex);
			totalPages = (int) Math.ceil((double) totalItems / size);
		}

		PageDto customerProjectPageDto = new PageDto();
		customerProjectPageDto.setItems(paginatedProjects);
		customerProjectPageDto.setCurrentPage(page);
		customerProjectPageDto.setTotalItems((long) totalItems);
		customerProjectPageDto.setTotalPages(totalPages);

		return new ResponseEntityDto(false, customerProjectPageDto);
	}

	@Override
	public ResponseEntityDto getProjectMembers(HttpServletRequest request,
			ProjectMemberFilterDto projectMemberFilterDto) {

		if (projectMemberFilterDto.getCustomerId() == null) {
			throw new ModuleException(InvoiceMessageConstant.INVOICE_ERROR_CUSTOMER_ID_REQUIRED);
		}

		if (projectMemberFilterDto.getProjectId() == null) {
			throw new ModuleException(InvoiceMessageConstant.INVOICE_ERROR_PROJECT_ID_REQUIRED);
		}

		Optional<Project> optionalProject = projectDao.findById_ProjectIdAndId_Customer_Id(
				projectMemberFilterDto.getProjectId(), projectMemberFilterDto.getCustomerId());

		if (optionalProject.isEmpty()) {
			throw new EntityNotFoundException(InvoiceMessageConstant.INVOICE_ERROR_CUSTOMER_PROJECT_NOT_FOUND);
		}

		Project project = optionalProject.get();

		// Define the GraphQL query
		String query = ProjectGraphQLQueries.INTERNAL_PROJECTS_MEMBERS_COUNT;

		List<TenantProjectUserResponseDto> internalProjects = callExternalAPItoGetProjectsWithUser(request, query);

		List<TenantProjectUserResponseDto> filteredCustomerProject = internalProjects.stream()
			.filter(proj -> Objects.equals(proj.getId(), project.getId().getProjectId()))
			.toList();

		List<BillableRate> allBillableRates = billableRateService.createProjectMemberBillableRateData(project,
				filteredCustomerProject.getFirst().getProjectUsers(), projectMemberFilterDto);

		List<ProjectMembersResponseDto> responseDto = projectMapper
			.memberBillableRateListToProjectMembersResponseDto(allBillableRates)
			.stream()
			.sorted(Sort.Direction.ASC == projectMemberFilterDto.getSortOrder()
					? Comparator.comparing(ProjectMembersResponseDto::getName)
					: Comparator.comparing(ProjectMembersResponseDto::getName).reversed())
			.collect(Collectors.toList());

		return new ResponseEntityDto(false, responseDto);

	}

	@Override
	public ResponseEntityDto updateTeamMemberBillableRates(Long customerId, Long projectId,
			List<TeamMemberBillableRateUpdateRequestDto> teamMemberBillableRateUpdateRequestDtos) {

		if (customerId == null) {
			throw new ModuleException(InvoiceMessageConstant.INVOICE_ERROR_CUSTOMER_ID_REQUIRED);
		}
		if (projectId == null) {
			throw new ModuleException(InvoiceMessageConstant.INVOICE_ERROR_PROJECT_ID_REQUIRED);
		}

		Optional<Project> optionalProject = projectDao.findById_ProjectIdAndId_Customer_Id(projectId, customerId);

		if (optionalProject.isEmpty()) {
			throw new EntityNotFoundException(InvoiceMessageConstant.INVOICE_ERROR_CUSTOMER_PROJECT_NOT_FOUND);
		}

		Project project = optionalProject.get();

		List<BillableRate> savedBillableRates = billableRateService.updateTeamMemberBillableRates(project,
				teamMemberBillableRateUpdateRequestDtos);

		List<ProjectMembersResponseDto> responseDtos = projectMapper
			.memberBillableRateListToProjectMembersResponseDto(savedBillableRates);

		return new ResponseEntityDto(false, responseDtos);

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

	private List<TenantProjectListResponseDto> callExternalAPItoGetProjects(HttpServletRequest request, String query) {

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

	private List<Project> getCustomerProjects(Long customerId) {
		Customer customer = customerDao.findById(customerId)
			.orElseThrow(() -> new EntityNotFoundException(InvoiceMessageConstant.INVOICE_ERROR_CUSTOMER_NOT_FOUND));

		return projectDao.findById_Customer_Id(customerId);
	}

	private List<TenantProjectUserResponseDto> callExternalAPItoGetProjectsWithUser(HttpServletRequest request,
			String query) {

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

				List<TenantProjectUserResponseDto> internalProjects = objectMapper.convertValue(
						responseEntityJsonNode.get(InvoiceCommonConstant.DATA)
							.get(InvoiceCommonConstant.INTERNAL_PROJECTS),
						objectMapper.getTypeFactory()
							.constructCollectionType(List.class, TenantProjectUserResponseDto.class));

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

	private List<ProjectAdminResponseDto> findProjectAdminUser(List<ProjectUsersResponseDto> projectUsers) {

		List<ProjectAdminResponseDto> adminList = new ArrayList<>();

		if (projectUsers.isEmpty()) {
			return null;
		}

		for (ProjectUsersResponseDto user : projectUsers) {
			if (user.getRole() == ProjectUserRole.ADMIN) {

				Optional<Employee> optionalEmployee = employeeDao.findById(user.getUserId());

				if (optionalEmployee.isPresent()) {

					Employee employee = optionalEmployee.get();

					ProjectAdminResponseDto projectAdminResponseDto = new ProjectAdminResponseDto();
					projectAdminResponseDto.setAdminName(employee.getFullName());
					projectAdminResponseDto.setAuthPic(employee.getAuthPic());
					adminList.add(projectAdminResponseDto);
				}
			}
		}
		return adminList;

	}

}
