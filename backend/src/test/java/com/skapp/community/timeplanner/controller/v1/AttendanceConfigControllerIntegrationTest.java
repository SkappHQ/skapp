package com.skapp.community.timeplanner.controller.v1;

import com.skapp.TestSkappApplication;
import com.skapp.community.timeplanner.payload.request.AttendanceConfigRequestDto;
import com.skapp.community.timeplanner.service.AttendanceConfigService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.transaction.annotation.Transactional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;

@SpringBootTest(classes = TestSkappApplication.class)
@AutoConfigureMockMvc
@Transactional
@DisplayName("Attendance Config Controller Integration Tests")
class AttendanceConfigControllerIntegrationTest extends AbstractControllerIntegrationTest {

	private static final String BASE_PATH = "/v1/attendance-config";

	@MockitoBean
	private AttendanceConfigService attendanceConfigService;

	private ResultActions performGetRequest() throws Exception {
		return performRequest(get(BASE_PATH).accept(MediaType.APPLICATION_JSON));
	}

	private ResultActions performPatchRequest(Object body) throws Exception {
		return performRequest(patch(BASE_PATH).contentType(MediaType.APPLICATION_JSON)
			.content(objectMapper.writeValueAsString(body))
			.accept(MediaType.APPLICATION_JSON));
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
