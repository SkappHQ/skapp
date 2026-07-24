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

import static com.skapp.support.TestConstants.STATUS_PATH;
import static com.skapp.support.TestConstants.STATUS_SUCCESSFUL;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = TestSkappApplication.class)
@AutoConfigureMockMvc
@Transactional
@RequiredArgsConstructor
@DisplayName("Leave Policy Controller Integration Tests")
class LeavePolicyControllerIntegrationTest {

	private static final String ENDPOINT = "/v1/leave/policies";

	private static final String SEED_LEAVE_TYPE = "INSERT INTO lv_leave_type (id, name, emoji_code, color_code, min_duration, is_attachment, is_attachment_must, is_comment_must, is_auto_approval, is_active) "
			+ "VALUES (100, 'PolicyAnnual', 'U+1F3D6', '#FFC107', 'FULL_DAY', false, false, false, false, true)";

	private static final String SEED_POLICY = "INSERT INTO lv_leave_policy (id, name, leave_type_id, policy_type, status, is_carryover_enabled) "
			+ "VALUES (500, 'Existing Policy', 100, 'ACCRUAL', 'ACTIVE', false)";

	private static final String SEED_INACTIVE_POLICY = "INSERT INTO lv_leave_policy (id, name, leave_type_id, policy_type, status, is_carryover_enabled) "
			+ "VALUES (501, 'Inactive Policy', 100, 'ACCRUAL', 'INACTIVE', false)";

	private static final String DOWNGRADE_USER2_TO_EMPLOYEE = "UPDATE employee_role SET leave_role = 'LEAVE_EMPLOYEE', people_role = 'PEOPLE_EMPLOYEE', attendance_role = 'ATTENDANCE_EMPLOYEE' WHERE employee_id = 2";

	private static final String USER2_PEOPLE_ADMIN_ONLY = "UPDATE employee_role SET leave_role = 'LEAVE_EMPLOYEE', people_role = 'PEOPLE_ADMIN', attendance_role = 'ATTENDANCE_EMPLOYEE' WHERE employee_id = 2";

	private static final String ACCRUAL_POLICY_JSON = """
			{
			  "name": "Annual Accrual Policy",
			  "leaveTypeId": 100,
			  "policyType": "ACCRUAL",
			  "accrual": {
			    "accrualDays": 1.5,
			    "frequency": "MONTHLY",
			    "isCarryoverEnabled": false
			  }
			}
			""";

	private static final String FLEXIBLE_POLICY_JSON = """
			{
			  "name": "Flexible Policy",
			  "leaveTypeId": 100,
			  "policyType": "FLEXIBLE"
			}
			""";

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

	private ResultActions performCreate(String authToken, String body) throws Exception {
		return mvc.perform(post(ENDPOINT).contentType(MediaType.APPLICATION_JSON)
			.accept(MediaType.APPLICATION_JSON)
			.content(body)
			.with(SecurityTestUtils.bearerToken(authToken)));
	}

	private ResultActions performGetAll(String authToken) throws Exception {
		return mvc
			.perform(get(ENDPOINT).accept(MediaType.APPLICATION_JSON).with(SecurityTestUtils.bearerToken(authToken)));
	}

	@Nested
	@DisplayName("Create Leave Policy")
	class CreateLeavePolicyTests {

		@Test
		@DisplayName("Leave admin can create an accrual policy")
		@Sql(statements = { SEED_LEAVE_TYPE })
		void addLeavePolicy_LeaveAdminAccrualPolicy_ReturnsCreated() throws Exception {
			performCreate(leaveAdminToken(), ACCRUAL_POLICY_JSON).andDo(print())
				.andExpect(status().isCreated())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
				.andExpect(jsonPath("$.results[0].name").value("Annual Accrual Policy"))
				.andExpect(jsonPath("$.results[0].policyType").value("ACCRUAL"))
				.andExpect(jsonPath("$.results[0].status").value("ACTIVE"))
				.andExpect(jsonPath("$.results[0].accrualDays").value(1.5));
		}

		@Test
		@DisplayName("Leave admin can create a flexible policy")
		@Sql(statements = { SEED_LEAVE_TYPE })
		void addLeavePolicy_LeaveAdminFlexiblePolicy_ReturnsCreated() throws Exception {
			performCreate(leaveAdminToken(), FLEXIBLE_POLICY_JSON).andDo(print())
				.andExpect(status().isCreated())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
				.andExpect(jsonPath("$.results[0].policyType").value("FLEXIBLE"));
		}

