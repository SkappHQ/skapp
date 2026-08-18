package com.skapp.community.peopleplanner.controller.v1;

import com.skapp.TestSkappApplication;
import com.skapp.community.common.model.Organization;
import com.skapp.community.common.model.OrganizationConfig;
import com.skapp.community.common.model.SpecialNotificationStatus;
import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.SpecialNotificationConfig;
import com.skapp.community.common.repository.OrganizationConfigDao;
import com.skapp.community.common.repository.OrganizationDao;
import com.skapp.community.common.repository.SpecialNotificationStatusDao;
import com.skapp.community.common.repository.UserDao;
import com.skapp.community.common.service.JwtService;
import com.skapp.community.common.type.OrganizationConfigType;
import com.skapp.community.common.type.Role;
import com.skapp.community.common.type.SpecialNotificationType;
import com.skapp.community.common.util.DateTimeUtils;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.EmployeePersonalInfo;
import com.skapp.community.peopleplanner.model.EmployeeTeam;
import com.skapp.community.peopleplanner.repository.EmployeeDao;
import com.skapp.community.peopleplanner.repository.EmployeeTeamDao;
import com.skapp.community.peopleplanner.repository.TeamDao;
import com.skapp.community.peopleplanner.type.AccountStatus;
import com.skapp.support.SecurityTestUtils;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.mockito.MockedStatic;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.json.JsonMapper;

import java.time.LocalDate;
import java.time.Month;
import java.time.ZoneId;
import java.util.function.Consumer;

import static com.skapp.support.TestConstants.RESULTS_0_PATH;
import static com.skapp.support.TestConstants.STATUS_PATH;
import static com.skapp.support.TestConstants.STATUS_SUCCESSFUL;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.nullValue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.CALLS_REAL_METHODS;
import static org.mockito.Mockito.mockStatic;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = TestSkappApplication.class)
@AutoConfigureMockMvc
@Transactional
@RequiredArgsConstructor
@DisplayName("People Birthday Notification Integration Tests")
class PeopleBirthdayNotificationControllerIntegrationTest {

	private static final String TODAY_PATH = "/v1/people/birthday-notifications/today";

	private static final String MARK_VIEWED_PATH = "/v1/people/birthday-notifications/mark-viewed-today";

	private static final String LAST_VIEWED_PATH = RESULTS_0_PATH + "['lastViewedDate']";

	private static final String BIRTHDAYS_PATH = RESULTS_0_PATH + "['employeeBirthdays']";

	private static final String BIRTHDAYS_COUNT_PATH = BIRTHDAYS_PATH + ".length()";

	private static final String CURRENT_USER_EMAIL = "user1@gmail.com";

	private static final Long CURRENT_EMPLOYEE_ID = 1L;

	private static final Long TEAMMATE_EMPLOYEE_ID = 2L;

	private static final Long OUTSIDER_EMPLOYEE_ID = 3L;

	private static final Long SECOND_OUTSIDER_EMPLOYEE_ID = 4L;

	private static final Long FIFTH_EMPLOYEE_ID = 5L;

	private static final Long SEEDED_TEAM_ID = 1L;

	private static final Long TOKEN_USER_ID = 1L;

	/** Leap year, so a 29 February month/day pair is always representable. */
	private static final int BIRTH_YEAR = 1996;

	/**
	 * 2027 is not a leap year, so 28 February is the last day of that month.
	 */
	private static final LocalDate LAST_DAY_OF_SHORT_FEBRUARY = LocalDate.of(2027, Month.FEBRUARY.getValue(), 28);

	private final JsonMapper objectMapper;

	private final JwtService jwtService;

	private final UserDetailsService userDetailsService;

	private final MockMvc mvc;

	private final EmployeeDao employeeDao;

	private final EmployeeTeamDao employeeTeamDao;

	private final TeamDao teamDao;

	private final UserDao userDao;

	private final OrganizationDao organizationDao;

	private final OrganizationConfigDao organizationConfigDao;

	private final SpecialNotificationStatusDao specialNotificationStatusDao;

	private String currentUserToken;

	private LocalDate today;

	@BeforeEach
	void setup() {
		currentUserToken = tokenFor(CURRENT_USER_EMAIL, TOKEN_USER_ID);
		today = DateTimeUtils.getCurrentUtcDate();
	}

	private String tokenFor(String email, Long userId) {
		return jwtService.generateAccessToken(userDetailsService.loadUserByUsername(email), userId);
	}

