package com.skapp.community.timeplanner.controller.v1;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skapp.community.common.model.User;
import com.skapp.community.common.security.AuthorityService;
import com.skapp.community.common.security.SkappUserDetails;
import com.skapp.community.common.service.JwtService;
import com.skapp.community.common.type.Role;
import com.skapp.community.common.util.DateTimeUtils;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.EmployeeManager;
import com.skapp.community.peopleplanner.model.EmployeeRole;
import com.skapp.community.peopleplanner.type.AccountStatus;
import com.skapp.community.peopleplanner.type.EmploymentAllocation;
import com.skapp.community.peopleplanner.type.RequestStatus;
import com.skapp.community.peopleplanner.type.RequestType;
import com.skapp.community.timeplanner.payload.request.AddTimeRecordDto;
import com.skapp.community.timeplanner.payload.request.ManualEntryRequestDto;
import com.skapp.community.timeplanner.payload.request.TimeRequestManagerPatchDto;
import com.skapp.community.timeplanner.type.TimeRecordActionTypes;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.request.RequestPostProcessor;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.HashSet;
import java.util.Set;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@DisplayName("Time Controller Integration Tests")
class TimeControllerIntegrationTest {

	private static final String BASE_PATH = "/v1/time";

	private static final String STATUS_PATH = "['status']";

	private static final String RESULTS_PATH = "['results']";

	private static final String RESULTS_0_PATH = "['results'][0]";

	private static final String MESSAGE_PATH = "['message']";

	private static final String STATUS_SUCCESSFUL = "successful";

	private static final String STATUS_UNSUCCESSFUL = "unsuccessful";

	@Autowired
	private AuthorityService authorityService;

	@Autowired
	private ObjectMapper objectMapper;

	@Autowired
	private JwtService jwtService;

	@Autowired
	private UserDetailsService userDetailsService;

	@Autowired
	private MockMvc mvc;

	private String authToken;

	@BeforeEach
	void setup() {
		setupSecurityContext();
		authToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user1@gmail.com"), 1L);
	}

	private RequestPostProcessor bearerToken() {
		return request -> {
			request.addHeader("Authorization", "Bearer " + authToken);
			return request;
		};
	}

	private ResultActions performRequest(MockHttpServletRequestBuilder request) throws Exception {
		return mvc.perform(request.with(bearerToken()));
	}

	private ResultActions performGetRequest() throws Exception {
		return performRequest(get("/v1/time/active-slot").accept(MediaType.APPLICATION_JSON));
	}

	private ResultActions performGetRequestWithParams(MultiValueMap<String, String> params) throws Exception {
		return performRequest(
				get("/v1/time/team-time-record-summary").params(params).accept(MediaType.APPLICATION_JSON));
	}

	private <T> ResultActions performPostRequest(String path, T content) throws Exception {
		return performRequest(post(path).contentType(MediaType.APPLICATION_JSON)
			.content(objectMapper.writeValueAsString(content))
			.accept(MediaType.APPLICATION_JSON));
	}

	private <T> ResultActions performPatchRequest(String path, T content) throws Exception {
		return performRequest(patch(path).contentType(MediaType.APPLICATION_JSON)
			.content(objectMapper.writeValueAsString(content))
			.accept(MediaType.APPLICATION_JSON));
	}

	private void setupSecurityContext() {
		User mockUser = createMockUser();
		SkappUserDetails userDetails = SkappUserDetails.builder()
			.username(mockUser.getEmail())
			.password(mockUser.getPassword())
			.enabled(mockUser.getIsActive())
			.authorities(authorityService.getAuthorities(mockUser))
			.build();

		UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(userDetails, null,
				userDetails.getAuthorities());

		SecurityContext securityContext = SecurityContextHolder.createEmptyContext();
		securityContext.setAuthentication(authentication);
		SecurityContextHolder.setContext(securityContext);
	}

