package com.skapp.community.leaveplanner.controller.v1;

import com.skapp.community.common.security.AuthorityService;
import com.skapp.community.common.service.JwtService;
import com.skapp.community.common.util.DateTimeUtils;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.community.leaveplanner.constant.LeaveMessageConstant;
import com.skapp.community.leaveplanner.payload.request.LeaveRequestDto;
import com.skapp.community.leaveplanner.type.LeaveRequestStatus;
import com.skapp.community.leaveplanner.type.LeaveState;
import com.skapp.support.MockUserFactory;
import com.skapp.support.SecurityTestUtils;
import com.skapp.TestSkappApplication;
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

import java.time.LocalDate;
import java.time.Month;

import static com.skapp.support.TestConstants.MESSAGE_PATH;
import static com.skapp.support.TestConstants.RESULTS_0_PATH;
import static com.skapp.support.TestConstants.STATUS_PATH;
import static com.skapp.support.TestConstants.STATUS_SUCCESSFUL;
import static com.skapp.support.TestConstants.STATUS_UNSUCCESSFUL;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.lessThanOrEqualTo;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = TestSkappApplication.class)
@AutoConfigureMockMvc
@Transactional
@RequiredArgsConstructor
@DisplayName("Leave Controller Integration Tests")
class LeaveControllerIntegrationTest {

	private static final String BASE_PATH = "/v1/leave";

	private final JsonMapper objectMapper;

	private final AuthorityService authorityService;

	private final JwtService jwtService;

	private final UserDetailsService userDetailsService;

	private final MockMvc mvc;

	private final MessageUtil messageUtil;

	private String authToken;

	@BeforeEach
	void setup() {
		SecurityTestUtils.setupSecurityContext(authorityService, MockUserFactory.createLeaveEmployee());
		authToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user2@gmail.com"), 2L);
	}

	private ResultActions performRequest(MockHttpServletRequestBuilder request) throws Exception {
		return mvc.perform(request.with(SecurityTestUtils.bearerToken(authToken)));
	}

	private <T> ResultActions performPostRequest(T content) throws Exception {
		return performRequest(post(LeaveControllerIntegrationTest.BASE_PATH).contentType(MediaType.APPLICATION_JSON)
			.content(objectMapper.writeValueAsString(content))
			.accept(MediaType.APPLICATION_JSON));
	}

	private LeaveRequestDto createFullDayLeaveRequest() {
		LeaveRequestDto leaveRequestDto = new LeaveRequestDto();
		leaveRequestDto.setStartDate(DateTimeUtils.getUtcLocalDate(DateTimeUtils.getCurrentYear(), 2, 12));
		leaveRequestDto.setEndDate(DateTimeUtils.getUtcLocalDate(DateTimeUtils.getCurrentYear(), 2, 13));
		leaveRequestDto.setTypeId(1L);
		leaveRequestDto.setRequestDesc("Full day leave");
		leaveRequestDto.setLeaveState(LeaveState.FULLDAY);
		return leaveRequestDto;
	}

	private LeaveRequestDto createHalfDayLeaveRequest() {
		LeaveRequestDto leaveRequestDto = new LeaveRequestDto();
		leaveRequestDto.setStartDate(DateTimeUtils.getUtcLocalDate(DateTimeUtils.getCurrentYear(), 2, 12));
		leaveRequestDto.setEndDate(DateTimeUtils.getUtcLocalDate(DateTimeUtils.getCurrentYear(), 2, 12));
		leaveRequestDto.setTypeId(6L);
		leaveRequestDto.setLeaveState(LeaveState.HALFDAY_MORNING);
		return leaveRequestDto;
	}

	@Nested
	@DisplayName("Leave Request Tests")
	class LeaveRequestTests {

		@Test
		@DisplayName("Apply leave request - Returns Created")
		void applyLeaveRequest_ReturnsCreated() throws Exception {
			LeaveRequestDto leaveRequestDto = createFullDayLeaveRequest();

			performPostRequest(leaveRequestDto).andDo(print())
				.andExpect(status().isCreated())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
				.andExpect(jsonPath(RESULTS_0_PATH + "['leaveType']['typeId']").value(1))
				.andExpect(jsonPath(RESULTS_0_PATH + "['leaveState']").value(LeaveState.FULLDAY.name()))
				.andExpect(jsonPath(RESULTS_0_PATH + "['status']").value(LeaveRequestStatus.PENDING.name()))
				.andExpect(jsonPath(RESULTS_0_PATH + "['startDate']").isNotEmpty())
				.andExpect(jsonPath(RESULTS_0_PATH + "['endDate']").isNotEmpty());
		}