		@Test
		@DisplayName("Returns bad request when a policy with the same name exists for the leave type")
		@Sql(statements = { SEED_LEAVE_TYPE, SEED_POLICY })
		void addLeavePolicy_DuplicateNameDifferentCase_ReturnsBadRequest() throws Exception {
			String duplicate = """
					{
					  "name": "existing policy",
					  "leaveTypeId": 100,
					  "policyType": "FLEXIBLE"
					}
					""";

			performCreate(leaveAdminToken(), duplicate).andDo(print()).andExpect(status().isBadRequest());
		}

		@Test
		@DisplayName("Returns bad request when policy type is missing")
		@Sql(statements = { SEED_LEAVE_TYPE })
		void addLeavePolicy_MissingPolicyType_ReturnsBadRequest() throws Exception {
			String missingPolicyType = """
					{
					  "name": "No Type Policy",
					  "leaveTypeId": 100
					}
					""";

			performCreate(leaveAdminToken(), missingPolicyType).andDo(print()).andExpect(status().isBadRequest());
		}

		@Test
		@DisplayName("Returns not found when the leave type does not exist")
		void addLeavePolicy_UnknownLeaveType_ReturnsNotFound() throws Exception {
			performCreate(leaveAdminToken(), ACCRUAL_POLICY_JSON).andDo(print()).andExpect(status().isNotFound());
		}

	}

	@Nested
	@DisplayName("Role-Based Access Tests")
	class RoleBasedAccessTests {

		@Test
		@DisplayName("Non-admin user cannot create a leave policy")
		@Sql(statements = { SEED_LEAVE_TYPE, DOWNGRADE_USER2_TO_EMPLOYEE })
		void addLeavePolicy_LeaveEmployee_ReturnsForbidden() throws Exception {
			performCreate(user2Token(), ACCRUAL_POLICY_JSON).andDo(print()).andExpect(status().isForbidden());
		}

		@Test
		@DisplayName("Returns 401 when no authentication token is provided")
		void addLeavePolicy_NoAuth_ReturnsUnauthorized() throws Exception {
			mvc.perform(post(ENDPOINT).contentType(MediaType.APPLICATION_JSON)
				.accept(MediaType.APPLICATION_JSON)
				.content(ACCRUAL_POLICY_JSON)).andDo(print()).andExpect(status().isUnauthorized());
		}

		@Test
		@DisplayName("Non-admin user cannot list leave policies")
		@Sql(statements = { DOWNGRADE_USER2_TO_EMPLOYEE })
		void getAllLeavePolicies_LeaveEmployee_ReturnsForbidden() throws Exception {
			performGetAll(user2Token()).andDo(print()).andExpect(status().isForbidden());
		}

		@Test
		@DisplayName("People admin can list leave policies but cannot create one")
		@Sql(statements = { SEED_LEAVE_TYPE, USER2_PEOPLE_ADMIN_ONLY })
		void leavePolicies_PeopleAdmin_CanReadButNotCreate() throws Exception {
			performGetAll(user2Token()).andDo(print()).andExpect(status().isOk());
			performCreate(user2Token(), ACCRUAL_POLICY_JSON).andDo(print()).andExpect(status().isForbidden());
		}

		@Test
		@DisplayName("Non-admin user cannot update a leave policy")
		@Sql(statements = { SEED_LEAVE_TYPE, SEED_POLICY, DOWNGRADE_USER2_TO_EMPLOYEE })
		void updateLeavePolicy_LeaveEmployee_ReturnsForbidden() throws Exception {
			mvc.perform(put(ENDPOINT + "/500").contentType(MediaType.APPLICATION_JSON)
				.accept(MediaType.APPLICATION_JSON)
				.content("{\"name\": \"Renamed Policy\"}")
				.with(SecurityTestUtils.bearerToken(user2Token()))).andDo(print()).andExpect(status().isForbidden());
		}

		@Test
		@DisplayName("Non-admin user cannot deactivate a leave policy")
		@Sql(statements = { SEED_LEAVE_TYPE, SEED_POLICY, DOWNGRADE_USER2_TO_EMPLOYEE })
		void deactivateLeavePolicy_LeaveEmployee_ReturnsForbidden() throws Exception {
			mvc.perform(patch(ENDPOINT + "/500/deactivate").accept(MediaType.APPLICATION_JSON)
				.with(SecurityTestUtils.bearerToken(user2Token()))).andDo(print()).andExpect(status().isForbidden());
		}

