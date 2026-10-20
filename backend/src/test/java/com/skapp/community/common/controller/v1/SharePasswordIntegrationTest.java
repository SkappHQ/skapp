package com.skapp.community.common.controller.v1;

import com.skapp.TestSkappApplication;
import com.skapp.community.common.constant.CommonMessageConstant;
import com.skapp.community.common.model.User;
import com.skapp.community.common.repository.UserDao;
import com.skapp.community.common.security.AuthorityService;
import com.skapp.community.common.service.JwtService;
import com.skapp.community.common.type.Role;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.repository.EmployeeDao;
import com.skapp.community.peopleplanner.type.AccountStatus;
import com.skapp.support.MockUserFactory;
import com.skapp.support.SecurityTestUtils;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.ValueSource;
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

import static com.skapp.support.TestConstants.MESSAGE_PATH;
import static com.skapp.support.TestConstants.RESULTS_0_PATH;
import static com.skapp.support.TestConstants.STATUS_PATH;
import static com.skapp.support.TestConstants.STATUS_SUCCESSFUL;
import static com.skapp.support.TestConstants.STATUS_UNSUCCESSFUL;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
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

	private final MessageUtil messageUtil;

	private final EmployeeDao employeeDao;

	private final EntityManager entityManager;

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
			.perform(post("/v1/auth/share-password/2").accept(MediaType.APPLICATION_JSON)
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
		mvc.perform(post("/v1/auth/share-password/9999").accept(MediaType.APPLICATION_JSON)
			.with(SecurityTestUtils.bearerToken(authToken))).andDo(print()).andExpect(status().isBadRequest());
	}

	@ParameterizedTest(name = "{0} -> user {1}")
	@CsvSource({ "/v1/auth/share-password/, 1", "/v1/auth/reset/share-password/, 1", "/v1/auth/share-password/, 3",
			"/v1/auth/reset/share-password/, 3" })
	@DisplayName("A people admin who is not a super admin cannot reset a super admin's or another people admin's password")
	void sharePassword_PeopleAdminTargetsPeopleAdminOrAbove_IsRefusedAndPasswordUnchanged(String path,
			Long targetUserId) throws Exception {
		setPeopleRoles(1L, Role.PEOPLE_EMPLOYEE, true);
		setPeopleRoles(2L, Role.PEOPLE_ADMIN, false);
		setPeopleRoles(3L, Role.PEOPLE_ADMIN, false);
		User targetBefore = userDao.findById(targetUserId).orElseThrow();
		String targetPassword = targetBefore.getPassword();
		String targetTempPassword = targetBefore.getTempPassword();
		Boolean targetPasswordChanged = targetBefore.getIsPasswordChangedForTheFirstTime();

		mvc.perform(post(path + targetUserId).accept(MediaType.APPLICATION_JSON)
			.with(SecurityTestUtils.bearerToken(peopleAdminToken())))
			.andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['employeeCredentials']").doesNotExist())
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CommonMessageConstant.COMMON_ERROR_PASSWORD_RESET_NOT_ALLOWED)));

		entityManager.flush();
		entityManager.clear();
		User targetAfter = userDao.findById(targetUserId).orElseThrow();
		assertEquals(targetPassword, targetAfter.getPassword());
		assertEquals(targetTempPassword, targetAfter.getTempPassword());
		assertEquals(targetPasswordChanged, targetAfter.getIsPasswordChangedForTheFirstTime());
	}

	@ParameterizedTest(name = "{0}")
	@ValueSource(strings = { "/v1/auth/share-password/3", "/v1/auth/reset/share-password/3" })
	@DisplayName("A people admin can reset the password of a user whose people role is below people admin")
	void sharePassword_PeopleAdminTargetsPeopleEmployee_ResetsPassword(String path) throws Exception {
		setPeopleRoles(2L, Role.PEOPLE_ADMIN, false);
		setPeopleRoles(3L, Role.PEOPLE_EMPLOYEE, false);

		MvcResult result = mvc
			.perform(post(path).accept(MediaType.APPLICATION_JSON)
				.with(SecurityTestUtils.bearerToken(peopleAdminToken())))
			.andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['employeeCredentials']['email']").value("user3@gmail.com"))
			.andReturn();

		String returnedTempPassword = extractTempPassword(result);
		User user = userDao.findById(3L).orElseThrow();
		assertTrue(passwordEncoder.matches(returnedTempPassword, user.getTempPassword()));
		assertTrue(passwordEncoder.matches(returnedTempPassword, user.getPassword()));
	}

	@ParameterizedTest(name = "{0}")
	@ValueSource(strings = { "/v1/auth/share-password/2", "/v1/auth/reset/share-password/2" })
	@DisplayName("A people admin who is not a super admin can reset their own password")
	void sharePassword_PeopleAdminTargetsSelf_ResetsPassword(String path) throws Exception {
		setPeopleRoles(2L, Role.PEOPLE_ADMIN, false);

		MvcResult result = mvc
			.perform(post(path).accept(MediaType.APPLICATION_JSON)
				.with(SecurityTestUtils.bearerToken(peopleAdminToken())))
			.andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['employeeCredentials']['email']").value("user2@gmail.com"))
			.andReturn();

		String returnedTempPassword = extractTempPassword(result);
		assertTrue(passwordEncoder.matches(returnedTempPassword, userDao.findById(2L).orElseThrow().getPassword()));
	}

	@ParameterizedTest(name = "{0}")
	@ValueSource(strings = { "/v1/auth/share-password/2", "/v1/auth/reset/share-password/2" })
	@DisplayName("A super admin can reset the password of a people admin")
	void sharePassword_SuperAdminTargetsPeopleAdmin_ResetsPassword(String path) throws Exception {
		setPeopleRoles(1L, Role.PEOPLE_ADMIN, true);
		setPeopleRoles(2L, Role.PEOPLE_ADMIN, false);

		MvcResult result = mvc
			.perform(post(path).accept(MediaType.APPLICATION_JSON).with(SecurityTestUtils.bearerToken(authToken)))
			.andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andReturn();

		String returnedTempPassword = extractTempPassword(result);
		assertTrue(passwordEncoder.matches(returnedTempPassword, userDao.findById(2L).orElseThrow().getPassword()));
	}

	private void setPeopleRoles(Long employeeId, Role peopleRole, boolean isSuperAdmin) {
		Employee employee = employeeDao.findById(employeeId).orElseThrow();
		employee.setAccountStatus(AccountStatus.ACTIVE);
		employee.getEmployeeRole().setPeopleRole(peopleRole);
		employee.getEmployeeRole().setIsSuperAdmin(isSuperAdmin);
		employeeDao.flush();
	}

	private String extractTempPassword(MvcResult result) throws Exception {
		return jsonMapper.readTree(result.getResponse().getContentAsString())
			.get("results")
			.get(0)
			.get("employeeCredentials")
			.get("tempPassword")
			.asString();
	}

	private String peopleAdminToken() {
		return jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user2@gmail.com"), 2L);
	}

}
