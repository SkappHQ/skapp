package com.skapp.community.timeplanner.controller.v1;

import com.skapp.TestSkappApplication;
import com.skapp.community.timeplanner.service.TimeAnalyticsService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.transaction.annotation.Transactional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@SpringBootTest(classes = TestSkappApplication.class)
@AutoConfigureMockMvc
@Transactional
@DisplayName("Time Analytics Controller Integration Tests")
class TimeAnalyticsControllerIntegrationTest extends AbstractControllerIntegrationTest {

	private static final String BASE_PATH = "/v1/time/analytics";

	@MockitoBean
	private TimeAnalyticsService timeAnalyticsService;

	@Nested
	@DisplayName("Time Analytics Tests")
	class TimeAnalyticsTests {

		@Test
		@DisplayName("GET /clockin-clockout-trend - returns OK")
		void getClockInClockOutTrend_ReturnsOk() throws Exception {
			when(timeAnalyticsService.getClockInClockOutTrend(any())).thenReturn(response("getClockInClockOutTrend"));

			assertOk(performGetRequest(BASE_PATH + "/clockin-clockout-trend"), "getClockInClockOutTrend");
			verify(timeAnalyticsService).getClockInClockOutTrend(any());
		}

		@Test
		@DisplayName("GET /late-arrival-trend - returns OK")
		void lateArrivalTrend_ReturnsOk() throws Exception {
			when(timeAnalyticsService.lateArrivalTrend(any())).thenReturn(response("lateArrivalTrend"));

			assertOk(performGetRequest(BASE_PATH + "/late-arrival-trend"), "lateArrivalTrend");
			verify(timeAnalyticsService).lateArrivalTrend(any());
		}

		@Test
		@DisplayName("GET /average-hours-worked-trend - returns OK")
		void averageHoursWorkedTrend_ReturnsOk() throws Exception {
			when(timeAnalyticsService.averageHoursWorkedTrend(any())).thenReturn(response("averageHoursWorkedTrend"));

			assertOk(performGetRequest(BASE_PATH + "/average-hours-worked-trend"), "averageHoursWorkedTrend");
			verify(timeAnalyticsService).averageHoursWorkedTrend(any());
		}

		@Test
		@DisplayName("GET /dashboard-summary - returns OK")
		void attendanceDashboardSummary_ReturnsOk() throws Exception {
			when(timeAnalyticsService.attendanceDashboardSummary(any()))
				.thenReturn(response("attendanceDashboardSummary"));

			assertOk(performGetRequest(BASE_PATH + "/dashboard-summary"), "attendanceDashboardSummary");
			verify(timeAnalyticsService).attendanceDashboardSummary(any());
		}

		@Test
		@DisplayName("GET /clockin-summary - returns OK")
		void clockInSummary_ReturnsOk() throws Exception {
			when(timeAnalyticsService.clockInSummary(any())).thenReturn(response("clockInSummary"));

			assertOk(performGetRequest(BASE_PATH + "/clockin-summary"), "clockInSummary");
			verify(timeAnalyticsService).clockInSummary(any());
		}

		@Test
		@DisplayName("GET /individual-utilization/{id} - returns OK")
		void individualWorkTimeUtilization_ReturnsOk() throws Exception {
			when(timeAnalyticsService.getIndividualWorkUtilization(anyLong()))
				.thenReturn(response("individualWorkTimeUtilization"));

			assertOk(performGetRequest(BASE_PATH + "/individual-utilization/1"), "individualWorkTimeUtilization");
			verify(timeAnalyticsService).getIndividualWorkUtilization(1L);
		}

		@Test
		@DisplayName("GET /average-employee-hours-worked-trend/{id} - returns OK")
		void averageHoursWorkedTrendForEmployee_ReturnsOk() throws Exception {
			when(timeAnalyticsService.averageEmployeeHoursWorkedTrend(any(), anyLong()))
				.thenReturn(response("averageHoursWorkedTrendForEmployee"));

			assertOk(performGetRequest(BASE_PATH + "/average-employee-hours-worked-trend/1"),
					"averageHoursWorkedTrendForEmployee");
			verify(timeAnalyticsService).averageEmployeeHoursWorkedTrend(any(), anyLong());
		}

	}

}
