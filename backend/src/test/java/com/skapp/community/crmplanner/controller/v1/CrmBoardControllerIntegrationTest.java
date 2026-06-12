package com.skapp.community.crmplanner.controller.v1;

import com.skapp.TestSkappApplication;
import com.skapp.community.common.service.JwtService;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.community.crmplanner.constant.CrmMessageConstant;
import com.skapp.community.crmplanner.model.CrmCompany;
import com.skapp.community.crmplanner.model.CrmContact;
import com.skapp.community.crmplanner.model.CrmDeal;
import com.skapp.community.crmplanner.model.CrmDealStage;
import com.skapp.community.crmplanner.payload.request.CrmDealUpdateStageRequestDto;
import com.skapp.community.crmplanner.repository.CrmCompanyDao;
import com.skapp.community.crmplanner.repository.CrmContactDao;
import com.skapp.community.crmplanner.repository.CrmDealDao;
import com.skapp.community.crmplanner.repository.CrmDealStageDao;
import com.skapp.community.crmplanner.type.CrmDealPriority;
import com.skapp.community.crmplanner.type.CrmDealStageType;
import com.skapp.community.common.type.Role;
import com.skapp.community.peopleplanner.repository.EmployeeDao;
import com.skapp.community.peopleplanner.repository.EmployeeRoleDao;
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
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.json.JsonMapper;

import static com.skapp.support.TestConstants.MESSAGE_PATH;
import static com.skapp.support.TestConstants.RESULTS_0_PATH;
import static com.skapp.support.TestConstants.STATUS_PATH;
import static com.skapp.support.TestConstants.STATUS_SUCCESSFUL;
import static com.skapp.support.TestConstants.STATUS_UNSUCCESSFUL;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = TestSkappApplication.class)
@AutoConfigureMockMvc
@Transactional
@RequiredArgsConstructor
@DisplayName("CRM Board Controller Integration Tests")
class CrmBoardControllerIntegrationTest {

	private static final String BASE_PATH = "/v1/crm/board/deal-move-between-stages";

	private final MockMvc mvc;

	private final JwtService jwtService;

	private final UserDetailsService userDetailsService;

	private final JsonMapper objectMapper;

	private final MessageUtil messageUtil;

	private final CrmCompanyDao crmCompanyDao;

	private final CrmContactDao crmContactDao;

	private final CrmDealStageDao crmDealStageDao;

	private final CrmDealDao crmDealDao;

	private final EmployeeDao employeeDao;

	private final EmployeeRoleDao employeeRoleDao;

	private String adminToken;

	private String repToken;

	private String otherRepToken;

	private CrmDealStage stage1;

	private CrmDealStage stage2;

	private CrmCompany company;

	private CrmContact contact;

	@BeforeEach
	void setup() {
		adminToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user1@gmail.com"), 1L);

		// Setup user2 as a sales representative
		employeeDao.findById(2L).orElseThrow().getEmployeeRole().setCrmRole(Role.CRM_SALES_REPRESENTATIVE);
		employeeRoleDao.flush();
		repToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user2@gmail.com"), 1L);

		// Setup user3 as a sales representative
		employeeDao.findById(3L).orElseThrow().getEmployeeRole().setCrmRole(Role.CRM_SALES_REPRESENTATIVE);
		employeeRoleDao.flush();
		otherRepToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user3@gmail.com"), 1L);

		stage1 = createStage("Stage 1", 1);
		stage2 = createStage("Stage 2", 2);

		company = new CrmCompany();
		company.setName("Board Test Company");
		crmCompanyDao.save(company);

		contact = new CrmContact();
		contact.setName("Board Test Contact");
		contact.setEmail("board.contact@example.com");
		contact.setCompany(company);
		contact.setOwner(employeeDao.getReferenceById(1L));
		crmContactDao.save(contact);
	}

	private ResultActions performPatchRequest(CrmDealUpdateStageRequestDto dto, String token) throws Exception {
		return mvc.perform(patch(BASE_PATH).contentType(MediaType.APPLICATION_JSON)
			.content(objectMapper.writeValueAsString(dto))
			.accept(MediaType.APPLICATION_JSON)
			.with(SecurityTestUtils.bearerToken(token)));
	}

