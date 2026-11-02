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

	private static final String RANGE_START = "2025-06-09";

	private static final String RANGE_END = "2025-06-15";

	private static final String SEED_LEAVES_CROSSING_RANGE_BOUNDARIES = "INSERT INTO lv_leave_request (id, employee_id, policy_id, start_date, end_date, leave_state, status, duration_days) VALUES "
			+ "(981, 4, 500, '2025-06-05', '2025-06-10', 'FULLDAY', 'APPROVED', 4), "
			+ "(982, 5, 500, '2025-06-14', '2025-06-20', 'FULLDAY', 'APPROVED', 5)";

	private static final String SEED_LEAVES_OUTSIDE_RANGE = "INSERT INTO lv_leave_request (id, employee_id, policy_id, start_date, end_date, leave_state, status, duration_days) VALUES "
			+ "(983, 4, 500, '2025-06-02', '2025-06-08', 'FULLDAY', 'APPROVED', 5), "
			+ "(984, 5, 500, '2025-06-16', '2025-06-17', 'FULLDAY', 'APPROVED', 2)";

	private static final String SEED_HOLIDAY_IN_RANGE = "INSERT INTO holiday (id, date, name, holiday_duration, is_active) "
			+ "VALUES (default, '2025-06-10', 'Founders Day', 'FULL_DAY', true)";

	private static final String REMOVE_SATURDAY_FROM_WORKING_DAYS = "DELETE FROM time_config WHERE day_of_week = 'SATURDAY'";

	private static final String SEED_TEAMS_FOR_EMPLOYEE_2 = "INSERT INTO employee_team (id, team_id, employee_id, is_supervisor) VALUES "
			+ "(default, 2, 2, false), (default, 2, 4, false), (default, 3, 5, false)";

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

	private ResultActions performGetResourceAvailability(String authToken, String startDate, String endDate,
			String... teamIds) throws Exception {
		return mvc.perform(get(ENDPOINT + "/resource-availability").param("startDate", startDate)
			.param("endDate", endDate)
			.param("teamIds", teamIds)
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

	@Nested
	@DisplayName("Get Resource Availability")
	class GetResourceAvailabilityTests {

		@Test
		@DisplayName("Returns one entry per day, inclusive of both range dates")
		@Sql(statements = { SEED_LEAVE_POLICY_ENABLED })
		void getResourceAvailability_ValidRange_ReturnsEveryDay() throws Exception {
			performGetResourceAvailability(leaveAdminToken(), RANGE_START, RANGE_END).andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
				.andExpect(jsonPath("$.results", hasSize(7)))
				.andExpect(jsonPath("$.results[0].date").value(RANGE_START))
				.andExpect(jsonPath("$.results[0].dayOfWeek").value("MONDAY"))
				.andExpect(jsonPath("$.results[0].isNonWorkingDay").value(false))
				.andExpect(jsonPath("$.results[0].leaveCount").value(0))
				.andExpect(jsonPath("$.results[0].availableCount").value(5))
				.andExpect(jsonPath("$.results[0].leaveRequests", hasSize(0)))
				.andExpect(jsonPath("$.results[6].date").value(RANGE_END));
		}

		@Test
		@DisplayName("Shows multi day leave on the days it overlaps, including leave crossing the range boundaries")
		@Sql(statements = { SEED_LEAVE_POLICY_ENABLED, SEED_LEAVE_TYPE, SEED_POLICY,
				SEED_LEAVES_CROSSING_RANGE_BOUNDARIES, SEED_MULTI_DAY_LEAVE_SPANNING_TODAY, SEED_LEAVES_OUTSIDE_RANGE })
		void getResourceAvailability_MultiDayLeave_ShownOnOverlappingDays() throws Exception {
			performGetResourceAvailability(leaveAdminToken(), RANGE_START, RANGE_END).andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.results[0].leaveCount").value(2))
				.andExpect(jsonPath("$.results[0].availableCount").value(3))
				.andExpect(jsonPath("$.results[1].leaveCount").value(2))
				.andExpect(jsonPath("$.results[2].leaveCount").value(1))
				.andExpect(jsonPath("$.results[2].leaveRequests[0].leaveRequestId").value(972))
				.andExpect(jsonPath("$.results[2].leaveRequests[0].employee.employeeId").value(3))
				.andExpect(jsonPath("$.results[2].leaveRequests[0].policyName").value("Annual Policy"))
				.andExpect(jsonPath("$.results[2].leaveRequests[0].leaveType.name").value("PolicyAnnual"))
				.andExpect(jsonPath("$.results[2].leaveRequests[0].leaveType.colorCode").value("#FFC107"))
				.andExpect(jsonPath("$.results[2].leaveRequests[0].leaveType.emojiCode").value("U+1F3D6"))
				.andExpect(jsonPath("$.results[2].leaveRequests[0].startDate").value("2025-06-09"))
				.andExpect(jsonPath("$.results[2].leaveRequests[0].endDate").value("2025-06-13"))
				.andExpect(jsonPath("$.results[2].leaveRequests[0].leaveState").value("FULLDAY"))
				.andExpect(jsonPath("$.results[5].leaveCount").value(1))
				.andExpect(jsonPath("$.results[5].leaveRequests[0].leaveRequestId").value(982))
				.andExpect(jsonPath("$.results[6].leaveCount").value(1))
				.andExpect(jsonPath("$.results[6].availableCount").value(4));
		}

		@Test
		@DisplayName("Counts an employee with two half days on the same day once and lists both requests")
		@Sql(statements = { SEED_LEAVE_POLICY_ENABLED, SEED_LEAVE_TYPE, SEED_POLICY, SEED_HALF_DAY_LEAVE_TODAY,
				SEED_SECOND_HALF_DAY_LEAVE_TODAY })
		void getResourceAvailability_HalfDays_CountedAsOnLeave() throws Exception {
			performGetResourceAvailability(leaveAdminToken(), RANGE_START, RANGE_END).andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.results[1].leaveCount").value(0))
				.andExpect(jsonPath("$.results[2].leaveCount").value(1))
				.andExpect(jsonPath("$.results[2].availableCount").value(4))
				.andExpect(jsonPath("$.results[2].leaveRequests", hasSize(2)))
				.andExpect(jsonPath("$.results[2].leaveRequests[0].leaveState").value("HALFDAY_MORNING"))
				.andExpect(jsonPath("$.results[2].leaveRequests[1].leaveState").value("HALFDAY_EVENING"))
				.andExpect(jsonPath("$.results[3].leaveCount").value(0));
		}

		@Test
		@DisplayName("Flags holidays and non-working days and lists them in the holidays")
		@Sql(statements = { SEED_LEAVE_POLICY_ENABLED, SEED_LEAVE_TYPE, SEED_POLICY,
				SEED_LEAVES_CROSSING_RANGE_BOUNDARIES, SEED_HOLIDAY_IN_RANGE, REMOVE_SATURDAY_FROM_WORKING_DAYS })
		void getResourceAvailability_HolidaysAndNonWorkingDays_Flagged() throws Exception {
			performGetResourceAvailability(leaveAdminToken(), RANGE_START, RANGE_END).andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.results[0].isNonWorkingDay").value(false))
				.andExpect(jsonPath("$.results[0].holidays", hasSize(0)))
				.andExpect(jsonPath("$.results[1].isNonWorkingDay").value(true))
				.andExpect(jsonPath("$.results[1].holidays", hasSize(1)))
				.andExpect(jsonPath("$.results[1].holidays[0].name").value("Founders Day"))
				.andExpect(jsonPath("$.results[1].leaveCount").value(1))
				.andExpect(jsonPath("$.results[5].dayOfWeek").value("SATURDAY"))
				.andExpect(jsonPath("$.results[5].isNonWorkingDay").value(true))
				.andExpect(jsonPath("$.results[5].holidays", hasSize(1)))
				.andExpect(jsonPath("$.results[5].holidays[0].name").value("Day Off!"))
				.andExpect(jsonPath("$.results[6].isNonWorkingDay").value(false));
		}

		@Test
		@DisplayName("Excludes pending, cancelled, denied and revoked requests")
		@Sql(statements = { SEED_LEAVE_POLICY_ENABLED, SEED_LEAVE_TYPE, SEED_POLICY, SEED_UNAPPROVED_LEAVE_TODAY })
		void getResourceAvailability_UnapprovedRequests_Excluded() throws Exception {
			performGetResourceAvailability(leaveAdminToken(), RANGE_START, RANGE_END).andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.results[1].leaveCount").value(0))
				.andExpect(jsonPath("$.results[1].leaveRequests", hasSize(0)))
				.andExpect(jsonPath("$.results[2].leaveCount").value(0))
				.andExpect(jsonPath("$.results[2].availableCount").value(5))
				.andExpect(jsonPath("$.results[2].leaveRequests", hasSize(0)))
				.andExpect(jsonPath("$.results[3].leaveCount").value(0));
		}

		@Test
		@DisplayName("Narrows the leave and the counts to the requested teams")
		@Sql(statements = { SEED_LEAVE_POLICY_ENABLED, SEED_LEAVE_TYPE, SEED_POLICY,
				SEED_APPROVED_LEAVE_TODAY_FOR_EMPLOYEES_1_AND_4 })
		void getResourceAvailability_TeamFilter_NarrowsToTeamMembers() throws Exception {
			performGetResourceAvailability(leaveAdminToken(), RANGE_START, RANGE_END, "1").andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.results[2].leaveCount").value(1))
				.andExpect(jsonPath("$.results[2].availableCount").value(0))
				.andExpect(jsonPath("$.results[2].leaveRequests", hasSize(1)))
				.andExpect(jsonPath("$.results[2].leaveRequests[0].employee.employeeId").value(1));
		}

		@Test
		@DisplayName("Treats a team id of -1 as all teams")
		@Sql(statements = { SEED_LEAVE_POLICY_ENABLED, SEED_LEAVE_TYPE, SEED_POLICY,
				SEED_APPROVED_LEAVE_TODAY_FOR_EMPLOYEES_1_AND_4 })
		void getResourceAvailability_AllTeams_ReturnsOrganizationCounts() throws Exception {
			performGetResourceAvailability(leaveAdminToken(), RANGE_START, RANGE_END, "-1").andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.results[2].leaveCount").value(2))
				.andExpect(jsonPath("$.results[2].availableCount").value(3));
		}

		@Test
		@DisplayName("A leave employee sees the members of their own teams")
		@Sql(statements = { SEED_LEAVE_POLICY_ENABLED, SEED_LEAVE_TYPE, SEED_POLICY,
				SEED_LEAVES_CROSSING_RANGE_BOUNDARIES, USER2_LEAVE_EMPLOYEE, SEED_TEAMS_FOR_EMPLOYEE_2 })
		void getResourceAvailability_LeaveEmployee_ScopedToOwnTeams() throws Exception {
			performGetResourceAvailability(leaveEmployeeToken(), RANGE_START, RANGE_END, "2").andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.results[0].leaveCount").value(1))
				.andExpect(jsonPath("$.results[0].availableCount").value(1))
				.andExpect(jsonPath("$.results[0].leaveRequests[0].employee.employeeId").value(4))
				.andExpect(jsonPath("$.results[5].leaveCount").value(0))
				.andExpect(jsonPath("$.results[5].availableCount").value(2));
		}

		@Test
		@DisplayName("A leave employee sees nobody in a team they do not belong to")
		@Sql(statements = { SEED_LEAVE_POLICY_ENABLED, SEED_LEAVE_TYPE, SEED_POLICY,
				SEED_LEAVES_CROSSING_RANGE_BOUNDARIES, USER2_LEAVE_EMPLOYEE, SEED_TEAMS_FOR_EMPLOYEE_2 })
		void getResourceAvailability_LeaveEmployeeOtherTeam_ReturnsNobody() throws Exception {
			performGetResourceAvailability(leaveEmployeeToken(), RANGE_START, RANGE_END, "3").andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.results[5].leaveCount").value(0))
				.andExpect(jsonPath("$.results[5].availableCount").value(0))
				.andExpect(jsonPath("$.results[5].leaveRequests", hasSize(0)));
		}

		@Test
		@DisplayName("Accepts a range of exactly 62 days")
		@Sql(statements = { SEED_LEAVE_POLICY_ENABLED })
		void getResourceAvailability_MaximumRange_ReturnsEveryDay() throws Exception {
			performGetResourceAvailability(leaveAdminToken(), "2025-06-01", "2025-08-01").andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.results", hasSize(62)));
		}

		@Test
		@DisplayName("Returns bad request when the range is longer than 62 days")
		@Sql(statements = { SEED_LEAVE_POLICY_ENABLED })
		void getResourceAvailability_RangeTooLong_ReturnsBadRequest() throws Exception {
			performGetResourceAvailability(leaveAdminToken(), "2025-06-01", "2025-08-02").andDo(print())
				.andExpect(status().isBadRequest());
		}

		@Test
		@DisplayName("Returns bad request when the end date is before the start date")
		@Sql(statements = { SEED_LEAVE_POLICY_ENABLED })
		void getResourceAvailability_EndBeforeStart_ReturnsBadRequest() throws Exception {
			performGetResourceAvailability(leaveAdminToken(), RANGE_END, RANGE_START).andDo(print())
				.andExpect(status().isBadRequest());
		}

		@Test
		@DisplayName("Returns bad request when a date is missing")
		@Sql(statements = { SEED_LEAVE_POLICY_ENABLED })
		void getResourceAvailability_MissingDate_ReturnsBadRequest() throws Exception {
			mvc.perform(get(ENDPOINT + "/resource-availability").param("startDate", RANGE_START)
				.accept(MediaType.APPLICATION_JSON)
				.with(SecurityTestUtils.bearerToken(leaveAdminToken())))
				.andDo(print())
				.andExpect(status().isBadRequest());
		}

		@Test
		@DisplayName("Returns bad request when leave policies are not enabled")
		@Sql(statements = { SEED_LEAVE_TYPE, SEED_POLICY, SEED_HALF_DAY_LEAVE_TODAY })
		void getResourceAvailability_LeavePoliciesDisabled_ReturnsBadRequest() throws Exception {
			performGetResourceAvailability(leaveAdminToken(), RANGE_START, RANGE_END).andDo(print())
				.andExpect(status().isBadRequest());
		}

	}

}
