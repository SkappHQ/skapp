package com.skapp.community.crmplanner.activity.controller.v1;

import com.skapp.TestSkappApplication;
import com.skapp.community.common.service.JwtService;
import com.skapp.community.common.type.Role;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.community.crmplanner.repository.CrmActivityCallDao;
import com.skapp.community.crmplanner.repository.CrmActivityEmailContactDao;
import com.skapp.community.crmplanner.repository.CrmActivityEmailDao;
import com.skapp.community.crmplanner.repository.CrmActivityMeetingContactDao;
import com.skapp.community.crmplanner.repository.CrmActivityMeetingDao;
import com.skapp.community.crmplanner.repository.CrmActivityTaskDao;
import com.skapp.community.crmplanner.constant.CrmMessageConstant;
import com.skapp.community.crmplanner.model.CrmActivityCall;
import com.skapp.community.crmplanner.model.CrmActivityEmail;
import com.skapp.community.crmplanner.model.CrmActivityEmailContact;
import com.skapp.community.crmplanner.model.CrmActivityEmailContactId;
import com.skapp.community.crmplanner.model.CrmActivityMeeting;
import com.skapp.community.crmplanner.model.CrmActivityMeetingContact;
import com.skapp.community.crmplanner.model.CrmActivityMeetingContactId;
import com.skapp.community.crmplanner.model.CrmActivityTask;
import com.skapp.community.crmplanner.model.CrmCompany;
import com.skapp.community.crmplanner.model.CrmContact;
import com.skapp.community.crmplanner.model.CrmDeal;
import com.skapp.community.crmplanner.model.CrmDealStage;
import com.skapp.community.crmplanner.repository.CrmCompanyDao;
import com.skapp.community.crmplanner.repository.CrmContactDao;
import com.skapp.community.crmplanner.repository.CrmDealDao;
import com.skapp.community.crmplanner.repository.CrmDealStageDao;
import com.skapp.community.crmplanner.type.CrmActivityEmailContactRole;
import com.skapp.community.crmplanner.type.CrmActivityTaskPriority;
import com.skapp.community.crmplanner.type.CrmDealPriority;
import com.skapp.community.crmplanner.type.CrmDealStageType;
import com.skapp.community.leaveplanner.type.ManagerType;
import com.skapp.community.peopleplanner.model.EmployeeManager;
import com.skapp.community.peopleplanner.model.EmployeeTeam;
import com.skapp.community.peopleplanner.model.Team;
import com.skapp.community.peopleplanner.repository.EmployeeDao;
import com.skapp.community.peopleplanner.repository.EmployeeManagerDao;
import com.skapp.community.peopleplanner.repository.EmployeeRoleDao;
import com.skapp.community.peopleplanner.repository.EmployeeTeamDao;
import com.skapp.community.peopleplanner.repository.TeamDao;
import com.skapp.support.SecurityTestUtils;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.List;

