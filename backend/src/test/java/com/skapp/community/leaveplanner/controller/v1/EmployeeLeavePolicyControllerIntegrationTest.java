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

import java.util.Arrays;

import static com.skapp.support.TestConstants.STATUS_PATH;
import static com.skapp.support.TestConstants.STATUS_SUCCESSFUL;
import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = TestSkappApplication.class)
@AutoConfigureMockMvc
@Transactional
@RequiredArgsConstructor
@DisplayName("Employee Leave Policy Controller Integration Tests")
class EmployeeLeavePolicyControllerIntegrationTest {

	private static final String ENDPOINT = "/v1/leave/policy-assignments";

	/**
	 * Employee 1 (user1) join_date = 2022-05-17; Employee 2 (user2) join_date =
	 * 2021-12-20.
	 */
	private static final String EMPLOYEE_1_JOIN_DATE = "2022-05-17";

	private static final String EMPLOYEE_1_EMAIL = "user1@gmail.com";

	private static final String EMPLOYEE_2_EMAIL = "user2@gmail.com";

	private static final String SEED_LEAVE_TYPES = "INSERT INTO lv_leave_type (id, name, emoji_code, color_code, min_duration, is_attachment, is_attachment_must, is_comment_must, is_auto_approval, is_active) "
			+ "VALUES (100, 'AssignAnnual', 'U+1F3D6', '#FFC107', 'FULL_DAY', false, false, false, false, true), "
			+ "(200, 'AssignCasual', 'U+1F334', '#4CAF50', 'FULL_DAY', false, false, false, false, true)";

	// 500/501 are both ACTIVE accrual policies on leave type 100 (conflict pair);
	// 502 is DEACTIVATED; 600 is an accrual policy on a different leave type (200);
	// 700 is a FLEXIBLE policy (rejected this phase — accrual only).
	private static final String SEED_POLICIES = "INSERT INTO lv_leave_policy (id, name, leave_type_id, policy_type, status, is_carryover_enabled) "
			+ "VALUES (500, 'Annual Standard', 100, 'ACCRUAL', 'ACTIVE', false), "
			+ "(501, 'Annual Senior', 100, 'ACCRUAL', 'ACTIVE', false), "
			+ "(502, 'Annual Retired', 100, 'ACCRUAL', 'INACTIVE', false), "
			+ "(600, 'Casual Basic', 200, 'ACCRUAL', 'ACTIVE', false), "
			+ "(700, 'Annual Flexible', 100, 'FLEXIBLE', 'ACTIVE', false)";

	// An open (ACTIVE) window for employee 1 on policy 500 (leave type 100).
	private static final String SEED_EXISTING_ASSIGNMENT = "INSERT INTO lv_employee_leave_policy (id, employee_id, policy_id, effective_date_type, effective_from, status) "
			+ "VALUES (900, 1, 500, 'SPECIFIC', '2023-01-01', 'ACTIVE')";

	private static final String SEED_PAGINATION_TYPES = "INSERT INTO lv_leave_type (id, name, emoji_code, color_code, min_duration, is_attachment, is_attachment_must, is_comment_must, is_auto_approval, is_active) VALUES "
			+ "(800, 'PageType0', 'U+1F3D6', '#111111', 'FULL_DAY', false, false, false, false, true), "
			+ "(801, 'PageType1', 'U+1F3D6', '#111111', 'FULL_DAY', false, false, false, false, true), "
			+ "(802, 'PageType2', 'U+1F3D6', '#111111', 'FULL_DAY', false, false, false, false, true), "
			+ "(803, 'PageType3', 'U+1F3D6', '#111111', 'FULL_DAY', false, false, false, false, true), "
			+ "(804, 'PageType4', 'U+1F3D6', '#111111', 'FULL_DAY', false, false, false, false, true), "
			+ "(805, 'PageType5', 'U+1F3D6', '#111111', 'FULL_DAY', false, false, false, false, true), "
			+ "(806, 'PageType6', 'U+1F3D6', '#111111', 'FULL_DAY', false, false, false, false, true)";

	private static final String SEED_PAGINATION_POLICIES = "INSERT INTO lv_leave_policy (id, name, leave_type_id, policy_type, status, is_carryover_enabled) VALUES "
			+ "(810, 'PagePolicy0', 800, 'ACCRUAL', 'ACTIVE', false), "
			+ "(811, 'PagePolicy1', 801, 'ACCRUAL', 'ACTIVE', false), "
			+ "(812, 'PagePolicy2', 802, 'ACCRUAL', 'ACTIVE', false), "
			+ "(813, 'PagePolicy3', 803, 'ACCRUAL', 'ACTIVE', false), "
			+ "(814, 'PagePolicy4', 804, 'ACCRUAL', 'ACTIVE', false), "
			+ "(815, 'PagePolicy5', 805, 'ACCRUAL', 'ACTIVE', false), "
			+ "(816, 'PagePolicy6', 806, 'ACCRUAL', 'ACTIVE', false)";

