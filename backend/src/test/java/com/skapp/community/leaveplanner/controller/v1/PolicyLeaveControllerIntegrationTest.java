package com.skapp.community.leaveplanner.controller.v1;

import com.jayway.jsonpath.JsonPath;
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
@DisplayName("Policy Leave Controller Integration Tests")
class PolicyLeaveControllerIntegrationTest {

	private static final String ENDPOINT = "/v1/leave/policy-leave";

	private static final String PENDING_COUNT_PATH = "$.results[0].pendingCount";

	private static final String SEED_LEAVE_POLICY_ENABLED = "INSERT INTO organization_config (config_title, config_value) VALUES ('LEAVE_POLICY', '{\"isEnabled\":true}')";

	private static final String SEED_LEAVE_TYPE = "INSERT INTO lv_leave_type (id, name, emoji_code, color_code, min_duration, is_attachment, is_attachment_must, is_comment_must, is_auto_approval, is_active) "
			+ "VALUES (100, 'PolicyAnnual', 'U+1F3D6', '#FFC107', 'HALF_AND_FULL_DAY', false, false, false, false, true)";

	private static final String SEED_POLICY = "INSERT INTO lv_leave_policy (id, name, leave_type_id, policy_type, status, is_carryover_enabled) "
			+ "VALUES (500, 'Annual Policy', 100, 'ACCRUAL', 'ACTIVE', false)";

	private static final String SEED_PENDING_AND_REVIEWED_REQUESTS = "INSERT INTO lv_leave_request (id, employee_id, policy_id, start_date, end_date, leave_state, status, duration_days) VALUES "
			+ "(960, 2, 500, '2025-06-11', '2025-06-11', 'FULLDAY', 'PENDING', 1), "
			+ "(961, 3, 500, '2025-06-12', '2025-06-13', 'FULLDAY', 'PENDING', 2), "
			+ "(962, 4, 500, '2025-06-16', '2025-06-16', 'HALFDAY_MORNING', 'PENDING', 0.5), "
			+ "(963, 2, 500, '2025-06-17', '2025-06-17', 'FULLDAY', 'APPROVED', 1), "
			+ "(964, 3, 500, '2025-06-18', '2025-06-18', 'FULLDAY', 'DENIED', 1), "
			+ "(965, 4, 500, '2025-06-19', '2025-06-19', 'FULLDAY', 'CANCELLED', 1), "
			+ "(966, 2, 500, '2025-06-20', '2025-06-20', 'FULLDAY', 'REVOKED', 1)";

	private static final String SEED_PENDING_REQUEST_FOR_UNSUPERVISED_EMPLOYEE_5 = "INSERT INTO lv_leave_request (id, employee_id, policy_id, start_date, end_date, leave_state, status, duration_days) "
			+ "VALUES (967, 5, 500, '2025-06-11', '2025-06-11', 'FULLDAY', 'PENDING', 1)";

	private static final String TERMINATE_EMPLOYEE_3 = "UPDATE employee SET account_status = 'TERMINATED' WHERE employee_id = 3";

	private static final String DELETE_EMPLOYEE_4 = "UPDATE employee SET account_status = 'DELETED' WHERE employee_id = 4";

	private static final String ADD_EMPLOYEE_2_TO_TEAM_2 = "INSERT INTO employee_team (id, team_id, employee_id, is_supervisor) VALUES (default, 2, 2, false)";

	private static final String USER3_LEAVE_MANAGER = "UPDATE employee_role SET leave_role = 'LEAVE_MANAGER', is_super_admin = false WHERE employee_id = 3";

	private static final String USER2_LEAVE_EMPLOYEE = "UPDATE employee_role SET leave_role = 'LEAVE_EMPLOYEE', people_role = 'PEOPLE_EMPLOYEE', attendance_role = 'ATTENDANCE_EMPLOYEE' WHERE employee_id = 2";

	private final AuthorityService authorityService;

	private final JwtService jwtService;

	private final UserDetailsService userDetailsService;

	private final MockMvc mvc;

	private String leaveAdminToken() {
		SecurityTestUtils.setupSecurityContext(authorityService, MockUserFactory.createLeaveAdmin());
		return jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user1@gmail.com"), 1L);
	}