	private ResultActions performRequest(MockHttpServletRequestBuilder request, String token) throws Exception {
		return mvc.perform(request.with(SecurityTestUtils.bearerToken(token)));
	}

	private ResultActions performGetTodayRequest(String token) throws Exception {
		return performRequest(get(TODAY_PATH).accept(MediaType.APPLICATION_JSON), token);
	}

	private ResultActions performMarkViewedRequest(String token) throws Exception {
		return performRequest(
				patch(MARK_VIEWED_PATH).contentType(MediaType.APPLICATION_JSON).accept(MediaType.APPLICATION_JSON),
				token);
	}

	private void seedConfig(boolean isTurnedOn, boolean isOrganizationWide, boolean isTeamWide) {
		SpecialNotificationConfig config = new SpecialNotificationConfig();
		config.setIsTurnedOn(isTurnedOn);
		config.setIsOrganizationWide(isOrganizationWide);
		config.setIsTeamWide(isTeamWide);
		organizationConfigDao.saveAndFlush(new OrganizationConfig(OrganizationConfigType.BIRTHDAY_NOTIFICATIONS.name(),
				objectMapper.writeValueAsString(config)));
	}

	private Employee loadEmployee(Long employeeId) {
		return employeeDao.findById(employeeId).orElseThrow();
	}

	private void seedLastViewed(Long employeeId, LocalDate lastViewedDate) {
		SpecialNotificationStatus specialNotificationStatus = new SpecialNotificationStatus();
		specialNotificationStatus.setEmployee(loadEmployee(employeeId));
		specialNotificationStatus.setSpecialNotificationType(SpecialNotificationType.BIRTHDAY);
		specialNotificationStatus.setLastViewedDate(lastViewedDate);
		specialNotificationStatusDao.saveAndFlush(specialNotificationStatus);
	}

	private void giveBirthdayOn(Long employeeId, LocalDate monthDaySource) {
		givePersonalInfo(employeeId,
				LocalDate.of(BIRTH_YEAR, monthDaySource.getMonthValue(), monthDaySource.getDayOfMonth()));
	}

	private void givePersonalInfo(Long employeeId, LocalDate birthDate) {
		Employee employee = loadEmployee(employeeId);
		EmployeePersonalInfo personalInfo = new EmployeePersonalInfo();
		personalInfo.setBirthDate(birthDate);
		personalInfo.setEmployee(employee);
		employee.setPersonalInfo(personalInfo);
		employeeDao.saveAndFlush(employee);
	}

	private void mutateEmployee(Long employeeId, Consumer<Employee> mutation) {
		Employee employee = loadEmployee(employeeId);
		mutation.accept(employee);
		employeeDao.saveAndFlush(employee);
	}

	private void addToSeededTeam(Long employeeId) {
		EmployeeTeam employeeTeam = new EmployeeTeam();
		employeeTeam.setTeam(teamDao.getReferenceById(SEEDED_TEAM_ID));
		employeeTeam.setEmployee(loadEmployee(employeeId));
		employeeTeam.setIsSupervisor(false);
		employeeTeamDao.saveAndFlush(employeeTeam);
	}

	private void deactivateUserOf(Long employeeId) {
		User user = loadEmployee(employeeId).getUser();
		user.setIsActive(false);
		userDao.saveAndFlush(user);
	}

	private LocalDate storedLastViewedDate(Long employeeId) {
		return specialNotificationStatusDao
			.findByEmployeeEmployeeIdAndSpecialNotificationType(employeeId, SpecialNotificationType.BIRTHDAY)
			.map(SpecialNotificationStatus::getLastViewedDate)
			.orElse(null);
	}

