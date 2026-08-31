package com.skapp.community.crmplanner.controller.v2;

import com.jayway.jsonpath.JsonPath;
import com.skapp.TestSkappApplication;
import com.skapp.community.common.service.JwtService;
import com.skapp.community.common.type.Role;
import com.skapp.community.common.util.DateTimeUtils;
import java.time.LocalDateTime;
import com.skapp.community.crmplanner.model.CrmCompany;
import com.skapp.community.crmplanner.model.CrmContact;
import com.skapp.community.crmplanner.model.CrmDeal;
import com.skapp.community.crmplanner.model.CrmDealStage;
import com.skapp.community.crmplanner.model.CrmTask;
import com.skapp.community.crmplanner.model.CrmTaskType;
import com.skapp.community.crmplanner.payload.request.CrmTaskCreateRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmTaskEditRequestDto;
import com.skapp.community.crmplanner.repository.CrmCompanyDao;
import com.skapp.community.crmplanner.repository.CrmContactDao;
import com.skapp.community.crmplanner.repository.CrmDealDao;
import com.skapp.community.crmplanner.repository.CrmDealStageDao;
import com.skapp.community.crmplanner.repository.CrmTaskDao;
import com.skapp.community.crmplanner.repository.CrmTaskTypeDao;
import com.skapp.community.crmplanner.type.CrmDealPriority;
import com.skapp.community.crmplanner.type.CrmDealStageType;
import com.skapp.community.crmplanner.type.CrmIndustryName;
import com.skapp.community.crmplanner.type.CrmTaskPriority;
import com.skapp.community.peopleplanner.repository.EmployeeDao;
import com.skapp.community.peopleplanner.repository.EmployeeRoleDao;
import com.skapp.support.SecurityTestUtils;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.json.JsonMapper;

import static com.skapp.support.TestConstants.RESULTS_0_PATH;
import static com.skapp.support.TestConstants.STATUS_PATH;
import static com.skapp.support.TestConstants.STATUS_SUCCESSFUL;
import static com.skapp.support.TestConstants.STATUS_UNSUCCESSFUL;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = TestSkappApplication.class)
@AutoConfigureMockMvc
@Transactional
@RequiredArgsConstructor
@DisplayName("CRM Task Controller V2 Integration Tests")
class CrmTaskControllerV2IntegrationTest {

	private static final String BASE_PATH = "/v2/crm/task";

	private static final String BY_ID_PATH = BASE_PATH + "/{id}";

	private final MockMvc mvc;

	private final JwtService jwtService;

	private final UserDetailsService userDetailsService;

	private final JsonMapper objectMapper;

	private final CrmCompanyDao crmCompanyDao;

	private final CrmContactDao crmContactDao;

	private final CrmDealDao crmDealDao;

	private final CrmDealStageDao crmDealStageDao;

	private final CrmTaskDao crmTaskDao;

	private final CrmTaskTypeDao crmTaskTypeDao;

	private final EmployeeDao employeeDao;

	private final EmployeeRoleDao employeeRoleDao;

	private String authToken;

	private Long contactId;

	private Long companyId;

	private Long taskTypeId;

	private CrmTaskType taskType;

	private CrmCompany company;

	private CrmContact contact;

	@BeforeEach
	void setup() {
		authToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user1@gmail.com"), 1L);

		company = new CrmCompany();
		company.setName("Task V2 Corp");
		company.setIndustry(CrmIndustryName.TECHNOLOGY_INFORMATION_AND_MEDIA);
		company.setWebsite("https://task-v2.com");
		company.setAddress("9 Task Blvd");
		company = crmCompanyDao.save(company);
		companyId = company.getId();

		contact = new CrmContact();
		contact.setName("Task Test Contact");
		contact.setEmail("task.contact.v2@example.com");
		contact.setOwner(employeeDao.getReferenceById(1L));
		contact.setCompany(company);
		contact = crmContactDao.save(contact);
		contactId = contact.getId();

		taskType = new CrmTaskType();
		taskType.setName("Call");
		taskType.setOrderIndex(1);
		taskType = crmTaskTypeDao.save(taskType);
		taskTypeId = taskType.getId();
	}

