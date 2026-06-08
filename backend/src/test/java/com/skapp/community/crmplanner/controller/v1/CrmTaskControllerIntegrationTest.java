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
import com.skapp.community.peopleplanner.repository.EmployeeDao;
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

	private String authToken;

	private Long contactId;

	private Long taskTypeId;

	@BeforeEach
	void setup() {
		authToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user1@gmail.com"), 1L);

		CrmContact contact = new CrmContact();
		contact.setName("Task Test Contact");
		contact.setEmail("task.contact@example.com");
		contact.setOwner(employeeDao.getReferenceById(1L));
		contactId = crmContactDao.save(contact).getId();

		CrmTaskType type = new CrmTaskType();
		type.setName("Call");
		type.setOrderIndex(1);
		taskTypeId = crmTaskTypeDao.save(type).getId();
	}

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
		return crmDealDao.save(deal);
	}

	// ===== Edit Task Tests =====

	private Long createTaskAndReturnId() throws Exception {
		CrmTaskCreateRequestDto dto = validPayload();
		MvcResult result = performCreateRequest(dto).andExpect(status().isCreated()).andReturn();
		return ((Number) JsonPath.read(result.getResponse().getContentAsString(), "$.results[0].id")).longValue();
	}

	private ResultActions performEditRequest(Long taskId, CrmTaskEditRequestDto dto) throws Exception {
		return mvc.perform(patch(BASE_PATH + "/" + taskId).with(SecurityTestUtils.bearerToken(authToken))
			.contentType(MediaType.APPLICATION_JSON)
			.content(objectMapper.writeValueAsString(dto))
			.accept(MediaType.APPLICATION_JSON));
	}

	@Test
	@DisplayName("Edit task name - Returns OK and persists updated name")
	void editTask_UpdateName_ReturnsOk() throws Exception {
		Long taskId = createTaskAndReturnId();

		CrmTaskEditRequestDto editDto = new CrmTaskEditRequestDto();
		editDto.setName("Updated task name");

		performEditRequest(taskId, editDto).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL));

		CrmTask saved = crmTaskDao.findById(taskId).orElseThrow();
		assertEquals("Updated task name", saved.getName());
	}

	@Test
	@DisplayName("Edit task priority - Returns OK and persists updated priority")
	void editTask_UpdatePriority_ReturnsOk() throws Exception {
		Long taskId = createTaskAndReturnId();

		CrmTaskEditRequestDto editDto = new CrmTaskEditRequestDto();
		editDto.setPriority(CrmTaskPriority.LOW);

		performEditRequest(taskId, editDto).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL));

		CrmTask saved = crmTaskDao.findById(taskId).orElseThrow();
		assertEquals(CrmTaskPriority.LOW, saved.getPriority());
	}

	@Test
	@DisplayName("Edit task completion status - Returns OK and persists isCompleted")
	void editTask_MarkCompleted_ReturnsOk() throws Exception {
		Long taskId = createTaskAndReturnId();

		CrmTaskEditRequestDto editDto = new CrmTaskEditRequestDto();
		editDto.setIsCompleted(true);

		performEditRequest(taskId, editDto).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL));

		CrmTask saved = crmTaskDao.findById(taskId).orElseThrow();
		assertEquals(true, saved.getIsCompleted());
	}

	@Test
	@DisplayName("Edit task due date - Returns OK and persists updated date")
	void editTask_UpdateDueAt_ReturnsOk() throws Exception {
		Long taskId = createTaskAndReturnId();

		CrmTaskEditRequestDto editDto = new CrmTaskEditRequestDto();
		editDto.setDueAt(DateTimeUtils.getCurrentUtcDateTime().plusDays(30));

		performEditRequest(taskId, editDto).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL));

		CrmTask saved = crmTaskDao.findById(taskId).orElseThrow();
		assertNotNull(saved.getDueAt());
	}

	@Test
	@DisplayName("Edit task notes - Returns OK and persists updated notes")
	void editTask_UpdateNotes_ReturnsOk() throws Exception {
		Long taskId = createTaskAndReturnId();

		CrmTaskEditRequestDto editDto = new CrmTaskEditRequestDto();
		editDto.setNotes("Updated notes content");

		performEditRequest(taskId, editDto).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL));

		CrmTask saved = crmTaskDao.findById(taskId).orElseThrow();
		assertEquals("Updated notes content", saved.getNotes());
	}

	@Test
	@DisplayName("Edit task with blank name - Returns Bad Request")
	void editTask_BlankName_ReturnsBadRequest() throws Exception {
		Long taskId = createTaskAndReturnId();

		CrmTaskEditRequestDto editDto = new CrmTaskEditRequestDto();
		editDto.setName("   ");

		performEditRequest(taskId, editDto).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_TASK_NAME_REQUIRED)));
	}

	@Test
	@DisplayName("Edit task with name exceeding max length - Returns Bad Request")
	void editTask_NameTooLong_ReturnsBadRequest() throws Exception {
		Long taskId = createTaskAndReturnId();

		CrmTaskEditRequestDto editDto = new CrmTaskEditRequestDto();
		editDto.setName("a".repeat(256));

		performEditRequest(taskId, editDto).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_TASK_NAME_TOO_LONG)));
	}

	@Test
	@DisplayName("Edit task with notes exceeding max length - Returns Bad Request")
	void editTask_NotesTooLong_ReturnsBadRequest() throws Exception {
		Long taskId = createTaskAndReturnId();

		CrmTaskEditRequestDto editDto = new CrmTaskEditRequestDto();
		editDto.setNotes("a".repeat(1001));

		performEditRequest(taskId, editDto).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_TASK_NOTES_TOO_LONG)));
	}

	@Test
	@DisplayName("Edit non-existent task - Returns Bad Request")
	void editTask_NonExistentTask_ReturnsBadRequest() throws Exception {
		CrmTaskEditRequestDto editDto = new CrmTaskEditRequestDto();
		editDto.setName("Updated");

		performEditRequest(999999L, editDto).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_TASK_NOT_FOUND)));
	}

	@Test
	@DisplayName("Edit task with non-existent contact id - Returns Bad Request")
	void editTask_NonExistentContact_ReturnsBadRequest() throws Exception {
		Long taskId = createTaskAndReturnId();

		CrmTaskEditRequestDto editDto = new CrmTaskEditRequestDto();
		editDto.setContactId(999999L);

		performEditRequest(taskId, editDto).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_CONTACT_NOT_FOUND)));
	}

	@Test
	@DisplayName("Edit task with non-existent company id - Returns Bad Request")
	void editTask_NonExistentCompany_ReturnsBadRequest() throws Exception {
		Long taskId = createTaskAndReturnId();

		CrmTaskEditRequestDto editDto = new CrmTaskEditRequestDto();
		editDto.setCompanyId(999999L);

		performEditRequest(taskId, editDto).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_COMPANY_NOT_FOUND)));
	}

	@Test
	@DisplayName("Edit task with non-existent deal id - Returns Bad Request")
	void editTask_NonExistentDeal_ReturnsBadRequest() throws Exception {
		Long taskId = createTaskAndReturnId();

		CrmTaskEditRequestDto editDto = new CrmTaskEditRequestDto();
		editDto.setDealId(999999L);

		performEditRequest(taskId, editDto).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_DEAL_NOT_FOUND)));
	}

	@Test
	@DisplayName("Edit task with contact-company mismatch - Returns Bad Request")
	void editTask_ContactCompanyMismatch_ReturnsBadRequest() throws Exception {
		CrmCompany companyA = savedCompany("Edit Company A");
		CrmCompany companyB = savedCompany("Edit Company B");

		CrmContact contactInA = new CrmContact();
		contactInA.setName("Edit Contact In A");
		contactInA.setEmail("edit.contact.in.a@example.com");
		contactInA.setOwner(employeeDao.getReferenceById(1L));
		contactInA.setCompany(companyA);
		contactInA = crmContactDao.save(contactInA);

		Long taskId = createTaskAndReturnId();

		CrmTaskEditRequestDto editDto = new CrmTaskEditRequestDto();
		editDto.setContactId(contactInA.getId());
		editDto.setCompanyId(companyB.getId());

		performEditRequest(taskId, editDto).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_TASK_CONTACT_COMPANY_MISMATCH)));
	}

	@Test
	@DisplayName("Edit task with consistent associations - Returns OK")
	void editTask_ConsistentAssociations_ReturnsOk() throws Exception {
		CrmCompany company = savedCompany("Edit Consistent Company");

		CrmContact contact = new CrmContact();
		contact.setName("Edit Consistent Contact");
		contact.setEmail("edit.consistent@example.com");
		contact.setOwner(employeeDao.getReferenceById(1L));
		contact.setCompany(company);
		contact = crmContactDao.save(contact);

		CrmDeal deal = savedDeal("Edit Consistent Deal", contact, company);

		Long taskId = createTaskAndReturnId();

		CrmTaskEditRequestDto editDto = new CrmTaskEditRequestDto();
		editDto.setContactId(contact.getId());
		editDto.setCompanyId(company.getId());
		editDto.setDealId(deal.getId());

		performEditRequest(taskId, editDto).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL));
	}

	@Test
	@DisplayName("Edit task without CRM role - Returns Forbidden")
	void editTask_WithoutCrmRole_ReturnsForbidden() throws Exception {
		Long taskId = createTaskAndReturnId();

		authToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user2@gmail.com"), 1L);

		CrmTaskEditRequestDto editDto = new CrmTaskEditRequestDto();
		editDto.setName("Unauthorized edit");

		performEditRequest(taskId, editDto).andDo(print()).andExpect(status().isForbidden());
	}

	@Test
	@DisplayName("Edit task with empty payload (no fields set) - Returns OK with no changes")
	void editTask_EmptyPayload_ReturnsOk() throws Exception {
		Long taskId = createTaskAndReturnId();

		CrmTaskEditRequestDto editDto = new CrmTaskEditRequestDto();

		performEditRequest(taskId, editDto).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL));

		CrmTask saved = crmTaskDao.findById(taskId).orElseThrow();
		assertEquals("Follow up call", saved.getName());
	}

	@Test
	@DisplayName("Edit task type id - Returns OK and persists updated type")
	void editTask_UpdateTypeId_ReturnsOk() throws Exception {
		Long taskId = createTaskAndReturnId();

		CrmTaskType newType = new CrmTaskType();
		newType.setName("Email");
		newType.setOrderIndex(2);
		Long newTypeId = crmTaskTypeDao.save(newType).getId();

		CrmTaskEditRequestDto editDto = new CrmTaskEditRequestDto();
		editDto.setTypeId(newTypeId);

		performEditRequest(taskId, editDto).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL));

		CrmTask saved = crmTaskDao.findById(taskId).orElseThrow();
		assertEquals(newTypeId, saved.getType().getId());
	}

	@Test
	@DisplayName("Edit task with non-existent type id - Returns Bad Request")
	void editTask_NonExistentTypeId_ReturnsBadRequest() throws Exception {
		Long taskId = createTaskAndReturnId();

		CrmTaskEditRequestDto editDto = new CrmTaskEditRequestDto();
		editDto.setTypeId(999999L);

		performEditRequest(taskId, editDto).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_TASK_TYPE_NOT_FOUND)));
	}

}
