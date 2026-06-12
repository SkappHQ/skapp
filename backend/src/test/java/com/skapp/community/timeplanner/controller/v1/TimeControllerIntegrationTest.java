package com.skapp.community.timeplanner.controller.v1;

import com.skapp.TestSkappApplication;
import com.skapp.community.peopleplanner.type.RequestStatus;
import com.skapp.community.timeplanner.payload.request.AddTimeRecordDto;
import com.skapp.community.timeplanner.payload.request.EditTimeRequestDto;
import com.skapp.community.timeplanner.payload.request.GetTimeConfigDeleteAvailabilityRequestDto;
import com.skapp.community.timeplanner.payload.request.ManualEntryRequestDto;
import com.skapp.community.timeplanner.payload.request.TimeConfigDto;
import com.skapp.community.timeplanner.payload.request.TimeRequestManagerPatchDto;
import com.skapp.community.timeplanner.payload.request.UpdateIncompleteTimeRecordsRequestDto;
import com.skapp.community.timeplanner.payload.request.UpdateTimeRequestsFilterDto;
import com.skapp.community.timeplanner.service.TimeService;
import com.skapp.community.timeplanner.type.TimeRecordActionTypes;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

@SpringBootTest(classes = TestSkappApplication.class)
@AutoConfigureMockMvc
@Transactional
@DisplayName("Time Controller Integration Tests")
class TimeControllerIntegrationTest extends AbstractControllerIntegrationTest {

	private static final String BASE_PATH = "/v1/time";

	@MockitoBean
	private TimeService timeService;

	private ResultActions performPatchRequest() throws Exception {
		return performRequest(patch("/v1/time/requests-update").accept(MediaType.APPLICATION_JSON));
	}

	private ResultActions performPatchRequest(String path, Object body) throws Exception {
		return performRequest(patch(path).contentType(MediaType.APPLICATION_JSON)
			.content(objectMapper.writeValueAsString(body))
			.accept(MediaType.APPLICATION_JSON));
	}

	private ResultActions performPostRequest(String path, Object body) throws Exception {
		return performRequest(post(path).contentType(MediaType.APPLICATION_JSON)
			.content(objectMapper.writeValueAsString(body))
			.accept(MediaType.APPLICATION_JSON));
	}

	@Nested
	@DisplayName("Time Config Tests")
	class TimeConfigTests {

		@Test
		@DisplayName("PATCH /config - returns OK")
		void updateTimeConfig_ReturnsOk() throws Exception {
			when(timeService.updateTimeConfigs(any())).thenReturn(response("updateTimeConfigs"));

			assertOk(performPatchRequest(BASE_PATH + "/config", new TimeConfigDto()), "updateTimeConfigs");
			verify(timeService).updateTimeConfigs(any(TimeConfigDto.class));
		}

		@Test
		@DisplayName("GET /config - returns OK")
		void getDefaultTimeConfig_ReturnsOk() throws Exception {
			when(timeService.getDefaultTimeConfigurations()).thenReturn(response("getDefaultTimeConfigurations"));

			assertOk(performGetRequest(BASE_PATH + "/config"), "getDefaultTimeConfigurations");
			verify(timeService).getDefaultTimeConfigurations();
		}

		@Test
		@DisplayName("GET /config/is-removable - returns OK")
		void getTimeConfigDeleteAvailability_ReturnsOk() throws Exception {
			when(timeService.getIfTimeConfigRemovable(any())).thenReturn(response("getIfTimeConfigRemovable"));

			assertOk(performGetRequest(BASE_PATH + "/config/is-removable"), "getIfTimeConfigRemovable");
			verify(timeService).getIfTimeConfigRemovable(any(GetTimeConfigDeleteAvailabilityRequestDto.class));
		}

	}

	@Nested
	@DisplayName("Time Slot Tests")
	class TimeSlotTests {

		@Test
		@DisplayName("GET /active-slot - returns OK")
		void getActiveTimeSlot_ReturnsOk() throws Exception {
			when(timeService.getActiveTimeSlot()).thenReturn(response("getActiveTimeSlot"));

			assertOk(performGetRequest(BASE_PATH + "/active-slot"), "getActiveTimeSlot");
			verify(timeService).getActiveTimeSlot();
		}

	}

	@Nested
	@DisplayName("Employee Time Tests")
	class EmployeeTimeTests {

		@Test
		@DisplayName("GET /work-summary - returns OK")
		void getEmployeeAttendanceSummary_ReturnsOk() throws Exception {
			when(timeService.getEmployeeAttendanceSummary(any())).thenReturn(response("getEmployeeAttendanceSummary"));

			assertOk(performGetRequest(BASE_PATH + "/work-summary"), "getEmployeeAttendanceSummary");
			verify(timeService).getEmployeeAttendanceSummary(any());
		}

