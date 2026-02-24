package com.skapp.community.leaveplanner.controller.v1;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skapp.community.common.model.User;
import com.skapp.community.common.security.AuthorityService;
import com.skapp.community.common.security.SkappUserDetails;
import com.skapp.community.common.service.JwtService;
import com.skapp.community.common.type.Role;
import com.skapp.community.common.util.DateTimeUtils;
import com.skapp.community.leaveplanner.payload.request.LeaveRequestDto;
import com.skapp.community.leaveplanner.type.LeaveRequestStatus;
import com.skapp.community.leaveplanner.type.LeaveState;
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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("Leave Controller Integration Tests")
class LeaveControllerIntegrationTest {

	private static final String BASE_PATH = "/v1/leave";

	private static final String STATUS_PATH = "['status']";

	private static final String RESULTS_0_PATH = "['results'][0]";

	private static final String MESSAGE_PATH = "['message']";

	private static final String STATUS_SUCCESSFUL = "successful";

	private static final String STATUS_UNSUCCESSFUL = "unsuccessful";

	@Autowired
	private ObjectMapper objectMapper;

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
		authToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user2@gmail.com"), 2L);
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

	private <T> ResultActions performPostRequest(T content) throws Exception {
		return performRequest(post(LeaveControllerIntegrationTest.BASE_PATH).contentType(MediaType.APPLICATION_JSON)
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
		User mockUser = new User();
		mockUser.setEmail("user2@gmail.com");
		mockUser.setPassword("$2a$12$CGe4n75Yejv/O8dnOTD7R.x0LruTiKM22kcdc3YNl4RRw01srJsB6");
		mockUser.setIsActive(true);
		mockUser.setUserId(2L);

		Employee mockEmployee = new Employee();
		mockEmployee.setEmployeeId(2L);
		mockEmployee.setFirstName("name");

		EmployeeRole role = new EmployeeRole();
		role.setLeaveRole(Role.LEAVE_EMPLOYEE);
		role.setIsSuperAdmin(true);

		mockEmployee.setEmployeeRole(role);
		mockUser.setEmployee(mockEmployee);

		return mockUser;
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
					.value("Comment must be included for the selected leave type"));
		}

	}

}
