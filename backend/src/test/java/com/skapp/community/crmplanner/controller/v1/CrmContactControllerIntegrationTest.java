package com.skapp.community.crmplanner.controller.v1;

import com.skapp.TestSkappApplication;
import com.skapp.community.common.service.JwtService;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.community.crmplanner.constant.CrmMessageConstant;
import com.skapp.community.crmplanner.model.CrmCompany;
import com.skapp.community.crmplanner.model.CrmContact;
import com.skapp.community.crmplanner.model.CrmDeal;
import com.skapp.community.crmplanner.model.CrmDealStage;
import com.skapp.community.crmplanner.payload.request.CrmContactCreateRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmContactEditRequestDto;
import com.skapp.community.crmplanner.repository.CrmCompanyDao;
import com.skapp.community.crmplanner.repository.CrmContactDao;
import com.skapp.community.crmplanner.repository.CrmDealDao;
import com.skapp.community.crmplanner.repository.CrmDealStageDao;
import com.skapp.community.crmplanner.type.CrmDealPriority;
import com.skapp.community.crmplanner.type.CrmDealStageType;
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
import org.springframework.test.context.transaction.TestTransaction;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.json.JsonMapper;

import static com.skapp.support.TestConstants.MESSAGE_PATH;
import static com.skapp.support.TestConstants.RESULTS_0_PATH;
import static com.skapp.support.TestConstants.STATUS_PATH;
import static com.skapp.support.TestConstants.STATUS_SUCCESSFUL;
import static com.skapp.support.TestConstants.STATUS_UNSUCCESSFUL;
import static org.junit.Assert.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = TestSkappApplication.class)
@AutoConfigureMockMvc
@Transactional
@RequiredArgsConstructor
@DisplayName("CRM Contact Controller Integration Tests")
class CrmContactControllerIntegrationTest {

	private static final String BASE_PATH = "/v1/crm/contact";

	private static final String BY_ID_PATH = BASE_PATH + "/{id}";

	private static final String METRICS_PATH = BASE_PATH + "/metrics";

	private static final String OWNERS_PATH = BASE_PATH + "/owners";

	private final MockMvc mvc;

	private final JwtService jwtService;

	private final UserDetailsService userDetailsService;

	private final JsonMapper objectMapper;

	private final MessageUtil messageUtil;

	private final CrmCompanyDao crmCompanyDao;

	private final CrmContactDao crmContactDao;

	private final CrmDealDao crmDealDao;

	private final CrmDealStageDao crmDealStageDao;

	private final EmployeeDao employeeDao;

	private final EmployeeRoleDao employeeRoleDao;

	// user1 is CRM_ADMIN + super admin — passes both hasRole(SALES_REPRESENTATIVE) and
	// hasRole(SALES_MANAGER)
	private String adminToken;

	// user2 has no CRM role — rejected by all CRM endpoints
	private String noRoleToken;

	@BeforeEach
	void setup() {
		adminToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user1@gmail.com"), 1L);
		noRoleToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user2@gmail.com"), 1L);
	}

	private ResultActions performRequest(MockHttpServletRequestBuilder request, String token) throws Exception {
		return mvc.perform(request.with(SecurityTestUtils.bearerToken(token)));
	}

	private ResultActions performRequest(MockHttpServletRequestBuilder request) throws Exception {
		return performRequest(request, adminToken);
	}

	private <T> ResultActions performPostRequest(T content) throws Exception {
		return performRequest(post(BASE_PATH).contentType(MediaType.APPLICATION_JSON)
			.content(objectMapper.writeValueAsString(content))
			.accept(MediaType.APPLICATION_JSON));
	}

	private <T> ResultActions performPutRequest(Long id, T content) throws Exception {
		return performRequest(put(BY_ID_PATH, id).contentType(MediaType.APPLICATION_JSON)
			.content(objectMapper.writeValueAsString(content))
			.accept(MediaType.APPLICATION_JSON));
	}

	private ResultActions performDeleteRequest(Long id) throws Exception {
		return performRequest(delete(BY_ID_PATH, id).accept(MediaType.APPLICATION_JSON));
	}

	private ResultActions performGetMetricsRequest() throws Exception {
		return performRequest(get(METRICS_PATH).accept(MediaType.APPLICATION_JSON));
	}

