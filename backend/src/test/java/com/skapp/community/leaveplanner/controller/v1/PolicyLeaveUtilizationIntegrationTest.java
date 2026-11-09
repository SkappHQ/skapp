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

/**
 * Fixture assumptions from data.sql: every day of the week is a working day, employee 2
 * has no work location, and user 3 is a secondary manager of employee 2 only. With the
 * organization date pinned to 2025-06-11 no seeded holiday falls inside the leave cycle
 * the employee's leave is in.
 */
@SpringBootTest(classes = TestSkappApplication.class)
@AutoConfigureMockMvc
@Transactional
@RequiredArgsConstructor
@DisplayName("Policy Leave Utilization Integration Tests")
class PolicyLeaveUtilizationIntegrationTest {

	private static final String ENDPOINT = "/v1/leave/policy-leave/employees/%d/leave-utilization";

	private static final LocalDate TODAY = LocalDate.of(2025, 6, 11);

	private static final String RESULT_PATH = "$.results[0]";

	private static final String SEED_LEAVE_POLICY_ENABLED = "INSERT INTO organization_config (config_title, config_value) VALUES ('LEAVE_POLICY', '{\"isEnabled\":true}')";

	private static final String SEED_APRIL_LEAVE_CYCLE = "UPDATE organization_config SET config_value = '{\"start\":{\"month\":4,\"date\":1},\"end\":{\"month\":3,\"date\":31},\"isDefault\":false}' WHERE config_title = 'LEAVE_CYCLE'";

	private static final String SEED_LEAVE_TYPES = "INSERT INTO lv_leave_type (id, name, emoji_code, color_code, min_duration, is_attachment, is_attachment_must, is_comment_must, is_auto_approval, is_active) VALUES "
			+ "(100, 'PolicyAnnual', 'U+1F3D6', '#FFC107', 'HALF_AND_FULL_DAY', false, false, false, false, true), "
			+ "(200, 'PolicyCasual', 'U+1F334', '#4CAF50', 'FULL_DAY', false, false, false, false, true), "
			+ "(300, 'PolicyMedical', 'U+1F912', '#2196F3', 'FULL_DAY', false, false, false, false, true)";

	private static final String SEED_POLICIES = "INSERT INTO lv_leave_policy (id, name, leave_type_id, policy_type, status, is_carryover_enabled) VALUES "
			+ "(500, 'Annual Policy', 100, 'ACCRUAL', 'ACTIVE', false), "
			+ "(600, 'Casual Policy', 200, 'ACCRUAL', 'ACTIVE', false), "
			+ "(700, 'Medical Policy', 300, 'ACCRUAL', 'ACTIVE', false)";

	// Employee 2 is assigned the annual policy only; the casual leave below was taken
	// under an assignment that has since been removed.
	private static final String SEED_ASSIGNMENT = "INSERT INTO lv_employee_leave_policy (id, employee_id, policy_id, effective_date_type, effective_from, status) "
			+ "VALUES (900, 2, 500, 'SPECIFIC', '2024-01-01', 'ACTIVE')";

	private static final String SEED_HALF_DAYS = "INSERT INTO lv_leave_request (id, employee_id, policy_id, start_date, end_date, leave_state, status, duration_days) VALUES "
			+ "(950, 2, 500, '2025-06-11', '2025-06-11', 'HALFDAY_MORNING', 'APPROVED', 0.5), "
			+ "(951, 2, 500, '2025-06-12', '2025-06-12', 'HALFDAY_EVENING', 'APPROVED', 0.5)";

	private static final String SEED_MONTH_CROSSING_LEAVE = "INSERT INTO lv_leave_request (id, employee_id, policy_id, start_date, end_date, leave_state, status, duration_days) "
			+ "VALUES (952, 2, 500, '2025-06-28', '2025-07-03', 'FULLDAY', 'APPROVED', 6)";

	private static final String SEED_CYCLE_CROSSING_LEAVE = "INSERT INTO lv_leave_request (id, employee_id, policy_id, start_date, end_date, leave_state, status, duration_days) "
			+ "VALUES (953, 2, 500, '2024-12-30', '2025-01-02', 'FULLDAY', 'APPROVED', 4)";

