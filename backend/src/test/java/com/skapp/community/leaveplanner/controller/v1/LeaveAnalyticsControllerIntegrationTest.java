package com.skapp.community.leaveplanner.controller.v1;

import com.skapp.TestSkappApplication;
import com.skapp.community.common.security.AuthorityService;
import com.skapp.community.common.service.JwtService;
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
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import java.time.LocalDate;
import java.time.Month;

import static com.skapp.support.TestConstants.RESULTS_0_PATH;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = TestSkappApplication.class)
@AutoConfigureMockMvc
@Transactional
@RequiredArgsConstructor
@DisplayName("Leave Analytics Controller Integration Tests")
class LeaveAnalyticsControllerIntegrationTest {

	private final AuthorityService authorityService;

	private final JwtService jwtService;

	private final UserDetailsService userDetailsService;

	private final MockMvc mvc;

	private String authToken;

	@BeforeEach
	void setup() {
		SecurityTestUtils.setupSecurityContext(authorityService, MockUserFactory.createLeaveAdmin());
		authToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user1@gmail.com"), 1L);
	}

	private ResultActions performRequest(MockHttpServletRequestBuilder request) throws Exception {
		return mvc.perform(request.with(SecurityTestUtils.bearerToken(authToken)));
	}

	private ResultActions performGetRequestWithParams(MultiValueMap<String, String> params) throws Exception {
		return performRequest(get("/v1/leave/analytics/all/leaves").params(params).accept(MediaType.APPLICATION_JSON));
	}

	private MultiValueMap<String, String> createDefaultLeaveRequestParams(String status) {
		MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
		params.add("fetchType", "ALL");
		params.add("startDate", String.valueOf(LocalDate.of(LocalDate.now().getYear(), Month.JANUARY, 1)));
		params.add("endDate", String.valueOf(LocalDate.of(LocalDate.now().getYear(), Month.DECEMBER, 30)));
		params.add("status", status);
		return params;
	}

	@Nested
	@DisplayName("Leave Request Analytics Tests")
	class LeaveRequestAnalyticsTests {

		@Test
		@DisplayName("Get all pending leave requests - Returns OK")
		void getAllLeaveRequestsForPendingRequests_ReturnsHttpStatusOk() throws Exception {
			MultiValueMap<String, String> params = createDefaultLeaveRequestParams("PENDING");

			performGetRequestWithParams(params).andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(RESULTS_0_PATH + "['items'][0]['status']").value("PENDING"));
		}

		@Test
		@DisplayName("Get all approved leave requests - Returns OK")
		void getAllLeaveRequestsForApprovedRequests_ReturnsHttpStatusOk() throws Exception {
			MultiValueMap<String, String> params = createDefaultLeaveRequestParams("APPROVED");

			performGetRequestWithParams(params).andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(RESULTS_0_PATH + "['items'][0]['status']").value("APPROVED"));
		}

		@Test
		@DisplayName("Get all leave requests with search keyword - Returns OK")
		void getAllLeaveRequestsWithSearchKeyword_ReturnsHttpStatusOk() throws Exception {
			MultiValueMap<String, String> params = createDefaultLeaveRequestParams("PENDING");
			params.add("searchKeyword", "Lastname Two");

			performGetRequestWithParams(params).andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(RESULTS_0_PATH + "['items'][0]['status']").value("PENDING"))
				.andExpect(jsonPath(RESULTS_0_PATH + "['items'][0]['employee']['lastName']").value("Lastname Two"));
		}

	}

}