	private String leaveManagerToken() {
		SecurityTestUtils.setupSecurityContext(authorityService,
				MockUserFactory.createLeaveManager("user3@gmail.com", 3L, 3L));
		return jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user3@gmail.com"), 3L);
	}

	private String leaveEmployeeToken() {
		SecurityTestUtils.setupSecurityContext(authorityService, MockUserFactory.createLeaveEmployee());
		return jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user2@gmail.com"), 2L);
	}

	private ResultActions performGetPendingCount(String authToken, String... teamIds) throws Exception {
		return mvc.perform(get(ENDPOINT + "/requests/pending-count").param("teamIds", teamIds)
			.accept(MediaType.APPLICATION_JSON)
			.with(SecurityTestUtils.bearerToken(authToken)));
	}

	private int getPendingRequestsTableTotal(String authToken) throws Exception {
		String response = mvc
			.perform(get(ENDPOINT + "/requests").param("status", "PENDING")
				.accept(MediaType.APPLICATION_JSON)
				.with(SecurityTestUtils.bearerToken(authToken)))
			.andExpect(status().isOk())
			.andReturn()
			.getResponse()
			.getContentAsString();
		return JsonPath.read(response, "$.results[0].totalItems");
	}

	@Nested
	@DisplayName("Get Supervised Pending Policy Leave Count")
	class GetSupervisedPendingPolicyLeaveCountTests {

		@Test
		@DisplayName("Counts only pending requests")
		@Sql(statements = { SEED_LEAVE_POLICY_ENABLED, SEED_LEAVE_TYPE, SEED_POLICY,
				SEED_PENDING_AND_REVIEWED_REQUESTS })
		void getSupervisedPendingPolicyLeaveCount_MixedStatuses_CountsOnlyPending() throws Exception {
			performGetPendingCount(leaveAdminToken()).andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
				.andExpect(jsonPath(PENDING_COUNT_PATH).value(3));
		}

		@Test
		@DisplayName("Returns zero when there are no pending requests")
		@Sql(statements = { SEED_LEAVE_POLICY_ENABLED })
		void getSupervisedPendingPolicyLeaveCount_NoRequests_ReturnsZero() throws Exception {
			performGetPendingCount(leaveAdminToken()).andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(PENDING_COUNT_PATH).value(0));
		}

