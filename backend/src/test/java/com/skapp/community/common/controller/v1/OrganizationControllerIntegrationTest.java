package com.skapp.community.common.controller.v1;

import com.skapp.TestSkappApplication;
import com.skapp.community.common.constant.CommonMessageConstant;
import com.skapp.community.common.payload.request.OrganizationDto;
import com.skapp.community.common.payload.request.UpdateOrganizationRequestDto;
import com.skapp.community.common.security.AuthorityService;
import com.skapp.community.common.service.JwtService;
import com.skapp.community.common.util.MessageUtil;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = TestSkappApplication.class)
@AutoConfigureMockMvc
@Transactional
@RequiredArgsConstructor
@DisplayName("Organization Controller Integration Tests")
class OrganizationControllerIntegrationTest {

	private static final String BASE_PATH = "/v1/organization";

	private final AuthorityService authorityService;

	private final JsonMapper objectMapper;

	private final JwtService jwtService;

	private final UserDetailsService userDetailsService;

	private final MockMvc mvc;

	private final MessageUtil messageUtil;

	private String authToken;

	@BeforeEach
	void setup() {
		SecurityTestUtils.setupSecurityContext(authorityService, MockUserFactory.createSuperAdmin());
		authToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user1@gmail.com"), 1L);
	}

	private ResultActions performRequest(MockHttpServletRequestBuilder request) throws Exception {
		return mvc.perform(request.with(SecurityTestUtils.bearerToken(authToken)));
	}

	private ResultActions performGetRequest() throws Exception {
		return performRequest(get(OrganizationControllerIntegrationTest.BASE_PATH).accept(MediaType.APPLICATION_JSON));
	}

	private <T> ResultActions performPostRequest(T content) throws Exception {
		return performRequest(
				post(OrganizationControllerIntegrationTest.BASE_PATH).contentType(MediaType.APPLICATION_JSON)
					.content(objectMapper.writeValueAsString(content))
					.accept(MediaType.APPLICATION_JSON));
	}

	private <T> ResultActions performPatchRequest(T content) throws Exception {
		return performRequest(
				patch(OrganizationControllerIntegrationTest.BASE_PATH).contentType(MediaType.APPLICATION_JSON)
					.content(objectMapper.writeValueAsString(content))
					.accept(MediaType.APPLICATION_JSON));
	}

	@Test
	@DisplayName("Create organization with all fields - Returns Created")
	void createOrganization_ReturnsCreated() throws Exception {
		OrganizationDto organizationDto = new OrganizationDto();
		organizationDto.setOrganizationName("Org");
		organizationDto.setCountry("Canada");
		organizationDto.setOrganizationTimeZone("Asia/Kolkata");

		performPostRequest(organizationDto).andDo(print())
			.andExpect(status().isCreated())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH).value("Organization created successfully"));
	}

	@Test
	@DisplayName("Create organization with only name - Returns Unprocessed Entity")
	void createOrganizationOnlyWithName_ReturnsUnprocessedEntity() throws Exception {
		OrganizationDto organizationDto = new OrganizationDto();
		organizationDto.setOrganizationName("Org");

		performPostRequest(organizationDto).andDo(print())
			.andExpect(status().isUnprocessableEntity())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CommonMessageConstant.COMMON_ERROR_VALIDATION_ERROR)))
			.andExpect(jsonPath(RESULTS_0_PATH + "['errors'][0]['field']").value("country"))
			.andExpect(jsonPath(RESULTS_0_PATH + "['errors'][0]['message']").value("must not be null"));
	}

	@Test
	@DisplayName("Get organization - Returns OK")
	void getOrganization_ReturnsOk() throws Exception {
		// Setup: create organization first
		OrganizationDto organizationDto = new OrganizationDto();
		organizationDto.setOrganizationName("Org");
		organizationDto.setCountry("Canada");
		organizationDto.setOrganizationTimeZone("Asia/Kolkata");
		performPostRequest(organizationDto);

		performGetRequest().andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['organizationName']").value("Org"))
			.andExpect(jsonPath(RESULTS_0_PATH + "['country']").value("Canada"));
	}

	@Test
	@DisplayName("Update organization name - Returns OK")
	void updateOrganizationName_ReturnsOk() throws Exception {
		// Setup: create organization first
		OrganizationDto setupDto = new OrganizationDto();
		setupDto.setOrganizationName("Org");
		setupDto.setCountry("Canada");
		setupDto.setOrganizationTimeZone("Asia/Kolkata");
		performPostRequest(setupDto);

		UpdateOrganizationRequestDto organizationDto = new UpdateOrganizationRequestDto();
		organizationDto.setOrganizationName("NewOrg");

		performPatchRequest(organizationDto).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['organizationName']").value("NewOrg"));
	}

}
