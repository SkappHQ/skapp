package com.skapp.community.crmplanner.controller.v1;

import com.skapp.community.common.service.JwtService;
import com.skapp.community.common.type.Role;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.community.crmplanner.constant.CrmMessageConstant;
import com.skapp.community.crmplanner.model.CrmCompany;
import com.skapp.community.crmplanner.model.CrmContact;
import com.skapp.community.crmplanner.model.CrmDeal;
import com.skapp.community.crmplanner.model.CrmDealStage;
import com.skapp.community.crmplanner.payload.request.CrmDealCreateRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmDealEditRequestDto;
import com.skapp.community.crmplanner.repository.CrmCompanyDao;
import com.skapp.community.crmplanner.repository.CrmContactDao;
import com.skapp.community.crmplanner.repository.CrmDealDao;
import com.skapp.community.crmplanner.repository.CrmDealStageDao;
import com.skapp.community.crmplanner.type.CrmDealPriority;
import com.skapp.community.crmplanner.type.CrmDealStageType;
import com.skapp.community.peopleplanner.repository.EmployeeDao;
import com.skapp.community.peopleplanner.repository.EmployeeRoleDao;
import com.skapp.support.SecurityTestUtils;
import com.skapp.TestSkappApplication;
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
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.json.JsonMapper;

import static com.skapp.support.TestConstants.RESULTS_0_PATH;
import static com.skapp.support.TestConstants.STATUS_PATH;
import static com.skapp.support.TestConstants.STATUS_SUCCESSFUL;
import static com.skapp.support.TestConstants.STATUS_UNSUCCESSFUL;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = TestSkappApplication.class)
@AutoConfigureMockMvc
@Transactional
@RequiredArgsConstructor
@DisplayName("CRM Deal Controller Integration Tests")
class CrmDealControllerIntegrationTest {

	private static final String BASE_PATH = "/v1/crm/deal";

	private final MockMvc mvc;

	private final JwtService jwtService;

	private final UserDetailsService userDetailsService;

	private final JsonMapper objectMapper;

	private final CrmCompanyDao crmCompanyDao;

	private final CrmContactDao crmContactDao;

	private final CrmDealStageDao crmDealStageDao;

	private final CrmDealDao crmDealDao;

	private final EmployeeDao employeeDao;

	private final EmployeeRoleDao employeeRoleDao;

	private final MessageUtil messageUtil;

	private String authToken;

	@BeforeEach
	void setup() {
		// user1 has CRM_ADMIN role (which grants access to CRM_SALES_REPRESENTATIVE
		// endpoints via role hierarchy) and is a valid deal owner
		authToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user1@gmail.com"), 1L);
	}

	private ResultActions performRequest(MockHttpServletRequestBuilder request) throws Exception {
		return mvc.perform(request.with(SecurityTestUtils.bearerToken(authToken)));
	}

	private ResultActions performPostRequest(CrmDealCreateRequestDto dto) throws Exception {
		return performRequest(post(BASE_PATH).contentType(MediaType.APPLICATION_JSON)
			.content(objectMapper.writeValueAsString(dto))
			.accept(MediaType.APPLICATION_JSON));
	}

	private ResultActions performPatchRequest(Long id, CrmDealEditRequestDto dto) throws Exception {
		return performRequest(patch(BASE_PATH + "/" + id).contentType(MediaType.APPLICATION_JSON)
			.content(objectMapper.writeValueAsString(dto))
			.accept(MediaType.APPLICATION_JSON));
	}

	private CrmDealStage savedStage() {
		CrmDealStage stage = new CrmDealStage();
		stage.setName("Test Stage");
		stage.setColor("#AABBCC");
		stage.setOrderIndex(1);
		stage.setStageType(CrmDealStageType.OPEN);
		return crmDealStageDao.save(stage);
	}

	private CrmCompany savedCompany(String name) {
		CrmCompany company = new CrmCompany();
		company.setName(name);
		return crmCompanyDao.save(company);
	}