	private ResultActions performRequest(MockHttpServletRequestBuilder request, String token) throws Exception {
		return mvc.perform(request.with(SecurityTestUtils.bearerToken(token)));
	}

	private ResultActions performCreateRequest(CrmTaskCreateRequestDto dto) throws Exception {
		return performRequest(post(BASE_PATH).contentType(MediaType.APPLICATION_JSON)
			.content(objectMapper.writeValueAsString(dto))
			.accept(MediaType.APPLICATION_JSON), authToken);
	}

	private ResultActions performPatchRequest(Long id, CrmTaskEditRequestDto dto) throws Exception {
		return performRequest(patch(BY_ID_PATH, id).contentType(MediaType.APPLICATION_JSON)
			.content(objectMapper.writeValueAsString(dto))
			.accept(MediaType.APPLICATION_JSON), authToken);
	}

	private ResultActions performGetTasksRequest() throws Exception {
		return performRequest(get(BASE_PATH).accept(MediaType.APPLICATION_JSON), authToken);
	}

	private ResultActions performGetTasksRequest(String isCompleted) throws Exception {
		return performRequest(get(BASE_PATH).param("isCompleted", isCompleted).accept(MediaType.APPLICATION_JSON),
				authToken);
	}

	private ResultActions performGetByContactRequest(Long targetContactId) throws Exception {
		return performRequest(
				get(BASE_PATH).param("contactId", targetContactId.toString()).accept(MediaType.APPLICATION_JSON),
				authToken);
	}

	private ResultActions performGetRelatedRequest(Long taskId) throws Exception {
		return performRequest(get(BASE_PATH + "/{id}/related", taskId).accept(MediaType.APPLICATION_JSON), authToken);
	}

	private ResultActions performGetUnpagedRequest() throws Exception {
		return performRequest(get(BASE_PATH).param("size", "-1").accept(MediaType.APPLICATION_JSON), authToken);
	}

	private ResultActions performGetByIdRequest(Long id) throws Exception {
		return performRequest(get(BY_ID_PATH, id).accept(MediaType.APPLICATION_JSON), authToken);
	}

	private CrmDeal savedDeal(String name) {
		CrmDealStage stage = new CrmDealStage();
		stage.setName("Task Deal Stage");
		stage.setColor("#000000");
		stage.setOrderIndex(1);
		stage.setStageType(CrmDealStageType.OPEN);
		stage = crmDealStageDao.save(stage);

		CrmDeal deal = new CrmDeal();
		deal.setName(name);
		deal.setPriority(CrmDealPriority.MEDIUM);
		deal.setStage(stage);
		deal.setContact(contact);
		deal.setCompany(company);
		deal.setOwner(employeeDao.getReferenceById(1L));
		deal.setOrderIndex("a0");
		return crmDealDao.save(deal);
	}

	private CrmTaskCreateRequestDto validPayload() {
		CrmTaskCreateRequestDto dto = new CrmTaskCreateRequestDto();
		dto.setName("Follow up call");
		dto.setTypeId(taskTypeId);
		dto.setContactId(contactId);
		dto.setDueAt(DateTimeUtils.getCurrentUtcDateTime().plusDays(7));
		return dto;
	}

	private CrmContact savedContact(String name) {
		CrmContact other = new CrmContact();
		other.setName(name);
		other.setEmail(name.toLowerCase().replace(' ', '.') + ".v2@example.com");
		other.setOwner(employeeDao.getReferenceById(1L));
		other.setCompany(company);
		return crmContactDao.save(other);
	}

	private CrmTask savedTask(String name, boolean isCompleted) {
		return savedTaskWith(name, company, contact, null, isCompleted);
	}

