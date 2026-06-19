package com.skapp.community.common.controller.v1;

import com.skapp.TestSkappApplication;
import com.skapp.community.common.model.User;
import com.skapp.community.common.repository.UserDao;
import com.skapp.community.common.security.AuthorityService;
import com.skapp.community.common.service.JwtService;
import com.skapp.support.MockUserFactory;
import com.skapp.support.SecurityTestUtils;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

import static com.skapp.support.TestConstants.RESULTS_0_PATH;
import static com.skapp.support.TestConstants.STATUS_PATH;
import static com.skapp.support.TestConstants.STATUS_SUCCESSFUL;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = TestSkappApplication.class)
@AutoConfigureMockMvc
@Transactional
@RequiredArgsConstructor
@DisplayName("Share Password Integration Tests")
class SharePasswordIntegrationTest {

	private final MockMvc mvc;

	private final JwtService jwtService;

	private final UserDetailsService userDetailsService;

	private final AuthorityService authorityService;

	private final PasswordEncoder passwordEncoder;

	private final UserDao userDao;

	private final JsonMapper jsonMapper;

	private String authToken;

	@BeforeEach
	void setup() {
		SecurityTestUtils.setupSecurityContext(authorityService, MockUserFactory.createSuperAdminWithAllRoles());
		authToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user1@gmail.com"), 1L);
	}

	@Test
	@DisplayName("Share password generates a new temp password, stores bcrypt hash in DB, and returns plaintext")
	void sharePassword_GeneratesNewPassword_StoresBcryptHash_ReturnsPlaintext() throws Exception {
		MvcResult result = mvc
			.perform(get("/v1/auth/share-password/2").accept(MediaType.APPLICATION_JSON)
				.with(SecurityTestUtils.bearerToken(authToken)))
			.andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['employeeCredentials']['tempPassword']").exists())
			.andExpect(jsonPath(RESULTS_0_PATH + "['employeeCredentials']['email']").value("user2@gmail.com"))
			.andReturn();

		JsonNode responseJson = jsonMapper.readTree(result.getResponse().getContentAsString());
		String returnedTempPassword = responseJson.get("results")
			.get(0)
			.get("employeeCredentials")
			.get("tempPassword")
			.asString();

		User user = userDao.findById(2L).orElseThrow();
		assertNotNull(user.getTempPassword());
		assertTrue(passwordEncoder.matches(returnedTempPassword, user.getTempPassword()),
				"DB temp_password should be a bcrypt hash of the returned plaintext");
		assertTrue(passwordEncoder.matches(returnedTempPassword, user.getPassword()),
				"DB password should also be updated to bcrypt hash of the returned plaintext");
	}

	@Test
	@DisplayName("Share password for non-existent user returns error")
	void sharePassword_NonExistentUser_ReturnsError() throws Exception {
		mvc.perform(get("/v1/auth/share-password/9999").accept(MediaType.APPLICATION_JSON)
			.with(SecurityTestUtils.bearerToken(authToken))).andDo(print()).andExpect(status().isBadRequest());
	}

}
