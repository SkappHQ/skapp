package com.skapp.community.crmplanner.controller.v1;

import com.skapp.community.crmplanner.model.CrmContact;
import com.skapp.community.crmplanner.model.CrmDeal;
import com.skapp.community.crmplanner.model.CrmDealStage;
import com.skapp.community.crmplanner.repository.CrmCompanyDao;
import com.skapp.community.crmplanner.repository.CrmContactDao;
import com.skapp.community.crmplanner.repository.CrmDealDao;
import com.skapp.community.crmplanner.repository.CrmDealStageDao;
import com.skapp.community.crmplanner.type.CrmDealPriority;
import com.skapp.community.crmplanner.type.CrmDealStageType;
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
import static org.junit.Assert.assertTrue;

import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.context.transaction.TestTransaction;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.json.JsonMapper;

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

	private final EmployeeDao employeeDao;

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
		dto.setWebsite("https://acme.com");
		dto.setAddress("123 Main St");
		dto.setContactNumber("94771234567");
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
	@DisplayName("Delete company with associated deals - Soft deletes all linked deals")
	void deleteCompany_WithAssociatedDeals_SoftDeletesDeals() throws Exception {
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
		crmContactDao.save(contact);

		CrmDeal deal = new CrmDeal();
		deal.setName("Test Deal");
		deal.setStage(stage);
		deal.setCompany(crmCompanyDao.getReferenceById(companyId));
		deal.setContact(contact);
		deal.setOwner(employeeDao.getReferenceById(1L));
		deal.setPriority(CrmDealPriority.MEDIUM);
		Long dealId = crmDealDao.save(deal).getId();

		performDeleteRequest(companyId).andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_SUCCESS_COMPANY_DELETED)));

		CrmDeal deletedDeal = crmDealDao.findById(dealId).orElseThrow();
		assertTrue(deletedDeal.getIsDeleted());
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
		editDto.setWebsite("https://acme-updated.com");
		editDto.setAddress("456 New St");
		editDto.setContactNumber("94779876543");

		performPatchRequest(companyId, editDto).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['name']").value("Acme Corp Updated"))
			.andExpect(jsonPath(RESULTS_0_PATH + "['industry']").value("FINANCIAL_SERVICES"))
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

}