import static com.skapp.support.TestConstants.MESSAGE_PATH;
import static com.skapp.support.TestConstants.RESULTS_0_PATH;
import static com.skapp.support.TestConstants.RESULTS_PATH;
import static com.skapp.support.TestConstants.STATUS_PATH;
import static com.skapp.support.TestConstants.STATUS_SUCCESSFUL;
import static com.skapp.support.TestConstants.STATUS_UNSUCCESSFUL;
import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.containsInAnyOrder;
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

	private static final String OVERDUE = RESULTS_0_PATH + "['overdue']";

	private static final String TODAY = RESULTS_0_PATH + "['today']";

	private static final String UPCOMING = RESULTS_0_PATH + "['upcoming']";

	private static final String BY_MONTH_ITEMS = RESULTS_0_PATH + "['byMonth']['items']";

	private static final String BY_MONTH_HAS_MORE = RESULTS_0_PATH + "['byMonth']['hasMore']";

	private static final String BY_MONTH_PAGE = RESULTS_0_PATH + "['byMonth']['page']";

	private final MockMvc mvc;

	private final JwtService jwtService;

	private final UserDetailsService userDetailsService;

	private final MessageUtil messageUtil;

	private final CrmActivityTaskDao crmActivityTaskDao;

	private final CrmActivityCallDao crmActivityCallDao;

	private final CrmActivityMeetingDao crmActivityMeetingDao;

	private final CrmActivityMeetingContactDao crmActivityMeetingContactDao;

	private final CrmActivityEmailDao crmActivityEmailDao;

	private final CrmActivityEmailContactDao crmActivityEmailContactDao;

	private final CrmCompanyDao crmCompanyDao;

	private final CrmContactDao crmContactDao;

	private final CrmDealDao crmDealDao;

	private final CrmDealStageDao crmDealStageDao;

	private final EmployeeDao employeeDao;

	private final EmployeeRoleDao employeeRoleDao;

	private final EmployeeManagerDao employeeManagerDao;

	private final TeamDao teamDao;

	private final EmployeeTeamDao employeeTeamDao;

	private String authToken;

	private Instant now;

	@BeforeEach
	void setup() {
		authToken = tokenFor("user1@gmail.com");
		now = Instant.now().truncatedTo(ChronoUnit.SECONDS);
	}

	private String tokenFor(String email) {
		return jwtService.generateAccessToken(userDetailsService.loadUserByUsername(email), 1L);
	}

	private ResultActions performRequest(MockHttpServletRequestBuilder request) throws Exception {
		return mvc.perform(request.header(TIMEZONE_HEADER, UTC)
			.accept(MediaType.APPLICATION_JSON)
			.with(SecurityTestUtils.bearerToken(authToken)));
	}

	private ResultActions performFeedRequest(String search) throws Exception {
		return performRequest(get(BASE_PATH).param("search", search)).andDo(print());
	}

	private void setCrmRole(long employeeId, Role role) {
		employeeDao.findById(employeeId).orElseThrow().getEmployeeRole().setCrmRole(role);
		employeeRoleDao.flush();
	}

	private void loginAsRepresentative() {
		setCrmRole(2L, Role.CRM_SALES_REPRESENTATIVE);
		authToken = tokenFor("user2@gmail.com");
	}

	private void loginAsManagerWithTeam() {
		setCrmRole(3L, Role.CRM_SALES_MANAGER);
		setCrmRole(4L, Role.CRM_SALES_REPRESENTATIVE);
		setCrmRole(5L, Role.CRM_SALES_REPRESENTATIVE);
		setCrmRole(2L, Role.CRM_SALES_REPRESENTATIVE);

		Team team = new Team();
		team.setTeamName("Activity Feed Team");
		team = teamDao.save(team);

		EmployeeTeam supervisor = new EmployeeTeam();
		supervisor.setTeam(team);
		supervisor.setEmployee(employeeDao.getReferenceById(3L));
		supervisor.setIsSupervisor(true);
		employeeTeamDao.save(supervisor);

		EmployeeTeam member = new EmployeeTeam();
		member.setTeam(team);
		member.setEmployee(employeeDao.getReferenceById(4L));
		member.setIsSupervisor(false);
		employeeTeamDao.save(member);

		EmployeeManager primary = new EmployeeManager();
		primary.setEmployee(employeeDao.getReferenceById(5L));
		primary.setManager(employeeDao.getReferenceById(3L));
		primary.setIsPrimaryManager(true);
		primary.setManagerType(ManagerType.PRIMARY);
		employeeManagerDao.save(primary);
		employeeManagerDao.flush();

		authToken = tokenFor("user3@gmail.com");
	}

	private CrmCompany savedCompany(String name, boolean deleted) {
		CrmCompany company = new CrmCompany();
		company.setName(name);
		company.setIsDeleted(deleted);
		return crmCompanyDao.save(company);
	}

	private CrmContact savedContact(String name, CrmCompany company, boolean deleted) {
		CrmContact contact = new CrmContact();
		contact.setName(name);
		contact.setEmail(name.replace(' ', '.').toLowerCase() + "@example.com");
		contact.setOwner(employeeDao.getReferenceById(1L));
		contact.setCompany(company);
		contact.setIsDeleted(deleted);
		return crmContactDao.save(contact);
	}

	private CrmDeal savedDeal(String name, CrmContact contact, boolean deleted) {
		CrmDealStage stage = new CrmDealStage();
		stage.setName("Activity Stage");
		stage.setColor("#000000");
		stage.setOrderIndex(1);
		stage.setStageType(CrmDealStageType.OPEN);
		stage = crmDealStageDao.save(stage);

		CrmDeal deal = new CrmDeal();
		deal.setName(name);
		deal.setPriority(CrmDealPriority.MEDIUM);
		deal.setStage(stage);
		deal.setContact(contact);
		deal.setCompany(contact.getCompany());
		deal.setOwner(employeeDao.getReferenceById(1L));
		deal.setOrderIndex("a0");
		deal.setIsDeleted(deleted);
		return crmDealDao.save(deal);
	}

	private CrmActivityTask savedTask(String name, long ownerId, Instant dueAt) {
		CrmActivityTask task = new CrmActivityTask();
		task.setName(name);
		task.setDueAt(dueAt);
		task.setPriority(CrmActivityTaskPriority.HIGH);
		task.setOwner(employeeDao.getReferenceById(ownerId));
		return crmActivityTaskDao.save(task);
	}

	private CrmActivityTask savedCompletedTask(String name, Instant dueAt, Instant completedAt) {
		CrmActivityTask task = new CrmActivityTask();
		task.setName(name);
		task.setDueAt(dueAt);
		task.setIsCompleted(true);
		task.setCompletedAt(completedAt);
		task.setOwner(employeeDao.getReferenceById(1L));
		return crmActivityTaskDao.save(task);
	}

	private CrmActivityCall savedCall(String subject, long ownerId, Instant loggedAt) {
		CrmActivityCall call = new CrmActivityCall();
		call.setSubject(subject);
		call.setLoggedAt(loggedAt);
		call.setOwner(employeeDao.getReferenceById(ownerId));
		return crmActivityCallDao.save(call);
	}

	private CrmActivityMeeting savedMeeting(String name, boolean scheduled, Instant startAt, CrmCompany company,
			List<CrmContact> contacts) {
		CrmActivityMeeting meeting = new CrmActivityMeeting();
		meeting.setName(name);
		meeting.setIsScheduled(scheduled);
		meeting.setStartAt(startAt);
		meeting.setEndAt(startAt.plus(1, ChronoUnit.HOURS));
		meeting.setCompany(company);
		meeting.setOwner(employeeDao.getReferenceById(1L));
		CrmActivityMeeting saved = crmActivityMeetingDao.save(meeting);

		for (CrmContact contact : contacts) {
			CrmActivityMeetingContact link = new CrmActivityMeetingContact();
			link.setId(new CrmActivityMeetingContactId(saved.getId(), contact.getId()));
			link.setMeeting(saved);
			link.setContact(contact);
			crmActivityMeetingContactDao.save(link);
		}
		crmActivityMeetingContactDao.flush();
		return saved;
	}

	private CrmActivityEmail savedEmail(String subject, Instant loggedAt, List<CrmContact> contacts) {
		CrmActivityEmail email = new CrmActivityEmail();
		email.setSubject(subject);
		email.setLoggedAt(loggedAt);
		email.setOwner(employeeDao.getReferenceById(1L));
		CrmActivityEmail saved = crmActivityEmailDao.save(email);

		for (CrmContact contact : contacts) {
			CrmActivityEmailContact link = new CrmActivityEmailContact();
			link.setId(new CrmActivityEmailContactId(saved.getId(), contact.getId()));
			link.setEmail(saved);
			link.setContact(contact);
			link.setRole(CrmActivityEmailContactRole.TO);
			crmActivityEmailContactDao.save(link);
		}
		crmActivityEmailContactDao.flush();
		return saved;
	}

	@Test
	@DisplayName("Get feed as CRM Admin - Returns activities of every owner in the org")
	void getFeed_AsAdmin_ReturnsWholeOrg() throws Exception {
		savedCall("Orgwide call by two", 2L, now.minus(1, ChronoUnit.DAYS));
		savedCall("Orgwide call by three", 3L, now.minus(2, ChronoUnit.DAYS));
		savedCall("Orgwide call by one", 1L, now.minus(3, ChronoUnit.DAYS));

		performFeedRequest("orgwide").andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(BY_MONTH_ITEMS + ".length()").value(3))
			.andExpect(jsonPath(BY_MONTH_ITEMS + "[*]['owner']['id']", containsInAnyOrder(1, 2, 3)));
	}

	@Test
	@DisplayName("Get feed as CRM Admin with ownerId - Returns only that owner's activities")
	void getFeed_AsAdminWithOwnerId_ReturnsThatOwner() throws Exception {
		savedCall("Picked call by two", 2L, now.minus(1, ChronoUnit.DAYS));
		savedCall("Picked call by three", 3L, now.minus(1, ChronoUnit.DAYS));

		performRequest(get(BASE_PATH).param("search", "picked").param("ownerId", "3")).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(BY_MONTH_ITEMS + ".length()").value(1))
			.andExpect(jsonPath(BY_MONTH_ITEMS + "[0]['owner']['id']").value(3));
	}

	@Test
	@DisplayName("Get feed as Super Admin - Sees the whole org even when the CRM role is Sales Manager")
	void getFeed_AsSuperAdmin_ReturnsWholeOrg() throws Exception {
		employeeDao.findById(3L).orElseThrow().getEmployeeRole().setIsSuperAdmin(true);
		setCrmRole(3L, Role.CRM_SALES_MANAGER);
		savedCall("Super call by two", 2L, now.minus(1, ChronoUnit.DAYS));
		savedCall("Super call by one", 1L, now.minus(1, ChronoUnit.DAYS));
		authToken = tokenFor("user3@gmail.com");

		performFeedRequest("super call").andExpect(status().isOk())
			.andExpect(jsonPath(BY_MONTH_ITEMS + ".length()").value(2));

		performRequest(get(TEAM_MEMBERS_PATH)).andExpect(status().isOk())
			.andExpect(jsonPath(RESULTS_PATH + "[*]['id']", containsInAnyOrder(1, 3)));
	}

	@Test
	@DisplayName("Get feed as Sales Representative - Returns only the caller's own activities")
	void getFeed_AsRepresentative_ReturnsOwnOnly() throws Exception {
		savedCall("Scope call by one", 1L, now.minus(1, ChronoUnit.DAYS));
		savedCall("Scope call by two", 2L, now.minus(1, ChronoUnit.DAYS));
		savedTask("Scope task by two", 2L, now.plus(3, ChronoUnit.DAYS));
		loginAsRepresentative();

		performFeedRequest("scope").andExpect(status().isOk())
			.andExpect(jsonPath(BY_MONTH_ITEMS + ".length()").value(1))
			.andExpect(jsonPath(BY_MONTH_ITEMS + "[0]['subject']").value("Scope call by two"))
			.andExpect(jsonPath(UPCOMING + ".length()").value(1))
			.andExpect(jsonPath(UPCOMING + "[0]['subject']").value("Scope task by two"))
			.andExpect(jsonPath(UPCOMING + "[0]['canComplete']").value(true));
	}

	@Test
	@DisplayName("Get feed as Sales Representative sending ownerId, from and to - Parameters are ignored")
	void getFeed_AsRepresentativeWithManagerParams_IgnoresThem() throws Exception {
		savedCall("Tamper call by one", 1L, now.minus(1, ChronoUnit.DAYS));
		savedCall("Tamper call by two", 2L, now.minus(40, ChronoUnit.DAYS));
		loginAsRepresentative();

		String today = LocalDate.now(ZoneId.of(UTC)).toString();
		String lastYear = LocalDate.now(ZoneId.of(UTC)).minusYears(1).toString();

		performRequest(
				get(BASE_PATH).param("search", "tamper").param("ownerId", "1").param("from", today).param("to", today))
			.andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(BY_MONTH_ITEMS + ".length()").value(1))
			.andExpect(jsonPath(BY_MONTH_ITEMS + "[0]['subject']").value("Tamper call by two"));

		performRequest(get(BASE_PATH).param("search", "tamper").param("from", today).param("to", lastYear))
			.andExpect(status().isOk())
			.andExpect(jsonPath(BY_MONTH_ITEMS + ".length()").value(1));
	}

	@Test
	@DisplayName("Get feed as Sales Manager - Returns primary reports, supervised team members and self only")
	void getFeed_AsManager_ReturnsTeamScope() throws Exception {
		for (long ownerId = 1L; ownerId <= 5L; ownerId++) {
			savedCall("Team call by " + ownerId, ownerId, now.minus(ownerId, ChronoUnit.HOURS));
		}
		loginAsManagerWithTeam();

		performFeedRequest("team call").andExpect(status().isOk())
			.andExpect(jsonPath(BY_MONTH_ITEMS + ".length()").value(3))
			.andExpect(jsonPath(BY_MONTH_ITEMS + "[*]['owner']['id']", containsInAnyOrder(3, 4, 5)));
	}

	@Test
	@DisplayName("Get feed as Sales Manager filtering by a team member - Returns only that member's activities")
	void getFeed_AsManagerWithOwnerInScope_ReturnsThatOwner() throws Exception {
		savedCall("Member call by four", 4L, now.minus(1, ChronoUnit.HOURS));
		savedCall("Member call by five", 5L, now.minus(1, ChronoUnit.HOURS));
		loginAsManagerWithTeam();

		performRequest(get(BASE_PATH).param("search", "member call").param("ownerId", "4")).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(BY_MONTH_ITEMS + ".length()").value(1))
			.andExpect(jsonPath(BY_MONTH_ITEMS + "[0]['owner']['id']").value(4));
	}

	@Test
	@DisplayName("Get feed as Sales Manager with an ownerId outside the team - Returns an empty feed")
	void getFeed_AsManagerWithOwnerOutOfScope_ReturnsEmpty() throws Exception {
		savedCall("Outside call by one", 1L, now.minus(1, ChronoUnit.HOURS));
		savedTask("Outside task by two", 2L, now.minus(1, ChronoUnit.DAYS));
		loginAsManagerWithTeam();

		performRequest(get(BASE_PATH).param("ownerId", "1")).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(OVERDUE + ".length()").value(0))
			.andExpect(jsonPath(TODAY + ".length()").value(0))
			.andExpect(jsonPath(UPCOMING + ".length()").value(0))
			.andExpect(jsonPath(BY_MONTH_ITEMS + ".length()").value(0))
			.andExpect(jsonPath(BY_MONTH_HAS_MORE).value(false));

		performRequest(get(BASE_PATH).param("ownerId", "2")).andExpect(status().isOk())
			.andExpect(jsonPath(OVERDUE + ".length()").value(0));
	}

	@Test
	@DisplayName("Get feed with a date range as CRM Admin - Includes the whole end day in the viewer timezone")
	void getFeed_WithDateRange_IncludesWholeEndDayInViewerTimezone() throws Exception {
		ZoneId colombo = ZoneId.of("Asia/Colombo");
		LocalDate day = LocalDate.of(2026, 3, 10);
		savedCall("Range late evening", 1L, day.atTime(23, 30).atZone(colombo).toInstant());
		savedCall("Range next morning", 1L, day.plusDays(1).atTime(0, 30).atZone(colombo).toInstant());
		savedCall("Range day before", 1L, day.minusDays(1).atTime(23, 0).atZone(colombo).toInstant());

		mvc.perform(get(BASE_PATH).param("search", "range")
			.param("from", day.toString())
			.param("to", day.toString())
			.header(TIMEZONE_HEADER, colombo.getId())
			.accept(MediaType.APPLICATION_JSON)
			.with(SecurityTestUtils.bearerToken(authToken)))
			.andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(BY_MONTH_ITEMS + ".length()").value(1))
			.andExpect(jsonPath(BY_MONTH_ITEMS + "[0]['subject']").value("Range late evening"));
	}

	@Test
	@DisplayName("Get feed with an end date before the start date - Returns invalid date range error")
	void getFeed_WithInvalidDateRange_ReturnsBadRequest() throws Exception {
		performRequest(get(BASE_PATH).param("from", "2026-10-22").param("to", "2026-10-21")).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['messageKey']").value("CRM_ERROR_ACTIVITY_INVALID_DATE_RANGE"))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_ACTIVITY_INVALID_DATE_RANGE)));
	}

	@Test
	@DisplayName("Get feed with search - Matches any linked contact's name and that contact's company")
	void getFeed_SearchAcrossLinkedContacts_MatchesEveryContact() throws Exception {
		CrmCompany contactCompany = savedCompany("Quokka Holdings", false);
		CrmCompany relatedCompany = savedCompany("Wombat Partners", false);
		CrmContact first = savedContact("Alpha Person", null, false);
		CrmContact second = savedContact("Bravo Person", contactCompany, false);
		CrmContact third = savedContact("Charlie Person", null, false);
		savedMeeting("Quarterly review", false, now.minus(2, ChronoUnit.DAYS), relatedCompany, List.of(first, second));
		savedEmail("Pricing follow up", now.minus(1, ChronoUnit.DAYS), List.of(first, third));

		performFeedRequest("bravo").andExpect(status().isOk())
			.andExpect(jsonPath(BY_MONTH_ITEMS + ".length()").value(1))
			.andExpect(jsonPath(BY_MONTH_ITEMS + "[0]['type']").value("MEETING"))
			.andExpect(jsonPath(BY_MONTH_ITEMS + "[0]['contacts'].length()").value(2))
			.andExpect(jsonPath(BY_MONTH_ITEMS + "[0]['contacts'][*]['name']",
					containsInAnyOrder("Alpha Person", "Bravo Person")))
			.andExpect(jsonPath(BY_MONTH_ITEMS + "[0]['company']['name']").value("Wombat Partners"));

		performFeedRequest("CHARLIE").andExpect(status().isOk())
			.andExpect(jsonPath(BY_MONTH_ITEMS + ".length()").value(1))
			.andExpect(jsonPath(BY_MONTH_ITEMS + "[0]['type']").value("EMAIL"));

		performFeedRequest("alpha").andExpect(status().isOk())
			.andExpect(jsonPath(BY_MONTH_ITEMS + ".length()").value(2));

		performFeedRequest("quokka").andExpect(status().isOk())
			.andExpect(jsonPath(BY_MONTH_ITEMS + ".length()").value(1))
			.andExpect(jsonPath(BY_MONTH_ITEMS + "[0]['subject']").value("Quarterly review"));

		performFeedRequest("wombat").andExpect(status().isOk())
			.andExpect(jsonPath(BY_MONTH_ITEMS + ".length()").value(0));
	}

	@Test
	@DisplayName("Get feed with search - Does not match a linked deal's name or the notes and comments body")
	void getFeed_SearchOnDealNameOrNotes_ReturnsNothing() throws Exception {
		CrmContact contact = savedContact("Neutral Person", null, false);
		CrmDeal deal = savedDeal("Platypus Deal", contact, false);
		CrmActivityCall call = savedCall("Neutral call", 1L, now.minus(1, ChronoUnit.DAYS));
		call.setDeal(deal);
		call.setComments("Echidna comment body");
		CrmActivityTask task = savedTask("Neutral task", 1L, now.plus(1, ChronoUnit.DAYS));
		task.setNotes("Echidna notes body");
		crmActivityCallDao.flush();

		performFeedRequest("platypus").andExpect(status().isOk())
			.andExpect(jsonPath(BY_MONTH_ITEMS + ".length()").value(0))
			.andExpect(jsonPath(UPCOMING + ".length()").value(0));

		performFeedRequest("echidna").andExpect(status().isOk())
			.andExpect(jsonPath(BY_MONTH_ITEMS + ".length()").value(0))
			.andExpect(jsonPath(UPCOMING + ".length()").value(0));
	}

	@Test
	@DisplayName("Get feed as Sales Representative - A linked deal owned by someone else is not exposed")
	void getFeed_AsRepresentativeWithOthersDeal_HidesDeal() throws Exception {
		CrmContact contact = savedContact("Deal Owner Person", null, false);
		CrmDeal othersDeal = savedDeal("Hidden Deal", contact, false);
		CrmActivityCall call = savedCall("Rep deal call", 2L, now.minus(1, ChronoUnit.DAYS));
		call.setDeal(othersDeal);
		call.setContact(contact);
		crmActivityCallDao.flush();
		loginAsRepresentative();

		performFeedRequest("rep deal call").andExpect(status().isOk())
			.andExpect(jsonPath(BY_MONTH_ITEMS + ".length()").value(1))
			.andExpect(jsonPath(BY_MONTH_ITEMS + "[0]['deal']").isEmpty())
			.andExpect(jsonPath(BY_MONTH_ITEMS + "[0]['contacts'][0]['name']").value("Deal Owner Person"));
	}

	@Test
	@DisplayName("Get feed as Sales Manager with no team - Returns own activities and only self as team member")
	void getFeed_AsManagerWithoutTeam_ReturnsOwnActivities() throws Exception {
		setCrmRole(4L, Role.CRM_SALES_MANAGER);
		savedCall("Lonely call by four", 4L, now.minus(1, ChronoUnit.DAYS));
		savedCall("Lonely call by one", 1L, now.minus(1, ChronoUnit.DAYS));
		authToken = tokenFor("user4@gmail.com");

		performFeedRequest("lonely call").andExpect(status().isOk())
			.andExpect(jsonPath(BY_MONTH_ITEMS + ".length()").value(1))
			.andExpect(jsonPath(BY_MONTH_ITEMS + "[0]['owner']['id']").value(4));

		performRequest(get(TEAM_MEMBERS_PATH)).andExpect(status().isOk())
			.andExpect(jsonPath(RESULTS_PATH + ".length()").value(1))
			.andExpect(jsonPath(RESULTS_PATH + "[0]['id']").value(4));
	}

	@Test
	@DisplayName("Get feed with search containing a wildcard - Wildcards are matched literally")
	void getFeed_SearchWithWildcard_EscapesPattern() throws Exception {
		savedCall("Discount 50% call", 1L, now.minus(1, ChronoUnit.DAYS));
		savedCall("Discount 500 call", 1L, now.minus(1, ChronoUnit.DAYS));

		performFeedRequest("50%").andExpect(status().isOk())
			.andExpect(jsonPath(BY_MONTH_ITEMS + ".length()").value(1))
			.andExpect(jsonPath(BY_MONTH_ITEMS + "[0]['subject']").value("Discount 50% call"));
	}

	@Test
	@DisplayName("Get feed - Buckets open tasks and scheduled meetings by day and orders every bucket newest first")
	void getFeed_Buckets_AreGroupedAndOrdered() throws Exception {
		savedTask("Bucket overdue recent", 1L, now.minus(2, ChronoUnit.DAYS));
		savedTask("Bucket overdue oldest", 1L, now.minus(5, ChronoUnit.DAYS));
		savedTask("Bucket today", 1L, now);
		savedTask("Bucket upcoming later", 1L, now.plus(6, ChronoUnit.DAYS));
		savedMeeting("Bucket upcoming meeting", true, now.plus(3, ChronoUnit.DAYS), null, List.of());
		savedMeeting("Bucket passed meeting", true, now.minus(4, ChronoUnit.DAYS), null, List.of());
		savedCompletedTask("Bucket completed early", now.plus(2, ChronoUnit.DAYS), now.minus(1, ChronoUnit.DAYS));
		savedCall("Bucket call", 1L, now.minus(3, ChronoUnit.DAYS));

		performFeedRequest("bucket").andExpect(status().isOk())
			.andExpect(jsonPath(OVERDUE + "[*]['subject']", contains("Bucket overdue recent", "Bucket overdue oldest")))
			.andExpect(jsonPath(TODAY + "[*]['subject']", contains("Bucket today")))
			.andExpect(
					jsonPath(UPCOMING + "[*]['subject']", contains("Bucket upcoming meeting", "Bucket upcoming later")))
			.andExpect(jsonPath(BY_MONTH_ITEMS + "[*]['subject']",
					contains("Bucket completed early", "Bucket call", "Bucket passed meeting")))
			.andExpect(jsonPath(BY_MONTH_ITEMS + "[0]['isCompleted']").value(true))
			.andExpect(jsonPath(BY_MONTH_ITEMS + "[0]['canComplete']").value(true))
			.andExpect(jsonPath(BY_MONTH_ITEMS + "[1]['canComplete']").value(false))
			.andExpect(jsonPath(OVERDUE + "[0]['priority']").value("HIGH"))
			.andExpect(jsonPath(OVERDUE + "[0]['owner']['name']").value("Employee User One Lastname One"));
	}

	@Test
	@DisplayName("Get feed with a type tab - Returns only that activity type")
	void getFeed_WithTypeTab_ReturnsOnlyThatType() throws Exception {
		savedTask("Tabbed task", 1L, now.plus(2, ChronoUnit.DAYS));
		savedCall("Tabbed call", 1L, now.minus(2, ChronoUnit.DAYS));

		performRequest(get(BASE_PATH).param("search", "tabbed").param("type", "CALL")).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(UPCOMING + ".length()").value(0))
			.andExpect(jsonPath(BY_MONTH_ITEMS + ".length()").value(1))
			.andExpect(jsonPath(BY_MONTH_ITEMS + "[0]['type']").value("CALL"));

		performRequest(get(BASE_PATH).param("search", "tabbed").param("type", "ALL")).andExpect(status().isOk())
			.andExpect(jsonPath(UPCOMING + ".length()").value(1))
			.andExpect(jsonPath(BY_MONTH_ITEMS + ".length()").value(1));
	}

	@Test
	@DisplayName("Get feed - By month is paged 25 at a time and due buckets are only returned on page 0")
	void getFeed_ByMonthPaging_Returns25PerPage() throws Exception {
		for (int index = 0; index < 26; index++) {
			savedCall("Paged call " + index, 1L, now.minus(index + 1L, ChronoUnit.HOURS));
		}
		savedTask("Paged task", 1L, now.minus(2, ChronoUnit.DAYS));

		performFeedRequest("paged").andExpect(status().isOk())
			.andExpect(jsonPath(OVERDUE + ".length()").value(1))
			.andExpect(jsonPath(BY_MONTH_ITEMS + ".length()").value(25))
			.andExpect(jsonPath(BY_MONTH_ITEMS + "[0]['subject']").value("Paged call 0"))
			.andExpect(jsonPath(BY_MONTH_HAS_MORE).value(true))
			.andExpect(jsonPath(BY_MONTH_PAGE).value(0));

		performRequest(get(BASE_PATH).param("search", "paged").param("page", "1")).andExpect(status().isOk())
			.andExpect(jsonPath(OVERDUE + ".length()").value(0))
			.andExpect(jsonPath(BY_MONTH_ITEMS + ".length()").value(1))
			.andExpect(jsonPath(BY_MONTH_ITEMS + "[0]['subject']").value("Paged call 25"))
			.andExpect(jsonPath(BY_MONTH_HAS_MORE).value(false))
			.andExpect(jsonPath(BY_MONTH_PAGE).value(1));
	}

	@Test
	@DisplayName("Get feed - Deleted contact, deal and company links are flagged per link")
	void getFeed_DeletedLinks_AreFlagged() throws Exception {
		CrmCompany deletedCompany = savedCompany("Gone Company", true);
		CrmContact deletedContact = savedContact("Gone Contact", null, true);
		CrmContact activeContact = savedContact("Kept Contact", null, false);
		CrmDeal deletedDeal = savedDeal("Gone Deal", activeContact, true);
		CrmActivityMeeting meeting = savedMeeting("Linked meeting", false, now.minus(1, ChronoUnit.DAYS),
				deletedCompany, List.of(deletedContact, activeContact));
		meeting.setDeal(deletedDeal);
		crmActivityMeetingDao.flush();

		performFeedRequest("linked meeting").andExpect(status().isOk())
			.andExpect(jsonPath(BY_MONTH_ITEMS + "[0]['deal']['name']").value("Gone Deal"))
			.andExpect(jsonPath(BY_MONTH_ITEMS + "[0]['deal']['deleted']").value(true))
			.andExpect(jsonPath(BY_MONTH_ITEMS + "[0]['company']['deleted']").value(true))
			.andExpect(jsonPath(BY_MONTH_ITEMS + "[0]['contacts'][0]['name']").value("Gone Contact"))
			.andExpect(jsonPath(BY_MONTH_ITEMS + "[0]['contacts'][0]['deleted']").value(true))
			.andExpect(jsonPath(BY_MONTH_ITEMS + "[0]['contacts'][1]['deleted']").value(false));
	}

	@Test
	@DisplayName("Get feed - Soft-deleted activities are excluded")
	void getFeed_DeletedActivities_AreExcluded() throws Exception {
		CrmActivityCall call = savedCall("Removed call", 1L, now.minus(1, ChronoUnit.DAYS));
		call.setIsDeleted(true);
		crmActivityCallDao.flush();

		performFeedRequest("removed call").andExpect(status().isOk())
			.andExpect(jsonPath(BY_MONTH_ITEMS + ".length()").value(0));
	}

	@Test
	@DisplayName("Get team members as Sales Representative - Returns forbidden")
	void getTeamMembers_AsRepresentative_ReturnsForbidden() throws Exception {
		loginAsRepresentative();

		performRequest(get(TEAM_MEMBERS_PATH)).andDo(print()).andExpect(status().isForbidden());
	}

	@Test
	@DisplayName("Get team members as Sales Manager - Returns primary reports, supervised team members and self")
	void getTeamMembers_AsManager_ReturnsTeam() throws Exception {
		loginAsManagerWithTeam();

		performRequest(get(TEAM_MEMBERS_PATH)).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(RESULTS_PATH + ".length()").value(3))
			.andExpect(jsonPath(RESULTS_PATH + "[*]['id']", containsInAnyOrder(3, 4, 5)))
			.andExpect(jsonPath(RESULTS_PATH + "[0]['name']").value("Manager User Five LastnameGlobal"));

		performRequest(get(TEAM_MEMBERS_PATH).param("search", "four")).andExpect(status().isOk())
			.andExpect(jsonPath(RESULTS_PATH + ".length()").value(1))
			.andExpect(jsonPath(RESULTS_PATH + "[0]['id']").value(4));
	}

	@Test
	@DisplayName("Get team members as CRM Admin - Returns every CRM user in the org")
	void getTeamMembers_AsAdmin_ReturnsEveryCrmUser() throws Exception {
		setCrmRole(2L, Role.CRM_SALES_REPRESENTATIVE);
		setCrmRole(3L, Role.CRM_SALES_MANAGER);

		performRequest(get(TEAM_MEMBERS_PATH)).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(RESULTS_PATH + ".length()").value(3))
			.andExpect(jsonPath(RESULTS_PATH + "[*]['id']", containsInAnyOrder(1, 2, 3)));
	}

}
