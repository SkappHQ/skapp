package com.skapp.enterprise.invoice.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skapp.community.common.exception.EntityNotFoundException;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.payload.response.PageDto;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.repository.EmployeeDao;
import com.skapp.community.timeplanner.payload.response.TimeConfigResponseDto;
import com.skapp.community.timeplanner.service.TimeService;
import com.skapp.enterprise.common.constant.EpAuthConstants;
import com.skapp.enterprise.invoice.constant.InvoiceCommonConstant;
import com.skapp.enterprise.invoice.constant.InvoiceMessageConstant;
import com.skapp.enterprise.invoice.constant.graphql.ProjectGraphQLQueries;
import com.skapp.enterprise.invoice.constant.graphql.ProjectGraphQLVariables;
import com.skapp.enterprise.invoice.mapper.ProjectMapper;
import com.skapp.enterprise.invoice.model.BillableRate;
import com.skapp.enterprise.invoice.model.Customer;
import com.skapp.enterprise.invoice.model.Project;
import com.skapp.enterprise.invoice.model.ProjectKey;
import com.skapp.enterprise.invoice.payload.request.ImportTimeLogFilterDto;
import com.skapp.enterprise.invoice.payload.request.ProjectFilterRequestDto;
import com.skapp.enterprise.invoice.payload.request.ProjectMemberFilterDto;
import com.skapp.enterprise.invoice.payload.request.invoice.TeamMemberBillableRateUpdateRequestDto;
import com.skapp.enterprise.invoice.payload.response.ImportTimeLogsResponseDto;
import com.skapp.enterprise.invoice.payload.response.ProjectAdminResponseDto;
import com.skapp.enterprise.invoice.payload.response.ProjectMembersResponseDto;
import com.skapp.enterprise.invoice.payload.response.ProjectSummaryResponseDto;
import com.skapp.enterprise.invoice.payload.response.ProjectUsersResponseDto;
import com.skapp.enterprise.invoice.payload.response.project.TenantProjectListResponseDto;
import com.skapp.enterprise.invoice.payload.response.project.TenantProjectResourceWiseTimeLogDto;
import com.skapp.enterprise.invoice.payload.response.project.TenantProjectUserResponseDto;
import com.skapp.enterprise.invoice.payload.response.project.TenantProjectTaskWiseTimeLogDto;
import com.skapp.enterprise.invoice.payload.response.project.TaskWorkLogDto;
import com.skapp.enterprise.invoice.repository.CustomerDao;
import com.skapp.enterprise.invoice.repository.ProjectDao;
import com.skapp.enterprise.invoice.service.BillableRateService;
import com.skapp.enterprise.invoice.service.InvoiceService;
import com.skapp.enterprise.invoice.service.ProjectService;
import com.skapp.enterprise.invoice.type.BillableFrequency;
import com.skapp.enterprise.invoice.type.ImportTimeLogGroupKey;
import com.skapp.enterprise.invoice.type.ProjectUserRole;
import com.skapp.enterprise.people.service.EpUserService;
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
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProjectServiceImpl implements ProjectService {

	@Value("${pm.service.url}")
	private String pmServiceUrl;

	@Value("${pm.internal.api.key}")
	private String internalApiKey;

	private final RestTemplate restTemplate;

	private final ProjectDao projectDao;

	private final CustomerDao customerDao;

	private final InvoiceService invoiceService;

	private final BillableRateService billableRateService;

	private final ProjectMapper projectMapper;

	private final EmployeeDao employeeDao;

	private final EpUserService epUserService;

	private final TimeService timeService;

	@Override
	public ResponseEntityDto getAllProjects(HttpServletRequest request) {

		List<TenantProjectListResponseDto> internalProjects = callExternalGraphQLApi(request,
				ProjectGraphQLQueries.INTERNAL_PROJECTS_BASE_DATA, null, InvoiceCommonConstant.INTERNAL_PROJECTS,
				TenantProjectListResponseDto.class, InvoiceMessageConstant.INVOICE_ERROR_FETCHING_PROJECTS,
				InvoiceMessageConstant.INVOICE_ERROR_FETCHING_PROJECTS_FROM_SOURCE);

		List<Project> assignedProjects = projectDao.findAll();
		Set<Long> assignedProjectIds = assignedProjects.stream()
			.map(Project::getId)
			.filter(Objects::nonNull)
			.map(ProjectKey::getProjectId)
			.filter(Objects::nonNull)
			.collect(Collectors.toSet());

		List<TenantProjectListResponseDto> unassignedProjects = internalProjects.stream()
			.filter(proj -> !assignedProjectIds.contains(proj.getId()))
			.sorted(Comparator.comparing(TenantProjectListResponseDto::getName))
			.toList();

		return new ResponseEntityDto(false, unassignedProjects);
	}

	@Override
	public ResponseEntityDto getProjectsByCustomer(HttpServletRequest request, Long customerId) {

		List<TenantProjectListResponseDto> internalProjects = callExternalGraphQLApi(request,
				ProjectGraphQLQueries.INTERNAL_PROJECTS_BASE_DATA, null, InvoiceCommonConstant.INTERNAL_PROJECTS,
				TenantProjectListResponseDto.class, InvoiceMessageConstant.INVOICE_ERROR_FETCHING_PROJECTS,
				InvoiceMessageConstant.INVOICE_ERROR_FETCHING_PROJECTS_FROM_SOURCE);

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

		List<TenantProjectUserResponseDto> internalProjects = callExternalGraphQLApi(request,
				ProjectGraphQLQueries.INTERNAL_PROJECTS_MEMBERS_COUNT, null, InvoiceCommonConstant.INTERNAL_PROJECTS,
				TenantProjectUserResponseDto.class, InvoiceMessageConstant.INVOICE_ERROR_FETCHING_PROJECTS,
				InvoiceMessageConstant.INVOICE_ERROR_FETCHING_PROJECTS_FROM_SOURCE);

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

		List<TenantProjectUserResponseDto> internalProjects = callExternalGraphQLApi(request,
				ProjectGraphQLQueries.INTERNAL_PROJECTS_MEMBERS_COUNT, null, InvoiceCommonConstant.INTERNAL_PROJECTS,
				TenantProjectUserResponseDto.class, InvoiceMessageConstant.INVOICE_ERROR_FETCHING_PROJECTS,
				InvoiceMessageConstant.INVOICE_ERROR_FETCHING_PROJECTS_FROM_SOURCE);

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

	@Override
	public ResponseEntityDto importTimeLogs(HttpServletRequest request, ImportTimeLogFilterDto importTimeLogFilterDto) {

		List<ImportTimeLogsResponseDto> importTimeLogsResponseDtos = new ArrayList<>();

		ResponseEntityDto config = timeService.getDefaultTimeConfigurations();

		TimeConfigResponseDto timeConfigResponseDto = (TimeConfigResponseDto) config.getResults().get(0);

		Float defaultDailyHours = timeConfigResponseDto.getTotalHours();
		int workingDays = config.getResults().size();

		if (importTimeLogFilterDto.getGroupBy() == ImportTimeLogGroupKey.RESOURCE) {

			importTimeLogsResponseDtos = getResourceWiseTimeLogs(request, importTimeLogFilterDto, defaultDailyHours,
					workingDays);

		}
		else {
			importTimeLogsResponseDtos = getTaskWiseTimeLogs(request, importTimeLogFilterDto, defaultDailyHours,
					workingDays);
		}

		return new ResponseEntityDto(false, importTimeLogsResponseDtos);
	}

	private List<ImportTimeLogsResponseDto> getTaskWiseTimeLogs(HttpServletRequest request,
			ImportTimeLogFilterDto importTimeLogFilterDto, Float defaultDailyHours, int workingDays) {

		Map<String, Object> input = new HashMap<>();
		input.put(ProjectGraphQLVariables.TIME_LOG_VARIABLE_PROJECT, importTimeLogFilterDto.getProjectId());
		input.put(ProjectGraphQLVariables.TIME_LOG_VARIABLE_START_DATE,
				String.valueOf(importTimeLogFilterDto.getStartDate()));
		input.put(ProjectGraphQLVariables.TIME_LOG_VARIABLE_END_DATE,
				String.valueOf(importTimeLogFilterDto.getEndDate()));

		Map<String, Object> variables = new HashMap<>();
		variables.put(ProjectGraphQLVariables.INPUT, input);

		List<TenantProjectTaskWiseTimeLogDto> taskWiseTimeLogs = callExternalGraphQLApi(request,
				ProjectGraphQLQueries.INTERNAL_TIME_LOGS_BY_PROJECT_TASK, variables,
				InvoiceCommonConstant.INTERNAL_TASK_TIME_LOGS, TenantProjectTaskWiseTimeLogDto.class,
				InvoiceMessageConstant.INVOICE_ERROR_FETCHING_TIMELOGS,
				InvoiceMessageConstant.INVOICE_ERROR_FETCHING_TIMELOGS_FROM_SOURCE);

		List<TaskWorkLogDto> allTaskWorkLogs = taskWiseTimeLogs.stream()
			.flatMap(taskLog -> taskLog.getItemInfoWorkLog().stream())
			.toList();

		List<Long> employeeIds = allTaskWorkLogs.stream().map(TaskWorkLogDto::getUserId).distinct().toList();

		List<Employee> users = epUserService.getUsersByIds(employeeIds);
		List<BillableRate> memberBillableRates = billableRateService
			.getBillableRatesByProjectId(importTimeLogFilterDto.getProjectId());

		Map<Long, Employee> userMap = users.stream().collect(Collectors.toMap(Employee::getEmployeeId, user -> user));
		Map<Long, BillableRate> rateMap = memberBillableRates.stream()
			.collect(Collectors.toMap(rate -> rate.getEmployee().getEmployeeId(), rate -> rate));

		List<ImportTimeLogsResponseDto> importTimeLogsResponseDtos = taskWiseTimeLogs.stream().map(taskLog -> {
			ImportTimeLogsResponseDto dto = new ImportTimeLogsResponseDto();
			dto.setDescription(taskLog.getTitle());

			double totalTime = 0.0;
			double totalAmount = 0.0;

			Map<Long, Double> userTotalTimeMap = taskLog.getItemInfoWorkLog()
				.stream()
				.collect(Collectors.groupingBy(TaskWorkLogDto::getUserId,
						Collectors.summingDouble(TaskWorkLogDto::getTime)));

			for (Map.Entry<Long, Double> entry : userTotalTimeMap.entrySet()) {
				Long userId = entry.getKey();
				Double time = entry.getValue();

				Employee user = userMap.get(userId);
				BillableRate rate = rateMap.get(userId);

				if (user != null && rate != null) {
					double quantity = convertTimeToQuantity(time, rate.getBillableFrequency(), defaultDailyHours,
							workingDays, importTimeLogFilterDto.getRoundOff());
					totalTime += time;
					totalAmount += calculateAmount(quantity, rate.getBillableRate());
				}
			}

			dto.setQuantity(convertTimeToQuantity(totalTime, BillableFrequency.PER_HOUR, defaultDailyHours, workingDays,
					importTimeLogFilterDto.getRoundOff()));
			dto.setAmount(totalAmount);

			return dto;
		}).toList();

		return importTimeLogsResponseDtos;

	}

	private List<ImportTimeLogsResponseDto> getResourceWiseTimeLogs(HttpServletRequest request,
			ImportTimeLogFilterDto importTimeLogFilterDto, Float defaultDailyHours, int workingDays) {

		Map<String, Object> input = new HashMap<>();
		input.put(ProjectGraphQLVariables.TIME_LOG_VARIABLE_PROJECT, importTimeLogFilterDto.getProjectId());
		input.put(ProjectGraphQLVariables.TIME_LOG_VARIABLE_START_DATE,
				String.valueOf(importTimeLogFilterDto.getStartDate()));
		input.put(ProjectGraphQLVariables.TIME_LOG_VARIABLE_END_DATE,
				String.valueOf(importTimeLogFilterDto.getEndDate()));

		Map<String, Object> variables = new HashMap<>();
		variables.put(ProjectGraphQLVariables.INPUT, input);

		List<TenantProjectResourceWiseTimeLogDto> resourceWiseTimeLogs = callExternalGraphQLApi(request,
				ProjectGraphQLQueries.INTERNAL_TIME_LOGS_BY_PROJECT_RESOURCE, variables,
				InvoiceCommonConstant.INTERNAL_RESOURCE_TIME_LOGS, TenantProjectResourceWiseTimeLogDto.class,
				InvoiceMessageConstant.INVOICE_ERROR_FETCHING_TIMELOGS,
				InvoiceMessageConstant.INVOICE_ERROR_FETCHING_TIMELOGS_FROM_SOURCE);

		List<Long> employeeIds = resourceWiseTimeLogs.stream()
			.map(TenantProjectResourceWiseTimeLogDto::getUserId)
			.collect(Collectors.toList());

		// get employee details from employeeId
		List<Employee> users = epUserService.getUsersByIds(employeeIds);

		// get employee rates from BillableRate table
		List<BillableRate> memberBillableRates = billableRateService
			.getBillableRatesByProjectId(importTimeLogFilterDto.getProjectId());

		List<ImportTimeLogsResponseDto> importTimeLogsResponseDtos = new ArrayList<>();

		Map<Long, Employee> userMap = users.stream().collect(Collectors.toMap(Employee::getEmployeeId, user -> user));
		Map<Long, BillableRate> rateMap = memberBillableRates.stream()
			.collect(Collectors.toMap(rate -> rate.getEmployee().getEmployeeId(), rate -> rate));

		resourceWiseTimeLogs.forEach(timeLog -> {
			Employee filteredUser = userMap.get(timeLog.getUserId());
			BillableRate filteredRate = rateMap.get(timeLog.getUserId());

			if (filteredUser != null && filteredRate != null) {
				ImportTimeLogsResponseDto importTimeLogsResponseDto = new ImportTimeLogsResponseDto();
				importTimeLogsResponseDto.setDescription(filteredUser.getFullName());
				importTimeLogsResponseDto.setUnit(filteredRate.getBillableFrequency());
				importTimeLogsResponseDto
					.setQuantity(convertTimeToQuantity(timeLog.getBillableTime(), importTimeLogsResponseDto.getUnit(),
							defaultDailyHours, workingDays, importTimeLogFilterDto.getRoundOff()));
				importTimeLogsResponseDto.setRate(filteredRate.getBillableRate());
				importTimeLogsResponseDto.setAmount(
						calculateAmount(importTimeLogsResponseDto.getQuantity(), importTimeLogsResponseDto.getRate()));

				importTimeLogsResponseDtos.add(importTimeLogsResponseDto);
			}
		});

		return importTimeLogsResponseDtos;
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

	private List<Project> getCustomerProjects(Long customerId) {
		Customer customer = customerDao.findById(customerId)
			.orElseThrow(() -> new EntityNotFoundException(InvoiceMessageConstant.INVOICE_ERROR_CUSTOMER_NOT_FOUND));

		return projectDao.findById_Customer_Id(customerId);
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

	private Double calculateAmount(Double quantity, Double rate) {

		return Math.round(quantity * rate * InvoiceCommonConstant.HUNDRED) / InvoiceCommonConstant.HUNDRED;

	}

	private Double convertTimeToQuantity(Double quantity, BillableFrequency billableFrequency, Float defaultDailyHours,
			int workingDays, Boolean roundOff) {

		if (roundOff != null && roundOff) {
			quantity = (double) roundMinutesToNearest15(quantity.intValue());
		}

		Double defaultDailyHoursInMinutes = defaultDailyHours * InvoiceCommonConstant.MINUTES_PER_HOUR;

		switch (billableFrequency) {
			case PER_HOUR:
				return quantity / InvoiceCommonConstant.MINUTES_PER_HOUR;
			case PER_DAY:
				return quantity / (defaultDailyHoursInMinutes);
			case PER_WEEK:
				return quantity / (workingDays * defaultDailyHoursInMinutes);
			case PER_MONTH:
				return quantity / (InvoiceCommonConstant.WORKING_DAYS_PER_MONTH * defaultDailyHoursInMinutes);
			default:
				return 0.0;
		}

	}

	private int roundMinutesToNearest15(int minutes) {

		long rounded = Math.round(minutes / 15.0f) * 15L;
		if (rounded > Integer.MAX_VALUE) {
			return Integer.MAX_VALUE;
		}
		else if (rounded < Integer.MIN_VALUE) {
			return Integer.MIN_VALUE;
		}
		return (int) rounded;
	}

	private <T> List<T> callExternalGraphQLApi(HttpServletRequest request, String query, Map<String, Object> variables,
			String dataKey, Class<T> dtoClass, InvoiceMessageConstant errorFetchingMessage,
			InvoiceMessageConstant errorFetchingFromSourceMessage) {

		Map<String, Object> graphQLRequest = new HashMap<>();

		graphQLRequest.put(ProjectGraphQLVariables.QUERY, query);

		if (variables != null) {
			graphQLRequest.put(ProjectGraphQLVariables.VARIABLES, variables);
		}

		HttpHeaders headers = createHeaders(request);
		HttpEntity<Map<String, Object>> entity = new HttpEntity<>(graphQLRequest, headers);

		try {
			ResponseEntity<String> responseEntity = restTemplate.postForEntity(pmServiceUrl, entity, String.class);
			ObjectMapper objectMapper = new ObjectMapper();
			JsonNode responseEntityJsonNode = objectMapper.readTree(responseEntity.getBody());

			if (responseEntityJsonNode.has(InvoiceCommonConstant.ERRORS)
					&& !responseEntityJsonNode.get(InvoiceCommonConstant.ERRORS).isEmpty()) {
				throw new ModuleException(errorFetchingMessage);
			}

			if (responseEntityJsonNode.has(InvoiceCommonConstant.DATA)
					&& responseEntityJsonNode.get(InvoiceCommonConstant.DATA).has(dataKey)) {
				return objectMapper.convertValue(responseEntityJsonNode.get(InvoiceCommonConstant.DATA).get(dataKey),
						objectMapper.getTypeFactory().constructCollectionType(List.class, dtoClass));
			}
		}
		catch (RestClientException e) {
			log.error("Error making HTTP request to {}: {}", pmServiceUrl, e.getMessage());
			throw new ModuleException(errorFetchingFromSourceMessage);
		}
		catch (Exception e) {
			log.error("Error parsing JSON response: ", e);
		}
		return new ArrayList<>();
	}

}
