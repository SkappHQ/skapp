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
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = TestSkappApplication.class)
@AutoConfigureMockMvc
@Transactional
@RequiredArgsConstructor
@DisplayName("Leave Type Breakdown Controller Integration Tests")
class LeaveTypeBreakdownControllerIntegrationTest {

	private static final String ENDPOINT = "/v1/leave/analytics/leave-type-breakdown";

	private final AuthorityService authorityService;

	private final JwtService jwtService;

	private final UserDetailsService userDetailsService;

	private final MockMvc mvc;

	private ResultActions performBreakdownRequest(String authToken, String teamIds) throws Exception {
		var requestBuilder = get(ENDPOINT).accept(MediaType.APPLICATION_JSON);
		if (teamIds != null) {
			requestBuilder = requestBuilder.param("teamIds", teamIds);
		}
		return mvc.perform(requestBuilder.with(SecurityTestUtils.bearerToken(authToken)));
	}

	@Nested
	@DisplayName("Super Admin - Leave Type Breakdown")
	@Sql(statements = {
			"INSERT INTO leave_request (leave_req_id, start_date, end_date, leave_state, status, employee_id, type_id, duration_days, is_viewed, is_auto_approved) "
					+ "VALUES (default, YEAR(CURRENT_TIMESTAMP) || '-02-10', YEAR(CURRENT_TIMESTAMP) || '-02-11', 'FULLDAY', 'APPROVED', 2, 1, 2, false, false)",
			"INSERT INTO leave_request (leave_req_id, start_date, end_date, leave_state, status, employee_id, type_id, duration_days, is_viewed, is_auto_approved) "
					+ "VALUES (default, YEAR(CURRENT_TIMESTAMP) || '-02-12', YEAR(CURRENT_TIMESTAMP) || '-02-13', 'FULLDAY', 'APPROVED', 5, 2, 2, false, false)" })
	class SuperAdminTests {

		@Test
		@DisplayName("Super admin with teamIds=-1 sees all employees approved leave data")
		void getLeaveTypeBreakdown_SuperAdmin_ReturnsAllEmployeesData() throws Exception {
			SecurityTestUtils.setupSecurityContext(authorityService, MockUserFactory.createLeaveAdmin());
			String authToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user1@gmail.com"),
					1L);

			performBreakdownRequest(authToken, "-1").andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
				.andExpect(jsonPath(RESULTS_0_PATH + "['totalLeaves']").exists())
				.andExpect(jsonPath(RESULTS_0_PATH + "['totalLeaves']['Feb']").value(4.0))
				.andExpect(jsonPath(RESULTS_0_PATH + "['totalLeaves']['Mar']").value(2.0));
		}

		@Test
		@DisplayName("Super admin without teamIds param sees all employees approved leave data")
		void getLeaveTypeBreakdown_SuperAdminNoTeamIds_ReturnsAllEmployeesData() throws Exception {
			SecurityTestUtils.setupSecurityContext(authorityService, MockUserFactory.createLeaveAdmin());
			String authToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user1@gmail.com"),
					1L);