	private User createMockUser() {
		// Create main user
		User mockUser = new User();
		mockUser.setEmail("user1@gmail.com");
		mockUser.setPassword("$2a$12$CGe4n75Yejv/O8dnOTD7R.x0LruTiKM22kcdc3YNl4RRw01srJsB6");
		mockUser.setUserId(1L);
		mockUser.setIsActive(true);

		// Create manager user
		User mockManagerUser = new User();
		mockManagerUser.setEmail("user2@gmail.com");
		mockManagerUser.setPassword("$2a$12$Z6/UrecHPvvCBVj/kEeGWezwhMzg46fPSJiAr/sLnBxhDAZfF4/1W");
		mockManagerUser.setUserId(2L);
		mockManagerUser.setIsActive(true);

		// Create employee
		Employee mockEmployee = new Employee();
		mockEmployee.setEmployeeId(1L);
		mockEmployee.setFirstName("name");
		mockEmployee.setAccountStatus(AccountStatus.ACTIVE);
		mockEmployee.setEmploymentAllocation(EmploymentAllocation.FULL_TIME);

		// Create manager employee
		Employee managerEmployee = new Employee();
		managerEmployee.setEmployeeId(2L);
		managerEmployee.setFirstName("name");
		managerEmployee.setAccountStatus(AccountStatus.ACTIVE);
		managerEmployee.setEmploymentAllocation(EmploymentAllocation.FULL_TIME);
		managerEmployee.setUser(mockManagerUser);

		// Set up employee-manager relationship
		EmployeeManager employeeManager = new EmployeeManager();
		employeeManager.setEmployee(mockEmployee);
		employeeManager.setManager(managerEmployee);
		Set<EmployeeManager> managerSet = new HashSet<>();
		managerSet.add(employeeManager);
		mockEmployee.setEmployeeManagers(managerSet);

		// Set up employee role
		EmployeeRole role = new EmployeeRole();
		role.setEmployeeRoleId(1L);
		role.setAttendanceRole(Role.SUPER_ADMIN);
		role.setIsSuperAdmin(true);
		mockEmployee.setEmployeeRole(role);

		// Connect user and employee
		mockUser.setEmployee(mockEmployee);
		mockEmployee.setUser(mockUser);

		return mockUser;
	}

	@Nested
	@DisplayName("Time Slot Tests")
	class TimeSlotTests {

		@Test
		@Order(1)
		@DisplayName("Get active time slot when clocked out - Returns OK")
		void getActiveTimeSlotWhenTimeRecordAvailable_ButClockedOut_ReturnsHttpStatusOk() throws Exception {
			performGetRequest().andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
				.andExpect(jsonPath(RESULTS_0_PATH + "['periodType']").value("END"));
		}

		@Test
		@Order(2)
		@DisplayName("Get active time slot - Returns OK")
		void getActiveTimeSlot_ReturnsOk() throws Exception {
			performGetRequest().andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
				.andExpect(jsonPath(RESULTS_PATH).isNotEmpty());
		}

	}

	@Nested
	@DisplayName("Time Record Tests")
	class TimeRecordTests {

		@Test
		@Order(3)
		@DisplayName("Add time log for current day with CLOCK_IN - Returns OK")
		void addTimeLog_ForTheCurrentDay_CLOCK_IN_ReturnsHttpStatusOk() throws Exception {
			LocalDateTime startTime = DateTimeUtils.getCurrentUtcDateTime().minusDays(1L);
			AddTimeRecordDto addTimeRecordDto = new AddTimeRecordDto();
			addTimeRecordDto.setRecordActionType(TimeRecordActionTypes.START);
			addTimeRecordDto.setTime(startTime);

			performPostRequest(BASE_PATH + "/record", addTimeRecordDto).andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
				.andExpect(jsonPath(RESULTS_0_PATH).value("Time Record Added Successfully " + startTime + " START"));
		}

		@Test
		@DisplayName("Add time log when CLOCK_IN already exists - Returns Bad Request")
		void addTimeLog_ForTheCurrentDay_When_CLOCK_IN_Exists_ReturnsBadRequest() throws Exception {
			AddTimeRecordDto addTimeRecordDto = new AddTimeRecordDto();
			addTimeRecordDto.setRecordActionType(TimeRecordActionTypes.START);
			addTimeRecordDto.setTime(DateTimeUtils.getCurrentUtcDateTime());

			performPostRequest(BASE_PATH + "/record", addTimeRecordDto).andDo(print())
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
				.andExpect(
						jsonPath(RESULTS_0_PATH + MESSAGE_PATH).value("Clock in already exists for the current date"));
		}

		@Test
		@DisplayName("Add time log with WORK when no CLOCK_IN exists - Returns Bad Request")
		void addTimeLog_ForTheCurrentDay_WORK_Request_When_No_CLOCK_IN_Exists_ReturnsBadRequest() throws Exception {
			AddTimeRecordDto addTimeRecordDto = new AddTimeRecordDto();
			addTimeRecordDto.setRecordActionType(TimeRecordActionTypes.RESUME);
			addTimeRecordDto.setTime(DateTimeUtils.getCurrentUtcDateTime().minusDays(2L));

			performPostRequest(BASE_PATH + "/record", addTimeRecordDto).andDo(print())
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
				.andExpect(
						jsonPath(RESULTS_0_PATH + MESSAGE_PATH).value("Clock in does not exists for the current date"));
		}

	}

	@Nested
	@DisplayName("Manual Entry Tests")
	class ManualEntryTests {

