package com.skapp.community.crmplanner.controller.v2;

import com.jayway.jsonpath.JsonPath;
import com.skapp.TestSkappApplication;
import com.skapp.community.common.service.JwtService;
import com.skapp.community.crmplanner.model.CrmCompany;
import com.skapp.community.crmplanner.model.CrmContact;
import com.skapp.community.crmplanner.model.CrmDeal;
import com.skapp.community.crmplanner.model.CrmDealStage;
import com.skapp.community.crmplanner.model.CrmTask;
import com.skapp.community.crmplanner.model.CrmTaskType;
import com.skapp.community.crmplanner.payload.request.CrmContactCreateRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmContactEditRequestDto;
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
import com.skapp.support.SecurityTestUtils;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.openapitools.jackson.nullable.JsonNullable;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.json.JsonMapper;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static com.skapp.support.TestConstants.RESULTS_0_PATH;
import static com.skapp.support.TestConstants.STATUS_PATH;
import static com.skapp.support.TestConstants.STATUS_SUCCESSFUL;
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
@DisplayName("CRM Contact Controller V2 Integration Tests")
class CrmContactControllerV2IntegrationTest {

	private static final String BASE_PATH = "/v2/crm/contact";

	private static final String BY_ID_PATH = BASE_PATH + "/{id}";

	private static final String METRICS_PATH = BASE_PATH;

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

	private String authToken;

	@BeforeEach
	void setup() {
		authToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user1@gmail.com"), 1L);
	}

	private ResultActions performRequest(MockHttpServletRequestBuilder request, String token) throws Exception {
		return mvc.perform(request.with(SecurityTestUtils.bearerToken(token)));
	}

	private ResultActions performRequest(MockHttpServletRequestBuilder request) throws Exception {
		return performRequest(request, authToken);
	}

	private <T> ResultActions performPostRequest(T content) throws Exception {
		return performRequest(post(BASE_PATH).contentType(MediaType.APPLICATION_JSON)
			.content(objectMapper.writeValueAsString(content))
			.accept(MediaType.APPLICATION_JSON));
	}

	private <T> ResultActions performPatchRequest(Long id, T content) throws Exception {
		return performRequest(patch(BY_ID_PATH, id).contentType(MediaType.APPLICATION_JSON)
			.content(objectMapper.writeValueAsString(content))
			.accept(MediaType.APPLICATION_JSON));
	}

	private ResultActions performGetByIdRequest(Long id) throws Exception {
		return performRequest(get(BY_ID_PATH, id).accept(MediaType.APPLICATION_JSON));
	}

	private ResultActions performGetMetricsRequest(String searchKeyword) throws Exception {
		return performRequest(
				get(METRICS_PATH).param("searchKeyword", searchKeyword).accept(MediaType.APPLICATION_JSON));
	}

	private CrmCompany savedCompany(String name) {
		CrmCompany company = new CrmCompany();
		company.setName(name);
		company.setIndustry(CrmIndustry.TECHNOLOGY_INFORMATION_AND_MEDIA);
		company.setWebsite("https://contact-v2.com");
		company.setAddress("42 Contact Ave");
		company.setContactNumber("94770000000");
		return crmCompanyDao.save(company);
	}

	private CrmContact savedContact(Long companyId, String email) {
		return savedContact(companyId, "Test Contact", email);
	}

	private CrmContact savedContact(Long companyId, String name, String email) {
		CrmContact contact = new CrmContact();
		contact.setName(name);
		contact.setEmail(email);
		contact.setCompany(crmCompanyDao.getReferenceById(companyId));
		contact.setOwner(employeeDao.getReferenceById(1L));
		return crmContactDao.save(contact);
	}

	private CrmDealStage savedStage(String name, CrmDealStageType stageType, int orderIndex) {
		CrmDealStage stage = new CrmDealStage();
		stage.setName(name);
		stage.setColor("#123456");
		stage.setOrderIndex(orderIndex);
		stage.setStageType(stageType);
		return crmDealStageDao.save(stage);
	}