	private CrmContact savedContact(CrmCompany company) {
		CrmContact contact = new CrmContact();
		contact.setName("Deal Test Contact");
		contact.setEmail("deal.contact@example.com");
		contact.setCompany(company);
		contact.setOwner(employeeDao.getReferenceById(1L));
		return crmContactDao.save(contact);
	}

	private CrmDeal savedDeal(CrmDealStage stage, CrmContact contact) {
		CrmDeal deal = new CrmDeal();
		deal.setName("Original Deal");
		deal.setStage(stage);
		deal.setContact(contact);
		deal.setOwner(employeeDao.getReferenceById(1L));
		deal.setPriority(CrmDealPriority.MEDIUM);
		deal.setOrderIndex("a0");
		return crmDealDao.save(deal);
	}

	private CrmDealCreateRequestDto validPayload(Long stageId, Long contactId) {
		CrmDealCreateRequestDto dto = new CrmDealCreateRequestDto();
		dto.setName("Test Deal");
		dto.setPriority(CrmDealPriority.MEDIUM);
		dto.setStageId(stageId);
		dto.setContactId(contactId);
		dto.setOwnerId(1L);
		return dto;
	}

	@Test
	@DisplayName("Create deal with contact linked to active company - company is set on deal")
	void createDeal_ContactWithActiveCompany_DealCreatedWithCompany() throws Exception {
		CrmDealStage stage = savedStage();
		CrmCompany company = savedCompany("Active Corp");
		CrmContact contact = savedContact(company);

		performPostRequest(validPayload(stage.getId(), contact.getId())).andDo(print())
			.andExpect(status().isCreated())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['name']").value("Test Deal"))
			.andExpect(jsonPath(RESULTS_0_PATH + "['companyName']").value("Active Corp"));
	}

	@Test
	@DisplayName("Create deal with contact whose company is soft-deleted - company is null on deal")
	void createDeal_ContactWithDeletedCompany_DealCreatedWithoutCompany() throws Exception {
		CrmDealStage stage = savedStage();
		CrmCompany company = savedCompany("Deleted Corp");
		CrmContact contact = savedContact(company);

		// soft-delete the company
		company.setIsDeleted(true);
		crmCompanyDao.save(company);

		performPostRequest(validPayload(stage.getId(), contact.getId())).andDo(print())
			.andExpect(status().isCreated())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['name']").value("Test Deal"))
			.andExpect(jsonPath(RESULTS_0_PATH + "['companyName']").value(nullValue()));
	}

	@Test
	@DisplayName("Create deal with contact that has no company - company is null on deal")
	void createDeal_ContactWithNoCompany_DealCreatedWithoutCompany() throws Exception {
		CrmDealStage stage = savedStage();
		CrmContact contact = savedContact(null);

		performPostRequest(validPayload(stage.getId(), contact.getId())).andDo(print())
			.andExpect(status().isCreated())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['name']").value("Test Deal"))
			.andExpect(jsonPath(RESULTS_0_PATH + "['companyName']").value(nullValue()));
	}

