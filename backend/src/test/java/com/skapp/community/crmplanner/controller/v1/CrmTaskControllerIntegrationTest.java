package com.skapp.community.crmplanner.controller.v1;

import com.skapp.TestSkappApplication;
import com.skapp.community.common.service.JwtService;
import com.skapp.community.common.util.DateTimeUtils;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.community.crmplanner.constant.CrmMessageConstant;
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
import com.skapp.community.crmplanner.type.CrmTaskPriority;
import com.skapp.community.common.type.Role;
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
import com.jayway.jsonpath.JsonPath;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.json.JsonMapper;

import static com.skapp.support.TestConstants.MESSAGE_PATH;
import static com.skapp.support.TestConstants.RESULTS_0_PATH;
import static com.skapp.support.TestConstants.STATUS_PATH;
import static com.skapp.support.TestConstants.STATUS_SUCCESSFUL;
import static com.skapp.support.TestConstants.STATUS_UNSUCCESSFUL;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
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

	private static final String BY_ID_PATH = "/v1/crm/task/{id}";

	private final JsonMapper objectMapper;

	private final JwtService jwtService;

	private final UserDetailsService userDetailsService;

	private final MockMvc mvc;

	private final MessageUtil messageUtil;

	private final CrmContactDao crmContactDao;

	private final CrmCompanyDao crmCompanyDao;

	private final CrmDealDao crmDealDao;

	private final CrmDealStageDao crmDealStageDao;

	private final CrmTaskTypeDao crmTaskTypeDao;

	private final CrmTaskDao crmTaskDao;

	private final EmployeeDao employeeDao;

	private final EmployeeRoleDao employeeRoleDao;

	private String authToken;

	private Long contactId;

	private Long taskTypeId;

	private CrmTaskType taskType;

	@BeforeEach
	void setup() {
		authToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user1@gmail.com"), 1L);

		CrmContact contact = new CrmContact();
		contact.setName("Task Test Contact");
		contact.setEmail("task.contact@example.com");
		contact.setOwner(employeeDao.getReferenceById(1L));
		contactId = crmContactDao.save(contact).getId();

		taskType = new CrmTaskType();
		taskType.setName("Call");
		taskType.setOrderIndex(1);
		taskType = crmTaskTypeDao.save(taskType);
		taskTypeId = taskType.getId();
	}

	// --- GET tasks helpers and tests ---

	private ResultActions performGetRequest(String token) throws Exception {
		return mvc
			.perform(get(BASE_PATH).accept(MediaType.APPLICATION_JSON).with(SecurityTestUtils.bearerToken(token)));
	}

	private ResultActions performGetRequest(String token, String searchKeyword, Long contactId, Long dealId)
			throws Exception {
		var request = get(BASE_PATH).accept(MediaType.APPLICATION_JSON).with(SecurityTestUtils.bearerToken(token));
		if (searchKeyword != null) {
			request = request.param("searchKeyword", searchKeyword);
		}
		if (contactId != null) {
			request = request.param("contactId", contactId.toString());
		}
		if (dealId != null) {
			request = request.param("dealId", dealId.toString());
		}
		return mvc.perform(request);
	}

	private CrmTask savedTask(String name, boolean isDeleted) {
		return savedTask(name, isDeleted, false);
	}

	private CrmTask savedTask(String name, boolean isDeleted, boolean isCompleted) {
		CrmTask task = new CrmTask();
		task.setName(name);
		task.setType(taskType);
		task.setPriority(CrmTaskPriority.MEDIUM);
		task.setOwner(employeeDao.getReferenceById(1L));
		task.setIsDeleted(isDeleted);
		task.setIsCompleted(isCompleted);
		return crmTaskDao.save(task);
	}

	private CrmTask savedTask(String name, boolean isDeleted, boolean isCompleted, Long linkedContactId) {
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
		return crmTaskDao.save(task);
	}

	private CrmTask savedTask(String name, boolean isDeleted, boolean isCompleted, Long linkedContactId,
			CrmDeal linkedDeal) {
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
		return crmTaskDao.save(task);
	}

	@Test
	@DisplayName("Get tasks with no tasks - Returns OK with empty tasks list")
	void getTasks_NoTasks_ReturnsOkEmpty() throws Exception {
		performGetRequest(authToken).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['tasks']").isArray())
			.andExpect(jsonPath(RESULTS_0_PATH + "['tasks']").isEmpty());
	}

	@Test
	@DisplayName("Get tasks excludes soft-deleted tasks - Returns only non-deleted")
	void getTasks_WithDeletedTask_ExcludesDeleted() throws Exception {
		savedTask("Active task", false);
		savedTask("Deleted task", true);

		performGetRequest(authToken).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['tasks'].length()").value(1))
			.andExpect(jsonPath(RESULTS_0_PATH + "['tasks'][0]['name']").value("Active task"));
	}

	@Test
	@DisplayName("Get tasks excludes completed tasks - Returns only non-completed")
	void getTasks_WithCompletedTask_ExcludesCompleted() throws Exception {
		savedTask("Active task", false, false);
		savedTask("Completed task", false, true);

		performGetRequest(authToken).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['tasks'].length()").value(1))
			.andExpect(jsonPath(RESULTS_0_PATH + "['tasks'][0]['name']").value("Active task"));
	}

	@Test
	@DisplayName("Get tasks with search keyword - Returns only matching tasks")
	void getTasks_WithSearchKeyword_ReturnsMatchingTasks() throws Exception {
		savedTask("Follow up call", false, false);
		savedTask("Send proposal", false, false);

		performGetRequest(authToken, "follow", null, null).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['tasks'].length()").value(1))
			.andExpect(jsonPath(RESULTS_0_PATH + "['tasks'][0]['name']").value("Follow up call"));
	}

	@Test
	@DisplayName("Get tasks filtered by contactId - Returns only tasks linked to that contact")
	void getTasks_FilterByContactId_ReturnsMatchingTasks() throws Exception {
		CrmContact other = new CrmContact();
		other.setName("Other Contact");
		other.setEmail("other@example.com");
		other.setOwner(employeeDao.getReferenceById(1L));
		Long otherContactId = crmContactDao.save(other).getId();

		savedTask("Task for main contact", false, false, contactId);
		savedTask("Task for other contact", false, false, otherContactId);

		performGetRequest(authToken, null, contactId, null).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['tasks'].length()").value(1))
			.andExpect(jsonPath(RESULTS_0_PATH + "['tasks'][0]['name']").value("Task for main contact"));
	}

	@Test
	@DisplayName("Get tasks filtered by dealId - Returns only tasks linked to that deal")
	void getTasks_FilterByDealId_ReturnsMatchingTasks() throws Exception {
		CrmDeal deal = savedDeal("Test Deal", crmContactDao.getReferenceById(contactId), null);

		savedTask("Task with deal", false, false, contactId, deal);
		savedTask("Task without deal", false, false, contactId, null);

		performGetRequest(authToken, null, null, deal.getId()).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['tasks'].length()").value(1))
			.andExpect(jsonPath(RESULTS_0_PATH + "['tasks'][0]['name']").value("Task with deal"));
	}

	@Test
	@DisplayName("Get tasks with combined search and contactId filter - Returns intersection")
	void getTasks_SearchAndContactIdFilter_ReturnsIntersection() throws Exception {
		savedTask("Follow up with main", false, false, contactId);
		savedTask("Follow up without contact", false, false);

		performGetRequest(authToken, "follow", contactId, null).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['tasks'].length()").value(1))
			.andExpect(jsonPath(RESULTS_0_PATH + "['tasks'][0]['name']").value("Follow up with main"));
	}

	// --- GET completed tasks helpers and tests ---

	private ResultActions performGetCompletedRequest(String token, String page, String size) throws Exception {
		return mvc.perform(get(BASE_PATH + "/completed").param("page", page)
			.param("size", size)
			.accept(MediaType.APPLICATION_JSON)
			.with(SecurityTestUtils.bearerToken(token)));
	}

	private ResultActions performGetCompletedRequest(String token, String page, String size, String searchKeyword,
			Long contactId, Long dealId) throws Exception {
		var request = get(BASE_PATH + "/completed").param("page", page)
			.param("size", size)
			.accept(MediaType.APPLICATION_JSON)
			.with(SecurityTestUtils.bearerToken(token));
		if (searchKeyword != null) {
			request = request.param("searchKeyword", searchKeyword);
		}
		if (contactId != null) {
			request = request.param("contactId", contactId.toString());
		}
		if (dealId != null) {
			request = request.param("dealId", dealId.toString());
		}
		return mvc.perform(request);
	}

	@Test
	@DisplayName("Get completed tasks - Returns paginated completed tasks")
	void getCompletedTasks_ReturnsPaginatedCompletedTasks_ReturnsOk() throws Exception {
		savedTask("Active task", false, false);
		savedTask("Completed task 1", false, true);
		savedTask("Completed task 2", false, true);

		performGetCompletedRequest(authToken, "0", "10").andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['items']").isArray())
			.andExpect(jsonPath(RESULTS_0_PATH + "['items'].length()").value(2))
			.andExpect(jsonPath(RESULTS_0_PATH + "['totalItems']").value(2))
			.andExpect(jsonPath(RESULTS_0_PATH + "['currentPage']").value(0))
			.andExpect(jsonPath(RESULTS_0_PATH + "['totalPages']").value(1));
	}

	@Test
	@DisplayName("Get completed tasks with no completed tasks - Returns empty page")
	void getCompletedTasks_WithNoCompletedTasks_ReturnsEmptyPage() throws Exception {
		savedTask("Active task", false, false);

		performGetCompletedRequest(authToken, "0", "10").andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['items']").isArray())
			.andExpect(jsonPath(RESULTS_0_PATH + "['items']").isEmpty())
			.andExpect(jsonPath(RESULTS_0_PATH + "['totalItems']").value(0))
			.andExpect(jsonPath(RESULTS_0_PATH + "['currentPage']").value(0))
			.andExpect(jsonPath(RESULTS_0_PATH + "['totalPages']").value(0));
	}

	@Test
	@DisplayName("Get completed tasks with search keyword - Returns only matching completed tasks")
	void getCompletedTasks_WithSearchKeyword_ReturnsMatchingTasks() throws Exception {
		savedTask("Completed call", false, true);
		savedTask("Completed proposal", false, true);

		performGetCompletedRequest(authToken, "0", "10", "call", null, null).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['items'].length()").value(1))
			.andExpect(jsonPath(RESULTS_0_PATH + "['items'][0]['name']").value("Completed call"))
			.andExpect(jsonPath(RESULTS_0_PATH + "['totalItems']").value(1));
	}

	@Test
	@DisplayName("Get completed tasks filtered by contactId - Returns only completed tasks for that contact")
	void getCompletedTasks_FilterByContactId_ReturnsMatchingTasks() throws Exception {
		CrmContact other = new CrmContact();
		other.setName("Other Completed Contact");
		other.setEmail("other.completed@example.com");
		other.setOwner(employeeDao.getReferenceById(1L));
		Long otherContactId = crmContactDao.save(other).getId();

		savedTask("Completed for main", false, true, contactId);
		savedTask("Completed for other", false, true, otherContactId);

		performGetCompletedRequest(authToken, "0", "10", null, contactId, null).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['items'].length()").value(1))
			.andExpect(jsonPath(RESULTS_0_PATH + "['items'][0]['name']").value("Completed for main"))
			.andExpect(jsonPath(RESULTS_0_PATH + "['totalItems']").value(1));
	}

	@Test
	@DisplayName("Get completed tasks filtered by dealId - Returns only completed tasks for that deal")
	void getCompletedTasks_FilterByDealId_ReturnsMatchingTasks() throws Exception {
		CrmDeal deal = savedDeal("Completed Deal", crmContactDao.getReferenceById(contactId), null);

		savedTask("Completed with deal", false, true, contactId, deal);
		savedTask("Completed without deal", false, true, contactId, null);

		performGetCompletedRequest(authToken, "0", "10", null, null, deal.getId()).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['items'].length()").value(1))
			.andExpect(jsonPath(RESULTS_0_PATH + "['items'][0]['name']").value("Completed with deal"))
			.andExpect(jsonPath(RESULTS_0_PATH + "['totalItems']").value(1));
	}

	// --- CREATE task helpers and tests ---

	private ResultActions performCreateRequest(CrmTaskCreateRequestDto dto) throws Exception {
		return mvc.perform(post(BASE_PATH).with(SecurityTestUtils.bearerToken(authToken))
			.contentType(MediaType.APPLICATION_JSON)
			.content(objectMapper.writeValueAsString(dto))
			.accept(MediaType.APPLICATION_JSON));
	}

	private CrmTaskCreateRequestDto validPayload() {
		CrmTaskCreateRequestDto dto = new CrmTaskCreateRequestDto();
		dto.setName("Follow up call");
		dto.setTypeId(taskTypeId);
		dto.setContactId(contactId);
		dto.setDueAt(DateTimeUtils.getCurrentUtcDateTime().plusDays(7));
		return dto;
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
			.andExpect(jsonPath(RESULTS_0_PATH + "['typeName']").value("Call"))
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
	@DisplayName("Create task with a due date in the past - Returns Bad Request")
	void createTask_PastDueDate_ReturnsBadRequest() throws Exception {
		CrmTaskCreateRequestDto dto = validPayload();
		dto.setDueAt(DateTimeUtils.getCurrentUtcDateTime().minusDays(1));

		performCreateRequest(dto).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_TASK_DUE_DATE_IN_PAST)));
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
	@DisplayName("Create task with no contact, company or deal - Returns Bad Request")
	void createTask_NoTarget_ReturnsBadRequest() throws Exception {
		CrmTaskCreateRequestDto dto = validPayload();
		dto.setContactId(null);

		performCreateRequest(dto).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_TASK_TARGET_REQUIRED)));
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
	@DisplayName("Create task with non-existent type id - Returns Internal Server Error")
	void createTask_NonExistentTaskType_ReturnsInternalServerError() throws Exception {
		CrmTaskCreateRequestDto dto = validPayload();
		dto.setTypeId(999999L);

		performCreateRequest(dto).andDo(print())
			.andExpect(status().isInternalServerError())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL));
	}

	@Test
	@DisplayName("Create task without CRM sales role - Returns Forbidden")
	void createTask_WithoutCrmRole_ReturnsForbidden() throws Exception {
		authToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user2@gmail.com"), 1L);

		performCreateRequest(validPayload()).andDo(print()).andExpect(status().isForbidden());
	}

	// --- Cross-entity association validation tests ---

	@Test
	@DisplayName("Create task with contact belonging to different company - Returns Bad Request")
	void createTask_ContactCompanyMismatch_ReturnsBadRequest() throws Exception {
		CrmCompany companyA = savedCompany("Company A");
		CrmCompany companyB = savedCompany("Company B");

		CrmContact contactInA = new CrmContact();
		contactInA.setName("Contact In A");
		contactInA.setEmail("contact.in.a@example.com");
		contactInA.setOwner(employeeDao.getReferenceById(1L));
		contactInA.setCompany(companyA);
		contactInA = crmContactDao.save(contactInA);

		CrmTaskCreateRequestDto dto = validPayload();
		dto.setContactId(contactInA.getId());
		dto.setCompanyId(companyB.getId());

		performCreateRequest(dto).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_TASK_CONTACT_COMPANY_MISMATCH)));
	}

	@Test
	@DisplayName("Create task with contact having no company but company specified - Returns Bad Request")
	void createTask_ContactNoCompanyButCompanySpecified_ReturnsBadRequest() throws Exception {
		CrmCompany company = savedCompany("Orphan Company");

		CrmTaskCreateRequestDto dto = validPayload();
		dto.setContactId(contactId);
		dto.setCompanyId(company.getId());

		performCreateRequest(dto).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_TASK_CONTACT_COMPANY_MISMATCH)));
	}

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
	@DisplayName("Create task with deal belonging to different company - Returns Bad Request")
	void createTask_DealCompanyMismatch_ReturnsBadRequest() throws Exception {
		CrmCompany companyA = savedCompany("Deal Company A");
		CrmCompany companyB = savedCompany("Deal Company B");

		CrmContact contact = new CrmContact();
		contact.setName("Contact For Deal");
		contact.setEmail("contact.deal@example.com");
		contact.setOwner(employeeDao.getReferenceById(1L));
		contact.setCompany(companyA);
		contact = crmContactDao.save(contact);

		CrmDeal deal = savedDeal("Deal in A", contact, companyA);

		CrmTaskCreateRequestDto dto = validPayload();
		dto.setContactId(contact.getId());
		dto.setCompanyId(companyB.getId());
		dto.setDealId(deal.getId());

		performCreateRequest(dto).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL));
	}

	@Test
	@DisplayName("Create task with deal having no company but company specified - Returns Bad Request")
	void createTask_DealNoCompanyButCompanySpecified_ReturnsBadRequest() throws Exception {
		CrmCompany company = savedCompany("Task Company");

		CrmDeal deal = savedDeal("Deal No Company", crmContactDao.getReferenceById(contactId), null);

		CrmTaskCreateRequestDto dto = validPayload();
		dto.setContactId(contactId);
		dto.setCompanyId(company.getId());
		dto.setDealId(deal.getId());

		performCreateRequest(dto).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL));
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
		dto.setCompanyId(company.getId());
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
			.andExpect(jsonPath(RESULTS_0_PATH + "['typeId']").value(newTypeId))
			.andExpect(jsonPath(RESULTS_0_PATH + "['typeName']").value("Email"));
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
		dto.setNotes("Updated notes content");

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
		dto.setNotes("a".repeat(1001));

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
		dto.setContactId(999999L);

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

}
