package com.skapp.community.leaveplanner.controller.v1;

import com.skapp.TestSkappApplication;
import com.skapp.community.common.security.AuthorityService;
import com.skapp.community.common.service.JwtService;
import com.skapp.community.leaveplanner.model.LeaveEntitlement;
import com.skapp.community.leaveplanner.repository.LeaveEntitlementDao;
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
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
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

	private static final String SEED_SECOND_LEAVE_TYPE = "INSERT INTO lv_leave_type (id, name, emoji_code, color_code, min_duration, is_attachment, is_attachment_must, is_comment_must, is_auto_approval, is_active) "
			+ "VALUES (101, 'PolicyCasual', 'U+1F3D6', '#FFC107', 'FULL_DAY', false, false, false, false, true)";

	private static final String SEED_POLICY = "INSERT INTO lv_leave_policy (id, name, leave_type_id, policy_type, status, is_carryover_enabled) "
			+ "VALUES (500, 'Existing Policy', 100, 'ACCRUAL', 'ACTIVE', false)";

	private static final String SEED_INACTIVE_POLICY = "INSERT INTO lv_leave_policy (id, name, leave_type_id, policy_type, status, is_carryover_enabled) "
			+ "VALUES (501, 'Inactive Policy', 100, 'ACCRUAL', 'INACTIVE', false)";

	private static final String DOWNGRADE_USER2_TO_EMPLOYEE = "UPDATE employee_role SET leave_role = 'LEAVE_EMPLOYEE', people_role = 'PEOPLE_EMPLOYEE', attendance_role = 'ATTENDANCE_EMPLOYEE' WHERE employee_id = 2";

	private static final String USER2_PEOPLE_ADMIN_ONLY = "UPDATE employee_role SET leave_role = 'LEAVE_EMPLOYEE', people_role = 'PEOPLE_ADMIN', attendance_role = 'ATTENDANCE_EMPLOYEE' WHERE employee_id = 2";

	private static final String SEED_ALLOCATION = "INSERT INTO leave_entitlement (entitlement_id, total_days_allocated, total_days_used, valid_from, valid_to, is_active, is_manual, is_override, leave_type_id, employee_id) "
			+ "VALUES (900, 14, 2, DATEADD('DAY', -30, CURRENT_DATE), DATEADD('DAY', 300, CURRENT_DATE), true, false, false, (SELECT type_id FROM leave_type WHERE name = 'Study'), 2)";

	private static final String SEED_LEAVE_POLICY_ENABLED = "INSERT INTO organization_config (config_title, config_value) VALUES ('LEAVE_POLICY', '{\"isEnabled\":true}')";

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

	private final LeaveEntitlementDao leaveEntitlementDao;

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

	private ResultActions performNameAvailability(String authToken, String name, String leaveTypeId) throws Exception {
		return mvc.perform(get(ENDPOINT + "/name-availability").param("name", name)
			.param("leaveTypeId", leaveTypeId)
			.accept(MediaType.APPLICATION_JSON)
			.with(SecurityTestUtils.bearerToken(authToken)));
	}

	private ResultActions performEnable(String authToken) throws Exception {
		return mvc.perform(post(ENDPOINT + "/enable").accept(MediaType.APPLICATION_JSON)
			.with(SecurityTestUtils.bearerToken(authToken)));
	}

	private ResultActions performGetConfig(String authToken) throws Exception {
		return mvc.perform(get(ENDPOINT + "/config").accept(MediaType.APPLICATION_JSON)
			.with(SecurityTestUtils.bearerToken(authToken)));
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

		@Test
		@DisplayName("Leave admin gets not found when activating an unknown policy")
		void activateLeavePolicy_UnknownPolicy_ReturnsNotFound() throws Exception {
			mvc.perform(patch(ENDPOINT + "/9999/activate").accept(MediaType.APPLICATION_JSON)
				.with(SecurityTestUtils.bearerToken(leaveAdminToken())))
				.andDo(print())
				.andExpect(status().isNotFound());
		}

		@Test
		@DisplayName("Leave admin gets not found when deactivating an unknown policy")
		void deactivateLeavePolicy_UnknownPolicy_ReturnsNotFound() throws Exception {
			mvc.perform(patch(ENDPOINT + "/9999/deactivate").accept(MediaType.APPLICATION_JSON)
				.with(SecurityTestUtils.bearerToken(leaveAdminToken())))
				.andDo(print())
				.andExpect(status().isNotFound());
		}

	}

	@Nested
	@DisplayName("Leave Policy Name Availability")
	class LeavePolicyNameAvailabilityTests {

		@Test
		@DisplayName("Returns available when no policy holds the name for the leave type")
		@Sql(statements = { SEED_LEAVE_TYPE, SEED_POLICY })
		void checkNameAvailability_UnusedName_ReturnsAvailable() throws Exception {
			performNameAvailability(leaveAdminToken(), "Brand New Policy", "100").andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
				.andExpect(jsonPath("$.results[0].isAvailable").value(true));
		}

		@Test
		@DisplayName("Returns unavailable when the name matches an existing policy ignoring case")
		@Sql(statements = { SEED_LEAVE_TYPE, SEED_POLICY })
		void checkNameAvailability_DuplicateNameDifferentCase_ReturnsUnavailable() throws Exception {
			performNameAvailability(leaveAdminToken(), "existing policy", "100").andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.results[0].isAvailable").value(false));
		}

		@Test
		@DisplayName("Returns bad request when the name is missing")
		@Sql(statements = { SEED_LEAVE_TYPE })
		void checkNameAvailability_MissingName_ReturnsBadRequest() throws Exception {
			mvc.perform(get(ENDPOINT + "/name-availability").param("leaveTypeId", "100")
				.accept(MediaType.APPLICATION_JSON)
				.with(SecurityTestUtils.bearerToken(leaveAdminToken())))
				.andDo(print())
				.andExpect(status().isBadRequest());
		}

		@Test
		@DisplayName("Returns unavailable when the name is held by an inactive policy")
		@Sql(statements = { SEED_LEAVE_TYPE, SEED_INACTIVE_POLICY })
		void checkNameAvailability_InactivePolicyName_ReturnsUnavailable() throws Exception {
			performNameAvailability(leaveAdminToken(), "Inactive Policy", "100").andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.results[0].isAvailable").value(false));
		}

		@Test
		@DisplayName("Returns available when the same name is used under a different leave type")
		@Sql(statements = { SEED_LEAVE_TYPE, SEED_SECOND_LEAVE_TYPE, SEED_POLICY })
		void checkNameAvailability_SameNameOtherLeaveType_ReturnsAvailable() throws Exception {
			performNameAvailability(leaveAdminToken(), "Existing Policy", "101").andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.results[0].isAvailable").value(true));
		}

		@Test
		@DisplayName("Returns bad request when the name is blank")
		@Sql(statements = { SEED_LEAVE_TYPE })
		void checkNameAvailability_BlankName_ReturnsBadRequest() throws Exception {
			performNameAvailability(leaveAdminToken(), "   ", "100").andDo(print()).andExpect(status().isBadRequest());
		}

		@Test
		@DisplayName("Returns bad request when the leave type is missing")
		void checkNameAvailability_MissingLeaveTypeId_ReturnsBadRequest() throws Exception {
			mvc.perform(get(ENDPOINT + "/name-availability").param("name", "Brand New Policy")
				.accept(MediaType.APPLICATION_JSON)
				.with(SecurityTestUtils.bearerToken(leaveAdminToken())))
				.andDo(print())
				.andExpect(status().isBadRequest());
		}

		@Test
		@DisplayName("Non-admin user cannot check policy name availability")
		@Sql(statements = { SEED_LEAVE_TYPE, DOWNGRADE_USER2_TO_EMPLOYEE })
		void checkNameAvailability_LeaveEmployee_ReturnsForbidden() throws Exception {
			performNameAvailability(user2Token(), "Brand New Policy", "100").andDo(print())
				.andExpect(status().isForbidden());
		}

		@Test
		@DisplayName("Returns 401 when no authentication token is provided")
		void checkNameAvailability_NoAuth_ReturnsUnauthorized() throws Exception {
			mvc.perform(get(ENDPOINT + "/name-availability").param("name", "Brand New Policy")
				.param("leaveTypeId", "100")
				.accept(MediaType.APPLICATION_JSON)).andDo(print()).andExpect(status().isUnauthorized());
		}

	}

	@Nested
	@DisplayName("Enable Leave Policies")
	class EnableLeavePoliciesTests {

		@Test
		@DisplayName("Leave admin can enable leave policies")
		void enableLeavePolicies_LeaveAdmin_ReturnsEnabled() throws Exception {
			performGetConfig(leaveAdminToken()).andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.results[0].isEnabled").value(false));

			performEnable(leaveAdminToken()).andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
				.andExpect(jsonPath("$.results[0].isEnabled").value(true));

			performGetConfig(leaveAdminToken()).andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.results[0].isEnabled").value(true));
		}

		@Test
		@DisplayName("Enabling leave policies removes existing leave allocations")
		@Sql(statements = { SEED_ALLOCATION })
		void enableLeavePolicies_ExistingAllocations_RemovesAllocations() throws Exception {
			performEnable(leaveAdminToken()).andDo(print()).andExpect(status().isOk());

			LeaveEntitlement allocation = leaveEntitlementDao.findById(900L).orElseThrow();
			assertEquals(0F, allocation.getTotalDaysAllocated());
			assertFalse(allocation.isActive());
			assertTrue(leaveEntitlementDao.findByIsActiveTrue().isEmpty());
		}

		@Test
		@DisplayName("Returns bad request when leave policies are already enabled")
		@Sql(statements = { SEED_LEAVE_POLICY_ENABLED })
		void enableLeavePolicies_AlreadyEnabled_ReturnsBadRequest() throws Exception {
			performEnable(leaveAdminToken()).andDo(print()).andExpect(status().isBadRequest());
		}

		@Test
		@DisplayName("Non-admin user cannot enable leave policies")
		@Sql(statements = { DOWNGRADE_USER2_TO_EMPLOYEE })
		void enableLeavePolicies_LeaveEmployee_ReturnsForbidden() throws Exception {
			performEnable(user2Token()).andDo(print()).andExpect(status().isForbidden());
		}

	}

}
