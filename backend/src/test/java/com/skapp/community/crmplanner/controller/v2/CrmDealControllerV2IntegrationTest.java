package com.skapp.community.crmplanner.controller.v2;

import com.skapp.TestSkappApplication;
import com.skapp.community.common.service.JwtService;
import com.skapp.community.common.type.Role;
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
import com.skapp.community.crmplanner.type.CrmIndustry;
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
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.json.JsonMapper;

import static com.skapp.support.TestConstants.RESULTS_0_PATH;
import static com.skapp.support.TestConstants.STATUS_PATH;
import static com.skapp.support.TestConstants.STATUS_SUCCESSFUL;
import static com.skapp.support.TestConstants.STATUS_UNSUCCESSFUL;
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
@DisplayName("CRM Deal Controller V2 Integration Tests")
class CrmDealControllerV2IntegrationTest {

	private static final String BASE_PATH = "/v2/crm/deal";

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

	private String authToken;

	@BeforeEach
	void setup() {
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

	private ResultActions performGetByIdRequest(Long id) throws Exception {
		return performRequest(get(BASE_PATH + "/" + id).accept(MediaType.APPLICATION_JSON));
	}

	private ResultActions performPatchRequest(Long id, CrmDealEditRequestDto dto) throws Exception {
		return performRequest(patch(BASE_PATH + "/" + id).contentType(MediaType.APPLICATION_JSON)
			.content(objectMapper.writeValueAsString(dto))
			.accept(MediaType.APPLICATION_JSON));
	}

	private ResultActions performGetDealsRequest(Long companyId) throws Exception {
		return performRequest(
				get(BASE_PATH).param("companyId", companyId.toString()).accept(MediaType.APPLICATION_JSON));
	}

	private CrmDealStage savedStage() {
		CrmDealStage stage = new CrmDealStage();
		stage.setName("V2 Stage");
		stage.setColor("#AABBCC");
		stage.setOrderIndex(1);
		stage.setStageType(CrmDealStageType.OPEN);
		return crmDealStageDao.save(stage);
	}

	private CrmCompany savedCompany(String name) {
		CrmCompany company = new CrmCompany();
		company.setName(name);
		company.setIndustry(CrmIndustry.TECHNOLOGY_INFORMATION_AND_MEDIA);
		company.setWebsite("https://deal-v2.com");
		company.setAddress("7 Deal Rd");
		company.setContactNumber("94771111111");
		return crmCompanyDao.save(company);
	}

	private CrmContact savedContact(CrmCompany company, String email) {
		CrmContact contact = new CrmContact();
		contact.setName("Deal Test Contact");
		contact.setEmail(email);
		contact.setCompany(company);
		contact.setOwner(employeeDao.getReferenceById(1L));
		return crmContactDao.save(contact);
	}

	private CrmDealCreateRequestDto validPayload(Long stageId, Long contactId) {
		CrmDealCreateRequestDto dto = new CrmDealCreateRequestDto();
		dto.setName("Test Deal V2");
		dto.setDescription("Deal description V2");
		dto.setAmount("5000");
		dto.setPriority(CrmDealPriority.MEDIUM);
		dto.setStageId(stageId);
		dto.setContactId(contactId);
		dto.setOwnerId(1L);
		return dto;
	}

	private CrmDeal savedDeal(String name, CrmDealStage stage, CrmCompany company, CrmContact contact, Long ownerId) {
		CrmDeal deal = new CrmDeal();
		deal.setName(name);
		deal.setStage(stage);
		deal.setCompany(company);
		deal.setContact(contact);
		deal.setOwner(employeeDao.getReferenceById(ownerId));
		deal.setPriority(CrmDealPriority.MEDIUM);
		deal.setAmount("5000");
		deal.setDescription("Saved deal V2");
		deal.setOrderIndex("a0");
		return crmDealDao.save(deal);
	}

	// --- createDeal ---

	@Test
	@DisplayName("Create deal - Returns Created with embedded stage, owner, company and contact-with-company")
	void createDeal_HappyPath_ReturnsEmbeddedAssociations() throws Exception {
		CrmDealStage stage = savedStage();
		CrmCompany company = savedCompany("Deal V2 Corp");
		CrmContact contact = savedContact(company, "deal.create.v2@example.com");

		performPostRequest(validPayload(stage.getId(), contact.getId())).andDo(print())
			.andExpect(status().isCreated())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['name']").value("Test Deal V2"))
			.andExpect(jsonPath(RESULTS_0_PATH + "['amount']").value("5000"))
			.andExpect(jsonPath(RESULTS_0_PATH + "['priority']").value("MEDIUM"))
			.andExpect(jsonPath(RESULTS_0_PATH + "['stage']['id']").value(stage.getId()))
			.andExpect(jsonPath(RESULTS_0_PATH + "['stage']['name']").value("V2 Stage"))
			.andExpect(jsonPath(RESULTS_0_PATH + "['owner']['employeeId']").value(1))
			.andExpect(jsonPath(RESULTS_0_PATH + "['company']['id']").value(company.getId()))
			.andExpect(jsonPath(RESULTS_0_PATH + "['company']['industry']")
				.value(CrmIndustry.TECHNOLOGY_INFORMATION_AND_MEDIA.name()))
			.andExpect(jsonPath(RESULTS_0_PATH + "['contact']['id']").value(contact.getId()))
			.andExpect(jsonPath(RESULTS_0_PATH + "['contact']['name']").value("Deal Test Contact"))
			.andExpect(jsonPath(RESULTS_0_PATH + "['contact']['company']['id']").value(company.getId()))
			.andExpect(jsonPath(RESULTS_0_PATH + "['contact']['company']['industry']")
				.value(CrmIndustry.TECHNOLOGY_INFORMATION_AND_MEDIA.name()))
			.andExpect(jsonPath(RESULTS_0_PATH + "['contact']['owner']['employeeId']").value(1));
	}

	// --- getDealById ---

	@Test
	@DisplayName("Get deal by ID - Returns embedded stage, owner, company and contact-with-company")
	void getDealById_HappyPath_ReturnsEmbeddedAssociations() throws Exception {
		CrmDealStage stage = savedStage();
		CrmCompany company = savedCompany("Deal Detail V2 Corp");
		CrmContact contact = savedContact(company, "deal.detail.v2@example.com");
		CrmDeal deal = savedDeal("Saved Deal V2", stage, company, contact, 1L);

		performGetByIdRequest(deal.getId()).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['id']").value(deal.getId()))
			.andExpect(jsonPath(RESULTS_0_PATH + "['name']").value("Saved Deal V2"))
			.andExpect(jsonPath(RESULTS_0_PATH + "['stage']['id']").value(stage.getId()))
			.andExpect(jsonPath(RESULTS_0_PATH + "['owner']['employeeId']").value(1))
			.andExpect(jsonPath(RESULTS_0_PATH + "['company']['id']").value(company.getId()))
			.andExpect(jsonPath(RESULTS_0_PATH + "['contact']['id']").value(contact.getId()))
			.andExpect(jsonPath(RESULTS_0_PATH + "['contact']['company']['industry']")
				.value(CrmIndustry.TECHNOLOGY_INFORMATION_AND_MEDIA.name()))
			.andExpect(jsonPath(RESULTS_0_PATH + "['contact']['owner']['employeeId']").value(1));
	}

	@Test
	@DisplayName("Get deals filtered by companyId - Returns paginated deals with embedded associations")
	void getDeals_FilterByCompanyId_ReturnsMatchingDeals() throws Exception {
		CrmDealStage stage = savedStage();
		CrmCompany company = savedCompany("Deal List V2 Corp");
		CrmContact contact = savedContact(company, "deal.list.v2@example.com");
		savedDeal("List Deal V2", stage, company, contact, 1L);

		performGetDealsRequest(company.getId()).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['items'].length()").value(1))
			.andExpect(jsonPath(RESULTS_0_PATH + "['items'][0]['name']").value("List Deal V2"))
			.andExpect(jsonPath(RESULTS_0_PATH + "['items'][0]['contact']['company']['id']").value(company.getId()));
	}

	@Test
	@DisplayName("Get deal by ID as Sales Representative viewing another owner's deal - Returns view-denied error")
	void getDealById_SalesRepViewingOthersDeal_ReturnsBadRequest() throws Exception {
		employeeDao.findById(2L).orElseThrow().getEmployeeRole().setCrmRole(Role.CRM_SALES_REPRESENTATIVE);
		employeeRoleDao.flush();

		CrmDealStage stage = savedStage();
		CrmCompany company = savedCompany("Rep Restricted V2 Corp");
		CrmContact contact = savedContact(company, "deal.rep.v2@example.com");
		CrmDeal deal = savedDeal("Admin Owned Deal V2", stage, company, contact, 1L);

		authToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user2@gmail.com"), 1L);

		performGetByIdRequest(deal.getId()).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL));
	}

	@Test
	@DisplayName("Get deal by ID with soft-deleted company - Masks company on deal and contact")
	void getDealById_SoftDeletedCompany_MasksCompany() throws Exception {
		CrmDealStage stage = savedStage();
		CrmCompany company = savedCompany("Deleted Co V2");
		CrmContact contact = savedContact(company, "deal.deletedco.v2@example.com");
		CrmDeal deal = savedDeal("Deleted Co Deal V2", stage, company, contact, 1L);

		company.setIsDeleted(true);
		crmCompanyDao.save(company);

		performGetByIdRequest(deal.getId()).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['id']").value(deal.getId()))
			.andExpect(jsonPath(RESULTS_0_PATH + "['company']['id']").doesNotExist())
			.andExpect(jsonPath(RESULTS_0_PATH + "['contact']['company']['id']").doesNotExist());
	}

	@Test
	@DisplayName("Get deal by ID that does not exist - Returns Bad Request")
	void getDealById_NotFound_ReturnsBadRequest() throws Exception {
		performGetByIdRequest(999999L).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL));
	}

	// --- editDeal ---

	@Test
	@DisplayName("Edit deal - Returns OK with updated deal and embedded associations")
	void editDeal_HappyPath_ReturnsUpdatedDeal() throws Exception {
		CrmDealStage stage = savedStage();
		CrmCompany company = savedCompany("Deal Edit V2 Corp");
		CrmContact contact = savedContact(company, "deal.edit.v2@example.com");
		CrmDeal deal = savedDeal("Original Deal V2", stage, company, contact, 1L);

		CrmDealEditRequestDto editDto = new CrmDealEditRequestDto();
		editDto.setName("Updated Deal V2");

		performPatchRequest(deal.getId(), editDto).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['name']").value("Updated Deal V2"))
			.andExpect(jsonPath(RESULTS_0_PATH + "['stage']['id']").value(stage.getId()))
			.andExpect(jsonPath(RESULTS_0_PATH + "['owner']['employeeId']").value(1))
			.andExpect(jsonPath(RESULTS_0_PATH + "['company']['id']").value(company.getId()))
			.andExpect(jsonPath(RESULTS_0_PATH + "['contact']['company']['id']").value(company.getId()));
	}

	@Test
	@DisplayName("Edit deal as Sales Representative editing another owner's deal - Returns edit-denied error")
	void editDeal_SalesRepEditingOthersDeal_ReturnsBadRequest() throws Exception {
		employeeDao.findById(2L).orElseThrow().getEmployeeRole().setCrmRole(Role.CRM_SALES_REPRESENTATIVE);
		employeeRoleDao.flush();

		CrmDealStage stage = savedStage();
		CrmCompany company = savedCompany("Rep Edit Restricted V2 Corp");
		CrmContact contact = savedContact(company, "deal.rep.edit.v2@example.com");
		CrmDeal deal = savedDeal("Admin Owned Deal V2", stage, company, contact, 1L);

		authToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user2@gmail.com"), 1L);

		CrmDealEditRequestDto editDto = new CrmDealEditRequestDto();
		editDto.setName("Hijacked Deal V2");

		performPatchRequest(deal.getId(), editDto).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL));
	}

	@Test
	@DisplayName("Create deal without CRM role - Returns Forbidden")
	void createDeal_WithoutCrmRole_ReturnsForbidden() throws Exception {
		CrmDealStage stage = savedStage();
		CrmCompany company = savedCompany("Forbidden Deal V2 Corp");
		CrmContact contact = savedContact(company, "deal.forbidden.v2@example.com");

		authToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user2@gmail.com"), 1L);

		performPostRequest(validPayload(stage.getId(), contact.getId())).andDo(print())
			.andExpect(status().isForbidden());
	}

}