		@Test
		@DisplayName("Apply leave request without comment - Returns Bad Request")
		void applyLeaveRequest_CommentMandatory_ReturnsBadRequest() throws Exception {
			LeaveRequestDto leaveRequestDto = createHalfDayLeaveRequest();

			performPostRequest(leaveRequestDto).andDo(print())
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
				.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
					.value(messageUtil.getMessage(LeaveMessageConstant.LEAVE_ERROR_MUST_INCLUDE_COMMENT)));
		}

	}

	@Nested
	@DisplayName("Get Manager Assigned Leave Requests Tests")
	class GetManagerAssignedLeavesTests {

		private String managerAuthToken;

		@BeforeEach
		void setupManager() {
			SecurityTestUtils.setupSecurityContext(authorityService, MockUserFactory.createSuperAdminWithAllRoles());
			managerAuthToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user1@gmail.com"),
					1L);
		}

		private String dateRangeParams() {
			int year = DateTimeUtils.getCurrentYear();
			return "?startDate=" + year + "-01-01&endDate=" + year + "-12-31";
		}

		private ResultActions performGetRequests(String queryParams) throws Exception {
			return mvc.perform(
					get(BASE_PATH + "/requests" + queryParams).with(SecurityTestUtils.bearerToken(managerAuthToken))
						.accept(MediaType.APPLICATION_JSON));
		}

		@Test
		@DisplayName("Get assigned leaves - Returns all 3 leave requests for manager user1")
		void getAssignedLeaves_ReturnsAllThreeRequests() throws Exception {
			// user1 is PRIMARY manager of employees 2,3,4 who each have 1 leave request
			performGetRequests(dateRangeParams()).andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
				.andExpect(jsonPath(RESULTS_0_PATH + "['totalItems']").value(3))
				.andExpect(jsonPath(RESULTS_0_PATH + "['items']").isArray())
				.andExpect(jsonPath(RESULTS_0_PATH + "['items']", hasSize(3)));
		}

		@Test
		@DisplayName("Get assigned leaves with page size 2 - Returns 2 items but totalItems is 3")
		void getAssignedLeaves_WithPagination_ReturnsPagedResults() throws Exception {
			performGetRequests(dateRangeParams() + "&page=0&size=2").andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
				.andExpect(jsonPath(RESULTS_0_PATH + "['totalItems']").value(3))
				.andExpect(jsonPath(RESULTS_0_PATH + "['totalPages']").value(2))
				.andExpect(jsonPath(RESULTS_0_PATH + "['currentPage']").value(0))
				.andExpect(jsonPath(RESULTS_0_PATH + "['items']", hasSize(2)));
		}

		@Test
		@DisplayName("Get assigned leaves filtered by PENDING - Returns 2 pending requests")
		void getAssignedLeaves_FilterByPendingStatus_ReturnsTwoResults() throws Exception {
			// employee2 PENDING Study, employee3 PENDING Casual
			performGetRequests(dateRangeParams() + "&status=PENDING").andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
				.andExpect(jsonPath(RESULTS_0_PATH + "['totalItems']").value(2))
				.andExpect(jsonPath(RESULTS_0_PATH + "['items']", hasSize(2)))
				.andExpect(jsonPath(RESULTS_0_PATH + "['items'][0]['status']").value("PENDING"))
				.andExpect(jsonPath(RESULTS_0_PATH + "['items'][1]['status']").value("PENDING"));
		}

		@Test
		@DisplayName("Get assigned leaves filtered by APPROVED - Returns 1 approved request")
		void getAssignedLeaves_FilterByApprovedStatus_ReturnsOneResult() throws Exception {
			// employee4 APPROVED Casual
			performGetRequests(dateRangeParams() + "&status=APPROVED").andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
				.andExpect(jsonPath(RESULTS_0_PATH + "['totalItems']").value(1))
				.andExpect(jsonPath(RESULTS_0_PATH + "['items']", hasSize(1)))
				.andExpect(jsonPath(RESULTS_0_PATH + "['items'][0]['status']").value("APPROVED"))
				.andExpect(jsonPath(RESULTS_0_PATH + "['items'][0]['leaveType']['name']").value("Casual"));
		}

		@Test
		@DisplayName("Get assigned leaves for user5 (no managees) - Returns 0 items")
		void getAssignedLeaves_NoManagees_ReturnsZeroItems() throws Exception {
			// user5 has no employees under management
			SecurityTestUtils.setupSecurityContext(authorityService,
					MockUserFactory.createLeaveManager("user5@gmail.com", 5L, 5L));
			String user5Token = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user5@gmail.com"),
					5L);

			mvc.perform(get(BASE_PATH + "/requests" + dateRangeParams()).with(SecurityTestUtils.bearerToken(user5Token))
				.accept(MediaType.APPLICATION_JSON))
				.andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
				.andExpect(jsonPath(RESULTS_0_PATH + "['totalItems']").value(0))
				.andExpect(jsonPath(RESULTS_0_PATH + "['items']", hasSize(0)));
		}

	}

	@Nested
	@DisplayName("Get Current User Leave Requests Tests")
	class GetCurrentUserLeaveRequestsTests {

		@Test
		@DisplayName("Returns leave requests with default parameters")
		void getLeaveRequests_NoFilters_ReturnsOk() throws Exception {
			performRequest(get(BASE_PATH).accept(MediaType.APPLICATION_JSON)).andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
				.andExpect(jsonPath(RESULTS_0_PATH + "['items']").isArray())
				.andExpect(jsonPath(RESULTS_0_PATH + "['currentPage']").value(0))
				.andExpect(jsonPath(RESULTS_0_PATH + "['totalItems']").isNumber())
				.andExpect(jsonPath(RESULTS_0_PATH + "['totalPages']").isNumber());
		}

		@Test
		@DisplayName("Returns leave requests filtered by PENDING status")
		void getLeaveRequests_PendingStatus_ReturnsPendingOnly() throws Exception {
			performRequest(get(BASE_PATH).param("status", "PENDING").accept(MediaType.APPLICATION_JSON)).andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
				.andExpect(jsonPath(RESULTS_0_PATH + "['items']").isArray())
				.andExpect(jsonPath(RESULTS_0_PATH + "['items'][0]['status']").value("PENDING"));
		}

		@Test
		@DisplayName("Returns leave requests filtered by date range")
		void getLeaveRequests_DateRange_ReturnsFilteredResults() throws Exception {
			String startDate = LocalDate.of(LocalDate.now().getYear(), Month.JANUARY, 1).toString();
			String endDate = LocalDate.of(LocalDate.now().getYear(), Month.DECEMBER, 31).toString();
			performRequest(get(BASE_PATH).param("startDate", startDate)
				.param("endDate", endDate)
				.accept(MediaType.APPLICATION_JSON)).andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
				.andExpect(jsonPath(RESULTS_0_PATH + "['items']").isArray())
				.andExpect(jsonPath(RESULTS_0_PATH + "['items']", hasSize(greaterThanOrEqualTo(1))));
		}

		@Test
		@DisplayName("Returns leave requests filtered by leave type")
		void getLeaveRequests_LeaveTypeFilter_ReturnsFilteredResults() throws Exception {
			performRequest(get(BASE_PATH).param("leaveType", "1").accept(MediaType.APPLICATION_JSON)).andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
				.andExpect(jsonPath(RESULTS_0_PATH + "['items']").isArray());
		}

		@Test
		@DisplayName("Returns leave requests with pagination parameters")
		void getLeaveRequests_WithPagination_ReturnsPagedResults() throws Exception {
			performRequest(get(BASE_PATH).param("page", "0").param("size", "6").accept(MediaType.APPLICATION_JSON))
				.andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
				.andExpect(jsonPath(RESULTS_0_PATH + "['currentPage']").value(0))
				.andExpect(jsonPath(RESULTS_0_PATH + "['items']", hasSize(lessThanOrEqualTo(6))));
		}

		@Test
		@DisplayName("Returns leave requests sorted by CREATED_DATE")
		void getLeaveRequests_SortByCreatedDate_ReturnsSortedResults() throws Exception {
			performRequest(get(BASE_PATH).param("sortKey", "CREATED_DATE")
				.param("sortOrder", "DESC")
				.accept(MediaType.APPLICATION_JSON)).andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
				.andExpect(jsonPath(RESULTS_0_PATH + "['items']").isArray());
		}

		@Test
		@DisplayName("Returns leave requests with all filters combined")
		void getLeaveRequests_AllFiltersCombined_ReturnsFilteredResults() throws Exception {
			String startDate = LocalDate.of(LocalDate.now().getYear(), Month.JANUARY, 1).toString();
			String endDate = LocalDate.of(LocalDate.now().getYear(), Month.DECEMBER, 31).toString();
			performRequest(get(BASE_PATH).param("status", "PENDING")
				.param("startDate", startDate)
				.param("endDate", endDate)
				.param("page", "0")
				.param("sortKey", "CREATED_DATE")
				.param("size", "6")
				.accept(MediaType.APPLICATION_JSON)).andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
				.andExpect(jsonPath(RESULTS_0_PATH + "['items']").isArray())
				.andExpect(jsonPath(RESULTS_0_PATH + "['currentPage']").value(0));
		}

		@Test
		@DisplayName("Returns empty results for future date range with no leaves")
		void getLeaveRequests_FutureDateRange_ReturnsEmptyResults() throws Exception {
			int nextYear = LocalDate.now().getYear() + 1;
			String startDate = LocalDate.of(nextYear, Month.JANUARY, 1).toString();
			String endDate = LocalDate.of(nextYear, Month.DECEMBER, 31).toString();
			performRequest(get(BASE_PATH).param("startDate", startDate)
				.param("endDate", endDate)
				.accept(MediaType.APPLICATION_JSON)).andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
				.andExpect(jsonPath(RESULTS_0_PATH + "['items']", hasSize(0)));
		}

		@Test
		@DisplayName("Returns 401 when no authentication token is provided")
		void getLeaveRequests_NoAuth_ReturnsUnauthorized() throws Exception {
			mvc.perform(get(BASE_PATH).accept(MediaType.APPLICATION_JSON))
				.andDo(print())
				.andExpect(status().isUnauthorized());
		}

	}

}