	private CrmTask savedTaskOwnedBy(String name, Long ownerId) {
		CrmTask task = new CrmTask();
		task.setName(name);
		task.setType(taskType);
		task.setPriority(CrmTaskPriority.MEDIUM);
		task.setDueAt(DateTimeUtils.getCurrentUtcDateTime().plusDays(7));
		task.setContact(contact);
		task.setCompany(company);
		task.setOwner(employeeDao.getReferenceById(ownerId));
		task.setIsCompleted(false);
		return crmTaskDao.save(task);
	}

	private CrmTask savedTaskWithDueAt(String name, LocalDateTime dueAt) {
		CrmTask task = new CrmTask();
		task.setName(name);
		task.setType(taskType);
		task.setPriority(CrmTaskPriority.MEDIUM);
		task.setDueAt(dueAt);
		task.setContact(contact);
		task.setCompany(company);
		task.setOwner(employeeDao.getReferenceById(1L));
		task.setIsCompleted(false);
		return crmTaskDao.save(task);
	}

	private CrmTask savedTaskWith(String name, CrmCompany taskCompany, CrmContact taskContact, CrmDeal taskDeal,
			boolean isCompleted) {
		CrmTask task = new CrmTask();
		task.setName(name);
		task.setType(taskType);
		task.setPriority(CrmTaskPriority.MEDIUM);
		task.setDueAt(DateTimeUtils.getCurrentUtcDateTime().plusDays(7));
		task.setContact(taskContact);
		task.setCompany(taskCompany);
		task.setDeal(taskDeal);
		task.setOwner(employeeDao.getReferenceById(1L));
		task.setIsCompleted(isCompleted);
		return crmTaskDao.save(task);
	}

	// --- createTask ---

	@Test
	@DisplayName("Create task with contact and deal - Returns Created with id references only")
	void createTask_WithContactAndDeal_ReturnsIdReferences() throws Exception {
		CrmDeal deal = savedDeal("Task Linked Deal V2");

		CrmTaskCreateRequestDto dto = validPayload();
		dto.setDealId(deal.getId());

		performCreateRequest(dto).andDo(print())
			.andExpect(status().isCreated())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['name']").value("Follow up call"))
			.andExpect(jsonPath(RESULTS_0_PATH + "['priority']").value("MEDIUM"))
			.andExpect(jsonPath(RESULTS_0_PATH + "['typeId']").value(taskTypeId))
			.andExpect(jsonPath(RESULTS_0_PATH + "['ownerId']").value(1))
			.andExpect(jsonPath(RESULTS_0_PATH + "['companyId']").value(companyId))
			.andExpect(jsonPath(RESULTS_0_PATH + "['contactId']").value(contactId))
			.andExpect(jsonPath(RESULTS_0_PATH + "['dealId']").value(deal.getId()))
			.andExpect(jsonPath(RESULTS_0_PATH + "['type']").doesNotExist())
			.andExpect(jsonPath(RESULTS_0_PATH + "['owner']").doesNotExist())
			.andExpect(jsonPath(RESULTS_0_PATH + "['deal']").doesNotExist());
	}

	@Test
	@DisplayName("Create task without CRM role - Returns Forbidden")
	void createTask_WithoutCrmRole_ReturnsForbidden() throws Exception {
		String noRoleToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user2@gmail.com"),
				1L);