	private static final String SEED_PAGINATION_ASSIGNMENTS = "INSERT INTO lv_employee_leave_policy (id, employee_id, policy_id, effective_date_type, effective_from, status) VALUES "
			+ "(910, 1, 810, 'SPECIFIC', '2024-01-01', 'ACTIVE'), "
			+ "(911, 1, 811, 'SPECIFIC', '2024-01-02', 'ACTIVE'), "
			+ "(912, 1, 812, 'SPECIFIC', '2024-01-03', 'ACTIVE'), "
			+ "(913, 1, 813, 'SPECIFIC', '2024-01-04', 'ACTIVE'), "
			+ "(914, 1, 814, 'SPECIFIC', '2024-01-05', 'ACTIVE'), "
			+ "(915, 1, 815, 'SPECIFIC', '2024-01-06', 'ACTIVE'), "
			+ "(916, 1, 816, 'SPECIFIC', '2024-01-07', 'ACTIVE')";

	private static final String NULL_JOIN_DATE_EMPLOYEE_2 = "UPDATE employee SET join_date = NULL WHERE employee_id = 2";

	private static final String DOWNGRADE_USER2_TO_EMPLOYEE = "UPDATE employee_role SET leave_role = 'LEAVE_EMPLOYEE', people_role = 'PEOPLE_EMPLOYEE', attendance_role = 'ATTENDANCE_EMPLOYEE' WHERE employee_id = 2";

	private static final String USER2_PEOPLE_ADMIN_ONLY = "UPDATE employee_role SET leave_role = 'LEAVE_EMPLOYEE', people_role = 'PEOPLE_ADMIN', attendance_role = 'ATTENDANCE_EMPLOYEE' WHERE employee_id = 2";

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

	private ResultActions performAssign(String authToken, String body) throws Exception {
		return mvc.perform(post(ENDPOINT).contentType(MediaType.APPLICATION_JSON)
			.accept(MediaType.APPLICATION_JSON)
			.content(body)
			.with(SecurityTestUtils.bearerToken(authToken)));
	}

	private ResultActions performUnassign(String authToken, String body) throws Exception {
		return mvc.perform(delete(ENDPOINT).contentType(MediaType.APPLICATION_JSON)
			.accept(MediaType.APPLICATION_JSON)
			.content(body)
			.with(SecurityTestUtils.bearerToken(authToken)));
	}

	private ResultActions performGet(String authToken, long employeeId) throws Exception {
		return mvc.perform(get(ENDPOINT + "/employee/" + employeeId).accept(MediaType.APPLICATION_JSON)
			.with(SecurityTestUtils.bearerToken(authToken)));
	}

	private ResultActions performGetPaged(String authToken, long employeeId, int page, int size) throws Exception {
		return mvc.perform(get(ENDPOINT + "/employee/" + employeeId + "?page=" + page + "&size=" + size)
			.accept(MediaType.APPLICATION_JSON)
			.with(SecurityTestUtils.bearerToken(authToken)));
	}

	private static String assignBody(long employeeId, long policyId, String effectiveDateType, String specificDate) {
		String specific = specificDate == null ? "" : ", \"specificDate\": \"" + specificDate + "\"";
		return "{ \"employeeId\": " + employeeId + ", \"policyId\": " + policyId + ", \"effectiveDateType\": \""
				+ effectiveDateType + "\"" + specific + " }";
	}

	private static String unassignBody(long employeeId, long policyId) {
		return "{ \"employeeId\": " + employeeId + ", \"policyId\": " + policyId + " }";
	}

	private ResultActions performBulk(String authToken, String body) throws Exception {
		return mvc.perform(post(ENDPOINT + "/bulk").contentType(MediaType.APPLICATION_JSON)
			.accept(MediaType.APPLICATION_JSON)
			.content(body)
			.with(SecurityTestUtils.bearerToken(authToken)));
	}

	private static String bulkRow(String employeeEmail, String policyId, String effectiveDate) {
		return "{ \"employeeEmail\": \"" + employeeEmail + "\", \"policyId\": \"" + policyId
				+ "\", \"effectiveDate\": \"" + effectiveDate + "\" }";
	}

	private static String bulkBody(String... rows) {
		return "{ \"assignments\": [" + String.join(", ", rows) + "] }";
	}

