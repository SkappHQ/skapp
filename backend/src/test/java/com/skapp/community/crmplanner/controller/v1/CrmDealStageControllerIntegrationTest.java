package com.skapp.community.crmplanner.controller.v1;

import com.skapp.TestSkappApplication;
import com.skapp.community.common.service.JwtService;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.community.crmplanner.constant.CrmConstants;
import com.skapp.community.crmplanner.constant.CrmMessageConstant;
import com.skapp.community.crmplanner.constant.DefaultCrmDealStageTemplate;
import com.skapp.community.crmplanner.model.CrmDealStage;
import com.skapp.community.crmplanner.payload.request.CrmDealStageCreateRequestDto;
import com.skapp.community.crmplanner.repository.CrmDealStageDao;
import com.skapp.community.crmplanner.type.CrmDealStageColors;
import com.skapp.community.crmplanner.type.CrmDealStageType;
import com.skapp.support.SecurityTestUtils;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
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
import com.skapp.enterprise.common.config.TenantValidator;
import com.skapp.community.crmplanner.type.CrmDealStageName;
import tools.jackson.databind.json.JsonMapper;
import static org.mockito.Mockito.when;

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
@DisplayName("CRM Deal Stage Controller Integration Tests")
class CrmDealStageControllerIntegrationTest {

	private static final String BASE_PATH = "/v1/crm/deal/stage";

	private final MockMvc mvc;

	private final JwtService jwtService;

	private final UserDetailsService userDetailsService;

	private final JsonMapper objectMapper;

	private final MessageUtil messageUtil;

	private final CrmDealStageDao crmDealStageDao;

	@MockitoBean
	private TenantValidator tenantValidator;

	private String authToken;

	@BeforeEach
	void setup() {
		// user1 has CRM_ADMIN role
		authToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user1@gmail.com"), 1L);
		when(tenantValidator.isCurrentTenantCoreOrPro()).thenReturn(false);
		crmDealStageDao.saveAll(DefaultCrmDealStageTemplate.getDefaultStages());
	}

	private ResultActions performRequest(MockHttpServletRequestBuilder request) throws Exception {
		return mvc.perform(request.with(SecurityTestUtils.bearerToken(authToken)));
	}

	private ResultActions performPostRequest(CrmDealStageCreateRequestDto dto) throws Exception {
		return performRequest(post(BASE_PATH).contentType(MediaType.APPLICATION_JSON)
			.content(objectMapper.writeValueAsString(dto))
			.accept(MediaType.APPLICATION_JSON));
	}

	private ResultActions performGetRequest() throws Exception {
		return performRequest(get(BASE_PATH).accept(MediaType.APPLICATION_JSON));
	}

	private CrmDealStageCreateRequestDto validPayload() {
		CrmDealStageCreateRequestDto dto = new CrmDealStageCreateRequestDto();
		dto.setName("Proposal");
		dto.setColor(CrmDealStageColors.TEAL);
		dto.setDescription("Proposal sent to prospect");
		return dto;
	}

	private CrmDealStage savedOpenStage(String name, int orderIndex) {
		return savedOpenStage(name, "SKY", orderIndex);
	}

	private CrmDealStage savedOpenStage(String name, String color, int orderIndex) {
		CrmDealStage stage = new CrmDealStage();
		stage.setName(name);
		stage.setColor(color);
		stage.setOrderIndex(orderIndex);
		stage.setStageType(CrmDealStageType.OPEN);
		stage.setIsDeleted(false);
		return crmDealStageDao.save(stage);
	}

	// GET /v1/crm/deal/stage

