package com.skapp.community.common.controller.v1;

import com.skapp.community.common.payload.request.SignInRequestDto;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import com.skapp.TestSkappApplication;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.json.JsonMapper;

import static com.skapp.support.TestConstants.RESULTS_0_PATH;
import static com.skapp.support.TestConstants.STATUS_PATH;
import static com.skapp.support.TestConstants.STATUS_SUCCESSFUL;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = TestSkappApplication.class)
@AutoConfigureMockMvc
@Transactional
@RequiredArgsConstructor
@DisplayName("Auth Controller Integration Tests")
class AuthControllerIntegrationTest {

	private final JsonMapper objectMapper;

	private final MockMvc mvc;

	private ResultActions performRequest(MockHttpServletRequestBuilder request) throws Exception {
		return mvc.perform(request);
	}

	private <T> ResultActions performPostRequest(T content) throws Exception {
		return performRequest(post("/v1/auth/sign-in").contentType(MediaType.APPLICATION_JSON)
			.content(objectMapper.writeValueAsString(content))
			.accept(MediaType.APPLICATION_JSON));
	}

	@Nested
	@DisplayName("Authentication Tests")
	class AuthenticationTests {

		@Test
		@DisplayName("Sign in with valid credentials - Returns OK")
		void signin_ReturnsOk() throws Exception {
			SignInRequestDto signInRequestDto = new SignInRequestDto();
			signInRequestDto.setEmail("user1@gmail.com");
			signInRequestDto.setPassword("Test@123");

			performPostRequest(signInRequestDto).andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
				.andExpect(jsonPath(RESULTS_0_PATH + "['accessToken']").exists());
		}

	}

}
