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

import static com.skapp.support.TestConstants.RESULTS_PATH;
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
@DisplayName("Leave Type Controller Integration Tests")
class LeaveTypeControllerIntegrationTest {

	private static final String ENDPOINT = "/v1/leave/types";

	private final AuthorityService authorityService;

	private final JwtService jwtService;

	private final UserDetailsService userDetailsService;

	private final MockMvc mvc;

	private ResultActions performGetLeaveTypes(String authToken, Boolean filterByInUse, Boolean isCarryForward)
			throws Exception {
		var requestBuilder = get(ENDPOINT).accept(MediaType.APPLICATION_JSON);
		if (filterByInUse != null) {
			requestBuilder = requestBuilder.param("filterByInUse", filterByInUse.toString());
		}
		if (isCarryForward != null) {
			requestBuilder = requestBuilder.param("isCarryForward", isCarryForward.toString());
		}
		return mvc.perform(requestBuilder.with(SecurityTestUtils.bearerToken(authToken)));
	}

	@Nested
	@DisplayName("Leave Admin - Get All Leave Types")
	class LeaveAdminGetAllTests {

		@Test
		@DisplayName("Returns all leave types when no filters applied (findAll branch)")
		void getLeaveTypes_NoFilters_ReturnsAllLeaveTypes() throws Exception {
			SecurityTestUtils.setupSecurityContext(authorityService, MockUserFactory.createLeaveAdmin());
			String authToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user1@gmail.com"),
					1L);

			performGetLeaveTypes(authToken, null, null).andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
				.andExpect(jsonPath(RESULTS_PATH, hasSize(6)))
				.andExpect(jsonPath("$.results[0].name").exists())
				.andExpect(jsonPath("$.results[0].typeId").exists())
				.andExpect(jsonPath("$.results[0].emojiCode").exists())
				.andExpect(jsonPath("$.results[0].colorCode").exists())
				.andExpect(jsonPath("$.results[0].calculationType").exists())
				.andExpect(jsonPath("$.results[0].isActive").value(true));
		}

		@Test
		@DisplayName("Returns all leave types when filterByInUse=false and isCarryForward=false (findAll branch)")
		void getLeaveTypes_DefaultFilters_ReturnsAllLeaveTypes() throws Exception {
			SecurityTestUtils.setupSecurityContext(authorityService, MockUserFactory.createLeaveAdmin());
			String authToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user1@gmail.com"),
					1L);