	private static final String SEED_CASUAL_LEAVE = "INSERT INTO lv_leave_request (id, employee_id, policy_id, start_date, end_date, leave_state, status, duration_days) "
			+ "VALUES (954, 2, 600, '2025-03-10', '2025-03-10', 'FULLDAY', 'APPROVED', 1)";

	private static final String SEED_NEXT_YEAR_LEAVE = "INSERT INTO lv_leave_request (id, employee_id, policy_id, start_date, end_date, leave_state, status, duration_days) "
			+ "VALUES (955, 2, 500, '2026-02-02', '2026-02-02', 'FULLDAY', 'APPROVED', 1)";

	private static final String SEED_NOT_APPROVED_LEAVE = "INSERT INTO lv_leave_request (id, employee_id, policy_id, start_date, end_date, leave_state, status, duration_days) VALUES "
			+ "(960, 2, 500, '2025-06-16', '2025-06-16', 'FULLDAY', 'PENDING', 1), "
			+ "(961, 2, 500, '2025-06-17', '2025-06-18', 'FULLDAY', 'CANCELLED', 2), "
			+ "(962, 2, 500, '2025-06-19', '2025-06-19', 'FULLDAY', 'REVOKED', 1), "
			+ "(963, 2, 500, '2025-06-20', '2025-06-20', 'FULLDAY', 'DENIED', 1), "
			+ "(964, 2, 500, '2025-06-27', '2025-07-02', 'FULLDAY', 'PENDING', 6)";

	private static final String SEED_OTHER_EMPLOYEE_LEAVE = "INSERT INTO lv_leave_request (id, employee_id, policy_id, start_date, end_date, leave_state, status, duration_days) VALUES "
			+ "(970, 3, 500, '2025-06-02', '2025-06-03', 'FULLDAY', 'APPROVED', 2), "
			+ "(971, 4, 700, '2025-06-05', '2025-06-05', 'FULLDAY', 'APPROVED', 1)";

	private static final String USER3_LEAVE_MANAGER = "UPDATE employee_role SET leave_role = 'LEAVE_MANAGER', is_super_admin = false WHERE employee_id = 3";

	private static final String USER3_SUPERVISES_TEAM_WITH_EMPLOYEE_4 = "INSERT INTO employee_team (id, team_id, employee_id, is_supervisor) VALUES "
			+ "(default, 2, 3, true), (default, 2, 4, false)";

	private static final String USER2_LEAVE_EMPLOYEE = "UPDATE employee_role SET leave_role = 'LEAVE_EMPLOYEE', people_role = 'PEOPLE_EMPLOYEE', attendance_role = 'ATTENDANCE_EMPLOYEE' WHERE employee_id = 2";

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

	private ResultActions performGetLeaveUtilization(String authToken, long employeeId, String... leaveTypeIds)
			throws Exception {
		return mvc.perform(get(String.format(ENDPOINT, employeeId)).param("leaveTypeIds", leaveTypeIds)
			.accept(MediaType.APPLICATION_JSON)
			.with(SecurityTestUtils.bearerToken(authToken)));
	}

	@Nested
	@DisplayName("Leave Usage Per Month")
	class LeaveUsagePerMonthTests {

		@Test
		@DisplayName("Counts approved half days as half a day each")
		@Sql(statements = { SEED_LEAVE_POLICY_ENABLED, SEED_LEAVE_TYPES, SEED_POLICIES, SEED_ASSIGNMENT,
				SEED_HALF_DAYS })
		void getEmployeeLeaveUtilization_HalfDays_CountsHalfDayEach() throws Exception {
			performGetLeaveUtilization(leaveAdminToken(), 2L, "-1").andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
				.andExpect(jsonPath(RESULT_PATH + ".totalLeaves.Jun").value(1.0))
				.andExpect(jsonPath(RESULT_PATH + ".totalLeavesWithType[0].leaveType.typeId").value(100))
				.andExpect(jsonPath(RESULT_PATH + ".totalLeavesWithType[0].leaveUtilizationData.Jun").value(1.0));
		}