			performBreakdownRequest(authToken, null).andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
				.andExpect(jsonPath(RESULTS_0_PATH + "['totalLeaves']").exists())
				.andExpect(jsonPath(RESULTS_0_PATH + "['totalLeaves']['Feb']").value(4.0))
				.andExpect(jsonPath(RESULTS_0_PATH + "['totalLeaves']['Mar']").value(2.0));
		}

	}

	@Nested
	@DisplayName("Leave Admin (non-super) - Leave Type Breakdown")
	@Sql(statements = {
			"INSERT INTO leave_request (leave_req_id, start_date, end_date, leave_state, status, employee_id, type_id, duration_days, is_viewed, is_auto_approved) "
					+ "VALUES (default, YEAR(CURRENT_TIMESTAMP) || '-02-10', YEAR(CURRENT_TIMESTAMP) || '-02-11', 'FULLDAY', 'APPROVED', 2, 1, 2, false, false)",
			"INSERT INTO leave_request (leave_req_id, start_date, end_date, leave_state, status, employee_id, type_id, duration_days, is_viewed, is_auto_approved) "
					+ "VALUES (default, YEAR(CURRENT_TIMESTAMP) || '-02-12', YEAR(CURRENT_TIMESTAMP) || '-02-13', 'FULLDAY', 'APPROVED', 5, 2, 2, false, false)" })
	class LeaveAdminTests {

		@Test
		@DisplayName("Leave admin with teamIds=-1 sees all employees approved leave data")
		void getLeaveTypeBreakdown_LeaveAdmin_ReturnsAllEmployeesData() throws Exception {
			// user2 has LEAVE_ADMIN in DB (not super admin) -
			// isUserSuperAdminOrLeaveAdmin
			// returns true
			SecurityTestUtils.setupSecurityContext(authorityService, MockUserFactory.createLeaveAdmin());
			String authToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user2@gmail.com"),
					2L);

			performBreakdownRequest(authToken, "-1").andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
				.andExpect(jsonPath(RESULTS_0_PATH + "['totalLeaves']").exists())
				.andExpect(jsonPath(RESULTS_0_PATH + "['totalLeaves']['Feb']").value(4.0))
				.andExpect(jsonPath(RESULTS_0_PATH + "['totalLeaves']['Mar']").value(2.0));
		}

	}

	@Nested
	@DisplayName("Leave Manager - Leave Type Breakdown (supervised employees only)")
	@Sql(statements = {
			// Change emp3 role from LEAVE_ADMIN to LEAVE_MANAGER
			"UPDATE employee_role SET leave_role = 'LEAVE_MANAGER', is_super_admin = false WHERE employee_id = 3",
			// Make emp3 supervisor of team 6 (My Team1)
			"INSERT INTO employee_team (id, team_id, employee_id, is_supervisor) VALUES (default, 6, 3, true)",
			// Add emp5 as member of team 6
			"INSERT INTO employee_team (id, team_id, employee_id, is_supervisor) VALUES (default, 6, 5, false)",
			// Add emp3 as PRIMARY manager of emp4 (to test primary supervision)
			"INSERT INTO employee_manager (id, employee_id, manager_id, is_direct_manager, manager_type) VALUES (default, 4, 3, 1, 'PRIMARY')",
			// Add APPROVED leave for emp2 (supervised by emp3 as SECONDARY manager) in
			// Feb
			"INSERT INTO leave_request (leave_req_id, start_date, end_date, leave_state, status, employee_id, type_id, duration_days, is_viewed, is_auto_approved) "
					+ "VALUES (default, YEAR(CURRENT_TIMESTAMP) || '-02-10', YEAR(CURRENT_TIMESTAMP) || '-02-11', 'FULLDAY', 'APPROVED', 2, 1, 2, false, false)",
			// Add APPROVED leave for emp5 (team member under emp3's team) in Feb
			"INSERT INTO leave_request (leave_req_id, start_date, end_date, leave_state, status, employee_id, type_id, duration_days, is_viewed, is_auto_approved) "
					+ "VALUES (default, YEAR(CURRENT_TIMESTAMP) || '-02-12', YEAR(CURRENT_TIMESTAMP) || '-02-13', 'FULLDAY', 'APPROVED', 5, 2, 2, false, false)" })
	class LeaveManagerTests {

		@Test
		@DisplayName("Leave manager with teamIds=-1 sees primary + secondary + team members")
		void getLeaveTypeBreakdown_LeaveManager_ReturnsOnlySupervisedEmployeesData() throws Exception {
			SecurityTestUtils.setupSecurityContext(authorityService,
					MockUserFactory.createLeaveManager("user3@gmail.com", 3L, 3L));
			String authToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user3@gmail.com"),
					3L);

			// emp3 supervises: emp2 (SECONDARY), emp4 (PRIMARY), emp5 (team 6
			// member)
			// emp4 has APPROVED leave in March (from data.sql)
			performBreakdownRequest(authToken, "-1").andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
				.andExpect(jsonPath(RESULTS_0_PATH + "['totalLeaves']").exists())
				// Feb: emp2 (2 days) + emp5 (2 days) = 4
				.andExpect(jsonPath(RESULTS_0_PATH + "['totalLeaves']['Feb']").value(4.0))
				// Mar: emp4 (2 days, PRIMARY supervised) = 2
				.andExpect(jsonPath(RESULTS_0_PATH + "['totalLeaves']['Mar']").value(2.0));
		}

		@Test
		@DisplayName("Leave manager without teamIds sees primary + secondary + team members")
		void getLeaveTypeBreakdown_LeaveManagerNoTeamIds_ReturnsOnlySupervisedEmployeesData() throws Exception {
			SecurityTestUtils.setupSecurityContext(authorityService,
					MockUserFactory.createLeaveManager("user3@gmail.com", 3L, 3L));
			String authToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user3@gmail.com"),
					3L);

			performBreakdownRequest(authToken, null).andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
				.andExpect(jsonPath(RESULTS_0_PATH + "['totalLeaves']").exists())
				.andExpect(jsonPath(RESULTS_0_PATH + "['totalLeaves']['Feb']").value(4.0))
				.andExpect(jsonPath(RESULTS_0_PATH + "['totalLeaves']['Mar']").value(2.0));
		}

		@Test
		@DisplayName("Leave manager with specific teamIds sees ONLY that team's members, not primary/secondary supervised")
		void getLeaveTypeBreakdown_LeaveManagerSpecificTeam_ReturnsTeamDataOnly() throws Exception {
			SecurityTestUtils.setupSecurityContext(authorityService,
					MockUserFactory.createLeaveManager("user3@gmail.com", 3L, 3L));
			String authToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user3@gmail.com"),
					3L);

			// Query only team 6 (where emp5 is a member)
			// emp2 (SECONDARY supervised) and emp4 (PRIMARY supervised) are NOT
			// in team 6, so they should be excluded
			performBreakdownRequest(authToken, "6").andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
				.andExpect(jsonPath(RESULTS_0_PATH + "['totalLeaves']").exists())
				// Feb: only emp5 (2 days in team 6)
				.andExpect(jsonPath(RESULTS_0_PATH + "['totalLeaves']['Feb']").value(2.0))
				// Mar: emp4 is PRIMARY supervised but NOT in team 6, so excluded
				.andExpect(jsonPath(RESULTS_0_PATH + "['totalLeaves']['Mar']").value(0.0));
		}

	}

}
