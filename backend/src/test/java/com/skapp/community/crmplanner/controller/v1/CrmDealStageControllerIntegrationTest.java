package com.skapp.community.crmplanner.controller.v1;

import com.skapp.TestSkappApplication;
import com.skapp.community.common.service.JwtService;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.community.crmplanner.constant.CrmConstants;
import com.skapp.community.crmplanner.constant.CrmMessageConstant;
import com.skapp.community.crmplanner.constant.DefaultCrmDealStageTemplate;
import com.skapp.community.crmplanner.payload.request.CrmDealStageCreateRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmDealStageReorderRequestDto;

import java.util.List;
import com.skapp.community.crmplanner.repository.CrmDealStageDao;
import com.skapp.community.crmplanner.type.CrmDealStageColors;
import com.skapp.community.crmplanner.type.CrmDealStageName;
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
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.json.JsonMapper;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static com.skapp.support.TestConstants.MESSAGE_PATH;
import static com.skapp.support.TestConstants.RESULTS_0_PATH;
import static com.skapp.support.TestConstants.STATUS_PATH;
import static com.skapp.support.TestConstants.STATUS_SUCCESSFUL;
import static com.skapp.support.TestConstants.STATUS_UNSUCCESSFUL;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
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

	private String authToken;

	@BeforeEach
	void setup() {
		// user1 has CRM_ADMIN role
		authToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user1@gmail.com"), 1L);
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

	// GET /v1/crm/deal/stage

	@Test
	@DisplayName("Get deal stages - Returns OK ordered by orderIndex")
	void getDealStages_ReturnsOkOrderedByIndex() throws Exception {
		performGetRequest().andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath("['results'].length()").value(7))
			.andExpect(jsonPath(RESULTS_0_PATH + "['name']").value(CrmDealStageName.LEAD.name()))
			.andExpect(jsonPath(RESULTS_0_PATH + "['orderIndex']").value(1))
			.andExpect(jsonPath("['results'][1]['name']").value(CrmDealStageName.QUALIFIED.name()))
			.andExpect(jsonPath("['results'][1]['orderIndex']").value(2))
			.andExpect(jsonPath("['results'][3]['name']").value(CrmDealStageName.PROPOSAL_SENT.name()))
			.andExpect(jsonPath("['results'][4]['name']").value(CrmDealStageName.NEGOTIATION.name()));
	}

	@Test
	@DisplayName("Get deal stages without CRM role - Returns Forbidden")
	void getDealStages_WithoutCrmRole_ReturnsForbidden() throws Exception {
		authToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user2@gmail.com"), 1L);

		performGetRequest().andDo(print()).andExpect(status().isForbidden());
	}

	// POST /v1/crm/deal/stage — happy path

	@Test
	@DisplayName("Create deal stage with valid payload - Returns Created with OPEN type and bottom orderIndex")
	void createDealStage_ValidPayload_ReturnsCreated() throws Exception {
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
	@DisplayName("Create deal stage with two character name - Returns Created")
	void createDealStage_TwoCharacterName_ReturnsCreated() throws Exception {
		CrmDealStageCreateRequestDto dto = validPayload();
		dto.setName("QA");

		performPostRequest(dto).andDo(print())
			.andExpect(status().isCreated())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['name']").value("QA"));
	}

	@Test
	@DisplayName("Create deal stage without description - Returns Created with null description")
	void createDealStage_NoDescription_ReturnsCreated() throws Exception {
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
	@DisplayName("Create deal stage with existing open stages - Returns Created without tier limit")
	void createDealStage_ExistingOpenStages_ReturnsCreated() throws Exception {
		performPostRequest(validPayload()).andDo(print())
			.andExpect(status().isCreated())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL));
	}

	@Test
	@DisplayName("Create deal stage without color - Returns Bad Request")
	void createDealStage_NullColor_ReturnsBadRequest() throws Exception {
		CrmDealStageCreateRequestDto dto = validPayload();
		dto.setColor(null);

		performPostRequest(dto).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_DEAL_STAGE_COLOR_REQUIRED)));
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

	private ResultActions performDeleteRequest(Long id) throws Exception {
		return performRequest(delete(BASE_PATH + "/" + id).accept(MediaType.APPLICATION_JSON));
	}

	private ResultActions performReorderRequest(List<CrmDealStageReorderRequestDto> payload) throws Exception {
		return performRequest(post(BASE_PATH + "/reorder").contentType(MediaType.APPLICATION_JSON)
			.content(objectMapper.writeValueAsString(payload))
			.accept(MediaType.APPLICATION_JSON));
	}

	private CrmDealStageReorderRequestDto reorderEntry(Long id, Integer orderIndex) {
		CrmDealStageReorderRequestDto dto = new CrmDealStageReorderRequestDto();
		dto.setId(id);
		dto.setOrderIndex(orderIndex);
		return dto;
	}

	private Long stageIdByType(CrmDealStageType type) {
		return crmDealStageDao.findAllByIsDeletedFalseOrderByOrderIndexAsc()
			.stream()
			.filter(s -> s.getStageType() == type)
			.findFirst()
			.orElseThrow()
			.getId();
	}

	private List<Long> openStageIds() {
		return crmDealStageDao.findAllByIsDeletedFalseOrderByOrderIndexAsc()
			.stream()
			.filter(s -> s.getStageType() == CrmDealStageType.OPEN)
			.map(com.skapp.community.crmplanner.model.CrmDealStage::getId)
			.toList();
	}

	// DELETE /v1/crm/deal/stage/{id}

	@Test
	@DisplayName("Delete OPEN stage - Returns OK")
	void deleteDealStage_OpenStage_ReturnsOk() throws Exception {
		Long openId = openStageIds().get(0);

		performDeleteRequest(openId).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL));
	}

	@Test
	@DisplayName("Delete INITIAL stage - Returns Bad Request")
	void deleteDealStage_InitialStage_ReturnsBadRequest() throws Exception {
		Long initialId = stageIdByType(CrmDealStageType.INITIAL);

		performDeleteRequest(initialId).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_CANNOT_DELETE_TERMINAL_STAGE)));
	}

	@Test
	@DisplayName("Delete WON stage - Returns Bad Request")
	void deleteDealStage_WonStage_ReturnsBadRequest() throws Exception {
		Long wonId = stageIdByType(CrmDealStageType.WON);

		performDeleteRequest(wonId).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_CANNOT_DELETE_TERMINAL_STAGE)));
	}

	@Test
	@DisplayName("Delete LOST stage - Returns Bad Request")
	void deleteDealStage_LostStage_ReturnsBadRequest() throws Exception {
		Long lostId = stageIdByType(CrmDealStageType.LOST);

		performDeleteRequest(lostId).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_CANNOT_DELETE_TERMINAL_STAGE)));
	}

	@Test
	@DisplayName("Delete non-existent stage - Returns Bad Request")
	void deleteDealStage_NonExistentId_ReturnsBadRequest() throws Exception {
		performDeleteRequest(99999L).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_DEAL_STAGE_NOT_FOUND)));
	}

	@Test
	@DisplayName("Delete stage without CRM admin role - Returns Forbidden")
	void deleteDealStage_WithoutAdminRole_ReturnsForbidden() throws Exception {
		authToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user2@gmail.com"), 1L);
		Long openId = openStageIds().get(0);

		performDeleteRequest(openId).andDo(print()).andExpect(status().isForbidden());
	}

	// POST /v1/crm/deal/stage/reorder

	@Test
	@DisplayName("Reorder OPEN stages keeping INITIAL fixed - Returns OK and preserves stage types")
	void reorderDealStages_ValidOpenStages_ReturnsOkAndPreservesTypes() throws Exception {
		Long initialId = stageIdByType(CrmDealStageType.INITIAL);
		Integer initialOrderIndex = crmDealStageDao.findById(initialId).orElseThrow().getOrderIndex();
		List<Long> ids = openStageIds();

		List<CrmDealStageReorderRequestDto> payload = List.of(reorderEntry(initialId, initialOrderIndex),
				reorderEntry(ids.get(0), 4), reorderEntry(ids.get(1), 2), reorderEntry(ids.get(2), 3),
				reorderEntry(ids.get(3), 5));

		performReorderRequest(payload).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL));

		assertEquals(CrmDealStageType.INITIAL, crmDealStageDao.findById(initialId).orElseThrow().getStageType());
		assertEquals(initialOrderIndex, crmDealStageDao.findById(initialId).orElseThrow().getOrderIndex());
		assertEquals(CrmDealStageType.OPEN, crmDealStageDao.findById(ids.get(0)).orElseThrow().getStageType());
		assertEquals(CrmDealStageType.OPEN, crmDealStageDao.findById(ids.get(1)).orElseThrow().getStageType());
		assertEquals(CrmDealStageType.OPEN, crmDealStageDao.findById(ids.get(2)).orElseThrow().getStageType());
		assertEquals(CrmDealStageType.OPEN, crmDealStageDao.findById(ids.get(3)).orElseThrow().getStageType());
	}

	@Test
	@DisplayName("Reorder that moves INITIAL stage - Returns Bad Request")
	void reorderDealStages_MovesInitialStage_ReturnsBadRequest() throws Exception {
		Long initialId = stageIdByType(CrmDealStageType.INITIAL);
		List<Long> ids = openStageIds();

		List<CrmDealStageReorderRequestDto> payload = List.of(reorderEntry(initialId, 5), reorderEntry(ids.get(0), 1),
				reorderEntry(ids.get(1), 2), reorderEntry(ids.get(2), 3), reorderEntry(ids.get(3), 4));

		performReorderRequest(payload).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_CANNOT_REORDER_INITIAL_STAGE)));
	}

	@Test
	@DisplayName("Reorder with empty list - Returns Bad Request")
	void reorderDealStages_EmptyList_ReturnsBadRequest() throws Exception {
		performReorderRequest(List.of()).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_DEAL_STAGE_REORDER_INVALID_REQUEST)));
	}

	@Test
	@DisplayName("Reorder with null ID entry - Returns Bad Request")
	void reorderDealStages_NullId_ReturnsBadRequest() throws Exception {
		List<CrmDealStageReorderRequestDto> payload = List.of(reorderEntry(null, 1), reorderEntry(2L, 2));

		performReorderRequest(payload).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_DEAL_STAGE_REORDER_INVALID_REQUEST)));
	}

	@Test
	@DisplayName("Reorder with null orderIndex entry - Returns Bad Request")
	void reorderDealStages_NullOrderIndex_ReturnsBadRequest() throws Exception {
		List<Long> ids = openStageIds();
		List<CrmDealStageReorderRequestDto> payload = List.of(reorderEntry(ids.get(0), null),
				reorderEntry(ids.get(1), 2));

		performReorderRequest(payload).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_DEAL_STAGE_REORDER_INVALID_REQUEST)));
	}

	@Test
	@DisplayName("Reorder with duplicate stage IDs - Returns Bad Request")
	void reorderDealStages_DuplicateIds_ReturnsBadRequest() throws Exception {
		Long id = openStageIds().get(0);
		List<CrmDealStageReorderRequestDto> payload = List.of(reorderEntry(id, 1), reorderEntry(id, 2));

		performReorderRequest(payload).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_DEAL_STAGE_DUPLICATE_VALUES)));
	}

	@Test
	@DisplayName("Reorder with duplicate order indexes - Returns Bad Request")
	void reorderDealStages_DuplicateOrderIndexes_ReturnsBadRequest() throws Exception {
		List<Long> ids = openStageIds();
		List<CrmDealStageReorderRequestDto> payload = List.of(reorderEntry(ids.get(0), 1), reorderEntry(ids.get(1), 1));

		performReorderRequest(payload).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_DEAL_STAGE_DUPLICATE_VALUES)));
	}

	@Test
	@DisplayName("Reorder with WON stage included - Returns Bad Request")
	void reorderDealStages_IncludesWonStage_ReturnsBadRequest() throws Exception {
		Long wonId = stageIdByType(CrmDealStageType.WON);
		Long openId = openStageIds().get(0);
		List<CrmDealStageReorderRequestDto> payload = List.of(reorderEntry(openId, 1), reorderEntry(wonId, 2));

		performReorderRequest(payload).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_DEAL_STAGE_REORDER_INVALID_REQUEST)));
	}

	@Test
	@DisplayName("Reorder with LOST stage included - Returns Bad Request")
	void reorderDealStages_IncludesLostStage_ReturnsBadRequest() throws Exception {
		Long lostId = stageIdByType(CrmDealStageType.LOST);
		Long openId = openStageIds().get(0);
		List<CrmDealStageReorderRequestDto> payload = List.of(reorderEntry(openId, 1), reorderEntry(lostId, 2));

		performReorderRequest(payload).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_DEAL_STAGE_REORDER_INVALID_REQUEST)));
	}

	@Test
	@DisplayName("Reorder with non-existent stage ID - Returns Bad Request")
	void reorderDealStages_NonExistentStageId_ReturnsBadRequest() throws Exception {
		List<CrmDealStageReorderRequestDto> payload = List.of(reorderEntry(99999L, 1),
				reorderEntry(openStageIds().get(0), 2));

		performReorderRequest(payload).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_DEAL_STAGE_REORDER_INVALID_REQUEST)));
	}

	@Test
	@DisplayName("Reorder without CRM admin role - Returns Forbidden")
	void reorderDealStages_WithoutAdminRole_ReturnsForbidden() throws Exception {
		authToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user2@gmail.com"), 1L);
		List<Long> ids = openStageIds();
		List<CrmDealStageReorderRequestDto> payload = List.of(reorderEntry(ids.get(0), 1));

		performReorderRequest(payload).andDo(print()).andExpect(status().isForbidden());
	}

}
