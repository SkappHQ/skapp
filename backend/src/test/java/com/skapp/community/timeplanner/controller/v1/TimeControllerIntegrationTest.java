package com.skapp.community.timeplanner.controller.v1;

import com.skapp.community.common.security.AuthorityService;
import com.skapp.community.common.service.JwtService;
import com.skapp.community.common.util.DateTimeUtils;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.community.timeplanner.constant.TimeMessageConstant;
import com.skapp.community.peopleplanner.type.RequestStatus;
import com.skapp.community.peopleplanner.type.RequestType;
import com.skapp.community.timeplanner.payload.request.AddTimeRecordDto;
import com.skapp.community.timeplanner.payload.request.ManualEntryRequestDto;
import com.skapp.community.timeplanner.payload.request.TimeRequestManagerPatchDto;
import com.skapp.community.timeplanner.type.TimeRecordActionTypes;
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
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import tools.jackson.databind.json.JsonMapper;

import java.time.LocalDateTime;
import java.time.ZoneId;

import static com.skapp.support.TestConstants.MESSAGE_PATH;
import static com.skapp.support.TestConstants.RESULTS_0_PATH;
import static com.skapp.support.TestConstants.RESULTS_PATH;
import static com.skapp.support.TestConstants.STATUS_PATH;
import static com.skapp.support.TestConstants.STATUS_SUCCESSFUL;
import static com.skapp.support.TestConstants.STATUS_UNSUCCESSFUL;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = TestSkappApplication.class)
@AutoConfigureMockMvc
@Transactional
@RequiredArgsConstructor
@DisplayName("Time Controller Integration Tests")
class TimeControllerIntegrationTest {

	private static final String BASE_PATH = "/v1/time";

	private final AuthorityService authorityService;

	private final JsonMapper objectMapper;

	private final JwtService jwtService;

	private final UserDetailsService userDetailsService;

	private final MockMvc mvc;

	private final MessageUtil messageUtil;

	private String authToken;

	@BeforeEach
	void setup() {
		SecurityTestUtils.setupSecurityContext(authorityService, MockUserFactory.createSuperAdminWithManager());
		authToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user1@gmail.com"), 1L);
	}

	private ResultActions performRequest(MockHttpServletRequestBuilder request) throws Exception {
		return mvc.perform(request.with(SecurityTestUtils.bearerToken(authToken)));
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

	@Nested
	@DisplayName("Time Slot Tests")
	class TimeSlotTests {

		@Test
		@DisplayName("Get active time slot when clocked out - Returns OK")
		void getActiveTimeSlotWhenTimeRecordAvailable_ButClockedOut_ReturnsHttpStatusOk() throws Exception {
			performGetRequest().andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
				.andExpect(jsonPath(RESULTS_0_PATH + "['periodType']").value("END"));
		}

		@Test
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
		@DisplayName("Add time log for current day with CLOCK_IN - Returns Created")
		void addTimeLog_ForTheCurrentDay_CLOCK_IN_ReturnsHttpStatusCreated() throws Exception {
			LocalDateTime startTime = DateTimeUtils.getCurrentUtcDateTime().minusDays(1L);
			AddTimeRecordDto addTimeRecordDto = new AddTimeRecordDto();
			addTimeRecordDto.setRecordActionType(TimeRecordActionTypes.START);
			addTimeRecordDto.setTime(startTime);

			performPostRequest(BASE_PATH + "/record", addTimeRecordDto).andDo(print())
				.andExpect(status().isCreated())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
				.andExpect(jsonPath(RESULTS_0_PATH).value(messageUtil.getMessage(
						TimeMessageConstant.TIME_SUCCESS_TIME_RECORD_ADDED, new Object[] { startTime, "START" })));
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
				.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH).value(
						messageUtil.getMessage(TimeMessageConstant.TIME_ERROR_TIME_CLOCK_IN_EXISTS_FOR_CURRENT_DATE)));
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
				.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH).value(
						messageUtil.getMessage(TimeMessageConstant.TIME_ERROR_CLOCK_IN_NOT_EXISTS_FOR_CURRENT_DATE)));
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
				.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
					.value(messageUtil.getMessage(TimeMessageConstant.TIME_ERROR_END_TIME_BEFORE_START_TIME)));
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
					.value(messageUtil.getMessage(TimeMessageConstant.TIME_ERROR_START_END_TIME_DIFFERENT_DATES)));
		}

		@Test
		@DisplayName("Add manual entry without request type - Returns Created")
		void addManualEntryRequest_WithoutRequestType_ReturnsCreated() throws Exception {
			LocalDateTime startTime = LocalDateTime.of(2025, 2, 27, 5, 30, 0);
			LocalDateTime endTime = LocalDateTime.of(2025, 2, 27, 6, 30, 0);

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
				.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
					.value(messageUtil.getMessage(TimeMessageConstant.TIME_ERROR_START_DATE_END_DATE_NOT_VALID)));
		}

	}

}
