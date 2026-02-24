package com.skapp.community.leaveplanner.controller.v1;

import com.skapp.community.common.model.User;
import com.skapp.community.common.security.AuthorityService;
import com.skapp.community.common.security.SkappUserDetails;
import com.skapp.community.common.service.JwtService;
import com.skapp.community.common.type.Role;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.EmployeeRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
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

import java.time.LocalDate;
import java.time.Month;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("Leave Analytics Controller Integration Tests")
class LeaveAnalyticsControllerIntegrationTest {

	private static final String RESULTS_0_PATH = "['results'][0]";

	@Autowired
	private AuthorityService authorityService;

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

	private ResultActions performGetRequestWithParams(MultiValueMap<String, String> params) throws Exception {
		return performRequest(get("/v1/leave/analytics/all/leaves").params(params).accept(MediaType.APPLICATION_JSON));
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
		User mockUser = new User();
		mockUser.setUserId(1L);
		mockUser.setEmail("user1@gmail.com");
		mockUser.setPassword("$2a$12$CGe4n75Yejv/O8dnOTD7R.x0LruTiKM22kcdc3YNl4RRw01srJsB6");
		mockUser.setIsActive(true);

		Employee mockEmployee = new Employee();
		mockEmployee.setEmployeeId(1L);
		mockEmployee.setFirstName("name");

		EmployeeRole role = new EmployeeRole();
		role.setLeaveRole(Role.LEAVE_ADMIN);
		role.setIsSuperAdmin(true);

		mockEmployee.setEmployeeRole(role);
		mockUser.setEmployee(mockEmployee);

		return mockUser;
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
