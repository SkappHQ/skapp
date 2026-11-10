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
import static org.hamcrest.Matchers.closeTo;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = TestSkappApplication.class)
@AutoConfigureMockMvc
@Transactional
@RequiredArgsConstructor
@DisplayName("Policy Leave Analytics Controller Integration Tests")
class PolicyLeaveAnalyticsControllerIntegrationTest {

	private static final String ABSENCE_RATE_ENDPOINT = "/v1/leave/policy-leave/analytics/absence-rate";

	private static final String CURRENT_ABSENCE_RATE_PATH = RESULTS_0_PATH + "['currentAbsenceRate']";

	private static final String MONTH_BEFORE_ABSENCE_RATE_PATH = RESULTS_0_PATH + "['monthBeforeAbsenceRate']";

	private static final double DELTA = 0.01;

	private static final String SEED_LEAVE_POLICY_ENABLED = "INSERT INTO organization_config (config_title, config_value) VALUES ('LEAVE_POLICY', '{\"isEnabled\":true}')";

	private static final String SEED_LEAVE_TYPE = "INSERT INTO lv_leave_type (id, name, emoji_code, color_code, min_duration, is_attachment, is_attachment_must, is_comment_must, is_auto_approval, is_active) "
			+ "VALUES (100, 'PolicyAnnual', 'U+1F3D6', '#FFC107', 'FULL_DAY', false, false, false, false, true)";

	private static final String SEED_POLICY = "INSERT INTO lv_leave_policy (id, name, leave_type_id, policy_type, status, is_carryover_enabled) "
			+ "VALUES (500, 'Annual Policy', 100, 'ACCRUAL', 'ACTIVE', false)";

	private static final String EVERY_DAY_WORKING = "DELETE FROM time_config";

	private static final String NO_HOLIDAYS = "UPDATE holiday SET is_active = false";

	// Current window is today-29..today and the previous window is today-59..today-30.
	private static final String SEED_LEAVE_REQUESTS = "INSERT INTO lv_leave_request (id, employee_id, policy_id, start_date, end_date, leave_state, status, duration_days) VALUES "
			+ "(970, 1, 500, DATEADD('DAY', -5, CURRENT_DATE), DATEADD('DAY', -4, CURRENT_DATE), 'FULLDAY', 'APPROVED', 2), "
			+ "(971, 1, 500, DATEADD('DAY', -31, CURRENT_DATE), DATEADD('DAY', -28, CURRENT_DATE), 'FULLDAY', 'APPROVED', 4), "
			+ "(972, 1, 500, DATEADD('DAY', -40, CURRENT_DATE), DATEADD('DAY', -40, CURRENT_DATE), 'FULLDAY', 'APPROVED', 1), "
			+ "(973, 1, 500, DATEADD('DAY', -3, CURRENT_DATE), DATEADD('DAY', -2, CURRENT_DATE), 'FULLDAY', 'PENDING', 2)";

	private static final String ADD_RECENT_JOINER_TO_TEAM = "INSERT INTO employee_team (id, team_id, employee_id, is_supervisor) VALUES (default, 1, 2, false)";

	private static final String RECENT_JOIN_DATE = "UPDATE employee SET join_date = DATEADD('DAY', -10, CURRENT_DATE) WHERE employee_id = 2";

	private final AuthorityService authorityService;

	private final JwtService jwtService;

	private final UserDetailsService userDetailsService;

	private final MockMvc mvc;

	private String leaveAdminToken() {
		SecurityTestUtils.setupSecurityContext(authorityService, MockUserFactory.createLeaveAdmin());
		return jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user1@gmail.com"), 1L);
	}

	private ResultActions performGetAbsenceRate(String authToken, String teamIds) throws Exception {
		return mvc.perform(get(ABSENCE_RATE_ENDPOINT).param("teamIds", teamIds)
			.accept(MediaType.APPLICATION_JSON)
			.with(SecurityTestUtils.bearerToken(authToken)));
	}

	@Nested
	@DisplayName("GET /absence-rate")
	class GetAbsenceRate {

		@Test
		@DisplayName("Leave inside and across the window edge - prorates into each window without overlap")
		@Sql(statements = { SEED_LEAVE_POLICY_ENABLED, SEED_LEAVE_TYPE, SEED_POLICY, EVERY_DAY_WORKING, NO_HOLIDAYS,
				SEED_LEAVE_REQUESTS })
		void getAbsenceRate_LeaveAcrossWindowEdge_ReturnsProratedRates() throws Exception {
			performGetAbsenceRate(leaveAdminToken(), "1").andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
				.andExpect(jsonPath(CURRENT_ABSENCE_RATE_PATH).value(closeTo(4.0 / 30 * 100, DELTA)))
				.andExpect(jsonPath(MONTH_BEFORE_ABSENCE_RATE_PATH).value(closeTo(3.0 / 30 * 100, DELTA)));
		}

		@Test
		@DisplayName("Employee who joined mid-window - counts working days only from the join date")
		@Sql(statements = { SEED_LEAVE_POLICY_ENABLED, SEED_LEAVE_TYPE, SEED_POLICY, EVERY_DAY_WORKING, NO_HOLIDAYS,
				SEED_LEAVE_REQUESTS, ADD_RECENT_JOINER_TO_TEAM, RECENT_JOIN_DATE })
		void getAbsenceRate_RecentJoiner_CountsFromJoinDate() throws Exception {
			performGetAbsenceRate(leaveAdminToken(), "1").andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(CURRENT_ABSENCE_RATE_PATH).value(closeTo(4.0 / 41 * 100, DELTA)))
				.andExpect(jsonPath(MONTH_BEFORE_ABSENCE_RATE_PATH).value(closeTo(3.0 / 30 * 100, DELTA)));
		}

		@Test
		@DisplayName("All teams selected alongside a team id - treated as all teams")
		@Sql(statements = { SEED_LEAVE_POLICY_ENABLED, SEED_LEAVE_TYPE, SEED_POLICY, EVERY_DAY_WORKING, NO_HOLIDAYS })
		void getAbsenceRate_AllTeamsWithTeamId_ReturnsZeroRates() throws Exception {
			performGetAbsenceRate(leaveAdminToken(), "-1,1").andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(CURRENT_ABSENCE_RATE_PATH).value(closeTo(0, DELTA)))
				.andExpect(jsonPath(MONTH_BEFORE_ABSENCE_RATE_PATH).value(closeTo(0, DELTA)));
		}

		@Test
		@DisplayName("Leave policies disabled - returns an error")
		void getAbsenceRate_PoliciesDisabled_ReturnsError() throws Exception {
			performGetAbsenceRate(leaveAdminToken(), "1").andDo(print()).andExpect(status().is4xxClientError());
		}

	}

}