	private void savedDeal(CrmContact contact, CrmDealStage stage, String amount, String orderIndex) {
		CrmDeal deal = new CrmDeal();
		deal.setName("V2 Contact Deal");
		deal.setStage(stage);
		deal.setCompany(contact.getCompany());
		deal.setContact(contact);
		deal.setOwner(employeeDao.getReferenceById(1L));
		deal.setPriority(CrmDealPriority.MEDIUM);
		deal.setOrderIndex(orderIndex);
		deal.setAmount(amount);
		crmDealDao.save(deal);
	}

	private void savedTask(CrmContact contact, LocalDateTime dueAt) {
		CrmTaskType taskType = new CrmTaskType();
		taskType.setName("V2 Task Type");
		taskType.setOrderIndex(1);
		crmTaskTypeDao.save(taskType);

		CrmTask task = new CrmTask();
		task.setName("V2 Contact Task");
		task.setType(taskType);
		task.setPriority(CrmTaskPriority.MEDIUM);
		task.setOwner(employeeDao.getReferenceById(1L));
		task.setContact(contact);
		task.setDueAt(dueAt);
		crmTaskDao.save(task);
	}

	private CrmContactCreateRequestDto createValidPayload(Long companyId) {
		CrmContactCreateRequestDto dto = new CrmContactCreateRequestDto();
		dto.setName("Jane Smith");
		dto.setEmail("jane.smith.v2@example.com");
		dto.setCompanyId(companyId);
		dto.setContactNumber("94771234567");
		dto.setOwnerId(1L);
		return dto;
	}

	private CrmContactEditRequestDto editValidPayload(Long companyId) {
		CrmContactEditRequestDto dto = new CrmContactEditRequestDto();
		dto.setName("Jane Smith Updated");
		dto.setEmail("jane.smith.updated.v2@example.com");
		dto.setCompanyId(JsonNullable.of(companyId));
		dto.setContactNumber("94779999999");
		dto.setOwnerId(1L);
		return dto;
	}

	// --- createContact ---

	@Test
	@DisplayName("Create contact - Returns Created with base contact carrying full company and owner without email")
	void createContact_HappyPath_ReturnsBaseContactWithFullCompanyAndOwner() throws Exception {
		Long companyId = savedCompany("Contact V2 Corp").getId();

		performPostRequest(createValidPayload(companyId)).andDo(print())
			.andExpect(status().isCreated())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['name']").value("Jane Smith"))
			.andExpect(jsonPath(RESULTS_0_PATH + "['email']").value("jane.smith.v2@example.com"))
			.andExpect(jsonPath(RESULTS_0_PATH + "['company']['id']").value(companyId))
			.andExpect(jsonPath(RESULTS_0_PATH + "['company']['name']").value("Contact V2 Corp"))
			.andExpect(jsonPath(RESULTS_0_PATH + "['company']['industry']")
				.value(CrmIndustry.TECHNOLOGY_INFORMATION_AND_MEDIA.name()))
			.andExpect(jsonPath(RESULTS_0_PATH + "['company']['website']").value("https://contact-v2.com"))
			.andExpect(jsonPath(RESULTS_0_PATH + "['company']['address']").value("42 Contact Ave"))
			.andExpect(jsonPath(RESULTS_0_PATH + "['owner']['employeeId']").value(1))
			.andExpect(jsonPath(RESULTS_0_PATH + "['owner']['email']").doesNotExist());
	}

	@Test
	@DisplayName("Create contact without CRM role - Returns Forbidden")
	void createContact_WithoutCrmRole_ReturnsForbidden() throws Exception {
		Long companyId = savedCompany("Forbidden Contact Corp").getId();
		String noRoleToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user2@gmail.com"),
				1L);

