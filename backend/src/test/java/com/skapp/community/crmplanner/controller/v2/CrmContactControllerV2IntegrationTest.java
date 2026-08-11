package com.skapp.community.crmplanner.controller.v2;

import com.skapp.TestSkappApplication;
import com.skapp.community.common.service.JwtService;
import com.skapp.community.crmplanner.model.CrmCompany;
import com.skapp.community.crmplanner.model.CrmContact;
import com.skapp.community.crmplanner.payload.request.CrmContactCreateRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmContactEditRequestDto;
import com.skapp.community.crmplanner.repository.CrmCompanyDao;
import com.skapp.community.crmplanner.repository.CrmContactDao;
import com.skapp.community.crmplanner.type.CrmIndustry;
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

	private ResultActions performGetMetricsRequest() throws Exception {
		return performRequest(get(METRICS_PATH).accept(MediaType.APPLICATION_JSON));
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
		CrmContact contact = new CrmContact();
		contact.setName("Test Contact");
		contact.setEmail(email);
		contact.setCompany(crmCompanyDao.getReferenceById(companyId));
		contact.setOwner(employeeDao.getReferenceById(1L));
		return crmContactDao.save(contact);
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

	// --- getContactMetrics ---

	@Test
	@DisplayName("Get contact metrics - Returns page with nested contact and metrics")
	void getContactMetrics_WithContacts_ReturnsNestedContactAndMetrics() throws Exception {
		Long companyId = savedCompany("Metrics V2 Corp").getId();
		Long contactId = savedContact(companyId, "metrics.contact.v2@example.com").getId();

		performGetMetricsRequest().andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath("['results'][0]['totalItems']").value(1))
			.andExpect(jsonPath("['results'][0]['items'][0]['contact']['id']").value(contactId))
			.andExpect(jsonPath("['results'][0]['items'][0]['contact']['name']").value("Test Contact"))
			.andExpect(jsonPath("['results'][0]['items'][0]['contact']['company']['id']").value(companyId))
			.andExpect(jsonPath("['results'][0]['items'][0]['metrics']['closedDealValue']").value("0"))
			.andExpect(jsonPath("['results'][0]['items'][0]['metrics']['closedDealCount']").value(0))
			.andExpect(jsonPath("['results'][0]['items'][0]['metrics']['openTasksCount']").value(0))
			.andExpect(jsonPath("['results'][0]['items'][0]['metrics']['overdueTasksCount']").value(0));
	}

	@Test
	@DisplayName("Get contact metrics - Company-less contact returns null company, not an empty object")
	void getContactMetrics_ContactWithoutCompany_ReturnsNullCompany() throws Exception {
		CrmContact contact = new CrmContact();
		contact.setName("No Company Contact");
		contact.setEmail("nocompany.v2@example.com");
		contact.setOwner(employeeDao.getReferenceById(1L));
		crmContactDao.save(contact);

		performGetMetricsRequest().andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath("['results'][0]['items'][0]['contact']['name']").value("No Company Contact"))
			.andExpect(jsonPath("['results'][0]['items'][0]['contact']['company']").doesNotExist());
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

}
