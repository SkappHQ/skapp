package com.skapp.community.crmplanner.controller.v1;

import com.skapp.community.common.service.JwtService;
import com.skapp.community.common.type.Role;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.community.crmplanner.constant.CrmMessageConstant;
import com.skapp.community.crmplanner.model.CrmCompany;
import com.skapp.community.crmplanner.model.CrmContact;
import com.skapp.community.crmplanner.model.CrmDeal;
import com.skapp.community.crmplanner.model.CrmDealStage;
import com.skapp.community.crmplanner.model.CrmTask;
import com.skapp.community.crmplanner.model.CrmTaskType;
import com.skapp.community.crmplanner.payload.request.CrmDealCreateRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmDealEditRequestDto;
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

import java.util.List;

import static com.skapp.support.TestConstants.MESSAGE_PATH;
import static com.skapp.support.TestConstants.RESULTS_0_PATH;
import static com.skapp.support.TestConstants.STATUS_PATH;
import static com.skapp.support.TestConstants.STATUS_SUCCESSFUL;
import static com.skapp.support.TestConstants.STATUS_UNSUCCESSFUL;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.nullValue;
import static org.junit.jupiter.api.Assertions.assertTrue;
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
@DisplayName("CRM Deal Controller Integration Tests")
class CrmDealControllerIntegrationTest {

	private static final String BASE_PATH = "/v1/crm/deal";

	private static final String EXISTS_PATH = BASE_PATH + "/exists";

	private final MockMvc mvc;

	private final JwtService jwtService;

	private final UserDetailsService userDetailsService;

	private final JsonMapper objectMapper;

	private final MessageUtil messageUtil;

	private final CrmCompanyDao crmCompanyDao;

	private final CrmContactDao crmContactDao;

	private final CrmDealStageDao crmDealStageDao;

	private final CrmDealDao crmDealDao;

	private final CrmTaskDao crmTaskDao;

	private final CrmTaskTypeDao crmTaskTypeDao;

	private final EmployeeDao employeeDao;

	private final EmployeeRoleDao employeeRoleDao;

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

	private ResultActions performDeleteRequest(Long id) throws Exception {
		return performRequest(delete(BASE_PATH + "/{id}", id).accept(MediaType.APPLICATION_JSON));
	}

	private ResultActions performGetExistsRequest(String name) throws Exception {
		return performRequest(get(EXISTS_PATH).param("name", name).accept(MediaType.APPLICATION_JSON));
	}