	@Nested
	@DisplayName("Assign Leave Policy")
	class AssignPolicyTests {

		@Test
		@DisplayName("Leave admin assigns a policy using the hire date; window opens on the employee's join date")
		@Sql(statements = { SEED_LEAVE_TYPES, SEED_POLICIES })
		void assign_HireDate_ReturnsCreatedWindowOnJoinDate() throws Exception {
			performAssign(leaveAdminToken(), assignBody(1, 500, "HIRE_DATE", null)).andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
				.andExpect(jsonPath("$.results[0].employeeId").value(1))
				.andExpect(jsonPath("$.results[0].policyId").value(500))
				.andExpect(jsonPath("$.results[0].policyName").value("Annual Standard"))
				.andExpect(jsonPath("$.results[0].leaveTypeName").value("AssignAnnual"))
				.andExpect(jsonPath("$.results[0].policyType").value("ACCRUAL"))
				.andExpect(jsonPath("$.results[0].status").value("ACTIVE"))
				.andExpect(jsonPath("$.results[0].effectiveDateType").value("HIRE_DATE"))
				.andExpect(jsonPath("$.results[0].effectiveFrom").value(EMPLOYEE_1_JOIN_DATE));
		}

		@Test
		@DisplayName("Leave admin assigns a policy on a specific date; window opens on that date")
		@Sql(statements = { SEED_LEAVE_TYPES, SEED_POLICIES })
		void assign_SpecificDate_ReturnsCreatedWindowOnChosenDate() throws Exception {
			performAssign(leaveAdminToken(), assignBody(1, 500, "SPECIFIC", "2024-03-01")).andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.results[0].effectiveDateType").value("SPECIFIC"))
				.andExpect(jsonPath("$.results[0].effectiveFrom").value("2024-03-01"))
				.andExpect(jsonPath("$.results[0].status").value("ACTIVE"));
		}

		@Test
		@DisplayName("Assigning a second policy of the same leave type supersedes the first (last-write-wins)")
		@Sql(statements = { SEED_LEAVE_TYPES, SEED_POLICIES, SEED_EXISTING_ASSIGNMENT })
		void assign_ConflictingLeaveType_ClosesPreviousWindow() throws Exception {
			// Employee 1 already has an open window on policy 500 (leave type 100).
			// Assigning policy 501 (also leave type 100) must close 500 and open 501.
			performAssign(leaveAdminToken(), assignBody(1, 501, "SPECIFIC", "2024-06-01")).andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.results[0].policyId").value(501));

			performGet(leaveAdminToken(), 1).andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.results[0].items", hasSize(1)))
				.andExpect(jsonPath("$.results[0].items[0].policyId").value(501));
		}

		@Test
		@DisplayName("Assigning a policy on a different leave type does not affect the existing assignment")
		@Sql(statements = { SEED_LEAVE_TYPES, SEED_POLICIES, SEED_EXISTING_ASSIGNMENT })
		void assign_DifferentLeaveType_KeepsBothWindows() throws Exception {
			performAssign(leaveAdminToken(), assignBody(1, 600, "SPECIFIC", "2024-06-01")).andDo(print())
				.andExpect(status().isOk());

			performGet(leaveAdminToken(), 1).andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.results[0].items", hasSize(2)));
		}

		@Test
		@DisplayName("Returns 400 when a specific date is chosen but not provided")
		@Sql(statements = { SEED_LEAVE_TYPES, SEED_POLICIES })
		void assign_SpecificDateMissing_ReturnsBadRequest() throws Exception {
			performAssign(leaveAdminToken(), assignBody(1, 500, "SPECIFIC", null)).andDo(print())
				.andExpect(status().isBadRequest());
		}

		@Test
		@DisplayName("Returns 400 when hire date is requested but the employee has no join date")
		@Sql(statements = { SEED_LEAVE_TYPES, SEED_POLICIES, NULL_JOIN_DATE_EMPLOYEE_2 })
		void assign_HireDateWithoutJoinDate_ReturnsBadRequest() throws Exception {
			performAssign(leaveAdminToken(), assignBody(2, 500, "HIRE_DATE", null)).andDo(print())
				.andExpect(status().isBadRequest());
		}

		@Test
		@DisplayName("Returns 400 when the policy is not active")
		@Sql(statements = { SEED_LEAVE_TYPES, SEED_POLICIES })
		void assign_InactivePolicy_ReturnsBadRequest() throws Exception {
			performAssign(leaveAdminToken(), assignBody(1, 502, "HIRE_DATE", null)).andDo(print())
				.andExpect(status().isBadRequest());
		}

