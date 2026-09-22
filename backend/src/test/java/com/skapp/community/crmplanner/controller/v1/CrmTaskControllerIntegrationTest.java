package com.skapp.community.crmplanner.controller.v1;

import com.jayway.jsonpath.JsonPath;
import com.skapp.TestSkappApplication;
import com.skapp.community.common.service.JwtService;
import com.skapp.community.common.type.Role;
import com.skapp.community.common.util.DateTimeUtils;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.community.crmplanner.constant.CrmMessageConstant;
import org.openapitools.jackson.nullable.JsonNullable;
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
import com.skapp.community.crmplanner.type.CrmIndustry;
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

import static com.skapp.support.TestConstants.MESSAGE_PATH;
import static com.skapp.support.TestConstants.RESULTS_0_PATH;
import static com.skapp.support.TestConstants.STATUS_PATH;
import static com.skapp.support.TestConstants.STATUS_SUCCESSFUL;
import static com.skapp.support.TestConstants.STATUS_UNSUCCESSFUL;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
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
@DisplayName("CRM Task Controller Integration Tests")
class CrmTaskControllerIntegrationTest {

	private static final String BASE_PATH = "/v1/crm/task";

	private static final String BY_ID_PATH = BASE_PATH + "/{id}";

	private final MockMvc mvc;

	private final JwtService jwtService;

	private final UserDetailsService userDetailsService;

	private final JsonMapper objectMapper;

