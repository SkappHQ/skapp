package com.skapp.community.peopleplanner.controller.v1;

import com.skapp.TestSkappApplication;
import com.skapp.community.common.model.OrganizationConfig;
import com.skapp.community.common.payload.request.BirthdayNotificationConfigRequestDto;
import com.skapp.community.common.payload.response.BirthdayNotificationConfigResponseDto;
import com.skapp.community.common.repository.OrganizationConfigDao;
import com.skapp.community.common.service.JwtService;
import com.skapp.community.common.type.OrganizationConfigType;
import com.skapp.community.common.type.Role;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.community.peopleplanner.constant.PeopleMessageConstant;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.repository.EmployeeDao;
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
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.json.JsonMapper;

import static com.skapp.support.TestConstants.MESSAGE_PATH;
import static com.skapp.support.TestConstants.RESULTS_0_PATH;
import static com.skapp.support.TestConstants.STATUS_PATH;
import static com.skapp.support.TestConstants.STATUS_SUCCESSFUL;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = TestSkappApplication.class)
@AutoConfigureMockMvc
@Transactional
@RequiredArgsConstructor
@DisplayName("People Config Controller Integration Tests")
class PeopleConfigControllerIntegrationTest {

	private static final String BIRTHDAY_PATH = "/v1/people-config/birthday-notifications";

	private static final String IS_TURNED_ON_PATH = RESULTS_0_PATH + "['isTurnedOn']";

	private static final String IS_ORGANIZATION_WIDE_PATH = RESULTS_0_PATH + "['isOrganizationWide']";

	private static final String IS_TEAM_WIDE_PATH = RESULTS_0_PATH + "['isTeamWide']";

	private static final String EMPTY_JSON_BODY = "{}";

	private static final Long RESTRICTED_EMPLOYEE_ID = 2L;

	private static final String ADMIN_USER_EMAIL = "user1@gmail.com";

	private static final String RESTRICTED_USER_EMAIL = "user2@gmail.com";

	/** User id embedded in generated access tokens. */
	private static final Long TOKEN_USER_ID = 1L;

	private final JsonMapper objectMapper;

	private final JwtService jwtService;

	private final UserDetailsService userDetailsService;

	private final MockMvc mvc;

	private final MessageUtil messageUtil;

	private final OrganizationConfigDao organizationConfigDao;

	private final EmployeeDao employeeDao;

	private String adminToken;

	@BeforeEach
	void setup() {
		adminToken = tokenFor(ADMIN_USER_EMAIL);
	}

	private String tokenFor(String email) {
		return jwtService.generateAccessToken(userDetailsService.loadUserByUsername(email), TOKEN_USER_ID);
	}

	private ResultActions performRequest(MockHttpServletRequestBuilder request, String token) throws Exception {
		return mvc.perform(request.with(SecurityTestUtils.bearerToken(token)));
	}

	private ResultActions performGetRequest(String token) throws Exception {
		return performRequest(get(BIRTHDAY_PATH).accept(MediaType.APPLICATION_JSON), token);
	}

	private ResultActions performPatchRequest(String body, String token) throws Exception {
		return performRequest(patch(BIRTHDAY_PATH).contentType(MediaType.APPLICATION_JSON)
			.content(body)
			.accept(MediaType.APPLICATION_JSON), token);
	}

	private String configRequestBody(Boolean isTurnedOn, Boolean isOrganizationWide, Boolean isTeamWide) {
		BirthdayNotificationConfigRequestDto requestDto = new BirthdayNotificationConfigRequestDto();
		requestDto.setIsTurnedOn(isTurnedOn);
		requestDto.setIsOrganizationWide(isOrganizationWide);
		requestDto.setIsTeamWide(isTeamWide);
		return objectMapper.writeValueAsString(requestDto);
	}

	private void seedConfig(boolean isTurnedOn, boolean isOrganizationWide, boolean isTeamWide) {
		BirthdayNotificationConfigResponseDto config = new BirthdayNotificationConfigResponseDto();
		config.setIsTurnedOn(isTurnedOn);
		config.setIsOrganizationWide(isOrganizationWide);
		config.setIsTeamWide(isTeamWide);
		seedRawConfig(objectMapper.writeValueAsString(config));
	}

	private void seedRawConfig(String configValue) {
		organizationConfigDao
			.saveAndFlush(new OrganizationConfig(OrganizationConfigType.BIRTHDAY_NOTIFICATIONS.name(), configValue));
	}

	private boolean configRowExists() {
		return organizationConfigDao
			.findOrganizationConfigByOrganizationConfigType(OrganizationConfigType.BIRTHDAY_NOTIFICATIONS.name())
			.isPresent();
	}

	/**
	 * user2@gmail.com owns employee 2 in data.sql, seeded as PEOPLE_ADMIN like every
	 * other employee. Downgrading it to PEOPLE_EMPLOYEE yields a token that authenticates
	 * but fails the ROLE_PEOPLE_ADMIN check on this controller.
	 */
	private String tokenWithoutPeopleAdminRole() {
		Employee employee = employeeDao.findById(RESTRICTED_EMPLOYEE_ID).orElseThrow();
		employee.getEmployeeRole().setPeopleRole(Role.PEOPLE_EMPLOYEE);
		employeeDao.saveAndFlush(employee);
		return tokenFor(RESTRICTED_USER_EMAIL);
	}