		@Test
		@DisplayName("Returns 400 when assigning a flexible policy (accrual only this phase)")
		@Sql(statements = { SEED_LEAVE_TYPES, SEED_POLICIES })
		void assign_FlexiblePolicy_ReturnsBadRequest() throws Exception {
			performAssign(leaveAdminToken(), assignBody(1, 700, "HIRE_DATE", null)).andDo(print())
				.andExpect(status().isBadRequest());
		}

		@Test
		@DisplayName("Re-assigning the same policy on the same date is idempotent (no duplicate active window)")
		@Sql(statements = { SEED_LEAVE_TYPES, SEED_POLICIES })
		void assign_IdenticalReassign_IsNoOp() throws Exception {
			performAssign(leaveAdminToken(), assignBody(1, 500, "SPECIFIC", "2024-03-01")).andExpect(status().isOk());
			performAssign(leaveAdminToken(), assignBody(1, 500, "SPECIFIC", "2024-03-01")).andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.results[0].policyId").value(500))
				.andExpect(jsonPath("$.results[0].effectiveFrom").value("2024-03-01"));

			performGet(leaveAdminToken(), 1).andExpect(status().isOk())
				.andExpect(jsonPath("$.results[0].items", hasSize(1)))
				.andExpect(jsonPath("$.results[0].items[0].policyId").value(500));
		}

		@Test
		@DisplayName("Returns 404 when the policy does not exist")
		void assign_UnknownPolicy_ReturnsNotFound() throws Exception {
			performAssign(leaveAdminToken(), assignBody(1, 999, "HIRE_DATE", null)).andDo(print())
				.andExpect(status().isNotFound());
		}

		@Test
		@DisplayName("Returns 404 when the employee does not exist")
		@Sql(statements = { SEED_LEAVE_TYPES, SEED_POLICIES })
		void assign_UnknownEmployee_ReturnsNotFound() throws Exception {
			performAssign(leaveAdminToken(), assignBody(9999, 500, "HIRE_DATE", null)).andDo(print())
				.andExpect(status().isNotFound());
		}

	}

	@Nested
	@DisplayName("Unassign Leave Policy")
	class UnassignPolicyTests {

		@Test
		@DisplayName("Leave admin unassigns an open policy; the assignment leaves the active list")
		@Sql(statements = { SEED_LEAVE_TYPES, SEED_POLICIES, SEED_EXISTING_ASSIGNMENT })
		void unassign_OpenWindow_ClosesAndRemovesFromActiveList() throws Exception {
			performUnassign(leaveAdminToken(), unassignBody(1, 500)).andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
				.andExpect(jsonPath("$.results[0].policyId").value(500))
				.andExpect(jsonPath("$.results[0].status").value("ENDED"));

			performGet(leaveAdminToken(), 1).andExpect(status().isOk())
				.andExpect(jsonPath("$.results[0].items", hasSize(0)));
		}

		@Test
		@DisplayName("Returns 400 when there is no active assignment to unassign")
		@Sql(statements = { SEED_LEAVE_TYPES, SEED_POLICIES })
		void unassign_NoOpenWindow_ReturnsNotFound() throws Exception {
			performUnassign(leaveAdminToken(), unassignBody(1, 500)).andDo(print()).andExpect(status().isBadRequest());
		}

		@Test
		@DisplayName("Replaying an unassign after removal returns 400 (nothing left to unassign)")
		@Sql(statements = { SEED_LEAVE_TYPES, SEED_POLICIES, SEED_EXISTING_ASSIGNMENT })
		void unassign_Replay_SecondReturnsNotFound() throws Exception {
			performUnassign(leaveAdminToken(), unassignBody(1, 500)).andExpect(status().isOk());
			performUnassign(leaveAdminToken(), unassignBody(1, 500)).andDo(print()).andExpect(status().isBadRequest());
		}

		@Test
		@DisplayName("Returns 400 (no active assignment) when unassigning for an unknown employee")
		@Sql(statements = { SEED_LEAVE_TYPES, SEED_POLICIES })
		void unassign_UnknownEmployee_ReturnsNoActiveAssignment() throws Exception {
			performUnassign(leaveAdminToken(), unassignBody(9999, 500)).andDo(print())
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.results[0].messageKey").value("LEAVE_ERROR_EMPLOYEE_LEAVE_POLICY_NOT_FOUND"));
		}

	}

	@Nested
	@DisplayName("List Employee Leave Policies")
	class GetEmployeePoliciesTests {