	private ResultActions performGetOwnersRequest() throws Exception {
		return performRequest(get(OWNERS_PATH).accept(MediaType.APPLICATION_JSON));
	}

	private CrmCompany savedCompany() {
		CrmCompany company = new CrmCompany();
		company.setName("Integration Test Corp");
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
		dto.setEmail("jane.smith@example.com");
		dto.setCompanyId(companyId);
		dto.setContactNumber("94771234567");
		dto.setOwnerId(1L);
		return dto;
	}

	private CrmContactEditRequestDto editValidPayload(Long companyId) {
		CrmContactEditRequestDto dto = new CrmContactEditRequestDto();
		dto.setName("Jane Smith Updated");
		dto.setEmail("jane.smith.updated@example.com");
		dto.setCompanyId(companyId);
		dto.setContactNumber("94779999999");
		dto.setOwnerId(1L);
		return dto;
	}

	// --- createContact ---

	@Test
	@DisplayName("Create contact with valid payload - Returns Created")
	void createContact_HappyPath_ReturnsCreated() throws Exception {
		Long companyId = savedCompany().getId();
		performPostRequest(createValidPayload(companyId)).andDo(print())
			.andExpect(status().isCreated())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['name']").value("Jane Smith"))
			.andExpect(jsonPath(RESULTS_0_PATH + "['email']").value("jane.smith@example.com"));
	}