	private CrmDealStage createStage(String name, int orderIndex) {
		CrmDealStage stage = new CrmDealStage();
		stage.setName(name);
		stage.setColor("#AABBCC");
		stage.setOrderIndex(orderIndex);
		stage.setStageType(CrmDealStageType.OPEN);
		return crmDealStageDao.save(stage);
	}

	private CrmDeal createDeal(String name, CrmDealStage stage, String orderIndex, Long ownerId) {
		CrmDeal deal = new CrmDeal();
		deal.setName(name);
		deal.setPriority(CrmDealPriority.MEDIUM);
		deal.setStage(stage);
		deal.setContact(contact);
		deal.setCompany(company);
		deal.setOwner(employeeDao.getReferenceById(ownerId));
		deal.setOrderIndex(orderIndex);
		return crmDealDao.save(deal);
	}

	@Test
	@DisplayName("Move deal to empty stage without neighbors - orderIndex becomes a0")
	void moveDeal_ToEmptyStage_NoNeighbors_OrderIndexIsA0() throws Exception {
		// stage2 has no deals (created fresh in @BeforeEach)
		CrmDeal dealToMove = createDeal("Deal to Move", stage1, "a0", 1L);

		CrmDealUpdateStageRequestDto request = new CrmDealUpdateStageRequestDto();
		request.setDealId(dealToMove.getId());
		request.setNewStageId(stage2.getId());

		performPatchRequest(request, adminToken).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL));

		CrmDeal updatedDeal = crmDealDao.findById(dealToMove.getId()).orElseThrow();
		assertEquals(stage2.getId(), updatedDeal.getStage().getId());
		assertEquals("a0", updatedDeal.getOrderIndex());
	}

	@Test
	@DisplayName("Move deal to non-empty stage without neighbors - returns neighbours-required error")
	void moveDeal_NoNeighbors_StageHasDeals_ReturnsError() throws Exception {
		CrmDeal dealToMove = createDeal("Deal to Move", stage1, "a0", 1L);
		createDeal("Existing Deal", stage2, "a0", 1L);

		CrmDealUpdateStageRequestDto request = new CrmDealUpdateStageRequestDto();
		request.setDealId(dealToMove.getId());
		request.setNewStageId(stage2.getId());

		performPatchRequest(request, adminToken).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_DEAL_ORDER_NEIGHBOURS_REQUIRED)));
	}

	@Test
	@DisplayName("Move deal to another stage at the beginning - before nextDealId")
	void moveDeal_WithNextDeal_PlacedAtBeginning() throws Exception {
		CrmDeal dealToMove = createDeal("Deal to Move", stage1, "a0", 1L);
		CrmDeal existingDeal = createDeal("Existing Deal", stage2, "a0", 1L);

		CrmDealUpdateStageRequestDto request = new CrmDealUpdateStageRequestDto();
		request.setDealId(dealToMove.getId());
		request.setNewStageId(stage2.getId());
		request.setNextDealId(existingDeal.getId());

		performPatchRequest(request, adminToken).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL));

		CrmDeal updatedDeal = crmDealDao.findById(dealToMove.getId()).orElseThrow();
		assertEquals(stage2.getId(), updatedDeal.getStage().getId());
		// Should be positioned before existingDeal (which has orderIndex "a0")
		assertTrue(updatedDeal.getOrderIndex().compareTo(existingDeal.getOrderIndex()) < 0);
	}

	@Test
	@DisplayName("Move deal to another stage at the end - after previousDealId")
	void moveDeal_WithPreviousDeal_PlacedAtEnd() throws Exception {
		CrmDeal dealToMove = createDeal("Deal to Move", stage1, "a0", 1L);
		CrmDeal existingDeal = createDeal("Existing Deal", stage2, "a0", 1L);

		CrmDealUpdateStageRequestDto request = new CrmDealUpdateStageRequestDto();
		request.setDealId(dealToMove.getId());
		request.setNewStageId(stage2.getId());
		request.setPreviousDealId(existingDeal.getId());

		performPatchRequest(request, adminToken).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL));

		CrmDeal updatedDeal = crmDealDao.findById(dealToMove.getId()).orElseThrow();
		assertEquals(stage2.getId(), updatedDeal.getStage().getId());
		// Should be positioned after existingDeal (which has orderIndex "a0")
		assertTrue(updatedDeal.getOrderIndex().compareTo(existingDeal.getOrderIndex()) > 0);
	}

	@Test
	@DisplayName("Move deal to another stage in-between two deals")
	void moveDeal_WithBothNeighbors_PlacedInBetween() throws Exception {
		CrmDeal dealToMove = createDeal("Deal to Move", stage1, "a0", 1L);
		CrmDeal firstDeal = createDeal("First Deal", stage2, "a0", 1L);
		CrmDeal secondDeal = createDeal("Second Deal", stage2, "a2", 1L);

		CrmDealUpdateStageRequestDto request = new CrmDealUpdateStageRequestDto();
		request.setDealId(dealToMove.getId());
		request.setNewStageId(stage2.getId());
		request.setPreviousDealId(firstDeal.getId());
		request.setNextDealId(secondDeal.getId());

		performPatchRequest(request, adminToken).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL));

		CrmDeal updatedDeal = crmDealDao.findById(dealToMove.getId()).orElseThrow();
		assertEquals(stage2.getId(), updatedDeal.getStage().getId());
		// orderIndex should be strictly between firstDeal ("a0") and secondDeal ("a2")
		assertTrue(updatedDeal.getOrderIndex().compareTo(firstDeal.getOrderIndex()) > 0);
		assertTrue(updatedDeal.getOrderIndex().compareTo(secondDeal.getOrderIndex()) < 0);
	}

	@Test
	@DisplayName("Move deal with neighbor belonging to a different stage - returns neighbour-stage-mismatch error")
	void moveDeal_NeighborStageMismatch_ReturnsBadRequest() throws Exception {
		CrmDeal dealToMove = createDeal("Deal to Move", stage1, "a0", 1L);
		// Belongs to stage1, but we are moving to stage2
		CrmDeal otherDeal = createDeal("Other Deal", stage1, "a1", 1L);

		CrmDealUpdateStageRequestDto request = new CrmDealUpdateStageRequestDto();
		request.setDealId(dealToMove.getId());
		request.setNewStageId(stage2.getId());
		request.setPreviousDealId(otherDeal.getId());

		performPatchRequest(request, adminToken).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_DEAL_NEIGHBOUR_STAGE_MISMATCH)));
	}

	@Test
	@DisplayName("Move deal using itself as neighbor - returns invalid-neighbour error")
	void moveDeal_SelfAsNeighbor_ReturnsBadRequest() throws Exception {
		CrmDeal dealToMove = createDeal("Deal to Move", stage1, "a0", 1L);

		CrmDealUpdateStageRequestDto request = new CrmDealUpdateStageRequestDto();
		request.setDealId(dealToMove.getId());
		request.setNewStageId(stage2.getId());
		request.setPreviousDealId(dealToMove.getId());

		performPatchRequest(request, adminToken).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_DEAL_INVALID_NEIGHBOUR)));
	}

	@Test
	@DisplayName("Move deal with edit restriction for Sales Representative - returns edit-denied error")
	void moveDeal_EditRestricted_ReturnsBadRequest() throws Exception {
		// Deal owned by employee 1 (admin), but user3 (other rep) tries to move it
		CrmDeal dealToMove = createDeal("Deal to Move", stage1, "a0", 1L);

		CrmDealUpdateStageRequestDto request = new CrmDealUpdateStageRequestDto();
		request.setDealId(dealToMove.getId());
		request.setNewStageId(stage2.getId());

		performPatchRequest(request, otherRepToken).andDo(print())
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
				.value(messageUtil.getMessage(CrmMessageConstant.CRM_ERROR_DEAL_EDIT_DENIED)));
	}

	@Test
	@DisplayName("Sales Representative moves their own deal - returns OK")
	void moveDeal_RepMovesOwnDeal_ReturnsOk() throws Exception {
		// Deal owned by employee 2, and user2 (repToken) moves it
		CrmDeal dealToMove = createDeal("Deal to Move", stage1, "a0", 2L);

		CrmDealUpdateStageRequestDto request = new CrmDealUpdateStageRequestDto();
		request.setDealId(dealToMove.getId());
		request.setNewStageId(stage2.getId());

		performPatchRequest(request, repToken).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL));
	}

}