			performGetLeaveTypes(authToken, false, false).andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
				.andExpect(jsonPath(RESULTS_PATH, hasSize(6)));
		}

	}

	@Nested
	@DisplayName("Leave Admin - Filter by Carry Forward")
	class LeaveAdminCarryForwardFilterTests {

		@Test
		@DisplayName("Returns empty when isCarryForward=true and no carry forward types exist (findByIsCarryForwardEnabledAndIsActive branch)")
		void getLeaveTypes_CarryForwardTrue_ReturnsEmptyList() throws Exception {
			SecurityTestUtils.setupSecurityContext(authorityService, MockUserFactory.createLeaveAdmin());
			String authToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user1@gmail.com"),
					1L);

			performGetLeaveTypes(authToken, false, true).andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
				.andExpect(jsonPath(RESULTS_PATH, hasSize(0)));
		}

		@Test
		@DisplayName("Returns carry forward leave types when data exists (findByIsCarryForwardEnabledAndIsActive branch)")
		@Sql(statements = {
				"INSERT INTO leave_type (type_id, name, emoji_code, color_code, calculation_type, min_duration, is_attachment, is_overridden, is_attachment_must, is_comment_must, is_auto_approval, is_active, carry_forward_enabled, max_carry_forward_days, carry_forward_expiration_days, is_carry_forward_remaining_balance_enabled) "
						+ "VALUES (100, 'CarryForwardType', 'U+1F605', '#FF0005', 'ACCUMULATED', 'FULL_DAY', false, false, false, false, false, true, true, 5.0, 30.0, true)" })
		void getLeaveTypes_CarryForwardTrue_ReturnsCarryForwardTypes() throws Exception {
			SecurityTestUtils.setupSecurityContext(authorityService, MockUserFactory.createLeaveAdmin());
			String authToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user1@gmail.com"),
					1L);

			performGetLeaveTypes(authToken, false, true).andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
				.andExpect(jsonPath(RESULTS_PATH, hasSize(1)))
				.andExpect(jsonPath("$.results[0].name").value("CarryForwardType"))
				.andExpect(jsonPath("$.results[0].isCarryForwardEnabled").value(true));
		}

	}

	@Nested
	@DisplayName("Leave Admin - Filter by In Use")
	class LeaveAdminFilterByInUseTests {

		@Test
		@DisplayName("Returns leave types that user has leave requests for (getUsedUserLeaveTypes branch)")
		@Sql(statements = {
				"INSERT INTO leave_request (leave_req_id, start_date, end_date, leave_state, status, employee_id, type_id, duration_days, is_viewed, is_auto_approved) "
						+ "VALUES (100, YEAR(CURRENT_TIMESTAMP) || '-04-01', YEAR(CURRENT_TIMESTAMP) || '-04-02', 'FULLDAY', 'APPROVED', 1, "
						+ "(SELECT type_id FROM leave_type WHERE name = 'Medical'), 1, false, false)" })
		void getLeaveTypes_FilterByInUseTrue_ReturnsUsedLeaveTypes() throws Exception {
			SecurityTestUtils.setupSecurityContext(authorityService, MockUserFactory.createLeaveAdmin());
			String authToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user1@gmail.com"),
					1L);

			performGetLeaveTypes(authToken, true, false).andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
				.andExpect(jsonPath(RESULTS_PATH, hasSize(1)))
				.andExpect(jsonPath("$.results[0].name").value("Medical"));
		}

		@Test
		@DisplayName("Returns empty when user has no leave requests and filterByInUse=true")
		void getLeaveTypes_FilterByInUseTrue_NoLeaveRequests_ReturnsEmptyList() throws Exception {
			SecurityTestUtils.setupSecurityContext(authorityService, MockUserFactory.createLeaveAdmin());
			String authToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user1@gmail.com"),
					1L);

			performGetLeaveTypes(authToken, true, false).andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
				.andExpect(jsonPath(RESULTS_PATH, hasSize(0)));
		}

		@Test
		@DisplayName("Returns only carry-forward types user has requests for when both filters true")
		@Sql(statements = {
				"INSERT INTO leave_type (type_id, name, emoji_code, color_code, calculation_type, min_duration, is_attachment, is_overridden, is_attachment_must, is_comment_must, is_auto_approval, is_active, carry_forward_enabled, max_carry_forward_days, carry_forward_expiration_days, is_carry_forward_remaining_balance_enabled) "
						+ "VALUES (101, 'CarryForwardUsed', 'U+1F606', '#FF0006', 'ACCUMULATED', 'FULL_DAY', false, false, false, false, false, true, true, 5.0, 30.0, true)",
				"INSERT INTO leave_request (leave_req_id, start_date, end_date, leave_state, status, employee_id, type_id, duration_days, is_viewed, is_auto_approved) "
						+ "VALUES (101, YEAR(CURRENT_TIMESTAMP) || '-05-01', YEAR(CURRENT_TIMESTAMP) || '-05-02', 'FULLDAY', 'PENDING', 1, 101, 1, false, false)",
				"INSERT INTO leave_request (leave_req_id, start_date, end_date, leave_state, status, employee_id, type_id, duration_days, is_viewed, is_auto_approved) "
						+ "VALUES (102, YEAR(CURRENT_TIMESTAMP) || '-05-03', YEAR(CURRENT_TIMESTAMP) || '-05-04', 'FULLDAY', 'APPROVED', 1, "
						+ "(SELECT type_id FROM leave_type WHERE name = 'Study'), 1, false, false)" })
		void getLeaveTypes_FilterByInUseAndCarryForwardTrue_ReturnsOnlyCarryForwardUsedTypes() throws Exception {
			SecurityTestUtils.setupSecurityContext(authorityService, MockUserFactory.createLeaveAdmin());
			String authToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user1@gmail.com"),
					1L);

			performGetLeaveTypes(authToken, true, true).andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
				.andExpect(jsonPath(RESULTS_PATH, hasSize(1)))
				.andExpect(jsonPath("$.results[0].name").value("CarryForwardUsed"))
				.andExpect(jsonPath("$.results[0].isCarryForwardEnabled").value(true));
		}

	}

	@Nested
	@DisplayName("Role-Based Access Tests")
	class RoleBasedAccessTests {

		@Test
		@DisplayName("Leave manager can access the endpoint")
		void getLeaveTypes_LeaveManager_ReturnsOk() throws Exception {
			SecurityTestUtils.setupSecurityContext(authorityService,
					MockUserFactory.createLeaveManager("user2@gmail.com", 2L, 2L));
			String authToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user2@gmail.com"),
					2L);

			performGetLeaveTypes(authToken, null, null).andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
				.andExpect(jsonPath(RESULTS_PATH, hasSize(6)));
		}

		@Test
		@DisplayName("Returns 401 when no authentication token is provided")
		void getLeaveTypes_NoAuth_ReturnsUnauthorized() throws Exception {
			mvc.perform(get(ENDPOINT).accept(MediaType.APPLICATION_JSON))
				.andDo(print())
				.andExpect(status().isUnauthorized());
		}

	}

}
