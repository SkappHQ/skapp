package com.skapp.community.crmplanner.controller.v1;

import com.skapp.TestSkappApplication;
import com.skapp.community.common.service.JwtService;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.community.crmplanner.constant.CrmMessageConstant;
import com.skapp.community.crmplanner.payload.request.CrmCompanyCreateDto;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = TestSkappApplication.class)
@AutoConfigureMockMvc
@Transactional
@RequiredArgsConstructor
@DisplayName("CRM Company Controller Integration Tests")
class CrmCompanyControllerIntegrationTest {

	private static final String BASE_PATH = "/v1/company";

	private static final String EXISTS_PATH = BASE_PATH + "/exists";

	private final JsonMapper objectMapper;

	private final JwtService jwtService;

	private final UserDetailsService userDetailsService;

	private final MockMvc mvc;

	private final MessageUtil messageUtil;

	private String authToken;

	@BeforeEach
	void setup() {
		authToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user1@gmail.com"), 1L);
	}

	private ResultActions performRequest(MockHttpServletRequestBuilder request) throws Exception {
		return mvc.perform(request.with(SecurityTestUtils.bearerToken(authToken)));
	}

	private <T> ResultActions performPostRequest(T content) throws Exception {
		return performRequest(post(BASE_PATH).contentType(MediaType.APPLICATION_JSON)
			.content(objectMapper.writeValueAsString(content))
			.accept(MediaType.APPLICATION_JSON));
	}

	private ResultActions performGetExistsRequest(String name) throws Exception {
		return performRequest(get(EXISTS_PATH).param("name", name).accept(MediaType.APPLICATION_JSON));
	}

	private CrmCompanyCreateDto createValidPayload() {
		CrmCompanyCreateDto dto = new CrmCompanyCreateDto();
		dto.setName("Acme Corp");
		dto.setIndustry("Technology");
		dto.setWebsite("https://acme.com");
		dto.setAddress("123 Main St");
		dto.setContactNumber("94771234567");
		return dto;
	}

	// --- Create company tests ---

	@Test
	@DisplayName("Create company with valid payload - Returns Created")
	void createCompany_HappyPath_ReturnsCreated() throws Exception {
		performPostRequest(createValidPayload()).andDo(print())
			.andExpect(status().isCreated())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['name']").value("Acme Corp"));
	}

	@Test
	@DisplayName("Create company with duplicate name - Returns Bad Request")
	void createCompany_DuplicateName_ReturnsBadRequest() throws Exception {
		performPostRequest(createValidPayload()).andExpect(status().isCreated());

		performPostRequest(createValidPayload()).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_COMPANY_EXISTS)));
	}

	@Test
	@DisplayName("Create company with whitespace-padded duplicate name - Returns Bad Request")
	void createCompany_WhitespacePaddedDuplicateName_ReturnsBadRequest() throws Exception {
		performPostRequest(createValidPayload()).andExpect(status().isCreated());

		CrmCompanyCreateDto dto = createValidPayload();
		dto.setName(" Acme Corp ");
		performPostRequest(dto).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_COMPANY_EXISTS)));
	}

	@Test
	@DisplayName("Create company with blank name - Returns Bad Request")
	void createCompany_BlankName_ReturnsUnprocessableEntity() throws Exception {
		CrmCompanyCreateDto dto = new CrmCompanyCreateDto();
		dto.setName("");

		performPostRequest(dto).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL));
	}

	// --- Check company name exists tests ---

	@Test
	@DisplayName("Check company name exists when not found - Returns OK with false")
	void checkCompanyNameExists_NotFound_ReturnsOkWithFalse() throws Exception {
		performGetExistsRequest("NonExistent").andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['isExists']").value(false));
	}

	@Test
	@DisplayName("Check company name exists when found - Returns OK with true")
	void checkCompanyNameExists_Found_ReturnsOkWithTrue() throws Exception {
		performPostRequest(createValidPayload()).andExpect(status().isCreated());

		performGetExistsRequest("Acme Corp").andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['isExists']").value(true));
	}

}