	private ResultActions performGetDealsRequest(Long companyId) throws Exception {
		return performRequest(
				get(BASE_PATH).param("companyId", companyId.toString()).accept(MediaType.APPLICATION_JSON));
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
		contact.setFirstName("Deal");
		contact.setLastName("Test Contact");
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

	private CrmDeal savedDeal() {
		CrmDealStage stage = savedStage();
		CrmCompany company = savedCompany("Deal Company");
		CrmContact contact = savedContact(company);
		CrmDeal deal = new CrmDeal();
		deal.setName("Saved Deal");
		deal.setAmount("5000");
		deal.setDescription("Test deal description");
		deal.setPriority(CrmDealPriority.HIGH);
		deal.setStage(stage);
		deal.setContact(contact);
		deal.setCompany(company);
		deal.setOwner(employeeDao.getReferenceById(1L));
		deal.setOrderIndex("a0");
		return crmDealDao.save(deal);
	}

	private CrmDeal savedDeal(String name, CrmDealStage stage, CrmCompany company) {
		CrmDeal deal = new CrmDeal();
		deal.setName(name);
		deal.setStage(stage);
		deal.setOwner(employeeDao.getReferenceById(1L));
		deal.setContact(savedContact(company));
		deal.setCompany(company);
		deal.setPriority(CrmDealPriority.MEDIUM);
		deal.setOrderIndex("a0");
		return crmDealDao.save(deal);
	}

	// --- Get deals tests ---

	@Test
	@DisplayName("Get deals filtered by companyId - Returns only deals linked to that company")
	void getDeals_FilterByCompanyId_ReturnsMatchingDeals() throws Exception {
		CrmDealStage stage = savedStage();
		CrmCompany company = savedCompany("Deal Filter Company");
		CrmCompany otherCompany = savedCompany("Other Deal Filter Company");

		savedDeal("Deal for company", stage, company);
		savedDeal("Deal for other company", stage, otherCompany);

		performGetDealsRequest(company.getId()).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['items'].length()").value(1))
			.andExpect(jsonPath(RESULTS_0_PATH + "['items'][0]['name']").value("Deal for company"));
	}

	@Test
	@DisplayName("Get deals filtered by contactId - Returns only deals linked to that contact")
	void getDeals_FilterByContactId_ReturnsMatchingDeals() throws Exception {
		CrmDealStage stage = savedStage();
		CrmCompany company = savedCompany("Contact Filter Deal Company");

		CrmContact contactA = new CrmContact();
		contactA.setFirstName("Contact");
		contactA.setLastName("A");
		contactA.setEmail("deal.filter.contact.a@example.com");
		contactA.setCompany(company);
		contactA.setOwner(employeeDao.getReferenceById(1L));
		contactA = crmContactDao.save(contactA);

		CrmContact contactB = new CrmContact();
		contactB.setFirstName("Contact");
		contactB.setLastName("B");
		contactB.setEmail("deal.filter.contact.b@example.com");
		contactB.setCompany(company);
		contactB.setOwner(employeeDao.getReferenceById(1L));
		contactB = crmContactDao.save(contactB);

		CrmDeal dealA = new CrmDeal();
		dealA.setName("Deal for Contact A");
		dealA.setStage(stage);
		dealA.setContact(contactA);
		dealA.setCompany(company);
		dealA.setOwner(employeeDao.getReferenceById(1L));
		dealA.setPriority(CrmDealPriority.MEDIUM);
		dealA.setOrderIndex("a0");
		crmDealDao.save(dealA);

		CrmDeal dealB = new CrmDeal();
		dealB.setName("Deal for Contact B");
		dealB.setStage(stage);
		dealB.setContact(contactB);
		dealB.setCompany(company);
		dealB.setOwner(employeeDao.getReferenceById(1L));
		dealB.setPriority(CrmDealPriority.MEDIUM);
		dealB.setOrderIndex("b0");
		crmDealDao.save(dealB);

		performRequest(
				get(BASE_PATH).param("contactId", contactA.getId().toString()).accept(MediaType.APPLICATION_JSON))
			.andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['items'].length()").value(1))
			.andExpect(jsonPath(RESULTS_0_PATH + "['items'][0]['name']").value("Deal for Contact A"));
	}

	// --- Check deal name exists tests ---

	@Test
	@DisplayName("Check deal name exists when not found - Returns OK with false")
	void checkDealNameExists_NotFound_ReturnsOkWithFalse() throws Exception {
		performGetExistsRequest("NonExistentDeal").andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['isExists']").value(false));
	}

	@Test
	@DisplayName("Check deal name exists when found - Returns OK with true")
	void checkDealNameExists_Found_ReturnsOkWithTrue() throws Exception {
		CrmDeal deal = new CrmDeal();
		deal.setName("Existing Deal");
		deal.setStage(savedStage());
		deal.setOwner(employeeDao.getReferenceById(1L));
		deal.setContact(savedContact(null));
		deal.setPriority(CrmDealPriority.MEDIUM);
		deal.setOrderIndex("a0");
		crmDealDao.save(deal);

		performGetExistsRequest("Existing Deal").andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['isExists']").value(true));
	}

	@Test
	@DisplayName("Check deal name exists is case-sensitive - Returns OK with false for different casing")
	void checkDealNameExists_CaseInsensitive_ReturnsOkWithTrue() throws Exception {
		CrmDeal deal = new CrmDeal();
		deal.setName("Case Deal");
		deal.setStage(savedStage());
		deal.setOwner(employeeDao.getReferenceById(1L));
		deal.setContact(savedContact(null));
		deal.setPriority(CrmDealPriority.MEDIUM);
		deal.setOrderIndex("a0");
		crmDealDao.save(deal);

		performGetExistsRequest("case deal").andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['isExists']").value(false));
	}

	@Test
	@DisplayName("Check deal name exists for soft-deleted deal - Returns OK with false")
	void checkDealNameExists_SoftDeletedDeal_ReturnsOkWithFalse() throws Exception {
		CrmDeal deal = new CrmDeal();
		deal.setName("Deleted Deal");
		deal.setStage(savedStage());
		deal.setOwner(employeeDao.getReferenceById(1L));
		deal.setContact(savedContact(null));
		deal.setPriority(CrmDealPriority.MEDIUM);
		deal.setOrderIndex("a0");
		deal.setIsDeleted(true);
		crmDealDao.save(deal);

		performGetExistsRequest("Deleted Deal").andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['isExists']").value(false));
	}

	@Test
	@DisplayName("Check deal name exists with blank name - Returns Bad Request")
	void checkDealNameExists_BlankName_ReturnsBadRequest() throws Exception {
		performGetExistsRequest("").andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['message']")
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_DEAL_NAME_REQUIRED)));
	}

	@Test
	@DisplayName("Check deal name exists with name exceeding max length - Returns Bad Request")
	void checkDealNameExists_NameTooLong_ReturnsBadRequest() throws Exception {
		String tooLongName = "A".repeat(256);
		performGetExistsRequest(tooLongName).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['message']")
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_DEAL_NAME_TOO_LONG)));
	}

	// --- Create deal tests ---

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

		CrmCompany newCompany = savedCompany("New Company");
		CrmContact newContact = savedContact(newCompany);
		newContact.setFirstName("New");
		newContact.setLastName("Contact");
		newContact = crmContactDao.save(newContact);

		CrmDealEditRequestDto dto = new CrmDealEditRequestDto();
		dto.setName("Updated Deal Name");
		dto.setAmount("5000.50");
		dto.setPriority(CrmDealPriority.HIGH);
		dto.setContactId(newContact.getId());

		performPatchRequest(deal.getId(), dto).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath("$.results[0].name").value("Updated Deal Name"))
			.andExpect(jsonPath("$.results[0].amount").value("5000.50"))
			.andExpect(jsonPath("$.results[0].contactName").value("New Contact"))
			.andExpect(jsonPath("$.results[0].companyName").value("New Company"));
	}

	@Test
	@DisplayName("Edit deal - update contact - company auto-resolved from new contact's company")
	void editDeal_UpdateContact_CompanyAutoResolved() throws Exception {
		CrmDealStage stage = savedStage();
		CrmCompany company = savedCompany("Original Corp");
		CrmContact contact = savedContact(company);
		CrmDeal deal = savedDeal(stage, contact);
		deal.setCompany(company);
		deal = crmDealDao.save(deal);

		CrmCompany newCompany = savedCompany("New Corp");
		CrmContact newContact = savedContact(newCompany);
		newContact.setFirstName("New");
		newContact.setLastName("Contact");
		newContact = crmContactDao.save(newContact);

		CrmDealEditRequestDto dto = new CrmDealEditRequestDto();
		dto.setContactId(newContact.getId());

		performPatchRequest(deal.getId(), dto).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath("$.results[0].contactName").value("New Contact"))
			.andExpect(jsonPath("$.results[0].companyName").value("New Corp"));
	}

	@Test
	@DisplayName("Edit deal - update contact - new contact has no company - company set to null")
	void editDeal_UpdateContact_NoCompany_CompanyNull() throws Exception {
		CrmDealStage stage = savedStage();
		CrmCompany company = savedCompany("Original Corp");
		CrmContact contact = savedContact(company);
		CrmDeal deal = savedDeal(stage, contact);
		deal.setCompany(company);
		deal = crmDealDao.save(deal);

		CrmContact newContact = savedContact(null);
		newContact.setFirstName("No");
		newContact.setLastName("Company Contact");
		newContact = crmContactDao.save(newContact);

		CrmDealEditRequestDto dto = new CrmDealEditRequestDto();
		dto.setContactId(newContact.getId());

		performPatchRequest(deal.getId(), dto).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath("$.results[0].contactName").value("No Company Contact"))
			.andExpect(jsonPath("$.results[0].companyName").value(nullValue()));
	}

	@Test
	@DisplayName("Edit deal - update contact - new contact's company is soft-deleted - company set to null")
	void editDeal_UpdateContact_DeletedCompany_CompanyNull() throws Exception {
		CrmDealStage stage = savedStage();
		CrmCompany originalCompany = savedCompany("Original Corp");
		CrmContact contact = savedContact(originalCompany);
		CrmDeal deal = savedDeal(stage, contact);
		deal.setCompany(originalCompany);
		deal = crmDealDao.save(deal);

		CrmCompany deletedCompany = savedCompany("Deleted Corp");
		CrmContact newContact = savedContact(deletedCompany);
		newContact.setFirstName("Deleted");
		newContact.setLastName("Company Contact");
		newContact = crmContactDao.save(newContact);

		// soft-delete the new contact's company
		deletedCompany.setIsDeleted(true);
		crmCompanyDao.save(deletedCompany);

		CrmDealEditRequestDto dto = new CrmDealEditRequestDto();
		dto.setContactId(newContact.getId());

		performPatchRequest(deal.getId(), dto).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath("$.results[0].contactName").value("Deleted Company Contact"))
			.andExpect(jsonPath("$.results[0].companyName").value(nullValue()));
	}

	@Test
	@DisplayName("Edit deal - deal not found - returns bad request")
	void editDeal_DealNotFound_ReturnsBadRequest() throws Exception {
		CrmDealEditRequestDto dto = new CrmDealEditRequestDto();
		dto.setName("Updated Name");

		performPatchRequest(9999L, dto).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath("$.results[0].message")
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_DEAL_NOT_FOUND)));
	}

	// --- Get deal by ID tests ---

	@Test
	@DisplayName("Get deal by ID - Happy path returns deal detail")
	void getDealById_HappyPath_ReturnsDealDetail() throws Exception {
		CrmDeal deal = savedDeal();

		performRequest(get(BASE_PATH + "/" + deal.getId()).accept(MediaType.APPLICATION_JSON)).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['id']").value(deal.getId().intValue()))
			.andExpect(jsonPath(RESULTS_0_PATH + "['name']").value("Saved Deal"))
			.andExpect(jsonPath(RESULTS_0_PATH + "['amount']").value("5000"))
			.andExpect(jsonPath(RESULTS_0_PATH + "['description']").value("Test deal description"))
			.andExpect(jsonPath(RESULTS_0_PATH + "['priority']").value("HIGH"))
			.andExpect(jsonPath(RESULTS_0_PATH + "['contactId']").value(deal.getContact().getId().intValue()))
			.andExpect(jsonPath(RESULTS_0_PATH + "['contactName']").value("Deal Test Contact"))
			.andExpect(jsonPath(RESULTS_0_PATH + "['companyName']").value("Deal Company"))
			.andExpect(jsonPath(RESULTS_0_PATH + "['stage']['id']").value(deal.getStage().getId().intValue()))
			.andExpect(jsonPath(RESULTS_0_PATH + "['owner']").exists())
			.andExpect(jsonPath(RESULTS_0_PATH + "['closingAt']").doesNotExist());
	}

	@Test
	@DisplayName("Get deal by ID - Deal with no company returns null company")
	void getDealById_NoCompany_ReturnsNullCompany() throws Exception {
		CrmDealStage stage = savedStage();
		CrmContact contact = savedContact(null);
		CrmDeal deal = new CrmDeal();
		deal.setName("No Company Deal");
		deal.setAmount("4000");
		deal.setPriority(CrmDealPriority.LOW);
		deal.setStage(stage);
		deal.setContact(contact);
		deal.setCompany(null);
		deal.setOwner(employeeDao.getReferenceById(1L));
		deal.setOrderIndex("a0");
		CrmDeal savedDeal = crmDealDao.save(deal);

		performRequest(get(BASE_PATH + "/" + savedDeal.getId()).accept(MediaType.APPLICATION_JSON)).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['id']").value(savedDeal.getId().intValue()))
			.andExpect(jsonPath(RESULTS_0_PATH + "['name']").value("No Company Deal"))
			.andExpect(jsonPath(RESULTS_0_PATH + "['stage']['id']").value(savedDeal.getStage().getId().intValue()))
			.andExpect(jsonPath(RESULTS_0_PATH + "['companyName']").value(nullValue()));
	}

	@Test
	@DisplayName("Get deal by ID - Not found returns bad request")
	void getDealById_NotFound_ReturnsBadRequest() throws Exception {
		performRequest(get(BASE_PATH + "/99999").accept(MediaType.APPLICATION_JSON)).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['message']")
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_DEAL_NOT_FOUND)));
	}

	@Test
	@DisplayName("Edit deal - update stage - returns success")
	void editDeal_UpdateStage_ReturnsSuccess() throws Exception {
		CrmDealStage stage = savedStage();
		CrmContact contact = savedContact(null);
		CrmDeal deal = savedDeal(stage, contact);

		CrmDealStage newStage = new CrmDealStage();
		newStage.setName("New Stage");
		newStage.setColor("#112233");
		newStage.setOrderIndex(2);
		newStage.setStageType(CrmDealStageType.OPEN);
		newStage = crmDealStageDao.save(newStage);

		CrmDealEditRequestDto dto = new CrmDealEditRequestDto();
		dto.setStageId(newStage.getId());

		performPatchRequest(deal.getId(), dto).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath("$.results[0].stage.name").value(newStage.getName()));
	}

	@Test
	@DisplayName("Edit deal - invalid stage ID - returns bad request")
	void editDeal_InvalidStageId_ReturnsBadRequest() throws Exception {
		CrmDealStage stage = savedStage();
		CrmContact contact = savedContact(null);
		CrmDeal deal = savedDeal(stage, contact);

		CrmDealEditRequestDto dto = new CrmDealEditRequestDto();
		dto.setStageId(9999L);

		performPatchRequest(deal.getId(), dto).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath("$.results[0].message")
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_DEAL_STAGE_NOT_FOUND)));
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
	@DisplayName("Edit deal - non-admin/non-manager representative edit owner - returns bad request")
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
		dto.setOwnerId(1L); // attempt to change owner to user1

		// Sales rep cannot reassign - resolveOwner throws assignment denied exception
		performPatchRequest(deal.getId(), dto).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath("$.results[0].message")
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_OWNER_ASSIGNMENT_DENIED)));
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
		dto.setOwnerId(2L);

		performPatchRequest(deal.getId(), dto).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath("$.results[0].owner.employeeId").value(2L));
	}

	@Test
	@DisplayName("Get deal by ID - Soft deleted deal returns bad request")
	void getDealById_SoftDeleted_ReturnsBadRequest() throws Exception {
		CrmDeal deal = savedDeal();
		deal.setIsDeleted(true);
		crmDealDao.save(deal);

		performRequest(get(BASE_PATH + "/" + deal.getId()).accept(MediaType.APPLICATION_JSON)).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['message']")
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_DEAL_NOT_FOUND)));
	}

	// --- Delete deal tests ---

	@Test
	@DisplayName("Delete active deal - Soft deletes deal and all associated tasks")
	void deleteDeal_ActiveDeal_SoftDeletesDealAndTasks() throws Exception {
		CrmDealStage stage = savedStage();
		CrmContact contact = savedContact(null);

		// Create deal
		CrmDeal deal = new CrmDeal();
		deal.setName("Deal to Delete");
		deal.setStage(stage);
		deal.setContact(contact);
		deal.setOwner(employeeDao.getReferenceById(1L));
		deal.setPriority(CrmDealPriority.HIGH);
		deal.setOrderIndex("a0");
		deal = crmDealDao.save(deal);

		// Create a task type first
		CrmTaskType taskType = new CrmTaskType();
		taskType.setName("Meeting");
		taskType.setOrderIndex(1);
		taskType = crmTaskTypeDao.save(taskType);

		// Create two tasks linked to deal with required fields populated
		CrmTask task1 = new CrmTask();
		task1.setName("Task 1");
		task1.setType(taskType);
		task1.setPriority(CrmTaskPriority.MEDIUM);
		task1.setOwner(employeeDao.getReferenceById(1L));
		task1.setDeal(deal);
		task1.setIsDeleted(false);
		crmTaskDao.save(task1);

		CrmTask task2 = new CrmTask();
		task2.setName("Task 2");
		task2.setType(taskType);
		task2.setPriority(CrmTaskPriority.MEDIUM);
		task2.setOwner(employeeDao.getReferenceById(1L));
		task2.setDeal(deal);
		task2.setIsDeleted(false);
		crmTaskDao.save(task2);

		// Perform delete
		performDeleteRequest(deal.getId()).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_SUCCESS_DEAL_DELETED)));

		// Verify deal is soft-deleted
		CrmDeal deletedDeal = crmDealDao.findById(deal.getId()).orElseThrow();
		assertTrue(deletedDeal.getIsDeleted());

		// Verify tasks are soft-deleted
		List<CrmTask> tasks = crmTaskDao.findByDeal_IdAndIsDeletedFalse(deal.getId());
		assertThat(tasks).isEmpty();
	}

	@Test
	@DisplayName("Delete already deleted deal - Returns Bad Request")
	void deleteDeal_AlreadyDeleted_ReturnsBadRequest() throws Exception {
		CrmDealStage stage = savedStage();
		CrmContact contact = savedContact(null);

		CrmDeal deal = new CrmDeal();
		deal.setName("Already Deleted Deal");
		deal.setStage(stage);
		deal.setContact(contact);
		deal.setOwner(employeeDao.getReferenceById(1L));
		deal.setPriority(CrmDealPriority.MEDIUM);
		deal.setOrderIndex("a0");
		deal.setIsDeleted(true);
		deal = crmDealDao.save(deal);

		performDeleteRequest(deal.getId()).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_DEAL_NOT_FOUND)));
	}

	@Test
	@DisplayName("Get deal by ID - Without CRM role returns forbidden")
	void getDealById_WithoutCrmRole_ReturnsForbidden() throws Exception {
		CrmDeal deal = savedDeal();
		String nonCrmToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user3@gmail.com"),
				1L);

		mvc.perform(get(BASE_PATH + "/" + deal.getId()).accept(MediaType.APPLICATION_JSON)
			.with(SecurityTestUtils.bearerToken(nonCrmToken))).andDo(print()).andExpect(status().isForbidden());
	}

	@Test
	@DisplayName("Delete non-existent deal - Returns Bad Request")
	void deleteDeal_NonExistent_ReturnsBadRequest() throws Exception {
		performDeleteRequest(99999L).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_DEAL_NOT_FOUND)));
	}

	@Test
	@DisplayName("Delete deal without required role - Returns Forbidden")
	void deleteDeal_WithoutRequiredRole_ReturnsForbidden() throws Exception {
		// user2@gmail.com only has CRM_SALES_REPRESENTATIVE role
		authToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user2@gmail.com"), 1L);

		performDeleteRequest(1L).andDo(print()).andExpect(status().isForbidden());
	}

}
