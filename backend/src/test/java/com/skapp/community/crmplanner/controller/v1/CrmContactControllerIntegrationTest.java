package com.skapp.community.crmplanner.controller.v1;

import com.skapp.TestSkappApplication;
import com.skapp.community.common.service.JwtService;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.community.crmplanner.constant.CrmMessageConstant;
import com.skapp.community.crmplanner.model.CrmContact;
import com.skapp.community.crmplanner.model.CrmTask;
import com.skapp.community.crmplanner.model.CrmTaskType;
import com.skapp.community.crmplanner.payload.request.CrmContactTaskCreateRequestDto;
import com.skapp.community.crmplanner.repository.CrmContactDao;
import com.skapp.community.crmplanner.repository.CrmTaskDao;
import com.skapp.community.crmplanner.repository.CrmTaskTypeDao;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = TestSkappApplication.class)
@AutoConfigureMockMvc
@Transactional
@RequiredArgsConstructor
@DisplayName("CRM Contact Controller Integration Tests")
class CrmContactControllerIntegrationTest {

	private static final String BASE_PATH = "/v1/crm/contact/{id}/tasks";

	private final JsonMapper objectMapper;

	private final JwtService jwtService;

	private final UserDetailsService userDetailsService;

	private final MockMvc mvc;

	private final MessageUtil messageUtil;

	private final CrmContactDao crmContactDao;

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

	private ResultActions performRequest(MockHttpServletRequestBuilder request) throws Exception {
		return mvc.perform(request.with(SecurityTestUtils.bearerToken(authToken)));
	}

	private ResultActions performCreateRequest(Long pathContactId, CrmContactTaskCreateRequestDto dto)
			throws Exception {
		return performRequest(post(BASE_PATH, pathContactId).contentType(MediaType.APPLICATION_JSON)
			.content(objectMapper.writeValueAsString(dto))
			.accept(MediaType.APPLICATION_JSON));
	}

	private CrmContactTaskCreateRequestDto validPayload() {
		CrmContactTaskCreateRequestDto dto = new CrmContactTaskCreateRequestDto();
		dto.setName("Follow up call");
		dto.setTypeId(taskTypeId);
		return dto;
	}

	@Test
	@DisplayName("Create task with valid payload - Returns Created with MEDIUM priority and current user as owner")
	void createContactTask_HappyPath_ReturnsCreated() throws Exception {
		MvcResult result = performCreateRequest(contactId, validPayload()).andDo(print())
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
	@DisplayName("Create task with blank name - Returns Bad Request")
	void createContactTask_BlankName_ReturnsBadRequest() throws Exception {
		CrmContactTaskCreateRequestDto dto = validPayload();
		dto.setName("   ");

		performCreateRequest(contactId, dto).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_TASK_NAME_REQUIRED)));
	}

	@Test
	@DisplayName("Create task with missing type id - Returns Bad Request")
	void createContactTask_MissingTypeId_ReturnsBadRequest() throws Exception {
		CrmContactTaskCreateRequestDto dto = validPayload();
		dto.setTypeId(null);

		performCreateRequest(contactId, dto).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_TASK_TYPE_ID_REQUIRED)));
	}

	@Test
	@DisplayName("Create task with name exceeding max length - Returns Bad Request")
	void createContactTask_NameTooLong_ReturnsBadRequest() throws Exception {
		CrmContactTaskCreateRequestDto dto = validPayload();
		dto.setName("a".repeat(256));

		performCreateRequest(contactId, dto).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_TASK_NAME_TOO_LONG)));
	}

	@Test
	@DisplayName("Create task with name at max length (255) - Returns Created")
	void createContactTask_NameAtMaxLength_ReturnsCreated() throws Exception {
		String maxLengthName = "a".repeat(255);
		CrmContactTaskCreateRequestDto dto = validPayload();
		dto.setName(maxLengthName);

		performCreateRequest(contactId, dto).andDo(print())
			.andExpect(status().isCreated())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['name']").value(maxLengthName));
	}

	@Test
	@DisplayName("Create task with missing name - Returns Bad Request")
	void createContactTask_NullName_ReturnsBadRequest() throws Exception {
		CrmContactTaskCreateRequestDto dto = validPayload();
		dto.setName(null);

		performCreateRequest(contactId, dto).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_TASK_NAME_REQUIRED)));
	}

	@Test
	@DisplayName("Create task with non-existent contact id - Returns Bad Request")
	void createContactTask_NonExistentContact_ReturnsBadRequest() throws Exception {
		performCreateRequest(999999L, validPayload()).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_CONTACT_NOT_FOUND)));
	}

	@Test
	@DisplayName("Create task for soft-deleted contact - Returns Bad Request")
	void createContactTask_SoftDeletedContact_ReturnsBadRequest() throws Exception {
		CrmContact deleted = crmContactDao.findById(contactId).orElseThrow();
		deleted.setIsDeleted(true);
		crmContactDao.save(deleted);

		performCreateRequest(contactId, validPayload()).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_CONTACT_NOT_FOUND)));
	}

	@Test
	@DisplayName("Create task with non-existent type id - Returns Internal Server Error")
	void createContactTask_NonExistentTaskType_ReturnsInternalServerError() throws Exception {
		CrmContactTaskCreateRequestDto dto = validPayload();
		dto.setTypeId(999999L);

		performCreateRequest(contactId, dto).andDo(print())
			.andExpect(status().isInternalServerError())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL));
	}

	@Test
	@DisplayName("Create task without CRM sales role - Returns Forbidden")
	void createContactTask_WithoutCrmRole_ReturnsForbidden() throws Exception {
		authToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user2@gmail.com"), 1L);

		performCreateRequest(contactId, validPayload()).andDo(print()).andExpect(status().isForbidden());
	}

}
