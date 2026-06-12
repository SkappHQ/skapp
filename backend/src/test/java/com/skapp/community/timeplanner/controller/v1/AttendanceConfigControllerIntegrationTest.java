package com.skapp.community.timeplanner.controller.v1;

import com.skapp.TestSkappApplication;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.security.AuthorityService;
import com.skapp.community.common.service.JwtService;
import com.skapp.community.timeplanner.payload.request.AttendanceConfigRequestDto;
import com.skapp.community.timeplanner.service.AttendanceConfigService;
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
import tools.jackson.databind.json.JsonMapper;
import java.util.Map;
import static com.skapp.support.TestConstants.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = TestSkappApplication.class)
@AutoConfigureMockMvc
@Transactional
@RequiredArgsConstructor
@DisplayName("Attendance Config Controller Integration Tests")
class AttendanceConfigControllerIntegrationTest {

	private static final String BASE_PATH = "/v1/attendance-config";

	private final AuthorityService authorityService;

	private final JwtService jwtService;

	private final UserDetailsService userDetailsService;

	private final MockMvc mvc;

	private final JsonMapper objectMapper;

	@MockitoBean
	private AttendanceConfigService attendanceConfigService;

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
		return performRequest(get(BASE_PATH).accept(MediaType.APPLICATION_JSON));
	}

	private ResultActions performPatchRequest(Object body) throws Exception {
		return performRequest(patch(BASE_PATH).contentType(MediaType.APPLICATION_JSON)
			.content(objectMapper.writeValueAsString(body))
			.accept(MediaType.APPLICATION_JSON));
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
	@DisplayName("Attendance Config Tests")
	class AttendanceConfigTests {

		@Test
		@DisplayName("PATCH /v1/attendance-config - returns OK")
		void updateAttendanceConfig_ReturnsOk() throws Exception {
			when(attendanceConfigService.updateAttendanceConfig(any())).thenReturn(response("updateAttendanceConfig"));

			assertOk(performPatchRequest(new AttendanceConfigRequestDto(true, false, true, false, true)),
					"updateAttendanceConfig");
			verify(attendanceConfigService).updateAttendanceConfig(any(AttendanceConfigRequestDto.class));
		}

		@Test
		@DisplayName("GET /v1/attendance-config - returns OK")
		void getAllAttendanceConfigs_ReturnsOk() throws Exception {
			when(attendanceConfigService.getAllAttendanceConfigs()).thenReturn(response("getAllAttendanceConfigs"));

			assertOk(performGetRequest(), "getAllAttendanceConfigs");
			verify(attendanceConfigService).getAllAttendanceConfigs();
		}

	}

}
