package com.skapp.community.leaveplanner.controller.v1;

import com.skapp.TestSkappApplication;
import com.skapp.community.common.security.AuthorityService;
import com.skapp.community.common.service.JwtService;
import com.skapp.community.common.service.TimeZoneService;
import com.skapp.support.MockUserFactory;
import com.skapp.support.SecurityTestUtils;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

import static com.skapp.support.TestConstants.STATUS_PATH;
import static com.skapp.support.TestConstants.STATUS_SUCCESSFUL;
import static org.hamcrest.Matchers.hasSize;
import static org.mockito.Mockito.when;
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

	private static final LocalDate TODAY = LocalDate.of(2025, 6, 11);

	private static final String SEED_LEAVE_POLICY_ENABLED = "INSERT INTO organization_config (config_title, config_value) VALUES ('LEAVE_POLICY', '{\"isEnabled\":true}')";

	private static final String SEED_LEAVE_TYPE = "INSERT INTO lv_leave_type (id, name, emoji_code, color_code, min_duration, is_attachment, is_attachment_must, is_comment_must, is_auto_approval, is_active) "
			+ "VALUES (100, 'PolicyAnnual', 'U+1F3D6', '#FFC107', 'HALF_AND_FULL_DAY', false, false, false, false, true)";

	private static final String SEED_POLICY = "INSERT INTO lv_leave_policy (id, name, leave_type_id, policy_type, status, is_carryover_enabled) "
			+ "VALUES (500, 'Annual Policy', 100, 'ACCRUAL', 'ACTIVE', false)";

	private static final String SEED_HALF_DAY_LEAVE_TODAY = "INSERT INTO lv_leave_request (id, employee_id, policy_id, start_date, end_date, leave_state, status, duration_days) "
			+ "VALUES (970, 2, 500, '2025-06-11', '2025-06-11', 'HALFDAY_MORNING', 'APPROVED', 0.5)";

	private static final String SEED_SECOND_HALF_DAY_LEAVE_TODAY = "INSERT INTO lv_leave_request (id, employee_id, policy_id, start_date, end_date, leave_state, status, duration_days) "
			+ "VALUES (971, 2, 500, '2025-06-11', '2025-06-11', 'HALFDAY_EVENING', 'APPROVED', 0.5)";

	private static final String SEED_MULTI_DAY_LEAVE_SPANNING_TODAY = "INSERT INTO lv_leave_request (id, employee_id, policy_id, start_date, end_date, leave_state, status, duration_days) "
			+ "VALUES (972, 3, 500, '2025-06-09', '2025-06-13', 'FULLDAY', 'APPROVED', 5)";

	private static final String SEED_UNAPPROVED_LEAVE_TODAY = "INSERT INTO lv_leave_request (id, employee_id, policy_id, start_date, end_date, leave_state, status, duration_days) VALUES "
			+ "(973, 4, 500, '2025-06-11', '2025-06-11', 'FULLDAY', 'PENDING', 1), "
			+ "(974, 5, 500, '2025-06-10', '2025-06-12', 'FULLDAY', 'CANCELLED', 3), "
			+ "(975, 1, 500, '2025-06-11', '2025-06-11', 'FULLDAY', 'DENIED', 1), "
			+ "(976, 3, 500, '2025-06-11', '2025-06-11', 'FULLDAY', 'REVOKED', 1)";

	private static final String SEED_APPROVED_LEAVE_NOT_TODAY = "INSERT INTO lv_leave_request (id, employee_id, policy_id, start_date, end_date, leave_state, status, duration_days) VALUES "
			+ "(977, 4, 500, '2025-06-12', '2025-06-13', 'FULLDAY', 'APPROVED', 2), "
			+ "(978, 5, 500, '2025-06-09', '2025-06-10', 'FULLDAY', 'APPROVED', 2)";

	private static final String SEED_APPROVED_LEAVE_TODAY_FOR_EMPLOYEES_1_AND_4 = "INSERT INTO lv_leave_request (id, employee_id, policy_id, start_date, end_date, leave_state, status, duration_days) VALUES "
			+ "(979, 1, 500, '2025-06-11', '2025-06-11', 'FULLDAY', 'APPROVED', 1), "
			+ "(980, 4, 500, '2025-06-11', '2025-06-11', 'FULLDAY', 'APPROVED', 1)";

	private static final String TERMINATE_EMPLOYEE_4 = "UPDATE employee SET account_status = 'TERMINATED' WHERE employee_id = 4";

	private static final String DEACTIVATE_USER_5 = "UPDATE \"user\" SET is_active = false WHERE email = 'user5@gmail.com'";

	private static final String USER3_LEAVE_MANAGER = "UPDATE employee_role SET leave_role = 'LEAVE_MANAGER', is_super_admin = false WHERE employee_id = 3";

	private static final String USER2_LEAVE_EMPLOYEE = "UPDATE employee_role SET leave_role = 'LEAVE_EMPLOYEE', people_role = 'PEOPLE_EMPLOYEE', attendance_role = 'ATTENDANCE_EMPLOYEE' WHERE employee_id = 2";

	private static final String SEED_HOLIDAY_TODAY = "INSERT INTO holiday (id, date, name, holiday_duration, is_active) "
			+ "VALUES (default, '2025-06-11', 'Founders Day', 'FULL_DAY', true)";

	private static final String REMOVE_WEDNESDAY_FROM_WORKING_DAYS = "DELETE FROM time_config WHERE day_of_week = 'WEDNESDAY'";

	private final AuthorityService authorityService;

	private final JwtService jwtService;

	private final UserDetailsService userDetailsService;

	private final MockMvc mvc;

	@MockitoBean
	private TimeZoneService timeZoneService;

	@BeforeEach
	void pinOrganizationDate() {
		when(timeZoneService.currentOrganizationDate()).thenReturn(TODAY);
	}

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

	private ResultActions performGetOnLeave(String authToken, String... teamIds) throws Exception {
		return mvc.perform(get(ENDPOINT + "/on-leave").param("teamIds", teamIds)
			.accept(MediaType.APPLICATION_JSON)
			.with(SecurityTestUtils.bearerToken(authToken)));
	}

	@Nested
	@DisplayName("Get Employees On Leave Today")
	class GetEmployeesOnLeaveTodayTests {

		@Test
		@DisplayName("Counts an approved half day leave taken today")
		@Sql(statements = { SEED_LEAVE_POLICY_ENABLED, SEED_LEAVE_TYPE, SEED_POLICY, SEED_HALF_DAY_LEAVE_TODAY })
		void getEmployeesOnLeaveToday_ApprovedHalfDay_CountsAsOnLeave() throws Exception {
			performGetOnLeave(leaveAdminToken()).andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
				.andExpect(jsonPath("$.results[0].date").value("2025-06-11"))
				.andExpect(jsonPath("$.results[0].isNonWorkingDay").value(false))
				.andExpect(jsonPath("$.results[0].onLeaveCount").value(1))
				.andExpect(jsonPath("$.results[0].onlineCount").value(4));
		}

		@Test
		@DisplayName("Counts an employee with morning and evening half days today once")
		@Sql(statements = { SEED_LEAVE_POLICY_ENABLED, SEED_LEAVE_TYPE, SEED_POLICY, SEED_HALF_DAY_LEAVE_TODAY,
				SEED_SECOND_HALF_DAY_LEAVE_TODAY })
		void getEmployeesOnLeaveToday_TwoHalfDaysSameEmployee_CountsOnce() throws Exception {
			performGetOnLeave(leaveAdminToken()).andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.results[0].onLeaveCount").value(1))
				.andExpect(jsonPath("$.results[0].onlineCount").value(4));
		}

		@Test
		@DisplayName("Counts an approved multi day leave that spans today")
		@Sql(statements = { SEED_LEAVE_POLICY_ENABLED, SEED_LEAVE_TYPE, SEED_POLICY,
				SEED_MULTI_DAY_LEAVE_SPANNING_TODAY })
		void getEmployeesOnLeaveToday_MultiDaySpanningToday_CountsAsOnLeave() throws Exception {
			performGetOnLeave(leaveAdminToken()).andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.results[0].onLeaveCount").value(1))
				.andExpect(jsonPath("$.results[0].onlineCount").value(4));
		}

		@Test
		@DisplayName("Excludes pending, cancelled, denied and revoked requests")
		@Sql(statements = { SEED_LEAVE_POLICY_ENABLED, SEED_LEAVE_TYPE, SEED_POLICY, SEED_UNAPPROVED_LEAVE_TODAY })
		void getEmployeesOnLeaveToday_UnapprovedRequests_Excluded() throws Exception {
			performGetOnLeave(leaveAdminToken()).andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.results[0].onLeaveCount").value(0))
				.andExpect(jsonPath("$.results[0].onlineCount").value(5));
		}

		@Test
		@DisplayName("Excludes approved requests that end before or start after today")
		@Sql(statements = { SEED_LEAVE_POLICY_ENABLED, SEED_LEAVE_TYPE, SEED_POLICY, SEED_APPROVED_LEAVE_NOT_TODAY })
		void getEmployeesOnLeaveToday_ApprovedNotCoveringToday_Excluded() throws Exception {
			performGetOnLeave(leaveAdminToken()).andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.results[0].onLeaveCount").value(0))
				.andExpect(jsonPath("$.results[0].onlineCount").value(5));
		}

		@Test
		@DisplayName("Excludes terminated employees and inactive users from both counts")
		@Sql(statements = { SEED_LEAVE_POLICY_ENABLED, SEED_LEAVE_TYPE, SEED_POLICY,
				SEED_APPROVED_LEAVE_TODAY_FOR_EMPLOYEES_1_AND_4, TERMINATE_EMPLOYEE_4, DEACTIVATE_USER_5 })
		void getEmployeesOnLeaveToday_InactiveEmployees_Excluded() throws Exception {
			performGetOnLeave(leaveAdminToken()).andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.results[0].onLeaveCount").value(1))
				.andExpect(jsonPath("$.results[0].onlineCount").value(2));
		}

		@Test
		@DisplayName("Narrows both counts to the requested teams")
		@Sql(statements = { SEED_LEAVE_POLICY_ENABLED, SEED_LEAVE_TYPE, SEED_POLICY,
				SEED_APPROVED_LEAVE_TODAY_FOR_EMPLOYEES_1_AND_4 })
		void getEmployeesOnLeaveToday_TeamFilter_NarrowsToTeamMembers() throws Exception {
			performGetOnLeave(leaveAdminToken(), "1").andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.results[0].onLeaveCount").value(1))
				.andExpect(jsonPath("$.results[0].onlineCount").value(0));
		}

		@Test
		@DisplayName("Treats a team id of -1 as all teams")
		@Sql(statements = { SEED_LEAVE_POLICY_ENABLED, SEED_LEAVE_TYPE, SEED_POLICY,
				SEED_APPROVED_LEAVE_TODAY_FOR_EMPLOYEES_1_AND_4 })
		void getEmployeesOnLeaveToday_AllTeams_ReturnsOrganizationCounts() throws Exception {
			performGetOnLeave(leaveAdminToken(), "-1").andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.results[0].onLeaveCount").value(2))
				.andExpect(jsonPath("$.results[0].onlineCount").value(3));
		}

		@Test
		@DisplayName("A leave manager only sees the people they supervise")
		@Sql(statements = { SEED_LEAVE_POLICY_ENABLED, SEED_LEAVE_TYPE, SEED_POLICY, SEED_HALF_DAY_LEAVE_TODAY,
				SEED_APPROVED_LEAVE_TODAY_FOR_EMPLOYEES_1_AND_4, USER3_LEAVE_MANAGER })
		void getEmployeesOnLeaveToday_LeaveManager_ScopedToSupervisees() throws Exception {
			performGetOnLeave(leaveManagerToken()).andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.results[0].onLeaveCount").value(1))
				.andExpect(jsonPath("$.results[0].onlineCount").value(0));
		}

		@Test
		@DisplayName("Returns the holiday instead of counts when today is a holiday")
		@Sql(statements = { SEED_LEAVE_POLICY_ENABLED, SEED_LEAVE_TYPE, SEED_POLICY, SEED_HALF_DAY_LEAVE_TODAY,
				SEED_HOLIDAY_TODAY })
		void getEmployeesOnLeaveToday_Holiday_ReturnsNonWorkingDay() throws Exception {
			performGetOnLeave(leaveAdminToken()).andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.results[0].isNonWorkingDay").value(true))
				.andExpect(jsonPath("$.results[0].holidays", hasSize(1)))
				.andExpect(jsonPath("$.results[0].holidays[0].name").value("Founders Day"))
				.andExpect(jsonPath("$.results[0].onLeaveCount").doesNotExist());
		}

		@Test
		@DisplayName("Returns a day off instead of counts when today is not a working day")
		@Sql(statements = { SEED_LEAVE_POLICY_ENABLED, SEED_LEAVE_TYPE, SEED_POLICY, SEED_HALF_DAY_LEAVE_TODAY,
				REMOVE_WEDNESDAY_FROM_WORKING_DAYS })
		void getEmployeesOnLeaveToday_NonWorkingDay_ReturnsDayOff() throws Exception {
			performGetOnLeave(leaveAdminToken()).andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.results[0].isNonWorkingDay").value(true))
				.andExpect(jsonPath("$.results[0].holidays", hasSize(1)))
				.andExpect(jsonPath("$.results[0].holidays[0].name").value("Day Off!"))
				.andExpect(jsonPath("$.results[0].onLeaveCount").doesNotExist());
		}

		@Test
		@DisplayName("Returns bad request when leave policies are not enabled")
		@Sql(statements = { SEED_LEAVE_TYPE, SEED_POLICY, SEED_HALF_DAY_LEAVE_TODAY })
		void getEmployeesOnLeaveToday_LeavePoliciesDisabled_ReturnsBadRequest() throws Exception {
			performGetOnLeave(leaveAdminToken()).andDo(print()).andExpect(status().isBadRequest());
		}

		@Test
		@DisplayName("Returns forbidden for a leave employee")
		@Sql(statements = { SEED_LEAVE_POLICY_ENABLED, USER2_LEAVE_EMPLOYEE })
		void getEmployeesOnLeaveToday_LeaveEmployee_ReturnsForbidden() throws Exception {
			performGetOnLeave(leaveEmployeeToken()).andDo(print()).andExpect(status().isForbidden());
		}

	}

}
