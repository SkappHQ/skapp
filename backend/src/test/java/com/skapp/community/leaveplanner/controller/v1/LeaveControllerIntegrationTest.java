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

import static com.skapp.support.TestConstants.MESSAGE_PATH;
import static com.skapp.support.TestConstants.RESULTS_0_PATH;
import static com.skapp.support.TestConstants.STATUS_PATH;
import static com.skapp.support.TestConstants.STATUS_SUCCESSFUL;
import static com.skapp.support.TestConstants.STATUS_UNSUCCESSFUL;
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

}
