package com.skapp.community.crmplanner.controller.v1;

import com.jayway.jsonpath.JsonPath;
import com.skapp.community.crmplanner.model.CrmContact;
import com.skapp.community.crmplanner.model.CrmDeal;
import com.skapp.community.crmplanner.model.CrmDealStage;
import com.skapp.community.crmplanner.model.CrmTask;
import com.skapp.community.crmplanner.model.CrmTaskType;
import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.response.PageDto;
import com.skapp.community.common.repository.UserDao;
import com.skapp.community.common.security.AuthorityService;
import com.skapp.community.crmplanner.payload.request.CrmContactMetricRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmDealFilterDto;
import com.skapp.community.crmplanner.payload.request.CrmTaskFilterDto;
import com.skapp.community.crmplanner.payload.response.CrmCompanyMetricsResponseDto;
import com.skapp.community.crmplanner.payload.response.CrmContactListItemDto;
import com.skapp.community.crmplanner.payload.response.CrmDealResponseDto;
import com.skapp.community.crmplanner.service.CrmContactService;
import com.skapp.community.crmplanner.service.CrmDealService;
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
import com.skapp.TestSkappApplication;
import com.skapp.community.common.service.JwtService;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.community.crmplanner.constant.CrmMessageConstant;
import com.skapp.community.crmplanner.payload.request.CrmCompanyCreateDto;
import com.skapp.community.crmplanner.type.CrmIndustry;
import com.skapp.community.crmplanner.payload.request.CrmCompanyEditDto;
import com.skapp.support.SecurityTestUtils;

import com.skapp.community.crmplanner.model.CrmCompany;

import static org.assertj.core.api.Assertions.assertThat;

import org.openapitools.jackson.nullable.JsonNullable;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.context.transaction.TestTransaction;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.json.JsonMapper;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static com.skapp.support.TestConstants.MESSAGE_PATH;
import static com.skapp.support.TestConstants.RESULTS_0_PATH;
import static com.skapp.support.TestConstants.STATUS_PATH;
import static com.skapp.support.TestConstants.STATUS_SUCCESSFUL;
import static com.skapp.support.TestConstants.STATUS_UNSUCCESSFUL;
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
@DisplayName("CRM Company Controller Integration Tests")
class CrmCompanyControllerIntegrationTest {

	private static final String BASE_PATH = "/v1/crm/company";

	private static final String EXISTS_PATH = BASE_PATH + "/exists";

	private static final String SEARCH_BY_DOMAIN_PATH = BASE_PATH + "/search-by-domain";

	private static final String DELETE_PATH = BASE_PATH + "/{id}";

	private static final String EDIT_PATH = BASE_PATH + "/{id}";

	private final JsonMapper objectMapper;

	private final JwtService jwtService;

	private final UserDetailsService userDetailsService;

	private final MockMvc mvc;

	private final MessageUtil messageUtil;

	private final CrmCompanyDao crmCompanyDao;

	private final CrmDealDao crmDealDao;

	private final CrmDealStageDao crmDealStageDao;

	private final CrmContactDao crmContactDao;

	private final CrmTaskDao crmTaskDao;

	private final CrmTaskTypeDao crmTaskTypeDao;

	private final EmployeeDao employeeDao;

	private final CrmContactService contactService;

	private final CrmDealService dealService;

	private final AuthorityService authorityService;

	private final UserDao userDao;

	private String authToken;

	@BeforeEach
	void setup() {
		authToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user1@gmail.com"), 1L);
	}

	private ResultActions performRequest(MockHttpServletRequestBuilder request) throws Exception {
		return mvc.perform(request.with(SecurityTestUtils.bearerToken(authToken)));
	}

	private <T> ResultActions performPostRequest(T content) throws Exception {
		return performRequest(post(BASE_PATH).contentType(MediaType.APPLICATION_JSON)
			.content(objectMapper.writeValueAsString(content))
			.accept(MediaType.APPLICATION_JSON));
	}