		@Test
		@DisplayName("Returns the employee's active assignments")
		@Sql(statements = { SEED_LEAVE_TYPES, SEED_POLICIES, SEED_EXISTING_ASSIGNMENT })
		void get_WithActiveAssignment_ReturnsIt() throws Exception {
			performGet(leaveAdminToken(), 1).andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
				.andExpect(jsonPath("$.results[0].items", hasSize(1)))
				.andExpect(jsonPath("$.results[0].items[0].policyId").value(500))
				.andExpect(jsonPath("$.results[0].items[0].status").value("ACTIVE"));
		}

		@Test
		@DisplayName("Returns an empty list for an employee with no assignments")
		void get_NoAssignments_ReturnsEmpty() throws Exception {
			performGet(leaveAdminToken(), 3).andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.results[0].items", hasSize(0)));
		}

		@Test
		@DisplayName("Returns an empty list for an unknown employee")
		void get_UnknownEmployee_ReturnsEmpty() throws Exception {
			performGet(leaveAdminToken(), 9999).andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.results[0].items", hasSize(0)));
		}

		@Test
		@DisplayName("page and size drive the returned items and the PageDto metadata")
		@Sql(statements = { SEED_PAGINATION_TYPES, SEED_PAGINATION_POLICIES, SEED_PAGINATION_ASSIGNMENTS })
		void get_Paginated_DrivesItemsAndMetadata() throws Exception {
			// First page: 6 of the 7 active assignments.
			performGetPaged(leaveAdminToken(), 1, 0, 6).andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.results[0].items", hasSize(6)))
				.andExpect(jsonPath("$.results[0].totalItems").value(7))
				.andExpect(jsonPath("$.results[0].totalPages").value(2))
				.andExpect(jsonPath("$.results[0].currentPage").value(0));

			// Second page: the remaining 1.
			performGetPaged(leaveAdminToken(), 1, 1, 6).andExpect(status().isOk())
				.andExpect(jsonPath("$.results[0].items", hasSize(1)))
				.andExpect(jsonPath("$.results[0].totalItems").value(7))
				.andExpect(jsonPath("$.results[0].totalPages").value(2))
				.andExpect(jsonPath("$.results[0].currentPage").value(1));
		}

	}

	@Nested
	@DisplayName("Full Assignment Lifecycle")
	class FullLifecycleTests {

		@Test
		@DisplayName("End-to-end: empty -> assign -> supersede same type -> keep other type -> unassign -> empty")
		@Sql(statements = { SEED_LEAVE_TYPES, SEED_POLICIES })
		void fullLifecycle_AssignSupersedeUnassign_TracksActiveState() throws Exception {
			String token = leaveAdminToken();

			// 1. Starts with no assignments.
			performGet(token, 1).andExpect(status().isOk()).andExpect(jsonPath("$.results[0].items", hasSize(0)));

			// 2. Assign policy 500 (leave type 100) on the hire date.
			performAssign(token, assignBody(1, 500, "HIRE_DATE", null)).andExpect(status().isOk())
				.andExpect(jsonPath("$.results[0].policyId").value(500))
				.andExpect(jsonPath("$.results[0].effectiveFrom").value(EMPLOYEE_1_JOIN_DATE));

			// 3. It is now the single active assignment.
			performGet(token, 1).andExpect(status().isOk())
				.andExpect(jsonPath("$.results[0].items", hasSize(1)))
				.andExpect(jsonPath("$.results[0].items[0].policyId").value(500));

			// 4. Assign policy 600 (leave type 200) - different type, so it coexists.
			performAssign(token, assignBody(1, 600, "SPECIFIC", "2024-06-01")).andExpect(status().isOk());
			performGet(token, 1).andExpect(status().isOk())
				.andExpect(jsonPath("$.results[0].items", hasSize(2)))
				.andExpect(jsonPath("$.results[0].items[*].policyId", containsInAnyOrder(500, 600)));

			// 5. Assign policy 501 (leave type 100) - same type as 500, so it supersedes
			// 500.
			performAssign(token, assignBody(1, 501, "SPECIFIC", "2024-09-01")).andExpect(status().isOk());
			performGet(token, 1).andExpect(status().isOk())
				.andExpect(jsonPath("$.results[0].items", hasSize(2)))
				.andExpect(jsonPath("$.results[0].items[*].policyId", containsInAnyOrder(501, 600)));

			// 6. Unassign 501 - it is returned ended; only the leave type 200 assignment
			// remains active.
			performUnassign(token, unassignBody(1, 501)).andExpect(status().isOk())
				.andExpect(jsonPath("$.results[0].policyId").value(501))
				.andExpect(jsonPath("$.results[0].status").value("ENDED"));
			performGet(token, 1).andExpect(status().isOk())
				.andExpect(jsonPath("$.results[0].items", hasSize(1)))
				.andExpect(jsonPath("$.results[0].items[0].policyId").value(600));

			// 7. Unassign the last one - back to empty.
			performUnassign(token, unassignBody(1, 600)).andExpect(status().isOk())
				.andExpect(jsonPath("$.results[0].policyId").value(600))
				.andExpect(jsonPath("$.results[0].status").value("ENDED"));

			performGet(token, 1).andExpect(status().isOk()).andExpect(jsonPath("$.results[0].items", hasSize(0)));
		}

	}

