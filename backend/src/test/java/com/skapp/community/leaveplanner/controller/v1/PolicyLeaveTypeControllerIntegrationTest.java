package com.skapp.community.leaveplanner.controller.v1;

import com.skapp.TestSkappApplication;
import com.skapp.community.common.security.AuthorityService;
import com.skapp.community.common.service.JwtService;
import com.skapp.support.MockUserFactory;
import com.skapp.support.SecurityTestUtils;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static com.skapp.support.TestConstants.STATUS_PATH;
import static com.skapp.support.TestConstants.STATUS_SUCCESSFUL;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = TestSkappApplication.class)
@AutoConfigureMockMvc
@Transactional
@RequiredArgsConstructor
@DisplayName("Policy Leave Type Controller Integration Tests")
class PolicyLeaveTypeControllerIntegrationTest {

	private static final String ENDPOINT = "/v1/leave/policy-leave-types";

	private static final String SEED_LEAVE_TYPE = "INSERT INTO lv_leave_type (id, name, emoji_code, color_code, min_duration, is_attachment, is_attachment_must, is_comment_must, is_auto_approval, is_active) "
			+ "VALUES (100, 'PolicyAnnual', 'U+1F3D6', '#FFC107', 'FULL_DAY', false, false, false, false, true)";

	private static final String DOWNGRADE_USER2_TO_EMPLOYEE = "UPDATE employee_role SET leave_role = 'LEAVE_EMPLOYEE', people_role = 'PEOPLE_EMPLOYEE', attendance_role = 'ATTENDANCE_EMPLOYEE' WHERE employee_id = 2";

	private final AuthorityService authorityService;

	private final JwtService jwtService;

	private final UserDetailsService userDetailsService;

	private final MockMvc mvc;

	private String leaveAdminToken() {
		SecurityTestUtils.setupSecurityContext(authorityService, MockUserFactory.createLeaveAdmin());
		return jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user1@gmail.com"), 1L);
	}

	private String user2Token() {
		SecurityTestUtils.setupSecurityContext(authorityService, MockUserFactory.createLeaveEmployee());
		return jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user2@gmail.com"), 2L);
	}

	@Test
	@DisplayName("Leave admin can list active policy leave types")
	@Sql(statements = { SEED_LEAVE_TYPE })
	void getPolicyLeaveTypes_LeaveAdmin_ReturnsActiveTypes() throws Exception {
		mvc.perform(
				get(ENDPOINT).accept(MediaType.APPLICATION_JSON).with(SecurityTestUtils.bearerToken(leaveAdminToken())))
			.andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath("$.results", hasSize(1)))
			.andExpect(jsonPath("$.results[0].name").value("PolicyAnnual"));
	}

	@Test
	@DisplayName("Non-admin user cannot list policy leave types")
	@Sql(statements = { DOWNGRADE_USER2_TO_EMPLOYEE })
	void getPolicyLeaveTypes_LeaveEmployee_ReturnsForbidden() throws Exception {
		mvc.perform(get(ENDPOINT).accept(MediaType.APPLICATION_JSON).with(SecurityTestUtils.bearerToken(user2Token())))
			.andDo(print())
			.andExpect(status().isForbidden());
	}

}
