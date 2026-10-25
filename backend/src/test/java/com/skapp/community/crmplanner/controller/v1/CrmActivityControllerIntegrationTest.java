package com.skapp.community.crmplanner.controller.v1;

import com.skapp.TestSkappApplication;
import com.skapp.community.common.service.JwtService;
import com.skapp.community.common.type.Role;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.community.crmplanner.constant.CrmMessageConstant;
import com.skapp.community.crmplanner.model.CrmActivityCall;
import com.skapp.community.crmplanner.model.CrmActivityMeeting;
import com.skapp.community.crmplanner.model.CrmActivityMeetingContact;
import com.skapp.community.crmplanner.model.CrmActivityMeetingContactId;
import com.skapp.community.crmplanner.model.CrmActivityTask;
import com.skapp.community.crmplanner.model.CrmCompany;
import com.skapp.community.crmplanner.model.CrmContact;
import com.skapp.community.crmplanner.type.CrmActivityTaskPriority;
import com.skapp.community.peopleplanner.repository.EmployeeDao;
import com.skapp.community.peopleplanner.repository.EmployeeRoleDao;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;

import static com.skapp.support.TestConstants.MESSAGE_PATH;
import static com.skapp.support.TestConstants.RESULTS_0_PATH;
import static com.skapp.support.TestConstants.RESULTS_PATH;
import static com.skapp.support.TestConstants.STATUS_PATH;
import static com.skapp.support.TestConstants.STATUS_SUCCESSFUL;
import static com.skapp.support.TestConstants.STATUS_UNSUCCESSFUL;
import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.empty;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.hasItems;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = TestSkappApplication.class)
@AutoConfigureMockMvc
@Transactional
@RequiredArgsConstructor
@DisplayName("CRM Activity Controller Integration Tests")
class CrmActivityControllerIntegrationTest {

	private static final String BASE_PATH = "/v1/crm/activities";

	private static final String TEAM_MEMBERS_PATH = BASE_PATH + "/team-members";

	private static final String TIMEZONE_HEADER = "X-Timezone";

	private static final String UTC = "UTC";

	private final MockMvc mvc;

	private final JwtService jwtService;

	private final UserDetailsService userDetailsService;

	private final MessageUtil messageUtil;

	private final EntityManager entityManager;

	private final EmployeeDao employeeDao;

	private final EmployeeRoleDao employeeRoleDao;