	@Nested
	@DisplayName("Role-Based Access")
	class RoleBasedAccessTests {

		@Test
		@DisplayName("Leave employee cannot assign, unassign, or list")
		@Sql(statements = { SEED_LEAVE_TYPES, SEED_POLICIES, DOWNGRADE_USER2_TO_EMPLOYEE })
		void leaveEmployee_AllOperations_Forbidden() throws Exception {
			performAssign(user2Token(), assignBody(1, 500, "HIRE_DATE", null)).andExpect(status().isForbidden());
			performUnassign(user2Token(), unassignBody(1, 500)).andExpect(status().isForbidden());
			performGet(user2Token(), 1).andExpect(status().isForbidden());
		}

		@Test
		@DisplayName("People admin can list but cannot assign or unassign")
		@Sql(statements = { SEED_LEAVE_TYPES, SEED_POLICIES, USER2_PEOPLE_ADMIN_ONLY })
		void peopleAdmin_ReadOnly() throws Exception {
			performGet(user2Token(), 1).andDo(print()).andExpect(status().isOk());
			performAssign(user2Token(), assignBody(1, 500, "HIRE_DATE", null)).andExpect(status().isForbidden());
			performUnassign(user2Token(), unassignBody(1, 500)).andExpect(status().isForbidden());
		}

		@Test
		@DisplayName("Returns 401 when no authentication token is provided")
		void assign_NoAuth_ReturnsUnauthorized() throws Exception {
			mvc.perform(post(ENDPOINT).contentType(MediaType.APPLICATION_JSON)
				.accept(MediaType.APPLICATION_JSON)
				.content(assignBody(1, 500, "HIRE_DATE", null))).andDo(print()).andExpect(status().isUnauthorized());
		}

	}

	@Nested
	@DisplayName("Bulk Assign Leave Policies")
	class BulkAssignPolicyTests {

		@Test
		@DisplayName("All valid rows are assigned and summarised")
		@Sql(statements = { SEED_LEAVE_TYPES, SEED_POLICIES })
		void bulkAssign_AllValid_AssignsEveryRow() throws Exception {
			String body = bulkBody(bulkRow(EMPLOYEE_1_EMAIL, "500", "01/06/2024"),
					bulkRow(EMPLOYEE_2_EMAIL, "600", "01/06/2024"));

			performBulk(leaveAdminToken(), body).andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
				.andExpect(jsonPath("$.results[0].bulkStatusSummary.successCount").value(2))
				.andExpect(jsonPath("$.results[0].bulkStatusSummary.failedCount").value(0))
				.andExpect(jsonPath("$.results[0].bulkRecordErrorLogs", hasSize(0)));

			performGet(leaveAdminToken(), 1).andExpect(status().isOk())
				.andExpect(jsonPath("$.results[0].items", hasSize(1)))
				.andExpect(jsonPath("$.results[0].items[0].policyId").value(500));
		}

		@Test
		@DisplayName("Valid rows are assigned and invalid rows are skipped with per-row errors")
		@Sql(statements = { SEED_LEAVE_TYPES, SEED_POLICIES })
		void bulkAssign_MixedRows_ProcessesValidSkipsInvalid() throws Exception {
			String body = bulkBody(bulkRow(EMPLOYEE_1_EMAIL, "500", "01/06/2024"),
					bulkRow("ghost@gmail.com", "500", "01/06/2024"), bulkRow(EMPLOYEE_2_EMAIL, "999", "01/06/2024"),
					bulkRow(EMPLOYEE_2_EMAIL, "700", "01/06/2024"), bulkRow(EMPLOYEE_2_EMAIL, "600", "32/13/2024"));

			performBulk(leaveAdminToken(), body).andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.results[0].bulkStatusSummary.successCount").value(1))
				.andExpect(jsonPath("$.results[0].bulkStatusSummary.failedCount").value(4))
				.andExpect(jsonPath("$.results[0].bulkRecordErrorLogs", hasSize(4)))
				.andExpect(jsonPath("$.results[0].bulkRecordErrorLogs[0].employeeEmail").value("ghost@gmail.com"))
				.andExpect(jsonPath("$.results[0].bulkRecordErrorLogs[0].error",
						containsString("No active employee found with the email: ghost@gmail.com")))
				.andExpect(jsonPath("$.results[0].bulkRecordErrorLogs[1].error",
						containsString("No policy found with the ID: 999")));

			performGet(leaveAdminToken(), 1).andExpect(status().isOk())
				.andExpect(jsonPath("$.results[0].items", hasSize(1)))
				.andExpect(jsonPath("$.results[0].items[0].policyId").value(500));
		}