		@Test
		@DisplayName("Add manual entry with start time after end time - Returns Bad Request")
		void addManualEntryRequest_InvalidStartEndDate_StartTimeAfterEndTime_ReturnsBadRequest() throws Exception {
			LocalDateTime startTime = LocalDateTime.of(DateTimeUtils.getCurrentYear(), 1, 1, 8, 30, 0);
			LocalDateTime endTime = LocalDateTime.of(DateTimeUtils.getCurrentYear(), 1, 1, 7, 30, 0);

			ManualEntryRequestDto manualEntryRequestDto = new ManualEntryRequestDto();
			manualEntryRequestDto.setRequestType(RequestType.MANUAL_ENTRY_REQUEST);
			manualEntryRequestDto.setStartTime(startTime);
			manualEntryRequestDto.setEndTime(endTime);
			manualEntryRequestDto.setRecordId(1L);
			manualEntryRequestDto.setZoneId(String.valueOf(ZoneId.systemDefault()));

			performPostRequest(BASE_PATH + "/manual-entry", manualEntryRequestDto).andDo(print())
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
				.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH).value("Start time cannot be after end time"));
		}

		@Test
		@DisplayName("Add manual entry with different start and end dates - Returns Bad Request")
		void addManualEntryRequest_InvalidStartEndDate_DifferentDate_ReturnsBadRequest() throws Exception {
			LocalDateTime startTime = LocalDateTime.of(DateTimeUtils.getCurrentYear(), 1, 1, 23, 30, 0);
			LocalDateTime endTime = LocalDateTime.of(DateTimeUtils.getCurrentYear(), 1, 2, 0, 30, 0);

			ManualEntryRequestDto manualEntryRequestDto = new ManualEntryRequestDto();
			manualEntryRequestDto.setRequestType(RequestType.MANUAL_ENTRY_REQUEST);
			manualEntryRequestDto.setStartTime(startTime);
			manualEntryRequestDto.setEndTime(endTime);
			manualEntryRequestDto.setRecordId(1L);
			manualEntryRequestDto.setZoneId(String.valueOf(ZoneId.systemDefault()));

			performPostRequest(BASE_PATH + "/manual-entry", manualEntryRequestDto).andDo(print())
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
				.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
					.value("Start time and End time must be within the same day"));
		}

		@Test
		@DisplayName("Add manual entry without request type - Returns Created")
		void addManualEntryRequest_WithoutRequestType_ReturnsCreated() throws Exception {
			LocalDateTime startTime = LocalDateTime.of(DateTimeUtils.getCurrentYear(), 2, 27, 5, 30, 0);
			LocalDateTime endTime = LocalDateTime.of(DateTimeUtils.getCurrentYear(), 2, 27, 6, 30, 0);

			ManualEntryRequestDto manualEntryRequestDto = new ManualEntryRequestDto();
			manualEntryRequestDto.setStartTime(startTime);
			manualEntryRequestDto.setEndTime(endTime);
			manualEntryRequestDto.setRecordId(3L);
			manualEntryRequestDto.setZoneId(ZoneId.systemDefault().getId());

			performPostRequest(BASE_PATH + "/manual-entry", manualEntryRequestDto).andDo(print())
				.andExpect(status().isCreated())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
				.andExpect(jsonPath(RESULTS_0_PATH + "['requestType']").value("MANUAL_ENTRY_REQUEST"));
		}

	}

	@Nested
	@DisplayName("Time Request Tests")
	class TimeRequestTests {

		@Test
		@DisplayName("Update time request by manager - Returns OK")
		void updateTimeRequestByManager_WithValidTimeRequestId_ReturnsOk() throws Exception {
			TimeRequestManagerPatchDto timeRequestManagerPatchDto = new TimeRequestManagerPatchDto();
			timeRequestManagerPatchDto.setStatus(RequestStatus.APPROVED);

			performPatchRequest(BASE_PATH + "/time-request/1", timeRequestManagerPatchDto).andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
				.andExpect(jsonPath(RESULTS_0_PATH + "['status']").value("APPROVED"));
		}

		@Test
		@DisplayName("Update time request with invalid ID - Returns Bad Request")
		void updateTimeRequestByManager_WithInvalidTimeRequestId_ReturnsBadRequest() throws Exception {
			TimeRequestManagerPatchDto timeRequestManagerPatchDto = new TimeRequestManagerPatchDto();
			timeRequestManagerPatchDto.setStatus(RequestStatus.APPROVED);

			performPatchRequest(BASE_PATH + "/time-request/100", timeRequestManagerPatchDto).andDo(print())
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL));
		}

	}

	@Nested
	@DisplayName("Team Summary Tests")
	class TeamSummaryTests {

		@Test
		@DisplayName("Team time record with invalid date range - Returns Bad Request")
		void managerTeamTimeRecordSummary_WithInvalidDateRange_ReturnsBadRequest() throws Exception {
			MultiValueMap<String, String> queryParams = new LinkedMultiValueMap<>();
			queryParams.add("startDate",
					String.valueOf(DateTimeUtils.getUtcLocalDate(DateTimeUtils.getCurrentYear(), 3, 30)));
			queryParams.add("endDate",
					String.valueOf(DateTimeUtils.getUtcLocalDate(DateTimeUtils.getCurrentYear(), 3, 29)));
			queryParams.add("teamId", "1");
			queryParams.add("filterTime", "DATE_RANGE");

			performGetRequestWithParams(queryParams).andDo(print())
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH).value("Start date and end date are not valid"));
		}

	}

}