		performRequest(post(BASE_PATH).contentType(MediaType.APPLICATION_JSON)
			.content(objectMapper.writeValueAsString(createValidPayload(companyId)))
			.accept(MediaType.APPLICATION_JSON), noRoleToken).andDo(print()).andExpect(status().isForbidden());
	}

	// --- getContactById ---

	@Test
	@DisplayName("Get contact by ID - Returns base contact with no metrics")
	void getContactById_HappyPath_ReturnsBaseContactWithoutMetrics() throws Exception {
		Long companyId = savedCompany("Detail V2 Corp").getId();
		Long contactId = savedContact(companyId, "detail.v2@example.com").getId();

		performGetByIdRequest(contactId).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['id']").value(contactId))
			.andExpect(jsonPath(RESULTS_0_PATH + "['name']").value("Test Contact"))
			.andExpect(jsonPath(RESULTS_0_PATH + "['email']").value("detail.v2@example.com"))
			.andExpect(jsonPath(RESULTS_0_PATH + "['company']['id']").value(companyId))
			.andExpect(jsonPath(RESULTS_0_PATH + "['metrics']").doesNotExist())
			.andExpect(jsonPath(RESULTS_0_PATH + "['totalRevenue']").doesNotExist());
	}

	@Test
	@DisplayName("Get contact by ID that does not exist - Returns Bad Request")
	void getContactById_NotFound_ReturnsBadRequest() throws Exception {
		performGetByIdRequest(999999L).andDo(print()).andExpect(status().isBadRequest());
	}

	@Test
	@DisplayName("Get contact by ID without CRM role - Returns Forbidden")
	void getContactById_WithoutCrmRole_ReturnsForbidden() throws Exception {
		Long companyId = savedCompany("Forbidden Detail V2 Corp").getId();
		Long contactId = savedContact(companyId, "forbidden.detail.v2@example.com").getId();
		String noRoleToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user2@gmail.com"),
				1L);

		performRequest(get(BY_ID_PATH, contactId).accept(MediaType.APPLICATION_JSON), noRoleToken).andDo(print())
			.andExpect(status().isForbidden());
	}

	// --- getContactMetrics ---

	@Test
	@DisplayName("Get contact metrics - Returns page with flat contact fields and zero metrics when no deals or tasks")
	void getContactMetrics_WithContacts_ReturnsNestedContactAndMetrics() throws Exception {
		Long companyId = savedCompany("Metrics V2 Corp").getId();
		Long contactId = savedContact(companyId, "ZeroMetricsContactV2Unique", "metrics.contact.v2@example.com")
			.getId();

		performGetMetricsRequest("ZeroMetricsContactV2Unique").andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath("['results'][0]['totalItems']").value(1))
			.andExpect(jsonPath("['results'][0]['items'][0]['id']").value(contactId))
			.andExpect(jsonPath("['results'][0]['items'][0]['name']").value("ZeroMetricsContactV2Unique"))
			.andExpect(jsonPath("['results'][0]['items'][0]['company']['id']").value(companyId))
			.andExpect(jsonPath("['results'][0]['items'][0]['metrics']['closedDealValue']").value("0"))
			.andExpect(jsonPath("['results'][0]['items'][0]['metrics']['closedDealCount']").value(0))
			.andExpect(jsonPath("['results'][0]['items'][0]['metrics']['openTasksCount']").value(0))
			.andExpect(jsonPath("['results'][0]['items'][0]['metrics']['overdueTasksCount']").value(0));
	}

	@Test
	@DisplayName("Get contact metrics - Aggregates won-deal value/count and open/overdue task counts")
	void getContactMetrics_WithDealsAndTasks_ReturnsAggregatedMetrics() throws Exception {
		Long companyId = savedCompany("Aggregate V2 Corp").getId();
		CrmContact contact = savedContact(companyId, "AggMetricsContactV2Unique", "agg.contact.v2@example.com");

		CrmDealStage openStage = savedStage("V2 Open Stage", CrmDealStageType.OPEN, 1);
		CrmDealStage wonStage = savedStage("V2 Won Stage", CrmDealStageType.WON, 2);
		savedDeal(contact, openStage, "150", "a0");
		savedDeal(contact, wonStage, "400", "a1");
		savedDeal(contact, wonStage, "600", "a2");

		savedTask(contact, LocalDateTime.now().plusDays(3));
		savedTask(contact, LocalDateTime.now().minusDays(2));

		String content = performGetMetricsRequest("AggMetricsContactV2Unique").andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath("['results'][0]['totalItems']").value(1))
			.andExpect(jsonPath("['results'][0]['items'][0]['metrics']['closedDealCount']").value(2))
			.andExpect(jsonPath("['results'][0]['items'][0]['metrics']['openTasksCount']").value(2))
			.andExpect(jsonPath("['results'][0]['items'][0]['metrics']['overdueTasksCount']").value(1))
			.andReturn()
			.getResponse()
			.getContentAsString();

		String closedDealValue = JsonPath.read(content, "$.results[0].items[0].metrics.closedDealValue");
		assertThat(new BigDecimal(closedDealValue)).as("closed deal value sums WON deals only")
			.isEqualByComparingTo("1000");
	}

	@Test
	@DisplayName("Get contact metrics - Company-less contact is returned")
	void getContactMetrics_ContactWithoutCompany_IsReturned() throws Exception {
		CrmContact contact = new CrmContact();
		contact.setName("NoCompanyContactV2Unique");
		contact.setEmail("nocompany.v2@example.com");
		contact.setOwner(employeeDao.getReferenceById(1L));
		crmContactDao.save(contact);

		performGetMetricsRequest("NoCompanyContactV2Unique").andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath("['results'][0]['totalItems']").value(1))
			.andExpect(jsonPath("['results'][0]['items'][0]['name']").value("NoCompanyContactV2Unique"));
	}

	@Test
	@DisplayName("Get contact metrics without CRM role - Returns Forbidden")
	void getContactMetrics_WithoutCrmRole_ReturnsForbidden() throws Exception {
		String noRoleToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user2@gmail.com"),
				1L);

		performRequest(get(METRICS_PATH).accept(MediaType.APPLICATION_JSON), noRoleToken).andDo(print())
			.andExpect(status().isForbidden());
	}

	// --- editContact ---

	@Test
	@DisplayName("Edit contact - Returns OK with updated base contact")
	void editContact_HappyPath_ReturnsUpdatedContact() throws Exception {
		Long companyId = savedCompany("Edit V2 Corp").getId();
		Long contactId = savedContact(companyId, "edit.original.v2@example.com").getId();

		performPatchRequest(contactId, editValidPayload(companyId)).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['name']").value("Jane Smith Updated"))
			.andExpect(jsonPath(RESULTS_0_PATH + "['email']").value("jane.smith.updated.v2@example.com"))
			.andExpect(jsonPath(RESULTS_0_PATH + "['company']['id']").value(companyId));
	}

	@Test
	@DisplayName("Edit contact that does not exist - Returns Bad Request")
	void editContact_NotFound_ReturnsBadRequest() throws Exception {
		Long companyId = savedCompany("Missing Edit V2 Corp").getId();

		performPatchRequest(999999L, editValidPayload(companyId)).andDo(print()).andExpect(status().isBadRequest());
	}

	@Test
	@DisplayName("Edit contact without CRM role - Returns Forbidden")
	void editContact_WithoutCrmRole_ReturnsForbidden() throws Exception {
		Long companyId = savedCompany("Forbidden Edit V2 Corp").getId();
		Long contactId = savedContact(companyId, "forbidden.edit.v2@example.com").getId();
		String noRoleToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user2@gmail.com"),
				1L);

		performRequest(patch(BY_ID_PATH, contactId).contentType(MediaType.APPLICATION_JSON)
			.content(objectMapper.writeValueAsString(editValidPayload(companyId)))
			.accept(MediaType.APPLICATION_JSON), noRoleToken).andDo(print()).andExpect(status().isForbidden());
	}

}