		@Test
		@DisplayName("A flexible policy row is rejected as not an accrual policy")
		@Sql(statements = { SEED_LEAVE_TYPES, SEED_POLICIES })
		void bulkAssign_FlexiblePolicy_Rejected() throws Exception {
			String body = bulkBody(bulkRow(EMPLOYEE_1_EMAIL, "700", "01/06/2024"));

			performBulk(leaveAdminToken(), body).andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.results[0].bulkStatusSummary.successCount").value(0))
				.andExpect(jsonPath("$.results[0].bulkStatusSummary.failedCount").value(1))
				.andExpect(
						jsonPath("$.results[0].bulkRecordErrorLogs[0].error", containsString("not an accrual policy")));
		}

		@Test
		@DisplayName("An inactive policy id is rejected")
		@Sql(statements = { SEED_LEAVE_TYPES, SEED_POLICIES })
		void bulkAssign_InactivePolicy_Rejected() throws Exception {
			String body = bulkBody(bulkRow(EMPLOYEE_1_EMAIL, "502", "01/06/2024"));

			performBulk(leaveAdminToken(), body).andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.results[0].bulkStatusSummary.failedCount").value(1))
				.andExpect(jsonPath("$.results[0].bulkRecordErrorLogs[0].error",
						containsString("Policy is inactive: Annual Retired")));
		}

		@Test
		@DisplayName("A policy id that is not a number is rejected without failing the whole upload")
		@Sql(statements = { SEED_LEAVE_TYPES, SEED_POLICIES })
		void bulkAssign_NonNumericPolicyId_RejectsRowOnly() throws Exception {
			String body = bulkBody(bulkRow(EMPLOYEE_1_EMAIL, "500", "01/06/2024"),
					bulkRow(EMPLOYEE_2_EMAIL, "six hundred", "01/06/2024"));

			performBulk(leaveAdminToken(), body).andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.results[0].bulkStatusSummary.successCount").value(1))
				.andExpect(jsonPath("$.results[0].bulkStatusSummary.failedCount").value(1))
				.andExpect(jsonPath("$.results[0].bulkRecordErrorLogs[0].error",
						containsString("Policy ID must be a number: six hundred")));
		}

		@Test
		@DisplayName("Empty email and policy id cells are reported per row")
		@Sql(statements = { SEED_LEAVE_TYPES, SEED_POLICIES })
		void bulkAssign_EmptyCells_ReportsPerRow() throws Exception {
			String body = bulkBody(bulkRow("", "500", "01/06/2024"), bulkRow(EMPLOYEE_2_EMAIL, "", "01/06/2024"));

			performBulk(leaveAdminToken(), body).andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.results[0].bulkStatusSummary.failedCount").value(2))
				.andExpect(jsonPath("$.results[0].bulkRecordErrorLogs[0].error",
						containsString("Employee Email is empty")))
				.andExpect(jsonPath("$.results[0].bulkRecordErrorLogs[1].error", containsString("Policy ID is empty")));
		}

		@Test
		@DisplayName("Duplicate employee and leave type in the file processes the first row only")
		@Sql(statements = { SEED_LEAVE_TYPES, SEED_POLICIES })
		void bulkAssign_DuplicateLeaveType_ProcessesFirstOnly() throws Exception {
			String body = bulkBody(bulkRow(EMPLOYEE_1_EMAIL, "500", "01/06/2024"),
					bulkRow(EMPLOYEE_1_EMAIL, "501", "01/07/2024"));

			performBulk(leaveAdminToken(), body).andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.results[0].bulkStatusSummary.successCount").value(1))
				.andExpect(jsonPath("$.results[0].bulkStatusSummary.failedCount").value(1))
				.andExpect(jsonPath("$.results[0].bulkRecordErrorLogs[0].error", containsString("Duplicate entry")));

			performGet(leaveAdminToken(), 1).andExpect(status().isOk())
				.andExpect(jsonPath("$.results[0].items", hasSize(1)))
				.andExpect(jsonPath("$.results[0].items[0].policyId").value(500));
		}