	private final MessageUtil messageUtil;

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
		company.setIndustry(CrmIndustry.TECHNOLOGY_INFORMATION_AND_MEDIA);
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
		return savedDeal(name, contact);
	}

	private CrmDeal savedDeal(String name, CrmContact dealContact) {
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
		deal.setContact(dealContact);
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
	@DisplayName("Get tasks filtered by contactId - Includes tasks linked only through the contact's deal")
	void getTasks_ByContactId_IncludesDealLinkedTasks() throws Exception {
		savedTask("Directly Linked Task", false);
		savedTaskWith("Deal Linked Task", null, null, savedDeal("Contact Deal"), false);

		performGetByContactRequest(contactId).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['items'].length()").value(2))
			.andExpect(jsonPath(RESULTS_0_PATH + "['totalItems']").value(2))
			.andExpect(jsonPath(RESULTS_0_PATH + "['items'][*]['name']")
				.value(containsInAnyOrder("Directly Linked Task", "Deal Linked Task")));
	}

	@Test
	@DisplayName("Get tasks filtered by contactId - Excludes tasks on another contact's deal")
	void getTasks_ByContactId_ExcludesOtherContactsDealTasks() throws Exception {
		savedTask("Directly Linked Task", false);

		CrmDeal otherDeal = savedDeal("Other Contact Deal", savedContact("Other Deal Contact"));
		savedTaskWith("Other Deal Task", null, null, otherDeal, false);

		performGetByContactRequest(contactId).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['items'].length()").value(1))
			.andExpect(jsonPath(RESULTS_0_PATH + "['totalItems']").value(1))
			.andExpect(jsonPath(RESULTS_0_PATH + "['items'][0]['name']").value("Directly Linked Task"));
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

	// --- create / edit / delete helpers and tests ---

	private CrmTask savedTask(String name, boolean isDeleted, boolean isCompleted, Long linkedContactId,
			CrmDeal linkedDeal) {
		return savedTask(name, isDeleted, isCompleted, linkedContactId, linkedDeal, null);
	}

	private CrmTask savedTask(String name, boolean isDeleted, boolean isCompleted, Long linkedContactId,
			CrmDeal linkedDeal, CrmCompany linkedCompany) {
		CrmTask task = new CrmTask();
		task.setName(name);
		task.setType(taskType);
		task.setPriority(CrmTaskPriority.MEDIUM);
		task.setOwner(employeeDao.getReferenceById(1L));
		task.setIsDeleted(isDeleted);
		task.setIsCompleted(isCompleted);
		if (linkedContactId != null) {
			task.setContact(crmContactDao.getReferenceById(linkedContactId));
		}
		if (linkedDeal != null) {
			task.setDeal(linkedDeal);
		}
		if (linkedCompany != null) {
			task.setCompany(linkedCompany);
		}
		return crmTaskDao.save(task);
	}

	@Test
	@DisplayName("Create task with valid payload - Returns Created with MEDIUM priority and current user as owner")
	void createTask_HappyPath_ReturnsCreated() throws Exception {
		MvcResult result = performCreateRequest(validPayload()).andDo(print())
			.andExpect(status().isCreated())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['id']").isNumber())
			.andExpect(jsonPath(RESULTS_0_PATH + "['name']").value("Follow up call"))
			.andExpect(jsonPath(RESULTS_0_PATH + "['priority']").value("MEDIUM"))
			.andExpect(jsonPath(RESULTS_0_PATH + "['typeId']").value(taskTypeId))
			.andExpect(jsonPath(RESULTS_0_PATH + "['contactId']").value(contactId))
			.andReturn();

		Long savedId = ((Number) JsonPath.read(result.getResponse().getContentAsString(), "$.results[0].id"))
			.longValue();

		CrmTask saved = crmTaskDao.findById(savedId).orElseThrow();
		assertEquals(CrmTaskPriority.MEDIUM, saved.getPriority());
		assertNotNull(saved.getOwner());
		assertEquals(contactId, saved.getContact().getId());
	}

	@Test
	@DisplayName("Create task with explicit priority, due date and notes - Returns Created and persists them")
	void createTask_WithOptionalFields_ReturnsCreated() throws Exception {
		CrmTaskCreateRequestDto dto = validPayload();
		dto.setPriority(CrmTaskPriority.HIGH);
		dto.setDueAt(DateTimeUtils.getCurrentUtcDateTime().plusYears(1));
		dto.setNotes("Discuss renewal terms");

		MvcResult result = performCreateRequest(dto).andDo(print())
			.andExpect(status().isCreated())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['priority']").value("HIGH"))
			.andReturn();

		Long savedId = ((Number) JsonPath.read(result.getResponse().getContentAsString(), "$.results[0].id"))
			.longValue();

		CrmTask saved = crmTaskDao.findById(savedId).orElseThrow();
		assertEquals(CrmTaskPriority.HIGH, saved.getPriority());
		assertEquals("Discuss renewal terms", saved.getNotes());
		assertNotNull(saved.getDueAt());
	}

	@Test
	@DisplayName("Create task with missing due date - Returns Bad Request")
	void createTask_MissingDueDate_ReturnsBadRequest() throws Exception {
		CrmTaskCreateRequestDto dto = validPayload();
		dto.setDueAt(null);

		performCreateRequest(dto).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_TASK_DUE_DATE_REQUIRED)));
	}

	@Test
	@DisplayName("Create task with a due date in the past - Returns Created and persists it")
	void createTask_PastDueDate_ReturnsCreated() throws Exception {
		CrmTaskCreateRequestDto dto = validPayload();
		LocalDateTime pastDueAt = DateTimeUtils.getCurrentUtcDateTime().minusDays(1);
		dto.setDueAt(pastDueAt);

		MvcResult result = performCreateRequest(dto).andDo(print())
			.andExpect(status().isCreated())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andReturn();

		Long savedId = ((Number) JsonPath.read(result.getResponse().getContentAsString(), "$.results[0].id"))
			.longValue();

		CrmTask saved = crmTaskDao.findById(savedId).orElseThrow();
		assertEquals(pastDueAt, saved.getDueAt());
	}

	@Test
	@DisplayName("Create task with notes exceeding max length - Returns Bad Request")
	void createTask_NotesTooLong_ReturnsBadRequest() throws Exception {
		CrmTaskCreateRequestDto dto = validPayload();
		dto.setNotes("a".repeat(1001));

		performCreateRequest(dto).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_TASK_NOTES_TOO_LONG)));
	}

	@Test
	@DisplayName("Create task with blank name - Returns Bad Request")
	void createTask_BlankName_ReturnsBadRequest() throws Exception {
		CrmTaskCreateRequestDto dto = validPayload();
		dto.setName("   ");

		performCreateRequest(dto).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_TASK_NAME_REQUIRED)));
	}

	@Test
	@DisplayName("Create task with missing type id - Returns Bad Request")
	void createTask_MissingTypeId_ReturnsBadRequest() throws Exception {
		CrmTaskCreateRequestDto dto = validPayload();
		dto.setTypeId(null);

		performCreateRequest(dto).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_TASK_TYPE_ID_REQUIRED)));
	}

	@Test
	@DisplayName("Create task with name exceeding max length - Returns Bad Request")
	void createTask_NameTooLong_ReturnsBadRequest() throws Exception {
		CrmTaskCreateRequestDto dto = validPayload();
		dto.setName("a".repeat(256));

		performCreateRequest(dto).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_TASK_NAME_TOO_LONG)));
	}

	@Test
	@DisplayName("Create task with name at max length (255) - Returns Created")
	void createTask_NameAtMaxLength_ReturnsCreated() throws Exception {
		String maxLengthName = "a".repeat(255);
		CrmTaskCreateRequestDto dto = validPayload();
		dto.setName(maxLengthName);

		performCreateRequest(dto).andDo(print())
			.andExpect(status().isCreated())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['name']").value(maxLengthName));
	}

	@Test
	@DisplayName("Create task with missing name - Returns Bad Request")
	void createTask_NullName_ReturnsBadRequest() throws Exception {
		CrmTaskCreateRequestDto dto = validPayload();
		dto.setName(null);

		performCreateRequest(dto).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_TASK_NAME_REQUIRED)));
	}

	@Test
	@DisplayName("Create task with non-existent contact id - Returns Bad Request")
	void createTask_NonExistentContact_ReturnsBadRequest() throws Exception {
		CrmTaskCreateRequestDto dto = validPayload();
		dto.setContactId(999999L);

		performCreateRequest(dto).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_CONTACT_NOT_FOUND)));
	}

	@Test
	@DisplayName("Create task for soft-deleted contact - Returns Bad Request")
	void createTask_SoftDeletedContact_ReturnsBadRequest() throws Exception {
		CrmContact deleted = crmContactDao.findById(contactId).orElseThrow();
		deleted.setIsDeleted(true);
		crmContactDao.save(deleted);

		performCreateRequest(validPayload()).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_CONTACT_NOT_FOUND)));
	}

	@Test
	@DisplayName("Create task with non-existent type id - Returns Bad Request")
	void createTask_NonExistentTaskType_ReturnsBadRequest() throws Exception {
		CrmTaskCreateRequestDto dto = validPayload();
		dto.setTypeId(999999L);

		performCreateRequest(dto).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_TASK_TYPE_NOT_FOUND)));
	}

	@Test
	@DisplayName("Create task without CRM sales role - Returns Forbidden")
	void createTask_WithoutCrmRole_ReturnsForbidden() throws Exception {
		authToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user2@gmail.com"), 1L);

		performCreateRequest(validPayload()).andDo(print()).andExpect(status().isForbidden());
	}

	// --- Cross-entity association validation tests ---

	@Test
	@DisplayName("Create task with deal belonging to different contact - Returns Bad Request")
	void createTask_DealContactMismatch_ReturnsBadRequest() throws Exception {
		CrmContact contactA = new CrmContact();
		contactA.setName("Contact A");
		contactA.setEmail("contact.a@example.com");
		contactA.setOwner(employeeDao.getReferenceById(1L));
		contactA = crmContactDao.save(contactA);

		CrmDeal deal = savedDeal("Deal for A", contactA, null);

		CrmTaskCreateRequestDto dto = validPayload();
		dto.setContactId(contactId);
		dto.setDealId(deal.getId());

		performCreateRequest(dto).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_TASK_DEAL_CONTACT_MISMATCH)));
	}

	@Test
	@DisplayName("Create task with consistent contact, company and deal - Returns Created")
	void createTask_ConsistentAssociations_ReturnsCreated() throws Exception {
		CrmCompany company = savedCompany("Consistent Company");

		CrmContact contact = new CrmContact();
		contact.setName("Consistent Contact");
		contact.setEmail("consistent@example.com");
		contact.setOwner(employeeDao.getReferenceById(1L));
		contact.setCompany(company);
		contact = crmContactDao.save(contact);

		CrmDeal deal = savedDeal("Consistent Deal", contact, company);

		CrmTaskCreateRequestDto dto = validPayload();
		dto.setContactId(contact.getId());
		dto.setDealId(deal.getId());

		performCreateRequest(dto).andDo(print())
			.andExpect(status().isCreated())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['contactId']").value(contact.getId()));
	}

	private CrmCompany savedCompany(String name) {
		CrmCompany company = new CrmCompany();
		company.setName(name);
		return crmCompanyDao.save(company);
	}

	private CrmDeal savedDeal(String name, CrmContact contact, CrmCompany company) {
		CrmDealStage stage = new CrmDealStage();
		stage.setName("Open");
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

	// --- Helper methods for editTask tests ---

	private CrmTask savedTask() {
		CrmTask task = new CrmTask();
		task.setName("Existing Task");
		task.setType(crmTaskTypeDao.getReferenceById(taskTypeId));
		task.setPriority(CrmTaskPriority.MEDIUM);
		task.setDueAt(DateTimeUtils.getCurrentUtcDateTime().plusDays(7));
		task.setContact(crmContactDao.getReferenceById(contactId));
		task.setOwner(employeeDao.getReferenceById(1L));
		return crmTaskDao.save(task);
	}

	private ResultActions performEditRequest(Long id, CrmTaskEditRequestDto dto) throws Exception {
		return mvc.perform(patch(BY_ID_PATH, id).with(SecurityTestUtils.bearerToken(authToken))
			.contentType(MediaType.APPLICATION_JSON)
			.content(objectMapper.writeValueAsString(dto))
			.accept(MediaType.APPLICATION_JSON));
	}

	private ResultActions performEditRequest(Long id, CrmTaskEditRequestDto dto, String token) throws Exception {
		return mvc.perform(patch(BY_ID_PATH, id).with(SecurityTestUtils.bearerToken(token))
			.contentType(MediaType.APPLICATION_JSON)
			.content(objectMapper.writeValueAsString(dto))
			.accept(MediaType.APPLICATION_JSON));
	}

	// --- editTask tests ---

	@Test
	@DisplayName("Edit task name - Returns OK with updated name")
	void editTask_UpdateName_ReturnsOk() throws Exception {
		CrmTask task = savedTask();
		CrmTaskEditRequestDto dto = new CrmTaskEditRequestDto();
		dto.setName("Updated Name");

		performEditRequest(task.getId(), dto).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['name']").value("Updated Name"));

		CrmTask updated = crmTaskDao.findById(task.getId()).orElseThrow();
		assertEquals("Updated Name", updated.getName());
	}

	@Test
	@DisplayName("Edit task priority - Returns OK with updated priority")
	void editTask_UpdatePriority_ReturnsOk() throws Exception {
		CrmTask task = savedTask();
		CrmTaskEditRequestDto dto = new CrmTaskEditRequestDto();
		dto.setPriority(CrmTaskPriority.HIGH);

		performEditRequest(task.getId(), dto).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['priority']").value("HIGH"));
	}

	@Test
	@DisplayName("Edit task type - Returns OK with updated type")
	void editTask_UpdateType_ReturnsOk() throws Exception {
		CrmTask task = savedTask();

		CrmTaskType newType = new CrmTaskType();
		newType.setName("Email");
		newType.setOrderIndex(2);
		Long newTypeId = crmTaskTypeDao.save(newType).getId();

		CrmTaskEditRequestDto dto = new CrmTaskEditRequestDto();
		dto.setTypeId(newTypeId);

		performEditRequest(task.getId(), dto).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['typeId']").value(newTypeId));
	}

	@Test
	@DisplayName("Edit task mark as completed - Returns OK")
	void editTask_MarkCompleted_ReturnsOk() throws Exception {
		CrmTask task = savedTask();
		CrmTaskEditRequestDto dto = new CrmTaskEditRequestDto();
		dto.setIsCompleted(true);

		performEditRequest(task.getId(), dto).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL));

		CrmTask updated = crmTaskDao.findById(task.getId()).orElseThrow();
		assertEquals(true, updated.getIsCompleted());
	}

	@Test
	@DisplayName("Edit task notes - Returns OK with updated notes")
	void editTask_UpdateNotes_ReturnsOk() throws Exception {
		CrmTask task = savedTask();
		CrmTaskEditRequestDto dto = new CrmTaskEditRequestDto();
		dto.setNotes(JsonNullable.of("Updated notes content"));

		performEditRequest(task.getId(), dto).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL));

		CrmTask updated = crmTaskDao.findById(task.getId()).orElseThrow();
		assertEquals("Updated notes content", updated.getNotes());
	}

	@Test
	@DisplayName("Edit task with non-existent id - Returns Bad Request")
	void editTask_NotFound_ReturnsBadRequest() throws Exception {
		CrmTaskEditRequestDto dto = new CrmTaskEditRequestDto();
		dto.setName("Ghost Task");

		performEditRequest(999999L, dto).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_TASK_NOT_FOUND)));
	}

	@Test
	@DisplayName("Edit task with blank name - Returns Bad Request")
	void editTask_BlankName_ReturnsBadRequest() throws Exception {
		CrmTask task = savedTask();
		CrmTaskEditRequestDto dto = new CrmTaskEditRequestDto();
		dto.setName("   ");

		performEditRequest(task.getId(), dto).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_TASK_NAME_REQUIRED)));
	}

	@Test
	@DisplayName("Edit task with name exceeding max length - Returns Bad Request")
	void editTask_NameTooLong_ReturnsBadRequest() throws Exception {
		CrmTask task = savedTask();
		CrmTaskEditRequestDto dto = new CrmTaskEditRequestDto();
		dto.setName("a".repeat(256));

		performEditRequest(task.getId(), dto).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_TASK_NAME_TOO_LONG)));
	}

	@Test
	@DisplayName("Edit task with notes exceeding max length - Returns Bad Request")
	void editTask_NotesTooLong_ReturnsBadRequest() throws Exception {
		CrmTask task = savedTask();
		CrmTaskEditRequestDto dto = new CrmTaskEditRequestDto();
		dto.setNotes(JsonNullable.of("a".repeat(1001)));

		performEditRequest(task.getId(), dto).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_TASK_NOTES_TOO_LONG)));
	}

	@Test
	@DisplayName("Edit task with non-existent type id - Returns Bad Request")
	void editTask_NonExistentTaskType_ReturnsBadRequest() throws Exception {
		CrmTask task = savedTask();
		CrmTaskEditRequestDto dto = new CrmTaskEditRequestDto();
		dto.setTypeId(999999L);

		performEditRequest(task.getId(), dto).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_TASK_TYPE_NOT_FOUND)));
	}

	@Test
	@DisplayName("Edit task with non-existent contact id - Returns Bad Request")
	void editTask_NonExistentContact_ReturnsBadRequest() throws Exception {
		CrmTask task = savedTask();
		CrmTaskEditRequestDto dto = new CrmTaskEditRequestDto();
		dto.setContactId(JsonNullable.of(999999L));

		performEditRequest(task.getId(), dto).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_CONTACT_NOT_FOUND)));
	}

	@Test
	@DisplayName("Edit task without CRM role - Returns Forbidden")
	void editTask_WithoutCrmRole_ReturnsForbidden() throws Exception {
		CrmTask task = savedTask();
		String noRoleToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user2@gmail.com"),
				1L);

		CrmTaskEditRequestDto dto = new CrmTaskEditRequestDto();
		dto.setName("Should Fail");

		performEditRequest(task.getId(), dto, noRoleToken).andDo(print()).andExpect(status().isForbidden());
	}

	@Test
	@DisplayName("Sales rep editing own task - Returns OK")
	void editTask_RepEditingOwnTask_ReturnsOk() throws Exception {
		employeeDao.findById(2L).orElseThrow().getEmployeeRole().setCrmRole(Role.CRM_SALES_REPRESENTATIVE);
		employeeRoleDao.flush();
		String repToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user2@gmail.com"), 1L);

		CrmTask task = new CrmTask();
		task.setName("Rep Task");
		task.setType(crmTaskTypeDao.getReferenceById(taskTypeId));
		task.setPriority(CrmTaskPriority.MEDIUM);
		task.setDueAt(DateTimeUtils.getCurrentUtcDateTime().plusDays(7));
		task.setContact(crmContactDao.getReferenceById(contactId));
		task.setOwner(employeeDao.getReferenceById(2L));
		task = crmTaskDao.save(task);

		CrmTaskEditRequestDto dto = new CrmTaskEditRequestDto();
		dto.setName("Rep Updated Task");

		performEditRequest(task.getId(), dto, repToken).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['name']").value("Rep Updated Task"));
	}

	@Test
	@DisplayName("Sales rep editing another owner's task - Returns Bad Request with edit-denied error")
	void editTask_RepEditingOtherOwnersTask_ReturnsBadRequest() throws Exception {
		employeeDao.findById(2L).orElseThrow().getEmployeeRole().setCrmRole(Role.CRM_SALES_REPRESENTATIVE);
		employeeRoleDao.flush();
		String repToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user2@gmail.com"), 1L);

		CrmTask task = savedTask();

		CrmTaskEditRequestDto dto = new CrmTaskEditRequestDto();
		dto.setName("Should Not Update");

		performEditRequest(task.getId(), dto, repToken).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_TASK_EDIT_DENIED)));
	}

	@Test
	@DisplayName("Sales manager editing any task - Returns OK")
	void editTask_SalesManagerEditingAnyTask_ReturnsOk() throws Exception {
		employeeDao.findById(2L).orElseThrow().getEmployeeRole().setCrmRole(Role.CRM_SALES_MANAGER);
		employeeRoleDao.flush();
		String managerToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user2@gmail.com"),
				1L);

		CrmTask task = savedTask();

		CrmTaskEditRequestDto dto = new CrmTaskEditRequestDto();
		dto.setName("Manager Updated");

		performEditRequest(task.getId(), dto, managerToken).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['name']").value("Manager Updated"));
	}

	@Test
	@DisplayName("Edit task with null fields leaves existing values unchanged")
	void editTask_NullFields_ExistingValuesPreserved() throws Exception {
		CrmTask task = savedTask();
		CrmTaskEditRequestDto dto = new CrmTaskEditRequestDto();

		performEditRequest(task.getId(), dto).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['name']").value("Existing Task"))
			.andExpect(jsonPath(RESULTS_0_PATH + "['priority']").value("MEDIUM"));
	}

	@Test
	@DisplayName("Edit task on soft-deleted task - Returns Bad Request")
	void editTask_SoftDeletedTask_ReturnsBadRequest() throws Exception {
		CrmTask task = savedTask();
		task.setIsDeleted(true);
		crmTaskDao.save(task);

		CrmTaskEditRequestDto dto = new CrmTaskEditRequestDto();
		dto.setName("Should Fail");

		performEditRequest(task.getId(), dto).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_TASK_NOT_FOUND)));
	}

	@Test
	@DisplayName("Edit task with explicit null contactId - Clears contact and derived company")
	void editTask_NullContactId_ClearsContactAndCompany() throws Exception {
		CrmCompany company = savedCompany("Unlink Co");

		CrmContact contact = new CrmContact();
		contact.setName("Unlink Contact");
		contact.setEmail("unlink.task@example.com");
		contact.setOwner(employeeDao.getReferenceById(1L));
		contact.setCompany(company);
		contact = crmContactDao.save(contact);

		CrmTask task = savedTask("Unlink Task", false, false, contact.getId(), null, company);

		CrmTaskEditRequestDto dto = new CrmTaskEditRequestDto();
		dto.setContactId(JsonNullable.of(null));

		performEditRequest(task.getId(), dto).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL));

		CrmTask updated = crmTaskDao.findById(task.getId()).orElseThrow();
		assertNull(updated.getContact());
		assertNull(updated.getCompany());
	}

	@Test
	@DisplayName("Edit task with explicit null dealId - Clears the deal only")
	void editTask_NullDealId_ClearsDealOnly() throws Exception {
		CrmDeal deal = savedDeal("Removable Deal", crmContactDao.getReferenceById(contactId), null);
		CrmTask task = savedTask("Deal Task", false, false, contactId, deal);

		CrmTaskEditRequestDto dto = new CrmTaskEditRequestDto();
		dto.setDealId(JsonNullable.of(null));

		performEditRequest(task.getId(), dto).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL));

		CrmTask updated = crmTaskDao.findById(task.getId()).orElseThrow();
		assertNotNull(updated.getContact());
		assertEquals(contactId, updated.getContact().getId());
		assertNull(updated.getDeal());
	}

	@Test
	@DisplayName("Edit task completion with contactId/dealId omitted - Preserves associations")
	void editTask_OmittedAssociations_Preserved() throws Exception {
		CrmDeal deal = savedDeal("Kept Deal", crmContactDao.getReferenceById(contactId), null);
		CrmTask task = savedTask("Kept Task", false, false, contactId, deal);

		CrmTaskEditRequestDto dto = new CrmTaskEditRequestDto();
		dto.setIsCompleted(true);

		performEditRequest(task.getId(), dto).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL));

		CrmTask updated = crmTaskDao.findById(task.getId()).orElseThrow();
		assertEquals(true, updated.getIsCompleted());
		assertNotNull(updated.getContact());
		assertEquals(contactId, updated.getContact().getId());
		assertNotNull(updated.getDeal());
		assertEquals(deal.getId(), updated.getDeal().getId());
	}

	// --- deleteTask helper and tests ---

	private ResultActions performDeleteRequest(Long id, String token) throws Exception {
		return mvc.perform(
				delete(BY_ID_PATH, id).with(SecurityTestUtils.bearerToken(token)).accept(MediaType.APPLICATION_JSON));
	}

	private String managerToken() {
		employeeDao.findById(2L).orElseThrow().getEmployeeRole().setCrmRole(Role.CRM_SALES_MANAGER);
		employeeRoleDao.flush();
		return jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user2@gmail.com"), 1L);
	}

	@Test
	@DisplayName("Delete task - Returns OK, sets isDeleted flag and returns success message")
	void deleteTask_HappyPath_ReturnsOk() throws Exception {
		CrmTask task = savedTask();
		String manager = managerToken();

		performDeleteRequest(task.getId(), manager).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_SUCCESS_TASK_DELETED)));

		assertEquals(true, crmTaskDao.findById(task.getId()).orElseThrow().getIsDeleted());
	}

	@Test
	@DisplayName("Delete task with non-existent id - Returns Bad Request")
	void deleteTask_NotFound_ReturnsBadRequest() throws Exception {
		String manager = managerToken();

		performDeleteRequest(999999L, manager).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_TASK_NOT_FOUND)));
	}

	@Test
	@DisplayName("Delete task without any CRM role - Returns Forbidden")
	void deleteTask_WithoutCrmRole_ReturnsForbidden() throws Exception {
		CrmTask task = savedTask();
		String noRoleToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user2@gmail.com"),
				1L);

		performDeleteRequest(task.getId(), noRoleToken).andDo(print()).andExpect(status().isForbidden());
	}

	@Test
	@DisplayName("Sales rep deleting another owner's task - Returns Bad Request with delete-denied error")
	void deleteTask_RepDeletingOtherOwnersTask_ReturnsBadRequest() throws Exception {
		employeeDao.findById(2L).orElseThrow().getEmployeeRole().setCrmRole(Role.CRM_SALES_REPRESENTATIVE);
		employeeRoleDao.flush();
		String repToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user2@gmail.com"), 1L);

		CrmTask task = savedTask();

		performDeleteRequest(task.getId(), repToken).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_TASK_DELETE_DENIED)));
	}

}
