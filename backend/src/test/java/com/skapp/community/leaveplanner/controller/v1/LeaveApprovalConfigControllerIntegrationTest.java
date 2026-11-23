package com.skapp.community.leaveplanner.controller.v1;

import com.skapp.TestSkappApplication;
import com.skapp.community.common.security.AuthorityService;
import com.skapp.community.common.service.JwtService;
import com.skapp.support.MockUserFactory;
import com.skapp.support.SecurityTestUtils;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.transaction.annotation.Transactional;

import static com.skapp.support.TestConstants.RESULTS_0_PATH;
import static com.skapp.support.TestConstants.STATUS_PATH;
import static com.skapp.support.TestConstants.STATUS_SUCCESSFUL;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = TestSkappApplication.class)
@AutoConfigureMockMvc
@Transactional
@RequiredArgsConstructor
@DisplayName("Leave Approval Config Controller Integration Tests")
class LeaveApprovalConfigControllerIntegrationTest {

	private static final String ENDPOINT = "/v1/leave/approval-config";

	private static final String IS_ENABLED_PATH = RESULTS_0_PATH + "['isMultiLevelApprovalEnabled']";

	private static final String DOWNGRADE_USER2_TO_EMPLOYEE = "UPDATE employee_role SET leave_role = 'LEAVE_EMPLOYEE', people_role = 'PEOPLE_EMPLOYEE', attendance_role = 'ATTENDANCE_EMPLOYEE' WHERE employee_id = 2";

	private static final String ENABLED_BODY = "{\"isMultiLevelApprovalEnabled\":true}";

	private static final String DISABLED_BODY = "{\"isMultiLevelApprovalEnabled\":false}";

	private final AuthorityService authorityService;

	private final JwtService jwtService;

	private final UserDetailsService userDetailsService;

	private final MockMvc mvc;

	private String adminToken() {
		SecurityTestUtils.setupSecurityContext(authorityService, MockUserFactory.createSuperAdminWithAllRoles());
		return jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user1@gmail.com"), 1L);
	}

	private String user2Token() {
		SecurityTestUtils.setupSecurityContext(authorityService, MockUserFactory.createLeaveEmployee());
		return jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user2@gmail.com"), 2L);
	}

	private ResultActions performGet(String authToken) throws Exception {
		return mvc
			.perform(get(ENDPOINT).accept(MediaType.APPLICATION_JSON).with(SecurityTestUtils.bearerToken(authToken)))
			.andDo(print());
	}

	private ResultActions performPatch(String authToken, String body) throws Exception {
		return mvc
			.perform(patch(ENDPOINT).contentType(MediaType.APPLICATION_JSON)
				.accept(MediaType.APPLICATION_JSON)
				.content(body)
				.with(SecurityTestUtils.bearerToken(authToken)))
			.andDo(print());
	}

	@Nested
	@DisplayName("Get Leave Approval Config")
	class GetLeaveApprovalConfigTests {

		@Test
		@DisplayName("Returns off when no config is saved")
		void getLeaveApprovalConfig_NoConfig_ReturnsDisabled() throws Exception {
			performGet(adminToken()).andExpect(status().isOk())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
				.andExpect(jsonPath(IS_ENABLED_PATH).value(false));
		}

		@Test
		@DisplayName("Employee without admin roles can read the config")
		@Sql(statements = { DOWNGRADE_USER2_TO_EMPLOYEE })
		void getLeaveApprovalConfig_Employee_ReturnsOk() throws Exception {
			performGet(user2Token()).andExpect(status().isOk()).andExpect(jsonPath(IS_ENABLED_PATH).value(false));
		}

	}

	@Nested
	@DisplayName("Update Leave Approval Config")
	class UpdateLeaveApprovalConfigTests {

		@Test
		@DisplayName("Switching on is saved and returned by GET")
		void updateLeaveApprovalConfig_On_ReturnsEnabled() throws Exception {
			String token = adminToken();

			performPatch(token, ENABLED_BODY).andExpect(status().isOk())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
				.andExpect(jsonPath(IS_ENABLED_PATH).value(true));
			performGet(token).andExpect(status().isOk()).andExpect(jsonPath(IS_ENABLED_PATH).value(true));
		}

		@Test
		@DisplayName("Switching off after on is saved and returned by GET")
		void updateLeaveApprovalConfig_Off_ReturnsDisabled() throws Exception {
			String token = adminToken();

			performPatch(token, ENABLED_BODY).andExpect(status().isOk());
			performPatch(token, DISABLED_BODY).andExpect(status().isOk())
				.andExpect(jsonPath(IS_ENABLED_PATH).value(false));
			performGet(token).andExpect(status().isOk()).andExpect(jsonPath(IS_ENABLED_PATH).value(false));
		}

		@Test
		@DisplayName("Missing value is rejected")
		void updateLeaveApprovalConfig_MissingValue_ReturnsBadRequest() throws Exception {
			performPatch(adminToken(), "{}").andExpect(status().isBadRequest());
		}

		@Test
		@DisplayName("Employee without the people admin role is forbidden")
		@Sql(statements = { DOWNGRADE_USER2_TO_EMPLOYEE })
		void updateLeaveApprovalConfig_Employee_ReturnsForbidden() throws Exception {
			performPatch(user2Token(), ENABLED_BODY).andExpect(status().isForbidden());
		}

	}

}