	private ResultActions performGetExistsRequest(String name) throws Exception {
		return performRequest(get(EXISTS_PATH).param("name", name).accept(MediaType.APPLICATION_JSON));
	}

	private ResultActions performSearchByDomainRequest(String domain, int limit) throws Exception {
		return performRequest(get(SEARCH_BY_DOMAIN_PATH).param("domain", domain)
			.param("limit", String.valueOf(limit))
			.accept(MediaType.APPLICATION_JSON));
	}

	private ResultActions performDeleteRequest(Long id) throws Exception {
		return performRequest(delete(DELETE_PATH, id).accept(MediaType.APPLICATION_JSON));
	}

	private <T> ResultActions performPatchRequest(Long id, T content) throws Exception {
		return performRequest(patch(EDIT_PATH, id).contentType(MediaType.APPLICATION_JSON)
			.content(objectMapper.writeValueAsString(content))
			.accept(MediaType.APPLICATION_JSON));
	}

	private CrmCompanyCreateDto createValidPayload() {
		CrmCompanyCreateDto dto = new CrmCompanyCreateDto();
		dto.setName("Acme Corp");
		dto.setIndustry(CrmIndustry.TECHNOLOGY_INFORMATION_AND_MEDIA);
		dto.setWebsite("https://acme.com");
		dto.setAddress("123 Main St");
		dto.setContactNumber("94771234567");
		return dto;
	}

	private CrmCompanyEditDto createValidEditPayload() {
		CrmCompanyEditDto dto = new CrmCompanyEditDto();
		dto.setName("Acme Corp");
		dto.setIndustry(CrmIndustry.TECHNOLOGY_INFORMATION_AND_MEDIA);
		dto.setWebsite(JsonNullable.of("https://acme.com"));
		dto.setAddress(JsonNullable.of("123 Main St"));
		dto.setContactNumber(JsonNullable.of("94771234567"));
		return dto;
	}

	// --- Create company tests ---

	@Test
	@DisplayName("Create company with valid payload - Returns Created")
	void createCompany_HappyPath_ReturnsCreated() throws Exception {
		performPostRequest(createValidPayload()).andDo(print())
			.andExpect(status().isCreated())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['name']").value("Acme Corp"));
	}