	@Test
	@DisplayName("Get activities as CRM admin - Returns every bucket")
	void getActivities_AsAdmin_ReturnsAllBuckets() throws Exception {
		Instant now = Instant.now();
		saveTask("Due today task", startOfTodayUtc().plus(12, ChronoUnit.HOURS), false, 1L);
		saveTask("Due later task", now.plus(5, ChronoUnit.DAYS), false, 1L);
		saveMeeting("Upcoming meeting", true, now.plus(3, ChronoUnit.DAYS), 1L, false);

		performGet(BASE_PATH, adminToken()).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + ".overdue[*].subject").value(hasItem("Prepare proposal")))
			.andExpect(jsonPath(RESULTS_0_PATH + ".today[*].subject").value(hasItem("Due today task")))
			.andExpect(jsonPath(RESULTS_0_PATH + ".upcoming[*].subject")
				.value(hasItems("Due later task", "Upcoming meeting")))
			.andExpect(jsonPath(RESULTS_0_PATH + ".byMonth.items[*].subject")
				.value(hasItems("Send follow-up", "Intro email", "Discovery call", "Site visit")))
			.andExpect(jsonPath(RESULTS_0_PATH + ".byMonth.hasMore").value(false));
	}

	@Test
	@DisplayName("Get activities filtered by type - Returns only that type")
	void getActivities_WithTypeFilter_ReturnsOnlyThatType() throws Exception {
		performGet(BASE_PATH + "?type=EMAIL", adminToken()).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(RESULTS_0_PATH + ".overdue").value(empty()))
			.andExpect(jsonPath(RESULTS_0_PATH + ".byMonth.items[*].type").value(not(hasItem("TASK"))))
			.andExpect(jsonPath(RESULTS_0_PATH + ".byMonth.items[*].subject").value(hasItem("Intro email")));
	}

	@Test
	@DisplayName("Get activities with search - Matches subject and linked contact name")
	void getActivities_WithSearch_MatchesSubjectAndContact() throws Exception {
		CrmCompany company = new CrmCompany();
		company.setName("Zenith Holdings");
		entityManager.persist(company);
		CrmContact contact = new CrmContact();
		contact.setName("Priya Fernando");
		contact.setEmail("priya.activity@example.com");
		contact.setOwner(employeeDao.getReferenceById(1L));
		contact.setCompany(company);
		entityManager.persist(contact);
		CrmActivityMeeting meeting = saveMeeting("Quarterly review", false, Instant.now().minus(2, ChronoUnit.DAYS), 1L,
				false);
		CrmActivityMeetingContact link = new CrmActivityMeetingContact();
		link.setId(new CrmActivityMeetingContactId(meeting.getId(), contact.getId()));
		link.setMeeting(meeting);
		link.setContact(contact);
		entityManager.persist(link);
		entityManager.flush();

		performGet(BASE_PATH + "?search=proposal", adminToken()).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(RESULTS_0_PATH + ".overdue[*].subject").value(contains("Prepare proposal")))
			.andExpect(jsonPath(RESULTS_0_PATH + ".byMonth.items").value(empty()));

		performGet(BASE_PATH + "?search=priya", adminToken()).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(RESULTS_0_PATH + ".byMonth.items[*].subject").value(contains("Quarterly review")))
			.andExpect(jsonPath(RESULTS_0_PATH + ".byMonth.items[0].contacts[0].name").value("Priya Fernando"));

		performGet(BASE_PATH + "?search=zenith", adminToken()).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(RESULTS_0_PATH + ".byMonth.items[*].subject").value(contains("Quarterly review")));
	}

	@Test
	@DisplayName("Get activities with date range - Applies the range in the request time zone")
	void getActivities_WithDateRange_FiltersByFeedDate() throws Exception {
		performGet(BASE_PATH + "?from=2026-01-15&to=2026-01-15", adminToken()).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(RESULTS_0_PATH + ".overdue[*].subject").value(contains("Prepare proposal")))
			.andExpect(jsonPath(RESULTS_0_PATH + ".byMonth.items").value(empty()));
	}

	@Test
	@DisplayName("Get activities with end date before start date - Returns bad request")
	void getActivities_WithInvalidDateRange_ReturnsBadRequest() throws Exception {
		performGet(BASE_PATH + "?from=2026-01-20&to=2026-01-10", adminToken()).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_ACTIVITY_FEED_DATE_RANGE_INVALID)));
	}

	@Test
	@DisplayName("Get activities excludes deleted rows")
	void getActivities_ExcludesDeletedRows() throws Exception {
		CrmActivityCall call = new CrmActivityCall();
		call.setSubject("Deleted call");
		call.setLoggedAt(Instant.now().minus(1, ChronoUnit.DAYS));
		call.setOwner(employeeDao.getReferenceById(1L));
		call.setIsDeleted(true);
		entityManager.persist(call);
		entityManager.flush();

		performGet(BASE_PATH + "?type=CALL", adminToken()).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(RESULTS_0_PATH + ".byMonth.items[*].subject").value(not(hasItem("Deleted call"))));
	}

	@Test
	@DisplayName("Get activities as sales representative - Sees only own rows and ignores owner filter")
	void getActivities_AsRepresentative_SeesOnlyOwnRows() throws Exception {
		setCrmRoleForEmployeeTwo(Role.CRM_SALES_REPRESENTATIVE);
		saveTask("Rep own task", startOfTodayUtc().plus(10, ChronoUnit.HOURS), false, 2L);
		String repToken = tokenFor("user2@gmail.com");

		performGet(BASE_PATH + "?ownerId=1&from=2026-01-01&to=2026-01-31", repToken).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(RESULTS_0_PATH + ".today[*].subject").value(contains("Rep own task")))
			.andExpect(jsonPath(RESULTS_0_PATH + ".today[0].canComplete").value(true))
			.andExpect(jsonPath(RESULTS_0_PATH + ".overdue").value(empty()))
			.andExpect(jsonPath(RESULTS_0_PATH + ".byMonth.items").value(empty()));
	}

	@Test
	@DisplayName("Get activities as sales manager with owner outside the team - Returns empty feed")
	void getActivities_AsManagerWithOwnerOutsideTeam_ReturnsEmpty() throws Exception {
		setCrmRoleForEmployeeTwo(Role.CRM_SALES_MANAGER);
		String managerToken = tokenFor("user2@gmail.com");

		performGet(BASE_PATH + "?ownerId=1", managerToken).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(RESULTS_0_PATH + ".overdue").value(empty()))
			.andExpect(jsonPath(RESULTS_0_PATH + ".today").value(empty()))
			.andExpect(jsonPath(RESULTS_0_PATH + ".upcoming").value(empty()))
			.andExpect(jsonPath(RESULTS_0_PATH + ".byMonth.items").value(empty()))
			.andExpect(jsonPath(RESULTS_0_PATH + ".byMonth.hasMore").value(false));
	}

	@Test
	@DisplayName("Get activities without CRM role - Returns forbidden")
	void getActivities_WithoutCrmRole_ReturnsForbidden() throws Exception {
		performGet(BASE_PATH, tokenFor("user2@gmail.com")).andDo(print()).andExpect(status().isForbidden());
	}

	@Test
	@DisplayName("Get team members as CRM admin - Returns CRM users")
	void getTeamMembers_AsAdmin_ReturnsCrmUsers() throws Exception {
		performGet(TEAM_MEMBERS_PATH, adminToken()).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_PATH).isArray())
			.andExpect(jsonPath(RESULTS_PATH + "[0].id").exists())
			.andExpect(jsonPath(RESULTS_PATH + "[0].name").exists());
	}

	@Test
	@DisplayName("Get team members as sales representative - Returns forbidden")
	void getTeamMembers_AsRepresentative_ReturnsForbidden() throws Exception {
		setCrmRoleForEmployeeTwo(Role.CRM_SALES_REPRESENTATIVE);

		performGet(TEAM_MEMBERS_PATH, tokenFor("user2@gmail.com")).andDo(print()).andExpect(status().isForbidden());
	}

	private ResultActions performGet(String path, String token) throws Exception {
		return mvc.perform(get(path).accept(MediaType.APPLICATION_JSON)
			.header("Authorization", "Bearer " + token)
			.header(TIMEZONE_HEADER, UTC));
	}

	private String adminToken() {
		return tokenFor("user1@gmail.com");
	}

	private String tokenFor(String email) {
		return jwtService.generateAccessToken(userDetailsService.loadUserByUsername(email), 1L);
	}

	private void setCrmRoleForEmployeeTwo(Role role) {
		employeeDao.findById(2L).orElseThrow().getEmployeeRole().setCrmRole(role);
		employeeRoleDao.flush();
	}

	private Instant startOfTodayUtc() {
		return LocalDate.now(ZoneOffset.UTC).atStartOfDay(ZoneOffset.UTC).toInstant();
	}

	private CrmActivityTask saveTask(String name, Instant dueAt, boolean completed, Long ownerId) {
		CrmActivityTask task = new CrmActivityTask();
		task.setName(name);
		task.setDueAt(dueAt);
		task.setIsCompleted(completed);
		task.setPriority(CrmActivityTaskPriority.MEDIUM);
		task.setOwner(employeeDao.getReferenceById(ownerId));
		entityManager.persist(task);
		entityManager.flush();
		return task;
	}

	private CrmActivityMeeting saveMeeting(String name, boolean scheduled, Instant startAt, Long ownerId,
			boolean deleted) {
		CrmActivityMeeting meeting = new CrmActivityMeeting();
		meeting.setName(name);
		meeting.setIsScheduled(scheduled);
		meeting.setStartAt(startAt);
		meeting.setEndAt(startAt.plus(1, ChronoUnit.HOURS));
		meeting.setOwner(employeeDao.getReferenceById(ownerId));
		meeting.setIsDeleted(deleted);
		entityManager.persist(meeting);
		entityManager.flush();
		return meeting;
	}

}
