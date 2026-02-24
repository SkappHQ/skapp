package com.skapp.community.common.controller.v1;

import com.skapp.community.common.constant.CommonMessageConstant;
import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.request.OrganizationDto;
import com.skapp.community.common.payload.request.UpdateOrganizationRequestDto;
import com.skapp.community.common.security.AuthorityService;
import com.skapp.community.common.security.SkappUserDetails;
import com.skapp.community.common.service.JwtService;
import com.skapp.community.common.type.Role;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.EmployeeRole;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.request.RequestPostProcessor;
import tools.jackson.databind.json.JsonMapper;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@RequiredArgsConstructor
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@DisplayName("Organization Controller Integration Tests")
class OrganizationControllerIntegrationTest {

	private static final String BASE_PATH = "/v1/organization";

	private static final String STATUS_PATH = "['status']";

	private static final String RESULTS_0_PATH = "['results'][0]";

	private static final String MESSAGE_PATH = "['message']";

	private static final String STATUS_SUCCESSFUL = "successful";

	private static final String STATUS_UNSUCCESSFUL = "unsuccessful";

	private final AuthorityService authorityService;

	private final JsonMapper objectMapper;

	private final JwtService jwtService;

	private final UserDetailsService userDetailsService;

	private final MockMvc mvc;

	private final MessageUtil messageUtil;

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
		mockUser.setEmail("user1@gmail.com");
		mockUser.setPassword("$2a$12$CGe4n75Yejv/O8dnOTD7R.x0LruTiKM22kcdc3YNl4RRw01srJsB6");
		mockUser.setIsActive(true);

		Employee mockEmployee = new Employee();
		mockEmployee.setEmployeeId(1L);
		mockEmployee.setFirstName("name");

		EmployeeRole role = new EmployeeRole();
		role.setAttendanceRole(Role.SUPER_ADMIN);
		role.setIsSuperAdmin(true);

		mockEmployee.setEmployeeRole(role);
		mockUser.setEmployee(mockEmployee);

		return mockUser;
	}

	@Test
	@Order(2)
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
	@Order(1)
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
	@Order(3)
	@DisplayName("Get organization - Returns OK")
	void getOrganization_ReturnsOk() throws Exception {
		performGetRequest().andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['organizationName']").value("Org"))
			.andExpect(jsonPath(RESULTS_0_PATH + "['country']").value("Canada"));
	}

	@Test
	@Order(4)
	@DisplayName("Update organization name - Returns OK")
	void updateOrganizationName_ReturnsOk() throws Exception {
		UpdateOrganizationRequestDto organizationDto = new UpdateOrganizationRequestDto();
		organizationDto.setOrganizationName("NewOrg");

		performPatchRequest(organizationDto).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['organizationName']").value("NewOrg"));
	}

}
