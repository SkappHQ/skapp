package com.skapp.community.crmplanner.controller.v2;

import com.skapp.TestSkappApplication;
import com.skapp.community.common.service.JwtService;
import com.skapp.community.common.type.Role;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.community.crmplanner.constant.CrmMessageConstant;
import com.skapp.community.crmplanner.model.CrmIndustry;
import com.skapp.community.crmplanner.repository.CrmIndustryDao;
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
import org.springframework.transaction.annotation.Transactional;

import static com.skapp.support.TestConstants.MESSAGE_PATH;
import static com.skapp.support.TestConstants.RESULTS_0_PATH;
import static com.skapp.support.TestConstants.STATUS_PATH;
import static com.skapp.support.TestConstants.STATUS_SUCCESSFUL;
import static com.skapp.support.TestConstants.STATUS_UNSUCCESSFUL;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = TestSkappApplication.class)
@AutoConfigureMockMvc
@Transactional
@RequiredArgsConstructor
@DisplayName("CRM Industry Controller V2 Integration Tests")
class CrmIndustryControllerV2IntegrationTest {

	private static final String BASE_PATH = "/v2/crm/industry";

	private final MockMvc mvc;

	private final JwtService jwtService;

	private final UserDetailsService userDetailsService;

	private final CrmIndustryDao crmIndustryDao;

	private final EmployeeDao employeeDao;

	private final EmployeeRoleDao employeeRoleDao;

	private final MessageUtil messageUtil;

	private String adminToken;

	@BeforeEach
	void setup() {
		// employee 1 is seeded as CRM_ADMIN in data.sql
		adminToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user1@gmail.com"), 1L);
	}

	private ResultActions performCreateRequest(String token, String body) throws Exception {
		return mvc.perform(post(BASE_PATH).accept(MediaType.APPLICATION_JSON)
			.contentType(MediaType.APPLICATION_JSON)
			.content(body)
			.with(SecurityTestUtils.bearerToken(token)));
	}

	private String tokenForCrmRole(Role crmRole) {
		employeeDao.findById(2L).orElseThrow().getEmployeeRole().setCrmRole(crmRole);
		employeeRoleDao.flush();
		return jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user2@gmail.com"), 1L);
	}

	@Test
	@DisplayName("Create industry as CRM admin - Returns Created with the persisted industry")
	void createIndustry_AsCrmAdmin_ReturnsCreated() throws Exception {
		performCreateRequest(adminToken, "{\"name\":\"Renewable Energy\"}").andDo(print())
			.andExpect(status().isCreated())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['name']").value("Renewable Energy"))
			.andExpect(jsonPath(RESULTS_0_PATH + "['id']").isNumber());

		assert crmIndustryDao.existsByNameIgnoreCaseAndIsDeletedFalse("Renewable Energy");
	}

	@Test
	@DisplayName("Create industry as CRM sales manager - Returns Created")
	void createIndustry_AsCrmSalesManager_ReturnsCreated() throws Exception {
		String managerToken = tokenForCrmRole(Role.CRM_SALES_MANAGER);

		performCreateRequest(managerToken, "{\"name\":\"Maritime Freight\"}").andDo(print())
			.andExpect(status().isCreated())
			.andExpect(jsonPath(RESULTS_0_PATH + "['name']").value("Maritime Freight"));
	}

	@Test
	@DisplayName("Create industry as CRM sales representative - Returns Forbidden")
	void createIndustry_AsCrmSalesRepresentative_ReturnsForbidden() throws Exception {
		String repToken = tokenForCrmRole(Role.CRM_SALES_REPRESENTATIVE);

		performCreateRequest(repToken, "{\"name\":\"Should Not Be Created\"}").andDo(print())
			.andExpect(status().isForbidden());

		assert !crmIndustryDao.existsByNameIgnoreCaseAndIsDeletedFalse("Should Not Be Created");
	}

	@Test
	@DisplayName("Create industry without CRM role - Returns Forbidden")
	void createIndustry_WithoutCrmRole_ReturnsForbidden() throws Exception {
		String noCrmRoleToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user4@gmail.com"),
				1L);

		performCreateRequest(noCrmRoleToken, "{\"name\":\"No Role Industry\"}").andDo(print())
			.andExpect(status().isForbidden());
	}

	@Test
	@DisplayName("Create industry that already exists in a different case - Returns Bad Request, no duplicate")
	void createIndustry_DuplicateIgnoringCase_ReturnsBadRequest() throws Exception {
		CrmIndustry existing = new CrmIndustry();
		existing.setName("Retail");
		crmIndustryDao.save(existing);

		performCreateRequest(adminToken, "{\"name\":\"  rETAIL  \"}").andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_INDUSTRY_EXISTS)));

		assert crmIndustryDao.findAll()
			.stream()
			.filter(industry -> "Retail".equalsIgnoreCase(industry.getName()))
			.count() == 1;
	}

	@Test
	@DisplayName("Create industry with collapsible internal whitespace - Returns Bad Request against the existing single-spaced record")
	void createIndustry_InternalWhitespaceCollapsed_ReturnsBadRequest() throws Exception {
		CrmIndustry existing = new CrmIndustry();
		existing.setName("Real Estate");
		crmIndustryDao.save(existing);

		performCreateRequest(adminToken, "{\"name\":\"Real    Estate\"}").andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_INDUSTRY_EXISTS)));
	}

	@Test
	@DisplayName("Create industry trims surrounding whitespace before persisting")
	void createIndustry_TrimsNameBeforePersisting() throws Exception {
		performCreateRequest(adminToken, "{\"name\":\"   Aerospace Defence   \"}").andDo(print())
			.andExpect(status().isCreated())
			.andExpect(jsonPath(RESULTS_0_PATH + "['name']").value("Aerospace Defence"));
	}

	@Test
	@DisplayName("Create industry with a whitespace-only name - Returns Bad Request")
	void createIndustry_WhitespaceOnlyName_ReturnsBadRequest() throws Exception {
		performCreateRequest(adminToken, "{\"name\":\"    \"}").andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL));
	}

	@Test
	@DisplayName("Create industry exceeding the 100 character limit - Returns Bad Request")
	void createIndustry_NameTooLong_ReturnsBadRequest() throws Exception {
		String tooLongName = "A".repeat(101);

		performCreateRequest(adminToken, "{\"name\":\"" + tooLongName + "\"}").andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL));
	}

	@Test
	@DisplayName("Create industry at exactly the 100 character limit - Returns Created")
	void createIndustry_NameAtMaxLength_ReturnsCreated() throws Exception {
		String maxLengthName = "B".repeat(100);

		performCreateRequest(adminToken, "{\"name\":\"" + maxLengthName + "\"}").andDo(print())
			.andExpect(status().isCreated())
			.andExpect(jsonPath(RESULTS_0_PATH + "['name']").value(maxLengthName));
	}

}