	private ResultActions assertSuccessful(ResultActions resultActions) throws Exception {
		return resultActions.andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL));
	}

	private ResultActions assertLastViewedDate(ResultActions resultActions, LocalDate expected) throws Exception {
		return resultActions.andExpect(jsonPath(LAST_VIEWED_PATH).value(expected.toString()));
	}

	private String birthdayFieldPath(int index, String field) {
		return BIRTHDAYS_PATH + "[" + index + "]['" + field + "']";
	}

	@Nested
	@DisplayName("Get Today Birthday Notifications Tests")
	class GetTodayBirthdayNotificationsTests {

		@Test
		@DisplayName("Get today's birthdays when no config row exists - Returns empty list and writes no row")
		void getTodayBirthdayNotifications_WithNoConfigRow_ReturnsEmptyListAndWritesNothing() throws Exception {
			giveBirthdayOn(CURRENT_EMPLOYEE_ID, today);

			assertSuccessful(performGetTodayRequest(currentUserToken))
				.andExpect(jsonPath(LAST_VIEWED_PATH).value(nullValue()))
				.andExpect(jsonPath(BIRTHDAYS_COUNT_PATH).value(0));

			assertThat(specialNotificationStatusDao.count()).isZero();
		}

		@Test
		@DisplayName("Get today's birthdays with SELF scope - Returns the current user and excludes a teammate")
		void getTodayBirthdayNotifications_WithSelfScope_ReturnsOnlySelf() throws Exception {
			seedConfig(true, false, false);
			addToSeededTeam(TEAMMATE_EMPLOYEE_ID);
			giveBirthdayOn(CURRENT_EMPLOYEE_ID, today);
			giveBirthdayOn(TEAMMATE_EMPLOYEE_ID, today);
			mutateEmployee(CURRENT_EMPLOYEE_ID, employee -> employee.setAuthPic("auth-pic-one.png"));

			assertSuccessful(performGetTodayRequest(currentUserToken))
				.andExpect(jsonPath(BIRTHDAYS_COUNT_PATH).value(1))
				.andExpect(jsonPath(birthdayFieldPath(0, "employeeId")).value(CURRENT_EMPLOYEE_ID.intValue()))
				.andExpect(jsonPath(birthdayFieldPath(0, "firstName")).value("Employee User One"))
				.andExpect(jsonPath(birthdayFieldPath(0, "lastName")).value("Lastname One"))
				.andExpect(jsonPath(birthdayFieldPath(0, "authPic")).value("auth-pic-one.png"))
				.andExpect(jsonPath(LAST_VIEWED_PATH).value(nullValue()));
			assertThat(specialNotificationStatusDao.count()).isZero();
		}

		@Test
		@DisplayName("Get today's birthdays with TEAM scope - Returns a shared-team member and excludes a non-teammate")
		void getTodayBirthdayNotifications_WithTeamScope_ReturnsOnlyTeammates() throws Exception {
			seedConfig(true, false, true);
			addToSeededTeam(TEAMMATE_EMPLOYEE_ID);
			giveBirthdayOn(CURRENT_EMPLOYEE_ID, today);
			giveBirthdayOn(TEAMMATE_EMPLOYEE_ID, today);
			giveBirthdayOn(OUTSIDER_EMPLOYEE_ID, today);

			assertSuccessful(performGetTodayRequest(currentUserToken))
				.andExpect(jsonPath(BIRTHDAYS_COUNT_PATH).value(2))
				.andExpect(jsonPath(birthdayFieldPath(0, "employeeId")).value(CURRENT_EMPLOYEE_ID.intValue()))
				.andExpect(jsonPath(birthdayFieldPath(1, "employeeId")).value(TEAMMATE_EMPLOYEE_ID.intValue()));
		}

		@Test
		@DisplayName("Get today's birthdays with ORGANIZATION scope - Returns matching employees ordered by name, excluding pending ones")
		void getTodayBirthdayNotifications_WithOrganizationScope_ReturnsAllMatchingEmployeesOrderedByName()
				throws Exception {
			seedConfig(true, true, false);
			giveBirthdayOn(CURRENT_EMPLOYEE_ID, today);
			giveBirthdayOn(OUTSIDER_EMPLOYEE_ID, today);
			giveBirthdayOn(SECOND_OUTSIDER_EMPLOYEE_ID, today);

			mutateEmployee(OUTSIDER_EMPLOYEE_ID, employee -> employee.setFirstName("alpha"));
			mutateEmployee(SECOND_OUTSIDER_EMPLOYEE_ID, employee -> {
				employee.setFirstName("Alpha");
				employee.setAccountStatus(AccountStatus.PENDING);
			});

			assertSuccessful(performGetTodayRequest(currentUserToken))
				.andExpect(jsonPath(BIRTHDAYS_COUNT_PATH).value(2))
				.andExpect(jsonPath(birthdayFieldPath(0, "employeeId")).value(OUTSIDER_EMPLOYEE_ID.intValue()))
				.andExpect(jsonPath(birthdayFieldPath(1, "employeeId")).value(CURRENT_EMPLOYEE_ID.intValue()));
		}

		@Test
		@DisplayName("Get today's birthdays when both organization-wide and team-wide are true - Uses ORGANIZATION scope")
		void getTodayBirthdayNotifications_WithBothOrganizationAndTeamFlags_UsesOrganizationScope() throws Exception {
			seedConfig(true, true, true);
			giveBirthdayOn(OUTSIDER_EMPLOYEE_ID, today);

			assertSuccessful(performGetTodayRequest(currentUserToken))
				.andExpect(jsonPath(BIRTHDAYS_COUNT_PATH).value(1))
				.andExpect(jsonPath(birthdayFieldPath(0, "employeeId")).value(OUTSIDER_EMPLOYEE_ID.intValue()));
		}

		@Test
		@DisplayName("Get today's birthdays when already viewed today - Returns empty list")
		void getTodayBirthdayNotifications_WhenAlreadyViewedToday_ReturnsEmptyList() throws Exception {
			seedConfig(true, true, false);
			giveBirthdayOn(CURRENT_EMPLOYEE_ID, today);
			seedLastViewed(CURRENT_EMPLOYEE_ID, today);

			assertLastViewedDate(assertSuccessful(performGetTodayRequest(currentUserToken)), today)
				.andExpect(jsonPath(BIRTHDAYS_COUNT_PATH).value(0));

			assertThat(specialNotificationStatusDao.count()).isEqualTo(1);
		}

		@Test
		@DisplayName("Get today's birthdays with an older last viewed date and birthdays found - Returns the older date")
		void getTodayBirthdayNotifications_WithStaleLastViewedDateAndBirthdaysFound_ReturnsStaleDate()
				throws Exception {
			LocalDate staleDate = today.minusDays(3);
			seedConfig(true, false, false);
			giveBirthdayOn(CURRENT_EMPLOYEE_ID, today);
			seedLastViewed(CURRENT_EMPLOYEE_ID, staleDate);

			assertLastViewedDate(assertSuccessful(performGetTodayRequest(currentUserToken)), staleDate)
				.andExpect(jsonPath(BIRTHDAYS_COUNT_PATH).value(1))
				.andExpect(jsonPath(birthdayFieldPath(0, "employeeId")).value(CURRENT_EMPLOYEE_ID.intValue()));

			assertThat(storedLastViewedDate(CURRENT_EMPLOYEE_ID)).isEqualTo(staleDate);
		}

		@Test
		@DisplayName("Get today's birthdays when matching employees are inactive, terminated, a PM guest, or missing a birth date - Excludes all of them")
		void getTodayBirthdayNotifications_WithDisqualifyingConditions_ExcludesAllOfThem() throws Exception {
			seedConfig(true, true, false);
			giveBirthdayOn(CURRENT_EMPLOYEE_ID, today);
			giveBirthdayOn(TEAMMATE_EMPLOYEE_ID, today);
			giveBirthdayOn(OUTSIDER_EMPLOYEE_ID, today);
			giveBirthdayOn(SECOND_OUTSIDER_EMPLOYEE_ID, today);
			deactivateUserOf(TEAMMATE_EMPLOYEE_ID);
			mutateEmployee(OUTSIDER_EMPLOYEE_ID, employee -> employee.setAccountStatus(AccountStatus.TERMINATED));
			mutateEmployee(SECOND_OUTSIDER_EMPLOYEE_ID,
					employee -> employee.getEmployeeRole().setPmRole(Role.PM_GUEST_EMPLOYEE));
			givePersonalInfo(FIFTH_EMPLOYEE_ID, null);

			assertSuccessful(performGetTodayRequest(currentUserToken))
				.andExpect(jsonPath(BIRTHDAYS_COUNT_PATH).value(1))
				.andExpect(jsonPath(birthdayFieldPath(0, "employeeId")).value(CURRENT_EMPLOYEE_ID.intValue()));
		}

		@Test
		@DisplayName("Get today's birthdays on 28 February of a non-leap year - Includes 29 February birthdays")
		void getTodayBirthdayNotifications_OnLastDayOfShortFebruary_IncludesLeapDayBirthday() throws Exception {
			seedConfig(true, true, false);
			givePersonalInfo(CURRENT_EMPLOYEE_ID, LocalDate.of(BIRTH_YEAR, Month.FEBRUARY.getValue(), 29));

			try (MockedStatic<LocalDate> clock = mockStatic(LocalDate.class, CALLS_REAL_METHODS)) {
				clock.when(() -> LocalDate.now(any(ZoneId.class))).thenReturn(LAST_DAY_OF_SHORT_FEBRUARY);

				assertSuccessful(performGetTodayRequest(currentUserToken))
					.andExpect(jsonPath(BIRTHDAYS_COUNT_PATH).value(1))
					.andExpect(jsonPath(birthdayFieldPath(0, "employeeId")).value(CURRENT_EMPLOYEE_ID.intValue()));
			}
		}

	}

	@Nested
	@DisplayName("Mark Viewed Today Tests")
	class MarkViewedTodayTests {

		@Test
		@DisplayName("Mark today's birthdays as viewed with no existing row - Creates the row with today")
		void markTodayBirthdayNotificationsAsViewed_WithNoExistingRow_CreatesRowWithToday() throws Exception {
			seedConfig(true, false, false);

			assertLastViewedDate(assertSuccessful(performMarkViewedRequest(currentUserToken)), today);

			SpecialNotificationStatus persisted = specialNotificationStatusDao
				.findByEmployeeEmployeeIdAndSpecialNotificationType(CURRENT_EMPLOYEE_ID,
						SpecialNotificationType.BIRTHDAY)
				.orElseThrow();
			assertThat(persisted.getLastViewedDate()).isEqualTo(today);
			assertThat(persisted.getCreatedBy()).isEqualTo(TOKEN_USER_ID.toString());
			assertThat(specialNotificationStatusDao.count()).isEqualTo(1);
		}

		@Test
		@DisplayName("Mark today's birthdays as viewed with an older row - Updates it to today")
		void markTodayBirthdayNotificationsAsViewed_WithOlderExistingRow_UpdatesToToday() throws Exception {
			seedConfig(true, false, false);
			seedLastViewed(CURRENT_EMPLOYEE_ID, today.minusDays(5));

			assertLastViewedDate(assertSuccessful(performMarkViewedRequest(currentUserToken)), today);

			assertThat(storedLastViewedDate(CURRENT_EMPLOYEE_ID)).isEqualTo(today);
			assertThat(specialNotificationStatusDao.count()).isEqualTo(1);
		}

		@Test
		@DisplayName("Mark today's birthdays as viewed when the feature is turned off - Returns today and leaves the stored row untouched")
		void markTodayBirthdayNotificationsAsViewed_WhenTurnedOff_ReturnsTodayWithoutWriting() throws Exception {
			seedConfig(false, false, false);
			seedLastViewed(CURRENT_EMPLOYEE_ID, today.minusDays(5));

			assertLastViewedDate(assertSuccessful(performMarkViewedRequest(currentUserToken)), today);

			assertThat(storedLastViewedDate(CURRENT_EMPLOYEE_ID)).isEqualTo(today.minusDays(5));
			assertThat(specialNotificationStatusDao.count()).isEqualTo(1);
		}

	}

	@Nested
	@DisplayName("Organization Time Zone Tests")
	class OrganizationTimeZoneTests {

		private static final String FAR_AHEAD_TIME_ZONE = "Pacific/Kiritimati";

		private static final String FAR_BEHIND_TIME_ZONE = "Pacific/Midway";

		@Test
		@DisplayName("Mark viewed when the organization time zone is far ahead of UTC - Uses the organization's local date")
		void markTodayBirthdayNotificationsAsViewed_WithFarAheadOrganizationTimeZone_UsesOrganizationDate()
				throws Exception {
			assertMarkViewedUsesOrganizationDate(FAR_AHEAD_TIME_ZONE);
		}

		@Test
		@DisplayName("Mark viewed when the organization time zone is far behind UTC - Uses the organization's local date")
		void markTodayBirthdayNotificationsAsViewed_WithFarBehindOrganizationTimeZone_UsesOrganizationDate()
				throws Exception {
			assertMarkViewedUsesOrganizationDate(FAR_BEHIND_TIME_ZONE);
		}

		private void assertMarkViewedUsesOrganizationDate(String timeZone) throws Exception {
			seedConfig(true, false, false);

			Organization organization = new Organization();
			organization.setOrganizationName("Time Zone Test Organization");
			organization.setOrganizationTimeZone(timeZone);
			organizationDao.saveAndFlush(organization);

			LocalDate organizationToday = LocalDate.now(ZoneId.of(timeZone));

			assertLastViewedDate(assertSuccessful(performMarkViewedRequest(currentUserToken)), organizationToday);

			assertThat(storedLastViewedDate(CURRENT_EMPLOYEE_ID)).isEqualTo(organizationToday);
		}

	}

}