		@Test
		@DisplayName("Excludes pending requests from employees the current user does not supervise")
		@Sql(statements = { SEED_LEAVE_POLICY_ENABLED, SEED_LEAVE_TYPE, SEED_POLICY,
				SEED_PENDING_REQUEST_FOR_UNSUPERVISED_EMPLOYEE_5 })
		void getSupervisedPendingPolicyLeaveCount_UnsupervisedEmployee_Excluded() throws Exception {
			performGetPendingCount(leaveAdminToken()).andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(PENDING_COUNT_PATH).value(0));
		}

		@Test
		@DisplayName("A leave manager only counts the people they supervise")
		@Sql(statements = { SEED_LEAVE_POLICY_ENABLED, SEED_LEAVE_TYPE, SEED_POLICY, SEED_PENDING_AND_REVIEWED_REQUESTS,
				USER3_LEAVE_MANAGER })
		void getSupervisedPendingPolicyLeaveCount_LeaveManager_ScopedToSupervisees() throws Exception {
			performGetPendingCount(leaveManagerToken()).andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(PENDING_COUNT_PATH).value(1));
		}

		@Test
		@DisplayName("Excludes pending requests from terminated and deleted employees")
		@Sql(statements = { SEED_LEAVE_POLICY_ENABLED, SEED_LEAVE_TYPE, SEED_POLICY, SEED_PENDING_AND_REVIEWED_REQUESTS,
				TERMINATE_EMPLOYEE_3, DELETE_EMPLOYEE_4 })
		void getSupervisedPendingPolicyLeaveCount_TerminatedAndDeletedEmployees_Excluded() throws Exception {
			performGetPendingCount(leaveAdminToken()).andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(PENDING_COUNT_PATH).value(1));
		}

		@Test
		@DisplayName("Narrows the count to the requested teams")
		@Sql(statements = { SEED_LEAVE_POLICY_ENABLED, SEED_LEAVE_TYPE, SEED_POLICY, SEED_PENDING_AND_REVIEWED_REQUESTS,
				ADD_EMPLOYEE_2_TO_TEAM_2 })
		void getSupervisedPendingPolicyLeaveCount_TeamFilter_NarrowsToTeamMembers() throws Exception {
			performGetPendingCount(leaveAdminToken(), "2").andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(PENDING_COUNT_PATH).value(1));
		}

		@Test
		@DisplayName("Returns zero for a team with no pending requests")
		@Sql(statements = { SEED_LEAVE_POLICY_ENABLED, SEED_LEAVE_TYPE, SEED_POLICY, SEED_PENDING_AND_REVIEWED_REQUESTS,
				ADD_EMPLOYEE_2_TO_TEAM_2 })
		void getSupervisedPendingPolicyLeaveCount_TeamWithoutPendingRequests_ReturnsZero() throws Exception {
			performGetPendingCount(leaveAdminToken(), "1").andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(PENDING_COUNT_PATH).value(0));
		}

		@Test
		@DisplayName("Treats a team id of -1 as all teams")
		@Sql(statements = { SEED_LEAVE_POLICY_ENABLED, SEED_LEAVE_TYPE, SEED_POLICY, SEED_PENDING_AND_REVIEWED_REQUESTS,
				ADD_EMPLOYEE_2_TO_TEAM_2 })
		void getSupervisedPendingPolicyLeaveCount_AllTeams_CountsEveryTeam() throws Exception {
			performGetPendingCount(leaveAdminToken(), "-1").andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(PENDING_COUNT_PATH).value(3));
		}

		@Test
		@DisplayName("Matches the total of the pending requests table for a leave admin")
		@Sql(statements = { SEED_LEAVE_POLICY_ENABLED, SEED_LEAVE_TYPE, SEED_POLICY, SEED_PENDING_AND_REVIEWED_REQUESTS,
				SEED_PENDING_REQUEST_FOR_UNSUPERVISED_EMPLOYEE_5, TERMINATE_EMPLOYEE_3 })
		void getSupervisedPendingPolicyLeaveCount_LeaveAdmin_MatchesPendingRequestsTable() throws Exception {
			String authToken = leaveAdminToken();
			int tableTotal = getPendingRequestsTableTotal(authToken);

			performGetPendingCount(authToken).andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(PENDING_COUNT_PATH).value(tableTotal))
				.andExpect(jsonPath(PENDING_COUNT_PATH).value(2));
		}

		@Test
		@DisplayName("Matches the total of the pending requests table for a leave manager")
		@Sql(statements = { SEED_LEAVE_POLICY_ENABLED, SEED_LEAVE_TYPE, SEED_POLICY, SEED_PENDING_AND_REVIEWED_REQUESTS,
				SEED_PENDING_REQUEST_FOR_UNSUPERVISED_EMPLOYEE_5, USER3_LEAVE_MANAGER })
		void getSupervisedPendingPolicyLeaveCount_LeaveManager_MatchesPendingRequestsTable() throws Exception {
			String authToken = leaveManagerToken();
			int tableTotal = getPendingRequestsTableTotal(authToken);

			performGetPendingCount(authToken).andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(PENDING_COUNT_PATH).value(tableTotal))
				.andExpect(jsonPath(PENDING_COUNT_PATH).value(1));
		}

		@Test
		@DisplayName("Returns bad request when leave policies are not enabled")
		@Sql(statements = { SEED_LEAVE_TYPE, SEED_POLICY, SEED_PENDING_AND_REVIEWED_REQUESTS })
		void getSupervisedPendingPolicyLeaveCount_LeavePoliciesDisabled_ReturnsBadRequest() throws Exception {
			performGetPendingCount(leaveAdminToken()).andDo(print()).andExpect(status().isBadRequest());
		}

		@Test
		@DisplayName("Returns forbidden for a leave employee")
		@Sql(statements = { SEED_LEAVE_POLICY_ENABLED, USER2_LEAVE_EMPLOYEE })
		void getSupervisedPendingPolicyLeaveCount_LeaveEmployee_ReturnsForbidden() throws Exception {
			performGetPendingCount(leaveEmployeeToken()).andDo(print()).andExpect(status().isForbidden());
		}

	}

}