	@Test
	@DisplayName("Create contact with blank name - Returns Bad Request")
	void createContact_BlankName_ReturnsBadRequest() throws Exception {
		Long companyId = savedCompany().getId();
		CrmContactCreateRequestDto dto = createValidPayload(companyId);
		dto.setName("");

		performPostRequest(dto).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL));
	}

	@Test
	@DisplayName("Create contact with invalid email - Returns Bad Request")
	void createContact_InvalidEmail_ReturnsBadRequest() throws Exception {
		Long companyId = savedCompany().getId();
		CrmContactCreateRequestDto dto = createValidPayload(companyId);
		dto.setEmail("not-an-email");

		performPostRequest(dto).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL));
	}

	@Test
	@DisplayName("Create contact with name containing invalid characters - Returns Bad Request")
	void createContact_InvalidNameCharacters_ReturnsBadRequest() throws Exception {
		Long companyId = savedCompany().getId();
		CrmContactCreateRequestDto dto = createValidPayload(companyId);
		dto.setName("Jane@Smith!");

		performPostRequest(dto).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL));
	}

	@Test
	@DisplayName("Create contact with email already used by another contact - Returns Bad Request")
	void createContact_DuplicateEmail_ReturnsBadRequest() throws Exception {
		Long companyId = savedCompany().getId();
		savedContact(companyId, "jane.smith@example.com");

		CrmContactCreateRequestDto dto = createValidPayload(companyId);
		dto.setEmail("jane.smith@example.com");

		performPostRequest(dto).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_CONTACT_EMAIL_ALREADY_EXISTS)));
	}

	@Test
	@DisplayName("Create contact without CRM role - Returns Forbidden")
	void createContact_WithoutCrmRole_ReturnsForbidden() throws Exception {
		Long companyId = savedCompany().getId();
		performRequest(post(BASE_PATH).contentType(MediaType.APPLICATION_JSON)
			.content(objectMapper.writeValueAsString(createValidPayload(companyId)))
			.accept(MediaType.APPLICATION_JSON), noRoleToken).andDo(print()).andExpect(status().isForbidden());
	}

	// --- editContact ---

	@Test
	@DisplayName("Edit contact with valid payload - Returns OK with updated fields")
	void editContact_HappyPath_ReturnsOk() throws Exception {
		Long companyId = savedCompany().getId();
		Long contactId = savedContact(companyId, "original@example.com").getId();

		performPutRequest(contactId, editValidPayload(companyId)).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['name']").value("Jane Smith Updated"))
			.andExpect(jsonPath(RESULTS_0_PATH + "['email']").value("jane.smith.updated@example.com"));
	}

	@Test
	@DisplayName("Edit contact that does not exist - Returns Bad Request")
	void editContact_NotFound_ReturnsBadRequest() throws Exception {
		Long companyId = savedCompany().getId();

		performPutRequest(999999L, editValidPayload(companyId)).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_CONTACT_NOT_FOUND)));
	}

	@Test
	@DisplayName("Edit contact with email already used by another contact - Returns Bad Request")
	void editContact_DuplicateEmail_ReturnsBadRequest() throws Exception {
		Long companyId = savedCompany().getId();
		savedContact(companyId, "taken@example.com");
		Long contactId = savedContact(companyId, "mine@example.com").getId();

		CrmContactEditRequestDto dto = editValidPayload(companyId);
		dto.setEmail("taken@example.com");

		performPutRequest(contactId, dto).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_CONTACT_EMAIL_ALREADY_EXISTS)));
	}

	@Test
	@DisplayName("Edit contact without CRM role - Returns Forbidden")
	void editContact_WithoutCrmRole_ReturnsForbidden() throws Exception {
		Long companyId = savedCompany().getId();
		Long contactId = savedContact(companyId, "edit.norole@example.com").getId();

		performRequest(put(BY_ID_PATH, contactId).contentType(MediaType.APPLICATION_JSON)
			.content(objectMapper.writeValueAsString(editValidPayload(companyId)))
			.accept(MediaType.APPLICATION_JSON), noRoleToken).andDo(print()).andExpect(status().isForbidden());
	}

	@Test
	@DisplayName("Edit soft-deleted contact - Returns Bad Request with not-found error")
	void editContact_SoftDeletedContact_ReturnsBadRequest() throws Exception {
		Long companyId = savedCompany().getId();
		CrmContact contact = savedContact(companyId, "soft.deleted@example.com");
		contact.setIsDeleted(true);
		crmContactDao.save(contact);

		performPutRequest(contact.getId(), editValidPayload(companyId)).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_CONTACT_NOT_FOUND)));
	}

	@Test
	@DisplayName("Sales rep editing their own contact - Returns OK")
	void editContact_RepEditingOwnContact_ReturnsOk() throws Exception {
		// Promote user2 (employeeId=2) to CRM_SALES_REPRESENTATIVE within this
		// transaction
		employeeDao.findById(2L).orElseThrow().getEmployeeRole().setCrmRole(Role.CRM_SALES_REPRESENTATIVE);
		employeeRoleDao.flush();
		String repToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user2@gmail.com"), 1L);

		Long companyId = savedCompany().getId();
		// Contact owned by employee 2 (the rep)
		CrmContact contact = new CrmContact();
		contact.setName("Rep Owned");
		contact.setEmail("rep.owned@example.com");
		contact.setCompany(crmCompanyDao.getReferenceById(companyId));
		contact.setOwner(employeeDao.getReferenceById(2L));
		Long contactId = crmContactDao.save(contact).getId();

		// Rep must assign to themselves (ownerId = 2)
		CrmContactEditRequestDto dto = editValidPayload(companyId);
		dto.setOwnerId(2L);

		performRequest(put(BY_ID_PATH, contactId).contentType(MediaType.APPLICATION_JSON)
			.content(objectMapper.writeValueAsString(dto))
			.accept(MediaType.APPLICATION_JSON), repToken).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL));
	}

	@Test
	@DisplayName("Sales rep editing a contact they do not own - Returns Bad Request with edit-denied error")
	void editContact_RepEditingOtherOwnersContact_ReturnsBadRequest() throws Exception {
		// Promote user2 to CRM_SALES_REPRESENTATIVE
		employeeDao.findById(2L).orElseThrow().getEmployeeRole().setCrmRole(Role.CRM_SALES_REPRESENTATIVE);
		employeeRoleDao.flush();
		String repToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user2@gmail.com"), 1L);

		Long companyId = savedCompany().getId();
		// Contact owned by employee 1 (admin), not by the rep
		Long contactId = savedContact(companyId, "admin.owned@example.com").getId();

		CrmContactEditRequestDto dto = editValidPayload(companyId);
		dto.setOwnerId(2L);

		performRequest(put(BY_ID_PATH, contactId).contentType(MediaType.APPLICATION_JSON)
			.content(objectMapper.writeValueAsString(dto))
			.accept(MediaType.APPLICATION_JSON), repToken).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_CONTACT_EDIT_DENIED)));
	}

	@Test
	@DisplayName("CRM sales manager editing a contact they do not own - Returns OK")
	void editContact_SalesManagerEditingAnyContact_ReturnsOk() throws Exception {
		// Promote user2 to CRM_SALES_MANAGER
		employeeDao.findById(2L).orElseThrow().getEmployeeRole().setCrmRole(Role.CRM_SALES_MANAGER);
		employeeRoleDao.flush();
		String managerToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user2@gmail.com"),
				1L);

		Long companyId = savedCompany().getId();
		// Contact owned by employee 1, not by user2
		Long contactId = savedContact(companyId, "manager.edit.test@example.com").getId();

		CrmContactEditRequestDto dto = editValidPayload(companyId);
		dto.setOwnerId(1L);

		performRequest(put(BY_ID_PATH, contactId).contentType(MediaType.APPLICATION_JSON)
			.content(objectMapper.writeValueAsString(dto))
			.accept(MediaType.APPLICATION_JSON), managerToken).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL));
	}

	@Test
	@DisplayName("Assigning owner with no CRM role - Returns Bad Request with invalid-role error")
	void editContact_AssigningOwnerWithNoRole_ReturnsBadRequest() throws Exception {
		// user2 has no CRM role in test data — use them as the target owner
		Long companyId = savedCompany().getId();
		Long contactId = savedContact(companyId, "assign.norole@example.com").getId();

		CrmContactEditRequestDto dto = editValidPayload(companyId);
		dto.setOwnerId(2L);

		// adminToken (user1 = CRM_ADMIN) makes the request — passes checkEditPermission,
		// then validateAssignableOwner(2) finds user2 has no assignable role
		performPutRequest(contactId, dto).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_OWNER_INVALID_ROLE)));
	}

	@Test
	@DisplayName("Sales rep assigning contact to a different owner - Returns Bad Request with assignment-denied error")
	void editContact_RepAssigningToDifferentOwner_ReturnsBadRequest() throws Exception {
		// Promote user2 to CRM_SALES_REPRESENTATIVE
		employeeDao.findById(2L).orElseThrow().getEmployeeRole().setCrmRole(Role.CRM_SALES_REPRESENTATIVE);
		employeeRoleDao.flush();
		String repToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user2@gmail.com"), 1L);

		Long companyId = savedCompany().getId();
		// Contact owned by employee 2 (the rep) — checkEditPermission passes
		CrmContact contact = new CrmContact();
		contact.setName("Rep Owned Two");
		contact.setEmail("rep.owned2@example.com");
		contact.setCompany(crmCompanyDao.getReferenceById(companyId));
		contact.setOwner(employeeDao.getReferenceById(2L));
		Long contactId = crmContactDao.save(contact).getId();

		// Rep attempts to reassign ownership to employee 1 — resolveOwner should deny
		CrmContactEditRequestDto dto = editValidPayload(companyId);
		dto.setOwnerId(1L);

		performRequest(put(BY_ID_PATH, contactId).contentType(MediaType.APPLICATION_JSON)
			.content(objectMapper.writeValueAsString(dto))
			.accept(MediaType.APPLICATION_JSON), repToken).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_OWNER_ASSIGNMENT_DENIED)));
	}

	// --- deleteContact ---

	@Test
	@DisplayName("Delete contact - Returns OK with success message")
	void deleteContact_HappyPath_ReturnsOk() throws Exception {
		Long companyId = savedCompany().getId();
		Long contactId = savedContact(companyId, "delete.me@example.com").getId();

		performDeleteRequest(contactId).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_SUCCESS_CONTACT_DELETED)));
	}

	@Test
	@DisplayName("Delete already deleted contact - Returns Bad Request")
	void deleteContact_AlreadyDeleted_ReturnsBadRequest() throws Exception {
		Long companyId = savedCompany().getId();
		Long contactId = savedContact(companyId, "already.deleted@example.com").getId();

		performDeleteRequest(contactId).andExpect(status().isOk());

		TestTransaction.flagForCommit();
		TestTransaction.end();

		performDeleteRequest(contactId).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_CONTACT_NOT_FOUND)));

		crmContactDao.deleteById(contactId);
	}

	@Test
	@DisplayName("Delete contact with associated deals - Soft deletes all linked deals")
	void deleteContact_WithAssociatedDeals_SoftDeletesLinkedDeals() throws Exception {
		Long companyId = savedCompany().getId();
		Long contactId = savedContact(companyId, "contact.with.deals@example.com").getId();

		CrmDealStage stage = new CrmDealStage();
		stage.setName("Test Stage");
		stage.setColor("#AABBCC");
		stage.setOrderIndex(1);
		stage.setStageType(CrmDealStageType.OPEN);
		crmDealStageDao.save(stage);

		CrmDeal deal = new CrmDeal();
		deal.setName("Test Deal");
		deal.setPriority(CrmDealPriority.MEDIUM);
		deal.setStage(stage);
		deal.setContact(crmContactDao.getReferenceById(contactId));
		deal.setCompany(crmCompanyDao.getReferenceById(companyId));
		deal.setOwner(employeeDao.getReferenceById(1L));
		Long dealId = crmDealDao.save(deal).getId();

		performDeleteRequest(contactId).andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL));

		CrmDeal deletedDeal = crmDealDao.findById(dealId).orElseThrow();
		assertTrue(deletedDeal.getIsDeleted());
	}

	@Test
	@DisplayName("Delete contact without CRM manager role - Returns Forbidden")
	void deleteContact_WithoutManagerRole_ReturnsForbidden() throws Exception {
		performRequest(delete(BY_ID_PATH, 1L).accept(MediaType.APPLICATION_JSON), noRoleToken).andDo(print())
			.andExpect(status().isForbidden());
	}

	// --- getContactOwners ---

	@Test
	@DisplayName("Get contact owners - Returns paginated list of eligible CRM users")
	void getContactOwners_HappyPath_ReturnsOk() throws Exception {
		performGetOwnersRequest().andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath("['results'][0]['items']").isArray());
	}

	@Test
	@DisplayName("Get contact owners filtered by keyword - Returns matching users")
	void getContactOwners_WithSearchKeyword_ReturnsFilteredResults() throws Exception {
		performRequest(get(OWNERS_PATH).param("searchKeyword", "Employee").accept(MediaType.APPLICATION_JSON))
			.andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL));
	}

	@Test
	@DisplayName("Get contact owners without CRM manager role - Returns Forbidden")
	void getContactOwners_WithoutManagerRole_ReturnsForbidden() throws Exception {
		performRequest(get(OWNERS_PATH).accept(MediaType.APPLICATION_JSON), noRoleToken).andDo(print())
			.andExpect(status().isForbidden());
	}

	// --- getContactMetrics ---

	@Test
	@DisplayName("Get contact metrics with no contacts - Returns empty page")
	void getContactMetrics_NoContacts_ReturnsEmptyPage() throws Exception {
		performGetMetricsRequest().andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath("['results'][0]['items']").isArray());
	}

	@Test
	@DisplayName("Get contact metrics with contacts present - Returns page with items")
	void getContactMetrics_WithContacts_ReturnsPageWithItems() throws Exception {
		Long companyId = savedCompany().getId();
		savedContact(companyId, "metrics.contact@example.com");

		performGetMetricsRequest().andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath("['results'][0]['totalItems']").value(1));
	}

	@Test
	@DisplayName("Get contact metrics filtered by company - Returns contacts for that company only")
	void getContactMetrics_FilteredByCompany_ReturnsMatchingContacts() throws Exception {
		Long companyId = savedCompany().getId();
		savedContact(companyId, "filtered.contact@example.com");

		CrmCompany otherCompany = new CrmCompany();
		otherCompany.setName("Other Corp");
		Long otherCompanyId = crmCompanyDao.save(otherCompany).getId();
		savedContact(otherCompanyId, "other.company.contact@example.com");

		performRequest(
				get(METRICS_PATH).param("companyId", String.valueOf(companyId)).accept(MediaType.APPLICATION_JSON))
			.andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath("['results'][0]['totalItems']").value(1));
	}

	@Test
	@DisplayName("Get contact metrics filtered by search keyword - Returns matching contacts")
	void getContactMetrics_FilteredByKeyword_ReturnsMatchingContacts() throws Exception {
		Long companyId = savedCompany().getId();
		savedContact(companyId, "keyword.contact@example.com");

		performRequest(get(METRICS_PATH).param("searchKeyword", "Test Contact").accept(MediaType.APPLICATION_JSON))
			.andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath("['results'][0]['totalItems']").value(1));
	}

	@Test
	@DisplayName("Get contact metrics without CRM role - Returns Forbidden")
	void getContactMetrics_WithoutCrmRole_ReturnsForbidden() throws Exception {
		performRequest(get(METRICS_PATH).accept(MediaType.APPLICATION_JSON), noRoleToken).andDo(print())
			.andExpect(status().isForbidden());
	}

}
