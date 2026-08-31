package com.skapp.community.crmplanner.controller.v2;

import com.jayway.jsonpath.JsonPath;
import com.skapp.TestSkappApplication;
import com.skapp.community.common.service.JwtService;
import com.skapp.community.common.type.Role;
import com.skapp.community.common.util.DateTimeUtils;
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

	private ResultActions performGetCompletedRequest() throws Exception {
		return performRequest(
				get(BASE_PATH + "/completed").param("page", "0").param("size", "10").accept(MediaType.APPLICATION_JSON),
				authToken);
	}

	private ResultActions performGetRelatedRequest(Long targetContactId) throws Exception {
		return performRequest(get(BASE_PATH + "/related").param("contactId", targetContactId.toString())
			.accept(MediaType.APPLICATION_JSON), authToken);
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

	private CrmTask savedTask(String name, boolean isCompleted) {
		CrmTask task = new CrmTask();
		task.setName(name);
		task.setType(taskType);
		task.setPriority(CrmTaskPriority.MEDIUM);
		task.setDueAt(DateTimeUtils.getCurrentUtcDateTime().plusDays(7));
		task.setContact(contact);
		task.setCompany(company);
		task.setOwner(employeeDao.getReferenceById(1L));
		task.setIsCompleted(isCompleted);
		return crmTaskDao.save(task);
	}

	// --- createTask ---

	@Test
	@DisplayName("Create task with contact and deal - Returns Created with embedded type, owner, company, contact and scalar deal ids")
	void createTask_WithContactAndDeal_ReturnsEmbeddedAssociations() throws Exception {
		CrmDeal deal = savedDeal("Task Linked Deal V2");

		CrmTaskCreateRequestDto dto = validPayload();
		dto.setDealId(deal.getId());

		performCreateRequest(dto).andDo(print())
			.andExpect(status().isCreated())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['name']").value("Follow up call"))
			.andExpect(jsonPath(RESULTS_0_PATH + "['priority']").value("MEDIUM"))
			.andExpect(jsonPath(RESULTS_0_PATH + "['type']['id']").value(taskTypeId))
			.andExpect(jsonPath(RESULTS_0_PATH + "['type']['name']").value("Call"))
			.andExpect(jsonPath(RESULTS_0_PATH + "['owner']['employeeId']").value(1))
			.andExpect(jsonPath(RESULTS_0_PATH + "['company']['id']").value(companyId))
			.andExpect(jsonPath(RESULTS_0_PATH + "['contact']['id']").value(contactId))
			.andExpect(jsonPath(RESULTS_0_PATH + "['contact']['name']").value("Task Test Contact"))
			.andExpect(jsonPath(RESULTS_0_PATH + "['deal']['id']").value(deal.getId()))
			.andExpect(jsonPath(RESULTS_0_PATH + "['deal']['name']").value("Task Linked Deal V2"))
			.andExpect(jsonPath(RESULTS_0_PATH + "['deal']['contactId']").value(contactId));
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

	// --- getTasks (open) ---

	@Test
	@DisplayName("Get tasks (open) - Returns tasks list wrapper, not a PageDto")
	void getTasks_Open_ReturnsTasksWrapper() throws Exception {
		savedTask("Open Task V2", false);

		performGetTasksRequest().andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['tasks']").isArray())
			.andExpect(jsonPath(RESULTS_0_PATH + "['tasks'].length()").value(1))
			.andExpect(jsonPath(RESULTS_0_PATH + "['tasks'][0]['name']").value("Open Task V2"))
			.andExpect(jsonPath(RESULTS_0_PATH + "['tasks'][0]['type']['name']").value("Call"))
			.andExpect(jsonPath(RESULTS_0_PATH + "['items']").doesNotExist())
			.andExpect(jsonPath(RESULTS_0_PATH + "['totalItems']").doesNotExist());
	}

	@Test
	@DisplayName("Get tasks (open) - Projects the nested deal with scalar stage, company and contact ids")
	void getTasks_WithLinkedDeal_ProjectsNestedDeal() throws Exception {
		CrmDeal deal = savedDeal("Nested Deal V2");

		CrmTask task = new CrmTask();
		task.setName("Task With Deal V2");
		task.setType(taskType);
		task.setPriority(CrmTaskPriority.MEDIUM);
		task.setDueAt(DateTimeUtils.getCurrentUtcDateTime().plusDays(7));
		task.setContact(contact);
		task.setCompany(company);
		task.setDeal(deal);
		task.setOwner(employeeDao.getReferenceById(1L));
		crmTaskDao.save(task);

		performGetTasksRequest().andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['tasks'][0]['name']").value("Task With Deal V2"))
			.andExpect(jsonPath(RESULTS_0_PATH + "['tasks'][0]['deal']['id']").value(deal.getId()))
			.andExpect(jsonPath(RESULTS_0_PATH + "['tasks'][0]['deal']['name']").value("Nested Deal V2"))
			.andExpect(jsonPath(RESULTS_0_PATH + "['tasks'][0]['deal']['stageId']").value(deal.getStage().getId()))
			.andExpect(jsonPath(RESULTS_0_PATH + "['tasks'][0]['deal']['companyId']").value(companyId))
			.andExpect(jsonPath(RESULTS_0_PATH + "['tasks'][0]['deal']['contactId']").value(contactId));
	}

	// --- getCompletedTasks ---

	@Test
	@DisplayName("Get completed tasks - Returns paginated completed tasks")
	void getCompletedTasks_ReturnsPaginatedCompletedTasks() throws Exception {
		savedTask("Open Task V2", false);
		savedTask("Completed Task V2", true);

		performGetCompletedRequest().andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['items']").isArray())
			.andExpect(jsonPath(RESULTS_0_PATH + "['items'].length()").value(1))
			.andExpect(jsonPath(RESULTS_0_PATH + "['items'][0]['name']").value("Completed Task V2"))
			.andExpect(jsonPath(RESULTS_0_PATH + "['totalItems']").value(1));
	}

	// --- getRelatedTasks ---

	@Test
	@DisplayName("Get related tasks by contactId - Returns paginated related tasks")
	void getRelatedTasks_ByContactId_ReturnsMatchingTasks() throws Exception {
		savedTask("Related Task A", false);
		savedTask("Related Task B", true);

		performGetRelatedRequest(contactId).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['items'].length()").value(2))
			.andExpect(jsonPath(RESULTS_0_PATH + "['totalItems']").value(2));
	}

	// --- getTaskById ---

	@Test
	@DisplayName("Get task by ID - Returns embedded type, owner, company and contact")
	void getTaskById_HappyPath_ReturnsEmbeddedAssociations() throws Exception {
		CrmTask task = savedTask("Detail Task V2", false);

		performGetByIdRequest(task.getId()).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['id']").value(task.getId()))
			.andExpect(jsonPath(RESULTS_0_PATH + "['name']").value("Detail Task V2"))
			.andExpect(jsonPath(RESULTS_0_PATH + "['type']['id']").value(taskTypeId))
			.andExpect(jsonPath(RESULTS_0_PATH + "['type']['name']").value("Call"))
			.andExpect(jsonPath(RESULTS_0_PATH + "['owner']['employeeId']").value(1))
			.andExpect(jsonPath(RESULTS_0_PATH + "['company']['id']").value(companyId))
			.andExpect(jsonPath(RESULTS_0_PATH + "['contact']['id']").value(contactId))
			.andExpect(jsonPath(RESULTS_0_PATH + "['contact']['company']['id']").value(companyId));
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

	@Test
	@DisplayName("Get related tasks without contactId or dealId - Returns Bad Request")
	void getRelatedTasks_NoContext_ReturnsBadRequest() throws Exception {
		performRequest(get(BASE_PATH + "/related").accept(MediaType.APPLICATION_JSON), authToken).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL));
	}

}
