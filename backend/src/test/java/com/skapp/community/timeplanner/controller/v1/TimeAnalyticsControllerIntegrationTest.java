package com.skapp.community.timeplanner.controller.v1;

import com.skapp.TestSkappApplication;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.security.AuthorityService;
import com.skapp.community.common.service.JwtService;
import com.skapp.community.timeplanner.service.TimeAnalyticsService;
import com.skapp.support.MockUserFactory;
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
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.transaction.annotation.Transactional;
import java.util.Map;
import static com.skapp.support.TestConstants.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = TestSkappApplication.class)
@AutoConfigureMockMvc
@Transactional
@RequiredArgsConstructor
@DisplayName("Time Analytics Controller Integration Tests")
class TimeAnalyticsControllerIntegrationTest {

	private static final String BASE_PATH = "/v1/time/analytics";

	private final AuthorityService authorityService;

	private final JwtService jwtService;

	private final UserDetailsService userDetailsService;

	private final MockMvc mvc;

	@MockitoBean
	private TimeAnalyticsService timeAnalyticsService;

	private String authToken;

	@BeforeEach
	void setup() {
		SecurityTestUtils.setupSecurityContext(authorityService, MockUserFactory.createSuperAdminWithManager());
		authToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user1@gmail.com"), 1L);
	}

	private ResultActions performRequest(MockHttpServletRequestBuilder request) throws Exception {
		return mvc.perform(request.with(SecurityTestUtils.bearerToken(authToken)));
	}

	private ResultActions performGetRequest(String path) throws Exception {
		return performRequest(get(path).accept(MediaType.APPLICATION_JSON));
	}

	private ResponseEntityDto response(String endpoint) {
		return new ResponseEntityDto(false, Map.of("endpoint", endpoint));
	}

	private void assertOk(ResultActions resultActions, String endpoint) throws Exception {
		resultActions.andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['endpoint']").value(endpoint));
	}

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