		@Test
		@DisplayName("Non-admin user cannot activate a leave policy")
		@Sql(statements = { SEED_LEAVE_TYPE, SEED_INACTIVE_POLICY, DOWNGRADE_USER2_TO_EMPLOYEE })
		void activateLeavePolicy_LeaveEmployee_ReturnsForbidden() throws Exception {
			mvc.perform(patch(ENDPOINT + "/501/activate").accept(MediaType.APPLICATION_JSON)
				.with(SecurityTestUtils.bearerToken(user2Token()))).andDo(print()).andExpect(status().isForbidden());
		}

	}

	@Nested
	@DisplayName("Manage Leave Policies")
	class ManageLeavePoliciesTests {

		@Test
		@DisplayName("Leave admin can list leave policies with paging")
		@Sql(statements = { SEED_LEAVE_TYPE, SEED_POLICY })
		void getAllLeavePolicies_LeaveAdmin_ReturnsSeededPolicy() throws Exception {
			performGetAll(leaveAdminToken()).andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
				.andExpect(jsonPath("$.results[0].items", hasSize(1)))
				.andExpect(jsonPath("$.results[0].items[0].name").value("Existing Policy"))
				.andExpect(jsonPath("$.results[0].totalItems").value(1));
		}

		@Test
		@DisplayName("Leave admin can update a leave policy name")
		@Sql(statements = { SEED_LEAVE_TYPE, SEED_POLICY })
		void updateLeavePolicy_LeaveAdmin_UpdatesName() throws Exception {
			mvc.perform(put(ENDPOINT + "/500").contentType(MediaType.APPLICATION_JSON)
				.accept(MediaType.APPLICATION_JSON)
				.content("{\"name\": \"Renamed Policy\"}")
				.with(SecurityTestUtils.bearerToken(leaveAdminToken())))
				.andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
				.andExpect(jsonPath("$.results[0].name").value("Renamed Policy"));
		}

		@Test
		@DisplayName("Leave admin can deactivate a leave policy")
		@Sql(statements = { SEED_LEAVE_TYPE, SEED_POLICY })
		void deactivateLeavePolicy_LeaveAdmin_MarksInactive() throws Exception {
			mvc.perform(patch(ENDPOINT + "/500/deactivate").accept(MediaType.APPLICATION_JSON)
				.with(SecurityTestUtils.bearerToken(leaveAdminToken())))
				.andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
				.andExpect(jsonPath("$.results[0].status").value("INACTIVE"));
		}

		@Test
		@DisplayName("Leave admin cannot deactivate an already inactive leave policy")
		@Sql(statements = { SEED_LEAVE_TYPE, SEED_INACTIVE_POLICY })
		void deactivateLeavePolicy_AlreadyInactive_ReturnsBadRequest() throws Exception {
			mvc.perform(patch(ENDPOINT + "/501/deactivate").accept(MediaType.APPLICATION_JSON)
				.with(SecurityTestUtils.bearerToken(leaveAdminToken())))
				.andDo(print())
				.andExpect(status().isBadRequest());
		}

		@Test
		@DisplayName("Leave admin can activate an inactive leave policy")
		@Sql(statements = { SEED_LEAVE_TYPE, SEED_INACTIVE_POLICY })
		void activateLeavePolicy_LeaveAdmin_MarksActive() throws Exception {
			mvc.perform(patch(ENDPOINT + "/501/activate").accept(MediaType.APPLICATION_JSON)
				.with(SecurityTestUtils.bearerToken(leaveAdminToken())))
				.andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
				.andExpect(jsonPath("$.results[0].status").value("ACTIVE"));
		}

		@Test
		@DisplayName("Leave admin cannot activate an already active leave policy")
		@Sql(statements = { SEED_LEAVE_TYPE, SEED_POLICY })
		void activateLeavePolicy_AlreadyActive_ReturnsBadRequest() throws Exception {
			mvc.perform(patch(ENDPOINT + "/500/activate").accept(MediaType.APPLICATION_JSON)
				.with(SecurityTestUtils.bearerToken(leaveAdminToken())))
				.andDo(print())
				.andExpect(status().isBadRequest());
		}

	}

}
