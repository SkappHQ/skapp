package com.skapp.community.crmplanner.controller.v2;

import com.skapp.TestSkappApplication;
import com.skapp.community.common.service.JwtService;
import com.skapp.community.common.type.Role;
import com.skapp.community.crmplanner.model.CrmCompany;
import com.skapp.community.crmplanner.model.CrmContact;
import com.skapp.community.crmplanner.model.CrmTaskType;
import com.skapp.community.crmplanner.repository.CrmCompanyDao;
import com.skapp.community.crmplanner.repository.CrmContactDao;
import com.skapp.community.crmplanner.repository.CrmTaskTypeDao;
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
import org.springframework.transaction.annotation.Transactional;

import static com.skapp.support.TestConstants.RESULTS_0_PATH;
import static com.skapp.support.TestConstants.STATUS_PATH;
import static com.skapp.support.TestConstants.STATUS_SUCCESSFUL;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = TestSkappApplication.class)
@AutoConfigureMockMvc
@Transactional
@RequiredArgsConstructor
@DisplayName("CRM Board Controller V2 Integration Tests")
class CrmBoardControllerV2IntegrationTest {

	private static final String BASE_PATH = "/v2/crm/board/init-data";

	private final MockMvc mvc;

	private final JwtService jwtService;

	private final UserDetailsService userDetailsService;

	private final CrmCompanyDao crmCompanyDao;

	private final CrmContactDao crmContactDao;

	private final CrmTaskTypeDao crmTaskTypeDao;

	private final EmployeeDao employeeDao;

	private final EmployeeRoleDao employeeRoleDao;

	private String repToken;

	private CrmCompany company;

	private CrmContact contact;

	@BeforeEach
	void setup() {
		employeeDao.findById(2L).orElseThrow().getEmployeeRole().setCrmRole(Role.CRM_SALES_REPRESENTATIVE);
		employeeRoleDao.flush();
		repToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user2@gmail.com"), 1L);

		company = new CrmCompany();
		company.setName("Board V2 Company");
		crmCompanyDao.save(company);

		contact = new CrmContact();
		contact.setName("Board V2 Contact");
		contact.setEmail("board.v2.contact@example.com");
		contact.setCompany(company);
		contact.setOwner(employeeDao.getReferenceById(1L));
		crmContactDao.save(contact);

		CrmTaskType taskType = new CrmTaskType();
		taskType.setName("Call");
		taskType.setOrderIndex(1);
		crmTaskTypeDao.save(taskType);
	}

	@Test
	@DisplayName("Board init data - Carries a contact's company as an id, not a nested object")
	void getBoardInitData_ContactCompanyIsAnIdReference() throws Exception {
		mvc.perform(get(BASE_PATH).accept(MediaType.APPLICATION_JSON).with(SecurityTestUtils.bearerToken(repToken)))
			.andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['contacts'][?(@.id == " + contact.getId() + ")].name")
				.value("Board V2 Contact"))
			.andExpect(jsonPath(RESULTS_0_PATH + "['contacts'][?(@.id == " + contact.getId() + ")].companyId")
				.value(company.getId().intValue()))
			.andExpect(jsonPath(RESULTS_0_PATH + "['contacts'][?(@.id == " + contact.getId() + ")].company")
				.doesNotExist());
	}

	@Test
	@DisplayName("Board init data - Returns the shared lookup set alongside the contacts")
	void getBoardInitData_ReturnsSharedLookupSet() throws Exception {
		mvc.perform(get(BASE_PATH).accept(MediaType.APPLICATION_JSON).with(SecurityTestUtils.bearerToken(repToken)))
			.andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['stages']").isArray())
			.andExpect(jsonPath(RESULTS_0_PATH + "['contacts']").isNotEmpty())
			.andExpect(jsonPath(RESULTS_0_PATH + "['owners']").isArray())
			.andExpect(jsonPath(RESULTS_0_PATH + "['taskTypes']").isNotEmpty());
	}

	@Test
	@DisplayName("Board init data without CRM role - Returns Forbidden")
	void getBoardInitData_WithoutCrmRole_ReturnsForbidden() throws Exception {
		String noCrmRoleToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user4@gmail.com"),
				1L);

		mvc.perform(
				get(BASE_PATH).accept(MediaType.APPLICATION_JSON).with(SecurityTestUtils.bearerToken(noCrmRoleToken)))
			.andDo(print())
			.andExpect(status().isForbidden());
	}

}