		performRequest(post(BASE_PATH).contentType(MediaType.APPLICATION_JSON)
			.content(objectMapper.writeValueAsString(validPayload()))
			.accept(MediaType.APPLICATION_JSON), noRoleToken).andDo(print()).andExpect(status().isForbidden());
	}

	// --- getTasks ---

	@Test
	@DisplayName("Get tasks - Returns a paginated envelope carrying id references only")
	void getTasks_ReturnsPagedIdReferencesOnly() throws Exception {
		CrmTask task = savedTask("Open Task V2", false);

		performGetTasksRequest().andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['items']").isArray())
			.andExpect(jsonPath(RESULTS_0_PATH + "['items'].length()").value(1))
			.andExpect(jsonPath(RESULTS_0_PATH + "['items'][0]['name']").value("Open Task V2"))
			.andExpect(jsonPath(RESULTS_0_PATH + "['items'][0]['typeId']").value(taskTypeId))
			.andExpect(jsonPath(RESULTS_0_PATH + "['items'][0]['ownerId']").value(1))
			.andExpect(jsonPath(RESULTS_0_PATH + "['items'][0]['contactId']").value(contactId))
			.andExpect(jsonPath(RESULTS_0_PATH + "['items'][0]['companyId']").value(companyId))
			.andExpect(jsonPath(RESULTS_0_PATH + "['items'][0]['id']").value(task.getId()))
			.andExpect(jsonPath(RESULTS_0_PATH + "['totalItems']").value(1))
			.andExpect(jsonPath(RESULTS_0_PATH + "['items'][0]['type']").doesNotExist())
			.andExpect(jsonPath(RESULTS_0_PATH + "['items'][0]['owner']").doesNotExist())
			.andExpect(jsonPath(RESULTS_0_PATH + "['items'][0]['contact']").doesNotExist())
			.andExpect(jsonPath(RESULTS_0_PATH + "['items'][0]['company']").doesNotExist())
			.andExpect(jsonPath(RESULTS_0_PATH + "['items'][0]['deal']").doesNotExist());
	}

	@Test
	@DisplayName("Get tasks with a linked deal - Sends the deal id rather than the deal")
	void getTasks_WithLinkedDeal_SendsDealIdOnly() throws Exception {
		CrmDeal deal = savedDeal("Nested Deal V2");
		savedTaskWith("Task With Deal V2", company, contact, deal, false);

		performGetTasksRequest().andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['items'][0]['name']").value("Task With Deal V2"))
			.andExpect(jsonPath(RESULTS_0_PATH + "['items'][0]['dealId']").value(deal.getId()))
			.andExpect(jsonPath(RESULTS_0_PATH + "['items'][0]['deal']").doesNotExist());
	}

	@Test
	@DisplayName("Get tasks with isCompleted true - Returns only completed tasks, paginated")
	void getTasks_IsCompletedTrue_ReturnsOnlyCompleted() throws Exception {
		savedTask("Open Task V2", false);
		savedTask("Completed Task V2", true);

		performGetTasksRequest("true").andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['items']").isArray())
			.andExpect(jsonPath(RESULTS_0_PATH + "['items'].length()").value(1))
			.andExpect(jsonPath(RESULTS_0_PATH + "['items'][0]['name']").value("Completed Task V2"))
			.andExpect(jsonPath(RESULTS_0_PATH + "['totalItems']").value(1));
	}

	@Test
	@DisplayName("Get tasks with isCompleted false - Returns only open tasks")
	void getTasks_IsCompletedFalse_ReturnsOnlyOpen() throws Exception {
		savedTask("Open Task V2", false);
		savedTask("Completed Task V2", true);

		performGetTasksRequest("false").andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(RESULTS_0_PATH + "['items'].length()").value(1))
			.andExpect(jsonPath(RESULTS_0_PATH + "['items'][0]['name']").value("Open Task V2"))
			.andExpect(jsonPath(RESULTS_0_PATH + "['totalItems']").value(1));
	}

	@Test
	@DisplayName("Get tasks with page and size - Returns the requested page slice")
	void getTasks_Paginated_ReturnsRequestedSlice() throws Exception {
		savedTask("Task A", false);
		savedTask("Task B", false);
		savedTask("Task C", false);

		performRequest(get(BASE_PATH).param("page", "0").param("size", "2").accept(MediaType.APPLICATION_JSON),
				authToken)
			.andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(RESULTS_0_PATH + "['items'].length()").value(2))
			.andExpect(jsonPath(RESULTS_0_PATH + "['totalItems']").value(3))
			.andExpect(jsonPath(RESULTS_0_PATH + "['totalPages']").value(2));
	}

	@Test
	@DisplayName("Get tasks sorted by last modified date descending - Returns the most recently modified first")
	void getTasks_SortByLastModifiedDesc_ReturnsMostRecentFirst() throws Exception {
		savedTask("Completed First", true);
		savedTask("Completed Second", true);

		performRequest(get(BASE_PATH).param("isCompleted", "true")
			.param("sortKey", "LAST_MODIFIED_DATE")
			.param("sortOrder", "DESC")
			.accept(MediaType.APPLICATION_JSON), authToken).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(RESULTS_0_PATH + "['items'].length()").value(2))
			.andExpect(jsonPath(RESULTS_0_PATH + "['items'][0]['name']").value("Completed Second"))
			.andExpect(jsonPath(RESULTS_0_PATH + "['items'][1]['name']").value("Completed First"));
	}

	@Test
	@DisplayName("Get tasks without isCompleted - Returns both open and completed tasks")
	void getTasks_NoIsCompleted_ReturnsBoth() throws Exception {
		savedTask("Open Task V2", false);
		savedTask("Completed Task V2", true);

		performGetTasksRequest().andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['totalItems']").value(2));
	}

	@Test
	@DisplayName("Get tasks filtered by contactId - Returns that contact's tasks")
	void getTasks_ByContactId_ReturnsMatchingTasks() throws Exception {
		savedTask("Related Task A", false);
		savedTask("Related Task B", true);

		performGetByContactRequest(contactId).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['items'].length()").value(2))
			.andExpect(jsonPath(RESULTS_0_PATH + "['totalItems']").value(2));
	}

	@Test
	@DisplayName("Get tasks with size -1 - Returns every match in a single page")
	void getTasks_UnpagedSize_ReturnsEveryMatchInOnePage() throws Exception {
		for (int index = 0; index < 12; index++) {
			savedTask("Bulk Task " + index, false);
		}

		performGetUnpagedRequest().andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['items'].length()").value(12))
			.andExpect(jsonPath(RESULTS_0_PATH + "['totalItems']").value(12))
			.andExpect(jsonPath(RESULTS_0_PATH + "['totalPages']").value(1));
	}

	@Test
	@DisplayName("Get tasks filtered by searchKeyword - Returns only tasks matching the keyword")
	void getTasks_BySearchKeyword_ReturnsMatchingTasks() throws Exception {
		savedTask("Alpha Report", false);
		savedTask("Beta Report", false);

		performRequest(get(BASE_PATH).param("searchKeyword", "Alpha").accept(MediaType.APPLICATION_JSON), authToken)
			.andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(RESULTS_0_PATH + "['items'].length()").value(1))
			.andExpect(jsonPath(RESULTS_0_PATH + "['items'][0]['name']").value("Alpha Report"));
	}

	@Test
	@DisplayName("Get tasks filtered by dealId - Returns only tasks linked to that deal")
	void getTasks_ByDealId_ReturnsMatchingTasks() throws Exception {
		CrmDeal deal = savedDeal("Filter Deal V2");
		savedTaskWith("Task On Deal", company, contact, deal, false);
		savedTask("Task Without Deal", false);

		performRequest(get(BASE_PATH).param("dealId", deal.getId().toString()).accept(MediaType.APPLICATION_JSON),
				authToken)
			.andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(RESULTS_0_PATH + "['items'].length()").value(1))
			.andExpect(jsonPath(RESULTS_0_PATH + "['items'][0]['name']").value("Task On Deal"))
			.andExpect(jsonPath(RESULTS_0_PATH + "['items'][0]['dealId']").value(deal.getId()));
	}

	@Test
	@DisplayName("Get tasks filtered by companyId - Returns only tasks linked to that company")
	void getTasks_ByCompanyId_ReturnsMatchingTasks() throws Exception {
		CrmCompany otherCompany = new CrmCompany();
		otherCompany.setName("Other Task Corp");
		otherCompany.setIndustry(CrmIndustry.TECHNOLOGY_INFORMATION_AND_MEDIA);
		otherCompany = crmCompanyDao.save(otherCompany);

		CrmContact otherContact = new CrmContact();
		otherContact.setName("Other Contact");
		otherContact.setEmail("other.contact.v2@example.com");
		otherContact.setOwner(employeeDao.getReferenceById(1L));
		otherContact.setCompany(otherCompany);
		otherContact = crmContactDao.save(otherContact);

		savedTask("Default Company Task", false);
		savedTaskWith("Other Company Task", otherCompany, otherContact, null, false);

		performRequest(
				get(BASE_PATH).param("companyId", otherCompany.getId().toString()).accept(MediaType.APPLICATION_JSON),
				authToken)
			.andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(RESULTS_0_PATH + "['items'].length()").value(1))
			.andExpect(jsonPath(RESULTS_0_PATH + "['items'][0]['name']").value("Other Company Task"))
			.andExpect(jsonPath(RESULTS_0_PATH + "['items'][0]['companyId']").value(otherCompany.getId()));
	}

	@Test
	@DisplayName("Get tasks sorted by due date descending - Returns the latest due date first")
	void getTasks_SortByDueDateDesc_ReturnsLatestDueFirst() throws Exception {
		savedTaskWithDueAt("Due Soon", DateTimeUtils.getCurrentUtcDateTime().plusDays(1));
		savedTaskWithDueAt("Due Later", DateTimeUtils.getCurrentUtcDateTime().plusDays(30));

		performRequest(
				get(BASE_PATH).param("sortKey", "DUE_AT").param("sortOrder", "DESC").accept(MediaType.APPLICATION_JSON),
				authToken)
			.andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(RESULTS_0_PATH + "['items'].length()").value(2))
			.andExpect(jsonPath(RESULTS_0_PATH + "['items'][0]['name']").value("Due Later"))
			.andExpect(jsonPath(RESULTS_0_PATH + "['items'][1]['name']").value("Due Soon"));
	}

	@Test
	@DisplayName("Get tasks sorted by last modified date ascending - Returns the earliest modified first")
	void getTasks_SortByLastModifiedAsc_ReturnsEarliestFirst() throws Exception {
		savedTask("Modified First", true);
		savedTask("Modified Second", true);

		performRequest(get(BASE_PATH).param("isCompleted", "true")
			.param("sortKey", "LAST_MODIFIED_DATE")
			.param("sortOrder", "ASC")
			.accept(MediaType.APPLICATION_JSON), authToken).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(RESULTS_0_PATH + "['items'].length()").value(2))
			.andExpect(jsonPath(RESULTS_0_PATH + "['items'][0]['name']").value("Modified First"))
			.andExpect(jsonPath(RESULTS_0_PATH + "['items'][1]['name']").value("Modified Second"));
	}

	@Test
	@DisplayName("Get tasks with size 0 - Returns every match unpaged rather than erroring")
	void getTasks_SizeZero_ReturnsEveryMatch() throws Exception {
		savedTask("Zero Size A", false);
		savedTask("Zero Size B", false);
		savedTask("Zero Size C", false);

		performRequest(get(BASE_PATH).param("size", "0").accept(MediaType.APPLICATION_JSON), authToken).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['items'].length()").value(3))
			.andExpect(jsonPath(RESULTS_0_PATH + "['totalItems']").value(3))
			.andExpect(jsonPath(RESULTS_0_PATH + "['totalPages']").value(1));
	}

	@Test
	@DisplayName("Get tasks as Sales Representative - Returns only the caller's own tasks")
	void getTasks_AsSalesRep_ReturnsOnlyOwnTasks() throws Exception {
		employeeDao.findById(2L).orElseThrow().getEmployeeRole().setCrmRole(Role.CRM_SALES_REPRESENTATIVE);
		employeeRoleDao.flush();

		savedTask("Admin Owned Task", false);
		savedTaskOwnedBy("Rep Owned Task", 2L);

		authToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user2@gmail.com"), 1L);

		performGetTasksRequest().andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['items'].length()").value(1))
			.andExpect(jsonPath(RESULTS_0_PATH + "['items'][0]['name']").value("Rep Owned Task"))
			.andExpect(jsonPath(RESULTS_0_PATH + "['items'][0]['ownerId']").value(2));
	}

	// --- getRelatedTasks ---

	@Test
	@DisplayName("Get related tasks for a contact-only source - Returns tasks sharing the contact, excluding the source")
	void getRelatedTasks_ContactOnlySource_ReturnsMatchesExcludingSource() throws Exception {
		CrmTask source = savedTask("Source Task", false);
		savedTask("Shares The Contact", false);
		savedTaskWith("Unrelated Task", null, savedContact("Other Related Contact"), null, false);

		performGetRelatedRequest(source.getId()).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['items'].length()").value(1))
			.andExpect(jsonPath(RESULTS_0_PATH + "['items'][0]['name']").value("Shares The Contact"))
			.andExpect(jsonPath(RESULTS_0_PATH + "['items'][0]['contactId']").value(contactId))
			.andExpect(jsonPath(RESULTS_0_PATH + "['items'][0]['contact']").doesNotExist())
			.andExpect(jsonPath(RESULTS_0_PATH + "['totalItems']").value(1));
	}

	@Test
	@DisplayName("Get related tasks for a source with both links - Requires the contact and the deal to match")
	void getRelatedTasks_ContactAndDealSource_RequiresBothToMatch() throws Exception {
		CrmDeal deal = savedDeal("Both Links Deal");
		CrmTask source = savedTaskWith("Source With Contact And Deal", company, contact, deal, false);
		savedTaskWith("Shares Both", company, contact, deal, false);
		savedTaskWith("Shares The Contact Only", company, contact, null, false);
		savedTaskWith("Shares The Deal Only", company, savedContact("Deal Mate Contact"), deal, false);

		performGetRelatedRequest(source.getId()).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['items'].length()").value(1))
			.andExpect(jsonPath(RESULTS_0_PATH + "['items'][0]['name']").value("Shares Both"))
			.andExpect(jsonPath(RESULTS_0_PATH + "['items'][0]['contactId']").value(contactId))
			.andExpect(jsonPath(RESULTS_0_PATH + "['items'][0]['dealId']").value(deal.getId()))
			.andExpect(jsonPath(RESULTS_0_PATH + "['totalItems']").value(1));
	}

	@Test
	@DisplayName("Get related tasks for a source with no contact or deal - Returns an empty page, not every task")
	void getRelatedTasks_SourceWithoutLinks_ReturnsEmptyPage() throws Exception {
		CrmTask source = savedTaskWith("Source Without Links", company, null, null, false);
		savedTask("Some Other Task", false);
		savedTask("Another Other Task", true);

		performGetRelatedRequest(source.getId()).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['items'].length()").value(0))
			.andExpect(jsonPath(RESULTS_0_PATH + "['totalItems']").value(0));
	}

	@Test
	@DisplayName("Get related tasks - A shared company alone does not make two tasks related")
	void getRelatedTasks_SharesCompanyOnly_ReturnsNoMatches() throws Exception {
		CrmTask source = savedTask("Source Task", false);
		savedTaskWith("Same Company Different Contact", company, savedContact("Company Mate Contact"), null, false);

		performGetRelatedRequest(source.getId()).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['items'].length()").value(0))
			.andExpect(jsonPath(RESULTS_0_PATH + "['totalItems']").value(0));
	}

	@Test
	@DisplayName("Get related tasks for a deal-only source - Matches tasks linked to the same deal")
	void getRelatedTasks_DealOnlySource_ReturnsMatches() throws Exception {
		CrmDeal deal = savedDeal("Shared Related Deal");
		CrmTask source = savedTaskWith("Source With Deal", null, null, deal, false);
		savedTaskWith("Another Task Same Deal", null, null, deal, false);
		savedTask("Task Without The Deal", false);

		performGetRelatedRequest(source.getId()).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(RESULTS_0_PATH + "['items'].length()").value(1))
			.andExpect(jsonPath(RESULTS_0_PATH + "['items'][0]['name']").value("Another Task Same Deal"))
			.andExpect(jsonPath(RESULTS_0_PATH + "['items'][0]['dealId']").value(deal.getId()))
			.andExpect(jsonPath(RESULTS_0_PATH + "['totalItems']").value(1));
	}

	@Test
	@DisplayName("Get related tasks - Includes both open and completed related tasks")
	void getRelatedTasks_IncludesOpenAndCompleted() throws Exception {
		CrmTask source = savedTask("Source Task", false);
		savedTask("Open Related", false);
		savedTask("Completed Related", true);

		performGetRelatedRequest(source.getId()).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(RESULTS_0_PATH + "['items'].length()").value(2))
			.andExpect(jsonPath(RESULTS_0_PATH + "['totalItems']").value(2));
	}

	@Test
	@DisplayName("Get related tasks for a task that does not exist - Returns Bad Request")
	void getRelatedTasks_TaskNotFound_ReturnsBadRequest() throws Exception {
		performGetRelatedRequest(999999L).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL));
	}

	// --- getTaskById ---

	@Test
	@DisplayName("Get task by ID - Returns id references for type, owner, company and contact")
	void getTaskById_HappyPath_ReturnsIdReferences() throws Exception {
		CrmTask task = savedTask("Detail Task V2", false);

		performGetByIdRequest(task.getId()).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['id']").value(task.getId()))
			.andExpect(jsonPath(RESULTS_0_PATH + "['name']").value("Detail Task V2"))
			.andExpect(jsonPath(RESULTS_0_PATH + "['typeId']").value(taskTypeId))
			.andExpect(jsonPath(RESULTS_0_PATH + "['ownerId']").value(1))
			.andExpect(jsonPath(RESULTS_0_PATH + "['companyId']").value(companyId))
			.andExpect(jsonPath(RESULTS_0_PATH + "['contactId']").value(contactId))
			.andExpect(jsonPath(RESULTS_0_PATH + "['type']").doesNotExist())
			.andExpect(jsonPath(RESULTS_0_PATH + "['contact']").doesNotExist());
	}

	@Test
	@DisplayName("Get task by ID that does not exist - Returns Bad Request")
	void getTaskById_NotFound_ReturnsBadRequest() throws Exception {
		performGetByIdRequest(999999L).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL));
	}

	// --- editTask ---

	@Test
	@DisplayName("Edit task name - Returns OK with updated task")
	void editTask_UpdateName_ReturnsOk() throws Exception {
		CrmTask task = savedTask("Original Task V2", false);

		CrmTaskEditRequestDto dto = new CrmTaskEditRequestDto();
		dto.setName("Updated Task V2");

		MvcResult result = performPatchRequest(task.getId(), dto).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['name']").value("Updated Task V2"))
			.andReturn();

		Long updatedId = ((Number) JsonPath.read(result.getResponse().getContentAsString(), "$.results[0].id"))
			.longValue();
		CrmTask updated = crmTaskDao.findById(updatedId).orElseThrow();
		assertEquals("Updated Task V2", updated.getName());
	}

	@Test
	@DisplayName("Get related tasks as Sales Representative for another owner's source task - Returns view-denied error")
	void getRelatedTasks_SalesRepViewingOthersTask_ReturnsBadRequest() throws Exception {
		employeeDao.findById(2L).orElseThrow().getEmployeeRole().setCrmRole(Role.CRM_SALES_REPRESENTATIVE);
		employeeRoleDao.flush();

		CrmTask task = savedTask("Admin Owned Source Task V2", false);

		authToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user2@gmail.com"), 1L);

		performGetRelatedRequest(task.getId()).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL));
	}

	@Test
	@DisplayName("Get task by ID as Sales Representative viewing another owner's task - Returns view-denied error")
	void getTaskById_SalesRepViewingOthersTask_ReturnsBadRequest() throws Exception {
		employeeDao.findById(2L).orElseThrow().getEmployeeRole().setCrmRole(Role.CRM_SALES_REPRESENTATIVE);
		employeeRoleDao.flush();

		CrmTask task = savedTask("Admin Owned Task V2", false);

		authToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user2@gmail.com"), 1L);

		performGetByIdRequest(task.getId()).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL));
	}

}
