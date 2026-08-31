package com.skapp.community.crmplanner.controller.v2;

import com.skapp.TestSkappApplication;
import com.skapp.community.common.service.JwtService;
import com.skapp.community.common.type.Role;
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

	private static final String INIT_DATA_PATH = "/v2/crm/board/init-data";

	private final MockMvc mvc;

	private final JwtService jwtService;

	private final UserDetailsService userDetailsService;

	private final EmployeeDao employeeDao;

	private final EmployeeRoleDao employeeRoleDao;

	private final CrmIndustryDao crmIndustryDao;

	private String repToken;

	@BeforeEach
	void setup() {
		employeeDao.findById(2L).orElseThrow().getEmployeeRole().setCrmRole(Role.CRM_SALES_REPRESENTATIVE);
		employeeRoleDao.flush();
		repToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user2@gmail.com"), 1L);

		savedIndustry("Retail");
		savedIndustry("Education");
	}

	private CrmIndustry savedIndustry(String name) {
		CrmIndustry industry = new CrmIndustry();
		industry.setName(name);
		return crmIndustryDao.save(industry);
	}

	@Test
	@DisplayName("Board init data V2 - includes industries alongside the existing board data")
	void getBoardInitData_ReturnsIndustries() throws Exception {
		mvc.perform(
				get(INIT_DATA_PATH).accept(MediaType.APPLICATION_JSON).with(SecurityTestUtils.bearerToken(repToken)))
			.andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['stages']").isArray())
			.andExpect(jsonPath(RESULTS_0_PATH + "['contacts']").isArray())
			.andExpect(jsonPath(RESULTS_0_PATH + "['owners']").isArray())
			.andExpect(jsonPath(RESULTS_0_PATH + "['crmRoles']").isArray())
			.andExpect(jsonPath(RESULTS_0_PATH + "['taskTypes']").isArray())
			.andExpect(jsonPath(RESULTS_0_PATH + "['industries']").isArray())
			.andExpect(jsonPath(RESULTS_0_PATH + "['industries']", org.hamcrest.Matchers.hasSize(2)))
			.andExpect(jsonPath(RESULTS_0_PATH + "['industries'][0]['name']").value("Education"))
			.andExpect(jsonPath(RESULTS_0_PATH + "['industries'][1]['name']").value("Retail"));
	}

	@Test
	@DisplayName("Board init data V2 - without CRM role returns Forbidden")
	void getBoardInitData_WithoutCrmRole_ReturnsForbidden() throws Exception {
		String noCrmRoleToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user4@gmail.com"),
				1L);

		mvc.perform(get(INIT_DATA_PATH).accept(MediaType.APPLICATION_JSON)
			.with(SecurityTestUtils.bearerToken(noCrmRoleToken))).andDo(print()).andExpect(status().isForbidden());
	}

}
