package com.skapp.community.common.controller.v1;

import com.skapp.TestSkappApplication;
import com.skapp.community.common.repository.NotificationDao;
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

import static org.hamcrest.Matchers.contains;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = TestSkappApplication.class)
@AutoConfigureMockMvc
@Transactional
@RequiredArgsConstructor
@DisplayName("Notification Controller Integration Tests")
class NotificationControllerIntegrationTest {

	private static final String SUMMARY_ENDPOINT = "/v1/notification/summary";

	private static final String LEAVE_REQUEST_COUNT_PATH = "$.results[?(@.notificationType == 'LEAVE_REQUEST')].notificationCount";

	private static final String SEED_LEAVE_POLICY_ENABLED = "INSERT INTO organization_config (config_title, config_value) VALUES ('LEAVE_POLICY', '{\"isEnabled\":true}')";

	private static final String SEED_POLICY_LEAVE_TYPE = "INSERT INTO lv_leave_type (id, name, emoji_code, color_code, min_duration, is_attachment, is_attachment_must, is_comment_must, is_auto_approval, is_active) "
			+ "VALUES (100, 'PolicyAnnual', 'U+1F3D6', '#FFC107', 'FULL_DAY', false, false, false, false, true)";

	private static final String SEED_POLICY = "INSERT INTO lv_leave_policy (id, name, leave_type_id, policy_type, status, is_carryover_enabled) "
			+ "VALUES (500, 'Existing Policy', 100, 'ACCRUAL', 'ACTIVE', false)";

	private static final String SEED_POLICY_LEAVE_REQUESTS = "INSERT INTO lv_leave_request (id, employee_id, policy_id, start_date, end_date, leave_state, status, duration_days) VALUES "
			+ "(960, 1, 500, DATEADD('DAY', 10, CURRENT_DATE), DATEADD('DAY', 10, CURRENT_DATE), 'FULLDAY', 'PENDING', 1), "
			+ "(961, 2, 500, DATEADD('DAY', 10, CURRENT_DATE), DATEADD('DAY', 10, CURRENT_DATE), 'FULLDAY', 'PENDING', 1)";

	private static final String SEED_LEGACY_LEAVE_REQUESTS = "INSERT INTO leave_request (leave_req_id, start_date, end_date, leave_state, status, employee_id, type_id, duration_days, is_viewed, is_auto_approved) VALUES "
			+ "(970, DATEADD('DAY', 10, CURRENT_DATE), DATEADD('DAY', 10, CURRENT_DATE), 'FULLDAY', 'PENDING', 1, (SELECT type_id FROM leave_type WHERE name = 'Study'), 1, false, false), "
			+ "(971, DATEADD('DAY', 10, CURRENT_DATE), DATEADD('DAY', 10, CURRENT_DATE), 'FULLDAY', 'PENDING', 2, (SELECT type_id FROM leave_type WHERE name = 'Study'), 1, false, false)";

	private static final String SEED_POLICY_LEAVE_NOTIFICATIONS = "INSERT INTO notification (id, employee_id, body, is_viewed, is_type_viewed, notification_type, resource_id) VALUES "
			+ "(9001, 1, 'Own policy leave', false, false, 'LEAVE_REQUEST', '960'), "
			+ "(9002, 1, 'Policy leave of another employee', false, false, 'LEAVE_REQUEST', '961')";

	private static final String SEED_LEGACY_LEAVE_NOTIFICATIONS = "INSERT INTO notification (id, employee_id, body, is_viewed, is_type_viewed, notification_type, resource_id) VALUES "
			+ "(9003, 1, 'Own legacy leave', false, false, 'LEAVE_REQUEST', '970'), "
			+ "(9004, 1, 'Legacy leave of another employee', false, false, 'LEAVE_REQUEST', '971')";

	private static final String SEED_TIME_ENTRY_NOTIFICATION = "INSERT INTO notification (id, employee_id, body, is_viewed, is_type_viewed, notification_type, resource_id) VALUES "
			+ "(9005, 1, 'Time entry', false, false, 'TIME_ENTRY', '980')";

	private final AuthorityService authorityService;

	private final JwtService jwtService;

	private final UserDetailsService userDetailsService;

	private final MockMvc mvc;

	private final NotificationDao notificationDao;

	private String leaveAdminToken() {
		SecurityTestUtils.setupSecurityContext(authorityService, MockUserFactory.createLeaveAdmin());
		return jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user1@gmail.com"), 1L);
	}

	private ResultActions performGetSummary(String authToken) throws Exception {
		return mvc.perform(get(SUMMARY_ENDPOINT).accept(MediaType.APPLICATION_JSON)
			.with(SecurityTestUtils.bearerToken(authToken)));
	}

	private boolean isTypeViewed(Long notificationId) {
		return notificationDao.findById(notificationId).orElseThrow().getIsTypeViewed();
	}

	@Nested
	@DisplayName("Get Notification Count By Type")
	class GetNotificationCountByTypeTests {

		@Test
		@DisplayName("With leave policies enabled, own policy leave notifications are not counted")
		@Sql(statements = { SEED_LEAVE_POLICY_ENABLED, SEED_POLICY_LEAVE_TYPE, SEED_POLICY, SEED_POLICY_LEAVE_REQUESTS,
				SEED_POLICY_LEAVE_NOTIFICATIONS })
		void getNotificationCountByType_PoliciesEnabled_ExcludesOwnPolicyLeave() throws Exception {
			performGetSummary(leaveAdminToken()).andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(LEAVE_REQUEST_COUNT_PATH).value(contains(1)));
		}

		@Test
		@DisplayName("With leave policies disabled, own legacy leave notifications are not counted")
		@Sql(statements = { SEED_LEGACY_LEAVE_REQUESTS, SEED_LEGACY_LEAVE_NOTIFICATIONS })
		void getNotificationCountByType_PoliciesDisabled_ExcludesOwnLegacyLeave() throws Exception {
			performGetSummary(leaveAdminToken()).andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(LEAVE_REQUEST_COUNT_PATH).value(contains(1)));
		}

	}

	@Nested
	@DisplayName("Enable Leave Policies")
	class EnableLeavePoliciesTests {

		@Test
		@DisplayName("Enabling leave policies marks existing leave notifications as type viewed")
		@Sql(statements = { SEED_LEGACY_LEAVE_REQUESTS, SEED_LEGACY_LEAVE_NOTIFICATIONS, SEED_TIME_ENTRY_NOTIFICATION })
		void enableLeavePolicies_ExistingLeaveNotifications_MarksTypeViewed() throws Exception {
			mvc.perform(post("/v1/leave/policies/enable").accept(MediaType.APPLICATION_JSON)
				.with(SecurityTestUtils.bearerToken(leaveAdminToken()))).andDo(print()).andExpect(status().isOk());

			assertTrue(isTypeViewed(9003L));
			assertTrue(isTypeViewed(9004L));
			assertFalse(isTypeViewed(9005L));

			performGetSummary(leaveAdminToken()).andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(LEAVE_REQUEST_COUNT_PATH).value(contains(0)));
		}

	}

}