		@Test
		@DisplayName("A conflicting active policy for the same leave type is silently superseded")
		@Sql(statements = { SEED_LEAVE_TYPES, SEED_POLICIES, SEED_EXISTING_ASSIGNMENT })
		void bulkAssign_ConflictingLeaveType_Supersedes() throws Exception {
			String body = bulkBody(bulkRow(EMPLOYEE_1_EMAIL, "501", "01/06/2024"));

			performBulk(leaveAdminToken(), body).andExpect(status().isOk())
				.andExpect(jsonPath("$.results[0].bulkStatusSummary.successCount").value(1))
				.andExpect(jsonPath("$.results[0].bulkStatusSummary.failedCount").value(0));

			performGet(leaveAdminToken(), 1).andExpect(status().isOk())
				.andExpect(jsonPath("$.results[0].items", hasSize(1)))
				.andExpect(jsonPath("$.results[0].items[0].policyId").value(501));
		}

		@Test
		@DisplayName("An email that differs only by case and padding still matches")
		@Sql(statements = { SEED_LEAVE_TYPES, SEED_POLICIES })
		void bulkAssign_LooselyFormattedEmail_Matches() throws Exception {
			String body = bulkBody(bulkRow("  USER1@Gmail.com ", " 500 ", "01/06/2024"));

			performBulk(leaveAdminToken(), body).andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.results[0].bulkStatusSummary.successCount").value(1))
				.andExpect(jsonPath("$.results[0].bulkStatusSummary.failedCount").value(0));
		}

		@Test
		@DisplayName("A blank effective date falls back to the employee hire date")
		@Sql(statements = { SEED_LEAVE_TYPES, SEED_POLICIES })
		void bulkAssign_BlankEffectiveDate_UsesHireDate() throws Exception {
			String body = bulkBody(bulkRow(EMPLOYEE_1_EMAIL, "500", ""));

			performBulk(leaveAdminToken(), body).andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.results[0].bulkStatusSummary.successCount").value(1))
				.andExpect(jsonPath("$.results[0].bulkStatusSummary.failedCount").value(0));

			performGet(leaveAdminToken(), 1).andExpect(status().isOk())
				.andExpect(jsonPath("$.results[0].items[0].effectiveDateType").value("HIRE_DATE"))
				.andExpect(jsonPath("$.results[0].items[0].effectiveFrom").value(EMPLOYEE_1_JOIN_DATE));
		}

		@Test
		@DisplayName("A blank effective date is rejected when the employee has no hire date")
		@Sql(statements = { SEED_LEAVE_TYPES, SEED_POLICIES, NULL_JOIN_DATE_EMPLOYEE_2 })
		void bulkAssign_BlankEffectiveDateWithoutHireDate_Rejected() throws Exception {
			String body = bulkBody(bulkRow(EMPLOYEE_2_EMAIL, "500", ""));

			performBulk(leaveAdminToken(), body).andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.results[0].bulkStatusSummary.successCount").value(0))
				.andExpect(jsonPath("$.results[0].bulkStatusSummary.failedCount").value(1))
				.andExpect(jsonPath("$.results[0].bulkRecordErrorLogs[0].error",
						containsString("has no hire date on record")));
		}

		@Test
		@DisplayName("A request without an assignments field summarises zero rows")
		@Sql(statements = { SEED_LEAVE_TYPES, SEED_POLICIES })
		void bulkAssign_MissingAssignments_ReturnsEmptySummary() throws Exception {
			performBulk(leaveAdminToken(), "{}").andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.results[0].bulkStatusSummary.successCount").value(0))
				.andExpect(jsonPath("$.results[0].bulkStatusSummary.failedCount").value(0))
				.andExpect(jsonPath("$.results[0].bulkRecordErrorLogs", hasSize(0)));
		}

		@Test
		@DisplayName("A file above the supported row count is rejected")
		@Sql(statements = { SEED_LEAVE_TYPES, SEED_POLICIES })
		void bulkAssign_TooManyRows_ReturnsBadRequest() throws Exception {
			String[] rows = new String[1001];
			Arrays.fill(rows, bulkRow(EMPLOYEE_1_EMAIL, "500", "01/06/2024"));

			performBulk(leaveAdminToken(), bulkBody(rows)).andDo(print()).andExpect(status().isBadRequest());
		}

		@Test
		@DisplayName("People admin cannot bulk assign")
		@Sql(statements = { SEED_LEAVE_TYPES, SEED_POLICIES, USER2_PEOPLE_ADMIN_ONLY })
		void bulkAssign_PeopleAdmin_Forbidden() throws Exception {
			String body = bulkBody(bulkRow(EMPLOYEE_1_EMAIL, "500", "01/06/2024"));
			performBulk(user2Token(), body).andDo(print()).andExpect(status().isForbidden());
		}

	}

}