		@Test
		@DisplayName("Splits an approved leave that crosses a month end across both months")
		@Sql(statements = { SEED_LEAVE_POLICY_ENABLED, SEED_LEAVE_TYPES, SEED_POLICIES, SEED_ASSIGNMENT,
				SEED_MONTH_CROSSING_LEAVE })
		void getEmployeeLeaveUtilization_MonthCrossingLeave_SplitsAcrossMonths() throws Exception {
			performGetLeaveUtilization(leaveAdminToken(), 2L, "-1").andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(RESULT_PATH + ".totalLeaves.Jun").value(3.0))
				.andExpect(jsonPath(RESULT_PATH + ".totalLeaves.Jul").value(3.0))
				.andExpect(jsonPath(RESULT_PATH + ".totalLeavesWithType[0].leaveUtilizationData.Jun").value(3.0))
				.andExpect(jsonPath(RESULT_PATH + ".totalLeavesWithType[0].leaveUtilizationData.Jul").value(3.0));
		}

		@Test
		@DisplayName("Counts only the part of a leave that falls inside the current leave cycle")
		@Sql(statements = { SEED_LEAVE_POLICY_ENABLED, SEED_LEAVE_TYPES, SEED_POLICIES, SEED_ASSIGNMENT,
				SEED_CYCLE_CROSSING_LEAVE })
		void getEmployeeLeaveUtilization_LeaveCrossingCycleStart_CountsDaysInsideCycle() throws Exception {
			performGetLeaveUtilization(leaveAdminToken(), 2L, "-1").andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(RESULT_PATH + ".totalLeaves.Jan").value(2.0))
				.andExpect(jsonPath(RESULT_PATH + ".totalLeaves.Dec").value(0.0));
		}

		@Test
		@DisplayName("Ignores pending, cancelled, revoked and denied leave")
		@Sql(statements = { SEED_LEAVE_POLICY_ENABLED, SEED_LEAVE_TYPES, SEED_POLICIES, SEED_ASSIGNMENT, SEED_HALF_DAYS,
				SEED_NOT_APPROVED_LEAVE })
		void getEmployeeLeaveUtilization_NotApprovedLeave_IsExcluded() throws Exception {
			performGetLeaveUtilization(leaveAdminToken(), 2L, "-1").andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(RESULT_PATH + ".totalLeaves.Jun").value(1.0))
				.andExpect(jsonPath(RESULT_PATH + ".totalLeaves.Jul").value(0.0));
		}

		@Test
		@DisplayName("Ignores leave taken by other employees")
		@Sql(statements = { SEED_LEAVE_POLICY_ENABLED, SEED_LEAVE_TYPES, SEED_POLICIES, SEED_ASSIGNMENT, SEED_HALF_DAYS,
				SEED_OTHER_EMPLOYEE_LEAVE })
		void getEmployeeLeaveUtilization_OtherEmployeesLeave_IsExcluded() throws Exception {
			performGetLeaveUtilization(leaveAdminToken(), 2L, "-1").andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(RESULT_PATH + ".totalLeaves.Jun").value(1.0))
				.andExpect(jsonPath(RESULT_PATH + ".totalLeavesWithType", hasSize(1)));
		}

		@Test
		@DisplayName("Uses the leave cycle containing today when the cycle does not start on January 1")
		@Sql(statements = { SEED_LEAVE_POLICY_ENABLED, SEED_APRIL_LEAVE_CYCLE, SEED_LEAVE_TYPES, SEED_POLICIES,
				SEED_ASSIGNMENT, SEED_HALF_DAYS, SEED_CASUAL_LEAVE, SEED_NEXT_YEAR_LEAVE })
		void getEmployeeLeaveUtilization_CycleNotStartingInJanuary_UsesCurrentCycle() throws Exception {
			performGetLeaveUtilization(leaveAdminToken(), 2L, "-1").andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(RESULT_PATH + ".totalLeaves.length()").value(12))
				.andExpect(jsonPath(RESULT_PATH + ".totalLeaves.Jun").value(1.0))
				.andExpect(jsonPath(RESULT_PATH + ".totalLeaves.Feb").value(1.0))
				.andExpect(jsonPath(RESULT_PATH + ".totalLeaves.Mar").value(0.0))
				.andExpect(jsonPath(RESULT_PATH + ".totalLeavesWithType", hasSize(1)))
				.andExpect(jsonPath(RESULT_PATH + ".totalLeavesWithType[0].leaveType.typeId").value(100));
		}

	}

	@Nested
	@DisplayName("Leave Type Filter")
	class LeaveTypeFilterTests {

		@Test
		@DisplayName("Returns every policy leave type the employee is assigned to or has used when -1 is passed")
		@Sql(statements = { SEED_LEAVE_POLICY_ENABLED, SEED_LEAVE_TYPES, SEED_POLICIES, SEED_ASSIGNMENT, SEED_HALF_DAYS,
				SEED_CASUAL_LEAVE, SEED_OTHER_EMPLOYEE_LEAVE })
		void getEmployeeLeaveUtilization_AllLeaveTypes_ReturnsEmployeesLeaveTypes() throws Exception {
			performGetLeaveUtilization(leaveAdminToken(), 2L, "-1").andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(RESULT_PATH + ".totalLeavesWithType", hasSize(2)))
				.andExpect(jsonPath(RESULT_PATH + ".totalLeavesWithType[0].leaveType.typeId").value(100))
				.andExpect(jsonPath(RESULT_PATH + ".totalLeavesWithType[0].leaveType.name").value("PolicyAnnual"))
				.andExpect(jsonPath(RESULT_PATH + ".totalLeavesWithType[0].leaveType.colorCode").value("#FFC107"))
				.andExpect(jsonPath(RESULT_PATH + ".totalLeavesWithType[0].leaveType.emojiCode").value("U+1F3D6"))
				.andExpect(jsonPath(RESULT_PATH + ".totalLeavesWithType[1].leaveType.typeId").value(200))
				.andExpect(jsonPath(RESULT_PATH + ".totalLeavesWithType[1].leaveUtilizationData.Mar").value(1.0))
				.andExpect(jsonPath(RESULT_PATH + ".totalLeaves.Mar").value(1.0))
				.andExpect(jsonPath(RESULT_PATH + ".totalLeaves.Jun").value(1.0));
		}

		@Test
		@DisplayName("Returns an assigned leave type with no leave taken as all zero months")
		@Sql(statements = { SEED_LEAVE_POLICY_ENABLED, SEED_LEAVE_TYPES, SEED_POLICIES, SEED_ASSIGNMENT })
		void getEmployeeLeaveUtilization_AssignedTypeWithNoLeave_ReturnsZeroMonths() throws Exception {
			performGetLeaveUtilization(leaveAdminToken(), 2L, "-1").andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(RESULT_PATH + ".totalLeavesWithType", hasSize(1)))
				.andExpect(jsonPath(RESULT_PATH + ".totalLeavesWithType[0].leaveType.typeId").value(100))
				.andExpect(jsonPath(RESULT_PATH + ".totalLeavesWithType[0].leaveUtilizationData.length()").value(12))
				.andExpect(jsonPath(RESULT_PATH + ".totalLeaves.Jun").value(0.0));
		}

		@Test
		@DisplayName("Returns only the requested leave types")
		@Sql(statements = { SEED_LEAVE_POLICY_ENABLED, SEED_LEAVE_TYPES, SEED_POLICIES, SEED_ASSIGNMENT, SEED_HALF_DAYS,
				SEED_CASUAL_LEAVE })
		void getEmployeeLeaveUtilization_SpecificLeaveType_ReturnsOnlyThatType() throws Exception {
			performGetLeaveUtilization(leaveAdminToken(), 2L, "200").andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(RESULT_PATH + ".totalLeavesWithType", hasSize(1)))
				.andExpect(jsonPath(RESULT_PATH + ".totalLeavesWithType[0].leaveType.typeId").value(200))
				.andExpect(jsonPath(RESULT_PATH + ".totalLeaves.Mar").value(1.0))
				.andExpect(jsonPath(RESULT_PATH + ".totalLeaves.Jun").value(0.0));
		}

		@Test
		@DisplayName("Returns not found for an unknown leave type")
		@Sql(statements = { SEED_LEAVE_POLICY_ENABLED, SEED_LEAVE_TYPES, SEED_POLICIES, SEED_ASSIGNMENT })
		void getEmployeeLeaveUtilization_UnknownLeaveType_ReturnsNotFound() throws Exception {
			performGetLeaveUtilization(leaveAdminToken(), 2L, "999").andDo(print()).andExpect(status().isNotFound());
		}

	}

	@Nested
	@DisplayName("Access")
	class AccessTests {

		@Test
		@DisplayName("Allows a manager to view an employee they manage")
		@Sql(statements = { SEED_LEAVE_POLICY_ENABLED, SEED_LEAVE_TYPES, SEED_POLICIES, SEED_ASSIGNMENT, SEED_HALF_DAYS,
				USER3_LEAVE_MANAGER })
		void getEmployeeLeaveUtilization_ManagerOfEmployee_ReturnsUtilization() throws Exception {
			performGetLeaveUtilization(leaveManagerToken(), 2L, "-1").andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(RESULT_PATH + ".totalLeaves.Jun").value(1.0));
		}

		@Test
		@DisplayName("Allows a manager to view a member of a team they supervise")
		@Sql(statements = { SEED_LEAVE_POLICY_ENABLED, SEED_LEAVE_TYPES, SEED_POLICIES, SEED_OTHER_EMPLOYEE_LEAVE,
				USER3_LEAVE_MANAGER, USER3_SUPERVISES_TEAM_WITH_EMPLOYEE_4 })
		void getEmployeeLeaveUtilization_TeamSupervisor_ReturnsUtilization() throws Exception {
			performGetLeaveUtilization(leaveManagerToken(), 4L, "-1").andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(RESULT_PATH + ".totalLeavesWithType[0].leaveType.typeId").value(300))
				.andExpect(jsonPath(RESULT_PATH + ".totalLeaves.Jun").value(1.0));
		}

		@Test
		@DisplayName("Blocks a manager from viewing an employee they do not supervise")
		@Sql(statements = { SEED_LEAVE_POLICY_ENABLED, SEED_LEAVE_TYPES, SEED_POLICIES, USER3_LEAVE_MANAGER })
		void getEmployeeLeaveUtilization_UnsupervisedEmployee_ReturnsNotFound() throws Exception {
			performGetLeaveUtilization(leaveManagerToken(), 4L, "-1").andDo(print()).andExpect(status().isNotFound());
		}

		@Test
		@DisplayName("Allows a leave admin to view any employee")
		@Sql(statements = { SEED_LEAVE_POLICY_ENABLED, SEED_LEAVE_TYPES, SEED_POLICIES, SEED_OTHER_EMPLOYEE_LEAVE })
		void getEmployeeLeaveUtilization_LeaveAdmin_ReturnsUtilization() throws Exception {
			performGetLeaveUtilization(leaveAdminToken(), 4L, "-1").andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(RESULT_PATH + ".totalLeaves.Jun").value(1.0));
		}

		@Test
		@DisplayName("Forbids a leave employee")
		@Sql(statements = { SEED_LEAVE_POLICY_ENABLED, USER2_LEAVE_EMPLOYEE })
		void getEmployeeLeaveUtilization_LeaveEmployee_ReturnsForbidden() throws Exception {
			performGetLeaveUtilization(leaveEmployeeToken(), 2L, "-1").andDo(print()).andExpect(status().isForbidden());
		}

		@Test
		@DisplayName("Returns not found for an unknown employee")
		@Sql(statements = { SEED_LEAVE_POLICY_ENABLED })
		void getEmployeeLeaveUtilization_UnknownEmployee_ReturnsNotFound() throws Exception {
			performGetLeaveUtilization(leaveAdminToken(), 999L, "-1").andDo(print()).andExpect(status().isNotFound());
		}

		@Test
		@DisplayName("Rejects the request when leave policies are disabled")
		void getEmployeeLeaveUtilization_PoliciesDisabled_ReturnsBadRequest() throws Exception {
			performGetLeaveUtilization(leaveAdminToken(), 2L, "-1").andDo(print()).andExpect(status().isBadRequest());
		}

	}

}