	private void assertFlags(ResultActions resultActions, boolean isTurnedOn, boolean isOrganizationWide,
			boolean isTeamWide) throws Exception {
		resultActions.andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(IS_TURNED_ON_PATH).value(isTurnedOn))
			.andExpect(jsonPath(IS_ORGANIZATION_WIDE_PATH).value(isOrganizationWide))
			.andExpect(jsonPath(IS_TEAM_WIDE_PATH).value(isTeamWide));
	}

	@Nested
	@DisplayName("Get Birthday Notification Config Tests")
	class GetBirthdayNotificationConfigTests {

		@Test
		@DisplayName("Get birthday notification config when no config row exists - Returns all flags false")
		void getBirthdayNotificationConfigs_WithNoConfigRow_ReturnsAllFlagsFalse() throws Exception {
			assertFlags(performGetRequest(adminToken), false, false, false);
		}

		@Test
		@DisplayName("Get birthday notification config when a config row exists - Returns the stored flags")
		void getBirthdayNotificationConfigs_WithExistingConfigRow_ReturnsStoredFlags() throws Exception {
			seedConfig(true, true, false);

			assertFlags(performGetRequest(adminToken), true, true, false);
		}

		@Test
		@DisplayName("Get birthday notification config when the stored JSON has an unknown property - Ignores it")
		void getBirthdayNotificationConfigs_WithUnknownStoredProperty_IgnoresIt() throws Exception {
			seedRawConfig("{\"isTurnedOn\":true,\"someFutureFlag\":true}");

			assertFlags(performGetRequest(adminToken), true, false, false);
		}

		@Test
		@DisplayName("Get birthday notification config as a non people-admin - Returns Forbidden")
		void getBirthdayNotificationConfigs_WithoutPeopleAdminRole_ReturnsForbidden() throws Exception {
			performGetRequest(tokenWithoutPeopleAdminRole()).andDo(print()).andExpect(status().isForbidden());
		}

	}

	@Nested
	@DisplayName("Update Birthday Notification Config Tests")
	class UpdateBirthdayNotificationConfigTests {

		@Test
		@DisplayName("Patch only isTurnedOn - Persists it and leaves the other flags at their defaults")
		void updateBirthdayNotificationConfigs_WithSingleField_PersistsThatFieldOnly() throws Exception {
			performPatchRequest(configRequestBody(true, null, null), adminToken).andDo(print())
				.andExpect(status().isOk());

			assertThat(configRowExists()).isTrue();
			assertFlags(performGetRequest(adminToken), true, false, false);
		}

		@Test
		@DisplayName("Patch isTurnedOn then isTeamWide - Second patch preserves the first")
		void updateBirthdayNotificationConfigs_WithSecondPartialPatch_PreservesUntouchedFields() throws Exception {
			performPatchRequest(configRequestBody(true, null, null), adminToken).andExpect(status().isOk());
			assertFlags(performGetRequest(adminToken), true, false, false);

			performPatchRequest(configRequestBody(null, null, true), adminToken).andExpect(status().isOk());

			assertFlags(performGetRequest(adminToken), true, false, true);
		}

		@Test
		@DisplayName("Patch with an empty body - Leaves the stored config unchanged")
		void updateBirthdayNotificationConfigs_WithEmptyBody_LeavesConfigUnchanged() throws Exception {
			// The request DTO carries no constraints and the controller has no @Valid, so
			// an
			// empty payload is a legitimate 200 no-op rather than a bad request.
			seedConfig(true, true, false);

			performPatchRequest(EMPTY_JSON_BODY, adminToken).andDo(print()).andExpect(status().isOk());

			assertFlags(performGetRequest(adminToken), true, true, false);
		}

		@Test
		@DisplayName("Patch isTurnedOn as false over an enabled config - Turns it off and keeps the scope flags")
		void updateBirthdayNotificationConfigs_WithFalseValue_OverwritesTrue() throws Exception {
			seedConfig(true, true, true);

			performPatchRequest(configRequestBody(false, null, null), adminToken).andDo(print())
				.andExpect(status().isOk());

			assertFlags(performGetRequest(adminToken), false, true, true);
		}

		@Test
		@DisplayName("Patch birthday notification config - Returns the success message")
		void updateBirthdayNotificationConfigs_WithValidPayload_ReturnsSuccessMessage() throws Exception {
			performPatchRequest(configRequestBody(true, true, null), adminToken).andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
				.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH).value(messageUtil
					.getMessage(PeopleMessageConstant.PEOPLE_SUCCESS_BIRTHDAY_NOTIFICATION_CONFIG_UPDATED)));
		}

		@Test
		@DisplayName("Patch birthday notification config as a non people-admin - Returns Forbidden")
		void updateBirthdayNotificationConfigs_WithoutPeopleAdminRole_ReturnsForbidden() throws Exception {
			performPatchRequest(configRequestBody(true, null, null), tokenWithoutPeopleAdminRole()).andDo(print())
				.andExpect(status().isForbidden());

			assertThat(configRowExists()).isFalse();
		}

	}

}
