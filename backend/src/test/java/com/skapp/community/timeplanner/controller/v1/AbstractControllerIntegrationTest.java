package com.skapp.community.timeplanner.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.security.AuthorityService;
import com.skapp.community.common.service.JwtService;
import com.skapp.support.MockUserFactory;
import com.skapp.support.SecurityTestUtils;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import tools.jackson.databind.json.JsonMapper;

import java.util.Map;

import static com.skapp.support.TestConstants.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

abstract class AbstractControllerIntegrationTest {

	@Autowired
	protected AuthorityService authorityService;

	@Autowired
	protected JwtService jwtService;

	@Autowired
	protected UserDetailsService userDetailsService;

	@Autowired
	protected MockMvc mvc;

	@Autowired
	protected JsonMapper objectMapper;

	protected String authToken;

	@BeforeEach
	void setup() {
		SecurityTestUtils.setupSecurityContext(authorityService, MockUserFactory.createSuperAdminWithManager());
		authToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user1@gmail.com"), 1L);
	}

	protected ResultActions performRequest(MockHttpServletRequestBuilder request) throws Exception {
		return mvc.perform(request.with(SecurityTestUtils.bearerToken(authToken)));
	}

	protected ResultActions performGetRequest(String path) throws Exception {
		return performRequest(get(path).accept(MediaType.APPLICATION_JSON));
	}

	protected ResponseEntityDto response(String endpoint) {
		return new ResponseEntityDto(false, Map.of("endpoint", endpoint));
	}

	protected void assertOk(ResultActions resultActions, String endpoint) throws Exception {
		resultActions.andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['endpoint']").value(endpoint));
	}

	protected void assertCreated(ResultActions resultActions, String endpoint) throws Exception {
		resultActions.andDo(print())
			.andExpect(status().isCreated())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['endpoint']").value(endpoint));
	}

}