	@Test
	@DisplayName("Get deal stages - Returns OK ordered by orderIndex")
	void getDealStages_ReturnsOkOrderedByIndex() throws Exception {
		performGetRequest().andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath("['results'].length()").value(5))
			.andExpect(jsonPath(RESULTS_0_PATH + "['name']").value(CrmDealStageName.LEAD.name()))
			.andExpect(jsonPath(RESULTS_0_PATH + "['orderIndex']").value(1))
			.andExpect(jsonPath("['results'][1]['name']").value(CrmDealStageName.QUALIFIED.name()))
			.andExpect(jsonPath("['results'][1]['orderIndex']").value(2));
	}

	@Test
	@DisplayName("Get deal stages without CRM role - Returns Forbidden")
	void getDealStages_WithoutCrmRole_ReturnsForbidden() throws Exception {
		authToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user2@gmail.com"), 1L);

		performGetRequest().andDo(print()).andExpect(status().isForbidden());
	}

	@Test
	@DisplayName("Get deal stages - Free Tier - Filters out hidden default stages")
	void getDealStages_FreeTier_FiltersHiddenStages() throws Exception {
		savedOpenStage(CrmDealStageName.PROPOSAL_SENT.name(), "SKY", 8);

		performGetRequest().andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath("['results'].length()").value(6))
			.andExpect(jsonPath("['results'][?(@.orderIndex == 4)]").isEmpty())
			.andExpect(jsonPath("['results'][?(@.orderIndex == 5)]").isEmpty())
			.andExpect(jsonPath("['results'][5]['name']").value(CrmDealStageName.PROPOSAL_SENT.name()))
			.andExpect(jsonPath("['results'][5]['orderIndex']").value(8));
	}

	@Test
	@DisplayName("Get deal stages - Core/Pro Tier - Returns all stages without filtering")
	void getDealStages_CoreProTier_ReturnsAllStages() throws Exception {
		when(tenantValidator.isCurrentTenantCoreOrPro()).thenReturn(true);

		performGetRequest().andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath("['results'].length()").value(7))
			.andExpect(jsonPath("['results'][3]['name']").value(CrmDealStageName.PROPOSAL_SENT.name()))
			.andExpect(jsonPath("['results'][4]['name']").value(CrmDealStageName.NEGOTIATION.name()));
	}

	// POST /v1/crm/deal/stage — happy path

	@Test
	@DisplayName("Create deal stage with valid payload - Returns Created with OPEN type and bottom orderIndex")
	void createDealStage_ValidPayload_ReturnsCreated() throws Exception {
		when(tenantValidator.isCurrentTenantCoreOrPro()).thenReturn(true);

		performPostRequest(validPayload()).andDo(print())
			.andExpect(status().isCreated())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['name']").value("Proposal"))
			.andExpect(jsonPath(RESULTS_0_PATH + "['color']").value("TEAL"))
			.andExpect(jsonPath(RESULTS_0_PATH + "['description']").value("Proposal sent to prospect"))
			.andExpect(jsonPath(RESULTS_0_PATH + "['stageType']").value(CrmDealStageType.OPEN.name()))
			.andExpect(jsonPath(RESULTS_0_PATH + "['orderIndex']").value(8));
	}

	@Test
	@DisplayName("Create deal stage without description - Returns Created with null description")
	void createDealStage_NoDescription_ReturnsCreated() throws Exception {
		when(tenantValidator.isCurrentTenantCoreOrPro()).thenReturn(true);

		CrmDealStageCreateRequestDto dto = validPayload();
		dto.setDescription(null);

		performPostRequest(dto).andDo(print())
			.andExpect(status().isCreated())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['name']").value("Proposal"));
	}

	@Test
	@DisplayName("Create deal stage with default stages - orderIndex is 8")
	void createDealStage_DefaultStagesExist_OrderIndexIsEight() throws Exception {
		when(tenantValidator.isCurrentTenantCoreOrPro()).thenReturn(true);

		performPostRequest(validPayload()).andDo(print())
			.andExpect(status().isCreated())
			.andExpect(jsonPath(RESULTS_0_PATH + "['orderIndex']").value(8));
	}

	@Test
	@DisplayName("Create deal stage without CRM admin role - Returns Forbidden")
	void createDealStage_WithoutAdminRole_ReturnsForbidden() throws Exception {
		authToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user2@gmail.com"), 1L);

		performPostRequest(validPayload()).andDo(print()).andExpect(status().isForbidden());
	}

	@Test
	@DisplayName("Create deal stage - Free Tier - Limit exceeded - Returns Bad Request")
	void createDealStage_FreeTierLimitExceeded_ReturnsBadRequest() throws Exception {
		performPostRequest(validPayload()).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_DEAL_STAGE_LIMIT_EXCEEDED,
						new Object[] { CrmConstants.DEAL_STAGE_OPEN_LIMIT_FREE_TIER })));
	}

	@Test
	@DisplayName("Create deal stage - Free Tier - Removed open stage frees one slot")
	void createDealStage_FreeTierRemovedOpenStage_ReturnsCreated() throws Exception {
		CrmDealStage removedStage = crmDealStageDao.findAllByIsDeletedFalseOrderByOrderIndexAsc()
			.stream()
			.filter(stage -> CrmDealStageName.DEMO_SCHEDULED.name().equals(stage.getName()))
			.findFirst()
			.orElseThrow();
		removedStage.setIsDeleted(true);
		crmDealStageDao.save(removedStage);

		performPostRequest(validPayload()).andDo(print())
			.andExpect(status().isCreated())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['name']").value("Proposal"))
			.andExpect(jsonPath(RESULTS_0_PATH + "['orderIndex']").value(8));
	}

	@Test
	@DisplayName("Create deal stage - Free Tier - Hidden defaults do not count toward limit")
	void createDealStage_FreeTierHiddenDefaultsDoNotCount_ReturnsCreated() throws Exception {
		CrmDealStage removedStage = crmDealStageDao.findAllByIsDeletedFalseOrderByOrderIndexAsc()
			.stream()
			.filter(stage -> CrmDealStageName.QUALIFIED.name().equals(stage.getName()))
			.findFirst()
			.orElseThrow();
		removedStage.setIsDeleted(true);
		crmDealStageDao.save(removedStage);

		performPostRequest(validPayload()).andDo(print())
			.andExpect(status().isCreated())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL));
	}

	@Test
	@DisplayName("Create deal stage - Core/Pro Tier - Limit exceeded - Returns Created (no limit)")
	void createDealStage_CoreProTierNoLimit_ReturnsCreated() throws Exception {
		when(tenantValidator.isCurrentTenantCoreOrPro()).thenReturn(true);

		performPostRequest(validPayload()).andDo(print())
			.andExpect(status().isCreated())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL));
	}

	// POST — name validation

	@Test
	@DisplayName("Create deal stage with blank name - Returns Bad Request")
	void createDealStage_BlankName_ReturnsBadRequest() throws Exception {
		CrmDealStageCreateRequestDto dto = validPayload();
		dto.setName("");

		performPostRequest(dto).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_DEAL_STAGE_NAME_REQUIRED)));
	}

	@Test
	@DisplayName("Create deal stage with null name - Returns Bad Request")
	void createDealStage_NullName_ReturnsBadRequest() throws Exception {
		CrmDealStageCreateRequestDto dto = validPayload();
		dto.setName(null);

		performPostRequest(dto).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_DEAL_STAGE_NAME_REQUIRED)));
	}

	@Test
	@DisplayName("Create deal stage with single character name - Returns Bad Request (too short)")
	void createDealStage_TooShortName_ReturnsBadRequest() throws Exception {
		CrmDealStageCreateRequestDto dto = validPayload();
		dto.setName("A");

		performPostRequest(dto).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_DEAL_STAGE_NAME_LENGTH)));
	}

	@Test
	@DisplayName("Create deal stage with name exceeding 50 chars - Returns Bad Request (too long)")
	void createDealStage_TooLongName_ReturnsBadRequest() throws Exception {
		CrmDealStageCreateRequestDto dto = validPayload();
		dto.setName("A".repeat(CrmConstants.DEAL_STAGE_NAME_MAX_LENGTH + 1));

		performPostRequest(dto).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_DEAL_STAGE_NAME_LENGTH)));
	}

	@Test
	@DisplayName("Create deal stage with special characters in name - Returns Bad Request")
	void createDealStage_InvalidCharsInName_ReturnsBadRequest() throws Exception {
		CrmDealStageCreateRequestDto dto = validPayload();
		dto.setName("Stage <script>");

		performPostRequest(dto).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_DEAL_STAGE_NAME_INVALID_CHARS)));
	}

	@Test
	@DisplayName("Create deal stage with numeric-only name - Returns Bad Request")
	void createDealStage_NumericOnlyName_ReturnsBadRequest() throws Exception {
		CrmDealStageCreateRequestDto dto = validPayload();
		dto.setName("12345");

		performPostRequest(dto).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_DEAL_STAGE_NAME_INVALID_CHARS)));
	}

	@Test
	@DisplayName("Create deal stage with duplicate name (case-insensitive) - Returns Bad Request")
	void createDealStage_DuplicateName_ReturnsBadRequest() throws Exception {
		when(tenantValidator.isCurrentTenantCoreOrPro()).thenReturn(true);

		performPostRequest(validPayload()).andExpect(status().isCreated());

		CrmDealStageCreateRequestDto dto = validPayload();
		dto.setName("PROPOSAL");

		performPostRequest(dto).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_DEAL_STAGE_NAME_DUPLICATE)));
	}

	// POST — description validation

	@Test
	@DisplayName("Create deal stage with description exceeding 250 chars - Returns Bad Request")
	void createDealStage_TooLongDescription_ReturnsBadRequest() throws Exception {
		CrmDealStageCreateRequestDto dto = validPayload();
		dto.setDescription("A".repeat(CrmConstants.DEAL_STAGE_DESCRIPTION_MAX_LENGTH + 1));

		performPostRequest(dto).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_DEAL_STAGE_DESCRIPTION_TOO_LONG)));
	}

	@Test
	@DisplayName("Create deal stage with special characters in description - Returns Bad Request")
	void createDealStage_InvalidCharsInDescription_ReturnsBadRequest() throws Exception {
		CrmDealStageCreateRequestDto dto = validPayload();
		dto.setDescription("Description <script>alert(1)</script>");

		performPostRequest(dto).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_DEAL_STAGE_DESCRIPTION_INVALID_CHARS)));
	}

}