	@Test
	@DisplayName("Edit deal - Happy Path - success")
	void editDeal_ValidRequest_ReturnsSuccess() throws Exception {
		CrmDealStage stage = savedStage();
		CrmCompany company = savedCompany("Original Company");
		CrmContact contact = savedContact(company);
		CrmDeal deal = savedDeal(stage, contact);
		deal.setCompany(company);
		deal = crmDealDao.save(deal);

		CrmDealEditRequestDto dto = new CrmDealEditRequestDto();
		dto.setName("Updated Deal Name");
		dto.setAmount("5000.50");
		dto.setPriority(CrmDealPriority.HIGH);
		dto.setContactName("Updated Contact Name");
		dto.setCompanyName("Updated Company Name");

		performPatchRequest(deal.getId(), dto).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath("$.results[0].name").value("Updated Deal Name"))
			.andExpect(jsonPath("$.results[0].amount").value("5000.50"))
			.andExpect(jsonPath("$.results[0].contactName").value("Updated Contact Name"))
			.andExpect(jsonPath("$.results[0].companyName").value("Updated Company Name"));
	}

	@Test
	@DisplayName("Edit deal - clear name - returns bad request")
	void editDeal_ClearName_ReturnsBadRequest() throws Exception {
		CrmDealStage stage = savedStage();
		CrmContact contact = savedContact(null);
		CrmDeal deal = savedDeal(stage, contact);

		CrmDealEditRequestDto dto = new CrmDealEditRequestDto();
		dto.setName("   ");

		performPatchRequest(deal.getId(), dto).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath("$.results[0].message")
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_DEAL_NAME_REQUIRED)));
	}

	@Test
	@DisplayName("Edit deal - non-admin/non-manager representative edit owner - returns forbidden/bad request")
	void editDeal_RepEditOwner_ReturnsBadRequest() throws Exception {
		// Set CRM role for user2
		employeeDao.findById(2L).orElseThrow().getEmployeeRole().setCrmRole(Role.CRM_SALES_REPRESENTATIVE);
		employeeRoleDao.flush();

		CrmDealStage stage = savedStage();
		CrmContact contact = savedContact(null);
		CrmDeal deal = savedDeal(stage, contact);

		// user2@gmail.com has ROLE_CRM_SALES_REPRESENTATIVE role only
		authToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user2@gmail.com"), 1L);

		// Since user2 is not the owner of the deal, first we must make them the owner of
		// the deal so they have edit permission at all
		deal.setOwner(employeeDao.getReferenceById(2L)); // Employee ID 2 is user2
		crmDealDao.save(deal);

		CrmDealEditRequestDto dto = new CrmDealEditRequestDto();
		dto.setOwnerId(1L); // change owner back to user1

		performPatchRequest(deal.getId(), dto).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath("$.results[0].message")
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_DEAL_OWNER_UPDATE_DENIED)));
	}

	@Test
	@DisplayName("Create deal - invalid owner ID - returns bad request")
	void createDeal_InvalidOwner_ReturnsBadRequest() throws Exception {
		CrmDealStage stage = savedStage();
		CrmContact contact = savedContact(null);
		CrmDealCreateRequestDto dto = validPayload(stage.getId(), contact.getId());
		dto.setOwnerId(9999L); // non-existent owner ID

		performPostRequest(dto).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath("$.results[0].message")
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_OWNER_INVALID_ROLE)));
	}

	@Test
	@DisplayName("Edit deal - Admin updates owner with invalid owner ID - returns bad request")
	void editDeal_AdminUpdateInvalidOwner_ReturnsBadRequest() throws Exception {
		CrmDealStage stage = savedStage();
		CrmContact contact = savedContact(null);
		CrmDeal deal = savedDeal(stage, contact);

		CrmDealEditRequestDto dto = new CrmDealEditRequestDto();
		dto.setOwnerId(9999L); // non-existent owner ID

		performPatchRequest(deal.getId(), dto).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath("$.results[0].message")
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_OWNER_INVALID_ROLE)));
	}

	@Test
	@DisplayName("Edit deal - Admin updates owner with valid owner ID - returns success")
	void editDeal_AdminUpdateValidOwner_ReturnsSuccess() throws Exception {
		// Set CRM role for user2 to be assignable (e.g. Sales Representative)
		employeeDao.findById(2L).orElseThrow().getEmployeeRole().setCrmRole(Role.CRM_SALES_REPRESENTATIVE);
		employeeRoleDao.flush();

		CrmDealStage stage = savedStage();
		CrmContact contact = savedContact(null);
		CrmDeal deal = savedDeal(stage, contact);

		CrmDealEditRequestDto dto = new CrmDealEditRequestDto();
		dto.setOwnerId(2L); // change owner to user2 (valid owner role)

		performPatchRequest(deal.getId(), dto).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath("$.results[0].owner.employeeId").value(2L));
	}

}