	@Test
	@DisplayName("Create company with duplicate name - Returns Bad Request")
	void createCompany_DuplicateName_ReturnsBadRequest() throws Exception {
		performPostRequest(createValidPayload()).andExpect(status().isCreated());

		performPostRequest(createValidPayload()).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_COMPANY_EXISTS)));
	}

	@Test
	@DisplayName("Create company with whitespace-padded duplicate name - Returns Bad Request")
	void createCompany_WhitespacePaddedDuplicateName_ReturnsBadRequest() throws Exception {
		performPostRequest(createValidPayload()).andExpect(status().isCreated());

		CrmCompanyCreateDto dto = createValidPayload();
		dto.setName(" Acme Corp ");
		performPostRequest(dto).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_COMPANY_EXISTS)));
	}

	@Test
	@DisplayName("Create company with blank name - Returns Bad Request")
	void createCompany_BlankName_ReturnsBadRequest() throws Exception {
		CrmCompanyCreateDto dto = new CrmCompanyCreateDto();
		dto.setName("");

		performPostRequest(dto).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL));
	}

	// --- Check company name exists tests ---

	@Test
	@DisplayName("Check company name exists when not found - Returns OK with false")
	void checkCompanyNameExists_NotFound_ReturnsOkWithFalse() throws Exception {
		performGetExistsRequest("NonExistent").andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['isExists']").value(false));
	}

	@Test
	@DisplayName("Check company name exists when found - Returns OK with true")
	void checkCompanyNameExists_Found_ReturnsOkWithTrue() throws Exception {
		performPostRequest(createValidPayload()).andExpect(status().isCreated());

		performGetExistsRequest("Acme Corp").andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['isExists']").value(true));
	}

	// --- Delete company tests ---

	@Test
	@DisplayName("Delete already deleted company - Returns Bad Request")
	void deleteCompany_AlreadyDeleted_ReturnsBadRequest() throws Exception {
		ResultActions createResult = performPostRequest(createValidPayload()).andExpect(status().isCreated());
		Long companyId = objectMapper.readTree(createResult.andReturn().getResponse().getContentAsString())
			.path("results")
			.get(0)
			.path("id")
			.asLong();

		performDeleteRequest(companyId).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_SUCCESS_COMPANY_DELETED)));

		// ensure delete is committed for existence check
		TestTransaction.flagForCommit();
		TestTransaction.end();

		performGetExistsRequest("Acme Corp").andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['isExists']").value(false));

		performDeleteRequest(companyId).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_COMPANY_NOT_FOUND)));

		// cleanup for future tests
		crmCompanyDao.deleteById(companyId);
	}

	@Test
	@DisplayName("Delete company with associated records - Keeps contacts, deals and tasks visible")
	void deleteCompany_WithAssociatedRecords_KeepsAllAssociatedRecordsVisible() throws Exception {
		ResultActions createResult = performPostRequest(createValidPayload()).andExpect(status().isCreated());
		Long companyId = objectMapper.readTree(createResult.andReturn().getResponse().getContentAsString())
			.path("results")
			.get(0)
			.path("id")
			.asLong();

		CrmDealStage stage = new CrmDealStage();
		stage.setName("Test Stage");
		stage.setColor("#123456");
		stage.setOrderIndex(1);
		stage.setStageType(CrmDealStageType.OPEN);
		crmDealStageDao.save(stage);

		CrmContact contact = new CrmContact();
		contact.setName("Test Contact");
		contact.setEmail("deal.test@example.com");
		contact.setOwner(employeeDao.getReferenceById(1L));
		contact.setCompany(crmCompanyDao.getReferenceById(companyId));
		Long contactId = crmContactDao.save(contact).getId();

		CrmDeal deal = new CrmDeal();
		deal.setName("Test Deal");
		deal.setStage(stage);
		deal.setCompany(crmCompanyDao.getReferenceById(companyId));
		deal.setContact(contact);
		deal.setOwner(employeeDao.getReferenceById(1L));
		deal.setPriority(CrmDealPriority.MEDIUM);
		deal.setOrderIndex("a0");
		Long dealId = crmDealDao.save(deal).getId();

		CrmTaskType taskType = new CrmTaskType();
		taskType.setName("Test Task Type");
		taskType.setOrderIndex(1);
		crmTaskTypeDao.save(taskType);

		CrmTask task = new CrmTask();
		task.setName("Test Task");
		task.setType(taskType);
		task.setPriority(CrmTaskPriority.MEDIUM);
		task.setOwner(employeeDao.getReferenceById(1L));
		task.setContact(contact);
		task.setDeal(deal);
		task.setCompany(crmCompanyDao.getReferenceById(companyId));
		Long taskId = crmTaskDao.save(task).getId();

		assertThat(crmDealDao.findDeals(new CrmDealFilterDto(), null, PageRequest.of(0, 100)).getContent())
			.extracting(CrmDeal::getId)
			.contains(dealId);
		assertThat(crmContactDao.findContacts(new CrmContactMetricRequestDto(), PageRequest.of(0, 100)).getContent())
			.extracting(CrmContact::getId)
			.contains(contactId);
		assertThat(crmTaskDao.findTasks(1L, new CrmTaskFilterDto())).extracting(CrmTask::getId).contains(taskId);

		performDeleteRequest(companyId).andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_SUCCESS_COMPANY_DELETED)));

		CrmDeal remainingDeal = crmDealDao.findById(dealId).orElseThrow();
		assertThat(remainingDeal.getIsDeleted()).isFalse();
		CrmContact remainingContact = crmContactDao.findById(contactId).orElseThrow();
		assertThat(remainingContact.getIsDeleted()).isFalse();
		CrmTask remainingTask = crmTaskDao.findById(taskId).orElseThrow();
		assertThat(remainingTask.getIsDeleted()).isFalse();

		PageDto contactsPage = (PageDto) contactService.getContactMetrics(new CrmContactMetricRequestDto())
			.getResults()
			.get(0);
		@SuppressWarnings("unchecked")
		java.util.List<CrmContactListItemDto> contactItems = (java.util.List<CrmContactListItemDto>) contactsPage
			.getItems();
		assertThat(contactItems).filteredOn(c -> c.getId().equals(contactId))
			.as("contact remains visible after its company is deleted")
			.singleElement()
			.satisfies(c -> assertThat(c.getCompany()).as("deleted company is presented as blank").isNull());

		// dealService.getDeals resolves the current user, but the MockMvc delete request
		// above clears the security context, so re-establish it for this direct call
		User currentUser = userDao.findByEmail("user1@gmail.com").orElseThrow();
		SecurityTestUtils.setupSecurityContext(authorityService, currentUser);

		CrmDealFilterDto dealFilter = new CrmDealFilterDto();
		dealFilter.setSize(100);
		PageDto dealsPage = (PageDto) dealService.getDeals(dealFilter).getResults().get(0);
		@SuppressWarnings("unchecked")
		java.util.List<CrmDealResponseDto> dealItems = (java.util.List<CrmDealResponseDto>) dealsPage.getItems();
		assertThat(dealItems).filteredOn(d -> d.getId().equals(dealId))
			.as("deal remains visible after its company is deleted")
			.singleElement()
			.satisfies(d -> assertThat(d.getCompanyName()).as("deleted company is presented as blank").isNull());

		assertThat(crmTaskDao.findTasks(1L, new CrmTaskFilterDto()))
			.as("task remains visible after its company is deleted")
			.extracting(CrmTask::getId)
			.contains(taskId);

		assertThat(crmTaskDao.findTaskMetricsByContactId(contactId).getOpenTasksCount())
			.as("contact task metrics still count tasks of a deleted company")
			.isEqualTo(1L);
		assertThat(crmTaskDao.findOpenTaskSummaryByContactIds(java.util.List.of(contactId)))
			.as("open task summary still counts tasks of a deleted company")
			.extracting(s -> s.getContactId())
			.contains(contactId);
		assertThat(crmTaskDao.countTasksByDealIds(java.util.List.of(dealId)))
			.as("deal task count still counts tasks of a deleted company")
			.containsEntry(dealId, 1L);
	}

	@Test
	@DisplayName("Delete company without CRM manager role - Returns Forbidden")
	void deleteCompany_WithoutManagerRole_ReturnsForbidden() throws Exception {
		authToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user2@gmail.com"), 1L);

		performDeleteRequest(1L).andDo(print()).andExpect(status().isForbidden());
	}

	// --- Edit company tests ---

	@Test
	@DisplayName("Edit company with valid payload - Returns OK with updated data")
	void editCompany_HappyPath_ReturnsOk() throws Exception {
		ResultActions createResult = performPostRequest(createValidPayload()).andExpect(status().isCreated());
		Long companyId = objectMapper.readTree(createResult.andReturn().getResponse().getContentAsString())
			.path("results")
			.get(0)
			.path("id")
			.asLong();

		CrmCompanyEditDto editDto = new CrmCompanyEditDto();
		editDto.setName("Acme Corp Updated");
		editDto.setIndustry(CrmIndustry.FINANCIAL_SERVICES);
		editDto.setWebsite(JsonNullable.of("https://acme-updated.com"));
		editDto.setAddress(JsonNullable.of("456 New St"));
		editDto.setContactNumber(JsonNullable.of("94779876543"));

		performPatchRequest(companyId, editDto).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['name']").value("Acme Corp Updated"))
			.andExpect(jsonPath(RESULTS_0_PATH + "['industry']").value(CrmIndustry.FINANCIAL_SERVICES.name()))
			.andExpect(jsonPath(RESULTS_0_PATH + "['website']").value("https://acme-updated.com"))
			.andExpect(jsonPath(RESULTS_0_PATH + "['address']").value("456 New St"))
			.andExpect(jsonPath(RESULTS_0_PATH + "['contactNumber']").value("94779876543"));

		CrmCompany persisted = crmCompanyDao.findByIdAndIsDeletedFalse(companyId).orElseThrow();
		assertThat(persisted.getName()).isEqualTo("Acme Corp Updated");
		assertThat(persisted.getIndustry()).isEqualTo(CrmIndustry.FINANCIAL_SERVICES);
		assertThat(persisted.getWebsite()).isEqualTo("https://acme-updated.com");
		assertThat(persisted.getAddress()).isEqualTo("456 New St");
		assertThat(persisted.getContactNumber()).isEqualTo("94779876543");
	}

	@Test
	@DisplayName("Edit company with explicit null text fields - Clears them")
	void editCompany_NullTextFields_PersistsNull() throws Exception {
		ResultActions createResult = performPostRequest(createValidPayload()).andExpect(status().isCreated());
		Long companyId = objectMapper.readTree(createResult.andReturn().getResponse().getContentAsString())
			.path("results")
			.get(0)
			.path("id")
			.asLong();

		CrmCompanyEditDto editDto = new CrmCompanyEditDto();
		editDto.setWebsite(JsonNullable.of(null));
		editDto.setAddress(JsonNullable.of(null));
		editDto.setContactNumber(JsonNullable.of(null));

		performPatchRequest(companyId, editDto).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL));

		CrmCompany persisted = crmCompanyDao.findByIdAndIsDeletedFalse(companyId).orElseThrow();
		assertThat(persisted.getWebsite()).isNull();
		assertThat(persisted.getAddress()).isNull();
		assertThat(persisted.getContactNumber()).isNull();
	}

	@Test
	@DisplayName("Edit company with non-existent ID - Returns Bad Request")
	void editCompany_NonExistentId_ReturnsBadRequest() throws Exception {
		CrmCompanyEditDto editDto = createValidEditPayload();

		performPatchRequest(Long.MAX_VALUE, editDto).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_COMPANY_NOT_FOUND)));
	}

	@Test
	@DisplayName("Edit company with duplicate name of another company - Returns Bad Request")
	void editCompany_DuplicateNameOfAnotherCompany_ReturnsBadRequest() throws Exception {
		performPostRequest(createValidPayload()).andExpect(status().isCreated());

		CrmCompanyCreateDto secondCompanyDto = new CrmCompanyCreateDto();
		secondCompanyDto.setName("Beta Corp");
		secondCompanyDto.setIndustry(CrmIndustry.HOSPITALS_AND_HEALTH_CARE);
		ResultActions secondResult = performPostRequest(secondCompanyDto).andExpect(status().isCreated());
		Long secondCompanyId = objectMapper.readTree(secondResult.andReturn().getResponse().getContentAsString())
			.path("results")
			.get(0)
			.path("id")
			.asLong();

		CrmCompanyEditDto editDto = new CrmCompanyEditDto();
		editDto.setName("ACME CORP");
		editDto.setIndustry(CrmIndustry.HOSPITALS_AND_HEALTH_CARE);

		performPatchRequest(secondCompanyId, editDto).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_COMPANY_EXISTS)));
	}

	@Test
	@DisplayName("Edit company without CRM manager role - Returns Forbidden")
	void editCompany_WithoutManagerRole_ReturnsForbidden() throws Exception {
		authToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user2@gmail.com"), 1L);

		performPatchRequest(1L, createValidEditPayload()).andDo(print()).andExpect(status().isForbidden());
	}

	// --- Search companies by domain tests ---

	@Test
	@DisplayName("Search companies by domain with matching website - Returns OK with company")
	void searchCompaniesByDomain_HappyPath_ReturnsMatchingCompany() throws Exception {
		performPostRequest(createValidPayload()).andExpect(status().isCreated());

		performSearchByDomainRequest("acme.com", 10).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['companies'][0]['name']").value("Acme Corp"));
	}

	@Test
	@DisplayName("Search companies by domain with blank domain - Returns Bad Request")
	void searchCompaniesByDomain_BlankDomain_ReturnsBadRequest() throws Exception {
		performSearchByDomainRequest("   ", 10).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_DOMAIN_REQUIRED)));
	}

	@Test
	@DisplayName("Search companies by domain without CRM role - Returns Forbidden")
	void searchCompaniesByDomain_WithoutCrmRole_ReturnsForbidden() throws Exception {
		authToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user2@gmail.com"), 1L);

		performSearchByDomainRequest("acme.com", 10).andDo(print()).andExpect(status().isForbidden());
	}

	// --- Company metrics tests ---

	@Test
	@DisplayName("Company metrics classify WON and LOST as closed - open metrics exclude both")
	void getCompanyMetrics_ClassifiesWonAndLostAsClosed() {
		CrmCompany company = createMetricsCompany("metrics classification co");
		CrmContact contact = createMetricsContact(company, "metrics.classification@example.com");

		CrmDealStage initialStage = createStage("Metrics Initial Stage", CrmDealStageType.INITIAL, 1);
		CrmDealStage openStage = createStage("Metrics Open Stage", CrmDealStageType.OPEN, 2);
		CrmDealStage wonStage = createStage("Metrics Won Stage", CrmDealStageType.WON, 3);
		CrmDealStage lostStage = createStage("Metrics Lost Stage", CrmDealStageType.LOST, 4);

		createDeal("Initial Deal", company, contact, initialStage, "100", false);
		createDeal("Open Deal", company, contact, openStage, "200", false);
		createDeal("Won Deal", company, contact, wonStage, "400", false);
		createDeal("Lost Deal", company, contact, lostStage, "800", false);
		// soft-deleted open deal must be ignored by every metric
		createDeal("Deleted Open Deal", company, contact, openStage, "9999", true);

		CrmCompanyMetricsResponseDto metrics = fetchMetrics(company.getId(), "metrics classification co");

		assertThat(new BigDecimal(metrics.getOpenValue()))
			.as("open value sums INITIAL + OPEN deals only; WON and LOST are excluded")
			.isEqualByComparingTo("300");
		assertThat(new BigDecimal(metrics.getAccountValue())).as("account value sums WON deals only")
			.isEqualByComparingTo("400");
		assertThat(metrics.getClosedDeals()).as("closed deals counts WON deals only").isEqualTo(1L);
		assertThat(metrics.getOpenDeals()).as("open deals counts INITIAL + OPEN deals only; WON and LOST are excluded")
			.isEqualTo(2L);
	}

	@Test
	@DisplayName("Company metrics for a LOST-only company - reports zero open and zero closed")
	void getCompanyMetrics_LostOnlyCompany_ReportsZeroOpenAndZeroClosed() {
		CrmCompany company = createMetricsCompany("metrics lost only co");
		CrmContact contact = createMetricsContact(company, "metrics.lostonly@example.com");

		CrmDealStage lostStage = createStage("Lost Only Stage", CrmDealStageType.LOST, 1);
		createDeal("Lost Deal One", company, contact, lostStage, "500", false);
		createDeal("Lost Deal Two", company, contact, lostStage, "700", false);

		CrmCompanyMetricsResponseDto metrics = fetchMetrics(company.getId(), "metrics lost only co");

		assertThat(new BigDecimal(metrics.getOpenValue())).as("LOST deals are not open, so open value is zero")
			.isEqualByComparingTo("0");
		assertThat(new BigDecimal(metrics.getAccountValue())).as("LOST deals are not WON, so account value is zero")
			.isEqualByComparingTo("0");
		assertThat(metrics.getClosedDeals()).as("LOST deals are not WON, so closed deal count is zero").isEqualTo(0L);
		assertThat(metrics.getOpenDeals()).as("LOST deals are not open, so open deal count is zero").isEqualTo(0L);
	}

	@Test
	@DisplayName("Company metrics search ranks exact match, then prefix match, then contains match")
	void getCompanyMetrics_RanksByRelevance() {
		createMetricsCompany("Global Rankacme Partners");
		createMetricsCompany("Rankacme Corp");
		createMetricsCompany("Rankacme");

		List<CrmCompanyMetricsResponseDto> metrics = crmCompanyDao.getCompanyMetrics(PageRequest.of(0, 100), "rankacme")
			.getContent();

		assertThat(metrics).extracting(CrmCompanyMetricsResponseDto::getName)
			.as("exact match first, then prefix match, then contains match")
			.containsExactly("Rankacme", "Rankacme Corp", "Global Rankacme Partners");
	}

	private CrmCompanyMetricsResponseDto fetchMetrics(Long companyId, String searchKeyword) {
		List<CrmCompanyMetricsResponseDto> metrics = crmCompanyDao
			.getCompanyMetrics(PageRequest.of(0, 100), searchKeyword)
			.getContent();

		return metrics.stream()
			.filter(m -> m.getId().equals(companyId))
			.findFirst()
			.orElseThrow(() -> new AssertionError("Metrics not found for company " + companyId));
	}

	private CrmCompany createMetricsCompany(String name) {
		CrmCompany company = new CrmCompany();
		company.setName(name);
		company.setIndustry(CrmIndustry.TECHNOLOGY_INFORMATION_AND_MEDIA);
		return crmCompanyDao.save(company);
	}

	private CrmContact createMetricsContact(CrmCompany company, String email) {
		CrmContact contact = new CrmContact();
		contact.setName("Metrics Contact");
		contact.setEmail(email);
		contact.setOwner(employeeDao.getReferenceById(1L));
		contact.setCompany(company);
		return crmContactDao.save(contact);
	}

	private CrmDealStage createStage(String name, CrmDealStageType stageType, int orderIndex) {
		CrmDealStage stage = new CrmDealStage();
		stage.setName(name);
		stage.setColor("#123456");
		stage.setOrderIndex(orderIndex);
		stage.setStageType(stageType);
		return crmDealStageDao.save(stage);
	}

	private CrmDeal createDeal(String name, CrmCompany company, CrmContact contact, CrmDealStage stage, String amount,
			boolean deleted) {
		CrmDeal deal = new CrmDeal();
		deal.setName(name);
		deal.setStage(stage);
		deal.setCompany(company);
		deal.setContact(contact);
		deal.setOwner(employeeDao.getReferenceById(1L));
		deal.setPriority(CrmDealPriority.MEDIUM);
		deal.setOrderIndex("a" + orderIndexCounter++);
		deal.setAmount(amount);
		deal.setIsDeleted(deleted);
		return crmDealDao.save(deal);
	}

	private int orderIndexCounter = 0;

	private void createCompanyTask(Long companyId, LocalDateTime dueAt) {
		CrmTaskType taskType = new CrmTaskType();
		taskType.setName("Metrics Task Type");
		taskType.setOrderIndex(1);
		crmTaskTypeDao.save(taskType);

		CrmTask task = new CrmTask();
		task.setName("Metrics Task");
		task.setType(taskType);
		task.setPriority(CrmTaskPriority.MEDIUM);
		task.setOwner(employeeDao.getReferenceById(1L));
		task.setCompany(crmCompanyDao.getReferenceById(companyId));
		task.setDueAt(dueAt);
		crmTaskDao.save(task);
	}

	// --- getCompanyMetricsById ---

	@Test
	@DisplayName("Get company metrics by ID - Returns aggregated deal and task metrics")
	void getCompanyMetricsById_HappyPath_ReturnsMetrics() throws Exception {
		CrmCompany company = createMetricsCompany("MetricsByIdCo");
		CrmContact contact = createMetricsContact(company, "metrics.byid@example.com");
		CrmDealStage openStage = createStage("Open Stage", CrmDealStageType.OPEN, 1);
		CrmDealStage wonStage = createStage("Won Stage", CrmDealStageType.WON, 2);
		createDeal("Open Deal", company, contact, openStage, "200", false);
		createDeal("Won Deal", company, contact, wonStage, "400", false);
		createCompanyTask(company.getId(), LocalDateTime.now().plusDays(5));
		createCompanyTask(company.getId(), LocalDateTime.now().minusDays(1));

		String content = performRequest(
				get(BASE_PATH + "/" + company.getId() + "/metrics").accept(MediaType.APPLICATION_JSON))
			.andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['openDeals']").value(1))
			.andExpect(jsonPath(RESULTS_0_PATH + "['closedDeals']").value(1))
			.andExpect(jsonPath(RESULTS_0_PATH + "['openTasksCount']").value(2))
			.andExpect(jsonPath(RESULTS_0_PATH + "['overdue']").value(1))
			.andReturn()
			.getResponse()
			.getContentAsString();

		String openValue = JsonPath.read(content, "$.results[0].openValue");
		String accountValue = JsonPath.read(content, "$.results[0].accountValue");
		assertThat(new BigDecimal(openValue)).as("open value sums non-closed deals").isEqualByComparingTo("200");
		assertThat(new BigDecimal(accountValue)).as("account value sums WON deals").isEqualByComparingTo("400");
	}

	@Test
	@DisplayName("Get company metrics by ID with no deals or tasks - Returns zero metrics")
	void getCompanyMetricsById_NoActivity_ReturnsZeroMetrics() throws Exception {
		CrmCompany company = createMetricsCompany("EmptyMetricsCo");

		performRequest(get(BASE_PATH + "/" + company.getId() + "/metrics").accept(MediaType.APPLICATION_JSON))
			.andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['openDeals']").value(0))
			.andExpect(jsonPath(RESULTS_0_PATH + "['closedDeals']").value(0))
			.andExpect(jsonPath(RESULTS_0_PATH + "['openTasksCount']").value(0))
			.andExpect(jsonPath(RESULTS_0_PATH + "['overdue']").value(0))
			.andExpect(jsonPath(RESULTS_0_PATH + "['openValue']").value("0"))
			.andExpect(jsonPath(RESULTS_0_PATH + "['accountValue']").value("0"));
	}

	@Test
	@DisplayName("Get company metrics by ID that does not exist - Returns Bad Request")
	void getCompanyMetricsById_NotFound_ReturnsBadRequest() throws Exception {
		performRequest(get(BASE_PATH + "/999999/metrics").accept(MediaType.APPLICATION_JSON)).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL));
	}

	@Test
	@DisplayName("Get company metrics by ID for a soft-deleted company - Returns Bad Request")
	void getCompanyMetricsById_SoftDeleted_ReturnsBadRequest() throws Exception {
		CrmCompany company = createMetricsCompany("DeletedMetricsCo");
		company.setIsDeleted(true);
		crmCompanyDao.save(company);

		performRequest(get(BASE_PATH + "/" + company.getId() + "/metrics").accept(MediaType.APPLICATION_JSON))
			.andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL));
	}

	@Test
	@DisplayName("Get company metrics by ID without CRM role - Returns Forbidden")
	void getCompanyMetricsById_WithoutCrmRole_ReturnsForbidden() throws Exception {
		CrmCompany company = createMetricsCompany("ForbiddenMetricsCo");
		authToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user2@gmail.com"), 1L);

		performRequest(get(BASE_PATH + "/" + company.getId() + "/metrics").accept(MediaType.APPLICATION_JSON))
			.andDo(print())
			.andExpect(status().isForbidden());
	}

}