		@Test
		@DisplayName("GET /daily-time-records - returns OK")
		void getEmployeeDailyTimeRecords_ReturnsOk() throws Exception {
			when(timeService.getEmployeeDailyTimeRecords(any())).thenReturn(response("getEmployeeDailyTimeRecords"));

			assertOk(performGetRequest(BASE_PATH + "/daily-time-records"), "getEmployeeDailyTimeRecords");
			verify(timeService).getEmployeeDailyTimeRecords(any());
		}

		@Test
		@DisplayName("GET /daily-time-records/{id} - returns OK")
		void getEmployeeDailyTimeRecordsByEmployeeId_ReturnsOk() throws Exception {
			when(timeService.getEmployeeDailyTimeRecordsByEmployeeId(any(), anyLong()))
				.thenReturn(response("getEmployeeDailyTimeRecordsByEmployeeId"));

			assertOk(performGetRequest(BASE_PATH + "/daily-time-records/1"), "getEmployeeDailyTimeRecordsByEmployeeId");
			verify(timeService).getEmployeeDailyTimeRecordsByEmployeeId(any(), anyLong());
		}

		@Test
		@DisplayName("GET /requests - returns OK")
		void getAllTimeRequestsByEmployeeId_ReturnsOk() throws Exception {
			when(timeService.getAllRequestsOfEmployee(any())).thenReturn(response("getAllRequestsOfEmployee"));

			assertOk(performGetRequest(BASE_PATH + "/requests"), "getAllRequestsOfEmployee");
			verify(timeService).getAllRequestsOfEmployee(any());
		}

		@Test
		@DisplayName("GET /request-period-availability - returns OK")
		void getRequestedTimeAvailability_ReturnsOk() throws Exception {
			when(timeService.getRequestedDateTimeAvailability(any()))
				.thenReturn(response("getRequestedDateTimeAvailability"));

			assertOk(performGetRequest(BASE_PATH + "/request-period-availability"), "getRequestedDateTimeAvailability");
			verify(timeService).getRequestedDateTimeAvailability(any());
		}

		@Test
		@DisplayName("GET /incomplete-clockouts - returns OK")
		void getCurrentUserIncompleteTimeRecords_ReturnsOk() throws Exception {
			when(timeService.getIncompleteClockOuts()).thenReturn(response("getIncompleteClockOuts"));

			assertOk(performGetRequest(BASE_PATH + "/incomplete-clockouts"), "getIncompleteClockOuts");
			verify(timeService).getIncompleteClockOuts();
		}

		@Test
		@DisplayName("POST /manual-entry - returns CREATED")
		void addManualEntryRequest_ReturnsCreated() throws Exception {
			when(timeService.addManualEntryRequest(any())).thenReturn(response("addManualEntryRequest"));

			assertCreated(performPostRequest(BASE_PATH + "/manual-entry", new ManualEntryRequestDto()),
					"addManualEntryRequest");
			verify(timeService).addManualEntryRequest(any());
		}

		@Test
		@DisplayName("PATCH /requests-update - returns OK")
		void updateTimeRequests_ReturnsOk() throws Exception {
			when(timeService.updateTimeRequests(any())).thenReturn(response("updateTimeRequests"));

			assertOk(performPatchRequest(), "updateTimeRequests");
			verify(timeService).updateTimeRequests(any(UpdateTimeRequestsFilterDto.class));
		}

		@Test
		@DisplayName("PATCH /incomplete-clockouts/{id} - returns OK")
		void updateCurrentUserIncompleteTimeRecords_ReturnsOk() throws Exception {
			when(timeService.updateCurrentUserIncompleteTimeRecords(anyLong(), any()))
				.thenReturn(response("updateCurrentUserIncompleteTimeRecords"));

			UpdateIncompleteTimeRecordsRequestDto request = new UpdateIncompleteTimeRecordsRequestDto();
			request.setClockOutTime(LocalDateTime.now());

			assertOk(performPatchRequest(BASE_PATH + "/incomplete-clockouts/1", request),
					"updateCurrentUserIncompleteTimeRecords");
			verify(timeService).updateCurrentUserIncompleteTimeRecords(eq(1L), any());
		}

		@Test
		@DisplayName("POST /record - returns CREATED")
		void addTimeRecord_ReturnsCreated() throws Exception {
			AddTimeRecordDto request = new AddTimeRecordDto();
			request.setRecordActionType(TimeRecordActionTypes.START);
			when(timeService.addTimeRecord(any())).thenReturn(response("addTimeRecord"));

			assertCreated(performPostRequest(BASE_PATH + "/record", request), "addTimeRecord");
			verify(timeService).addTimeRecord(any());
		}

		@Test
		@DisplayName("PATCH /request - returns OK")
		void editTimeRequest_ReturnsOk() throws Exception {
			when(timeService.editTimeRequest(any())).thenReturn(response("editTimeRequest"));

			assertOk(performPatchRequest(BASE_PATH + "/request", new EditTimeRequestDto()), "editTimeRequest");
			verify(timeService).editTimeRequest(any());
		}

	}

	@Nested
	@DisplayName("Manager Time Tests")
	class ManagerTimeTests {

		@Test
		@DisplayName("GET /attendance-summary - returns OK")
		void managerAttendanceSummary_ReturnsOk() throws Exception {
			when(timeService.getManagerAttendanceSummary(any())).thenReturn(response("getManagerAttendanceSummary"));

			assertOk(performGetRequest(BASE_PATH + "/attendance-summary"), "getManagerAttendanceSummary");
			verify(timeService).getManagerAttendanceSummary(any());
		}

		@Test
		@DisplayName("PATCH /time-request/{id} - returns OK")
		void updateTimeRequestByManager_ReturnsOk() throws Exception {
			when(timeService.updateTimeRequestByManager(anyLong(), any()))
				.thenReturn(response("updateTimeRequestByManager"));

			TimeRequestManagerPatchDto request = new TimeRequestManagerPatchDto();
			request.setStatus(RequestStatus.APPROVED);

			assertOk(performPatchRequest(BASE_PATH + "/time-request/1", request), "updateTimeRequestByManager");
			verify(timeService).updateTimeRequestByManager(eq(1L), any());
		}

		@Test
		@DisplayName("GET /team-time-records - returns OK")
		void managerAssignUsersTimeRecords_ReturnsOk() throws Exception {
			when(timeService.managerAssignUsersTimeRecords(any()))
				.thenReturn(response("managerAssignUsersTimeRecords"));

			assertOk(performGetRequest(BASE_PATH + "/team-time-records"), "managerAssignUsersTimeRecords");
			verify(timeService).managerAssignUsersTimeRecords(any());
		}

		@Test
		@DisplayName("GET /time-requests - returns OK")
		void getAllAssignEmployeesTimeRequests_ReturnsOk() throws Exception {
			when(timeService.getAllAssignEmployeesTimeRequests(any()))
				.thenReturn(response("getAllAssignEmployeesTimeRequests"));

			assertOk(performGetRequest(BASE_PATH + "/time-requests"), "getAllAssignEmployeesTimeRequests");
			verify(timeService).getAllAssignEmployeesTimeRequests(any());
		}

		@Test
		@DisplayName("GET /team-time-record-summary - returns OK")
		void managerTeamTimeRecordSummary_ReturnsOk() throws Exception {
			when(timeService.managerTeamTimeRecordSummary(any())).thenReturn(response("managerTeamTimeRecordSummary"));

			assertOk(performGetRequest(BASE_PATH + "/team-time-record-summary"), "managerTeamTimeRecordSummary");
			verify(timeService).managerTeamTimeRecordSummary(any());
		}

		@Test
		@DisplayName("GET /employee-daily-log - returns OK")
		void getManagerEmployeeDailyLog_ReturnsOk() throws Exception {
			when(timeService.getManagerEmployeeDailyLog(any())).thenReturn(response("getManagerEmployeeDailyLog"));

			assertOk(performGetRequest(BASE_PATH + "/employee-daily-log"), "getManagerEmployeeDailyLog");
			verify(timeService).getManagerEmployeeDailyLog(any());
		}

		@Test
		@DisplayName("GET /work-hour-graph - returns OK")
		void getIndividualWorkHoursBySupervisor_ReturnsOk() throws Exception {
			when(timeService.getIndividualWorkHoursBySupervisor(any()))
				.thenReturn(response("getIndividualWorkHoursBySupervisor"));

			assertOk(performGetRequest(BASE_PATH + "/work-hour-graph"), "getIndividualWorkHoursBySupervisor");
			verify(timeService).getIndividualWorkHoursBySupervisor(any());
		}

		@Test
		@DisplayName("GET /individual-utilization/{id} - returns OK")
		void individualWorkTimeUtilizationByManager_ReturnsOk() throws Exception {
			when(timeService.getIndividualWorkUtilizationByManager(anyLong()))
				.thenReturn(response("getIndividualWorkUtilizationByManager"));

			assertOk(performGetRequest(BASE_PATH + "/individual-utilization/1"),
					"getIndividualWorkUtilizationByManager");
			verify(timeService).getIndividualWorkUtilizationByManager(1L);
		}

		@Test
		@DisplayName("GET /pending-requests/count - returns OK")
		void getPendingTimeRequestsCount_ReturnsOk() throws Exception {
			when(timeService.getPendingTimeRequestsCount()).thenReturn(response("getPendingTimeRequestsCount"));

			assertOk(performGetRequest(BASE_PATH + "/pending-requests/count"), "getPendingTimeRequestsCount");
			verify(timeService).getPendingTimeRequestsCount();
		}

	}

}
