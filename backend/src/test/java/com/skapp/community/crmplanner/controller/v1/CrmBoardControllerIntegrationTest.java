package com.skapp.community.crmplanner.controller.v1;

import com.skapp.TestSkappApplication;
import com.skapp.community.common.service.JwtService;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.community.crmplanner.constant.CrmMessageConstant;
import com.skapp.community.crmplanner.model.CrmCompany;
import com.skapp.community.crmplanner.model.CrmContact;
import com.skapp.community.crmplanner.model.CrmDeal;
import com.skapp.community.crmplanner.model.CrmDealStage;
import com.skapp.community.crmplanner.model.CrmTask;
import com.skapp.community.crmplanner.model.CrmTaskType;
import com.skapp.community.crmplanner.payload.request.CrmDealUpdateStageRequestDto;
import com.skapp.community.crmplanner.payload.request.board.CrmDealsByStagesRequestDto;
import com.skapp.community.crmplanner.repository.CrmCompanyDao;
import com.skapp.community.crmplanner.repository.CrmContactDao;
import com.skapp.community.crmplanner.repository.CrmDealDao;
import com.skapp.community.crmplanner.repository.CrmDealStageDao;
import com.skapp.community.crmplanner.repository.CrmTaskDao;
import com.skapp.community.crmplanner.repository.CrmTaskTypeDao;
import com.skapp.community.crmplanner.type.CrmDealPriority;
import com.skapp.community.crmplanner.type.CrmDealStageType;
import com.skapp.community.crmplanner.type.CrmTaskPriority;
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

import java.util.List;

import static com.skapp.support.TestConstants.MESSAGE_PATH;
import static com.skapp.support.TestConstants.RESULTS_0_PATH;
import static com.skapp.support.TestConstants.STATUS_PATH;
import static com.skapp.support.TestConstants.STATUS_SUCCESSFUL;
import static com.skapp.support.TestConstants.STATUS_UNSUCCESSFUL;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

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

	private final CrmTaskDao crmTaskDao;

	private final CrmTaskTypeDao crmTaskTypeDao;

	private String adminToken;

	private String repToken;

	private String otherRepToken;

	private CrmDealStage stage1;

	private CrmDealStage stage2;

	private CrmCompany company;

	private CrmContact contact;

	private CrmTaskType taskType;

	private CrmTaskType emailTaskType;

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

		emailTaskType = new CrmTaskType();
		emailTaskType.setName("Email");
		emailTaskType.setOrderIndex(1);
		emailTaskType = crmTaskTypeDao.save(emailTaskType);

		taskType = new CrmTaskType();
		taskType.setName("Call");
		taskType.setOrderIndex(2);
		taskType = crmTaskTypeDao.save(taskType);
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
	@DisplayName("Move deal to non-empty stage without neighbors - placed at top of stage")
	void moveDeal_NoNeighbors_StageHasDeals_PlacedAtTop() throws Exception {
		CrmDeal dealToMove = createDeal("Deal to Move", stage1, "a0", 1L);
		CrmDeal existingDeal = createDeal("Existing Deal", stage2, "a0", 1L);

		CrmDealUpdateStageRequestDto request = new CrmDealUpdateStageRequestDto();
		request.setDealId(dealToMove.getId());
		request.setNewStageId(stage2.getId());

		performPatchRequest(request, adminToken).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL));

		CrmDeal updatedDeal = crmDealDao.findById(dealToMove.getId()).orElseThrow();
		assertEquals(stage2.getId(), updatedDeal.getStage().getId());
		// Should be positioned at the top of the stage, before the existing deal
		assertTrue(updatedDeal.getOrderIndex().compareTo(existingDeal.getOrderIndex()) < 0);
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

	@Test
	@DisplayName("Deals grouped by stage - deal with no tasks returns priority and taskCount zero")
	void getDealsByStages_DealWithNoTasks_ReturnsPriorityAndZeroTaskCount() throws Exception {
		createDeal("No Task Deal", stage1, "a0", 1L);

		CrmDealsByStagesRequestDto request = new CrmDealsByStagesRequestDto();
		request.setStageIds(List.of(stage1.getId()));

		performPostDealsByStagesRequest(request, adminToken).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['deals'][0]['priority']").value(CrmDealPriority.MEDIUM.name()))
			.andExpect(jsonPath(RESULTS_0_PATH + "['deals'][0]['taskCount']").value(0));
	}

	@Test
	@DisplayName("Deals grouped by stage - deal with tasks returns correct taskCount")
	void getDealsByStages_DealWithTasks_ReturnsCorrectTaskCount() throws Exception {
		CrmDeal deal = createDeal("Tasked Deal", stage1, "a0", 1L);
		createTask(deal);
		createTask(deal);

		CrmDealsByStagesRequestDto request = new CrmDealsByStagesRequestDto();
		request.setStageIds(List.of(stage1.getId()));

		performPostDealsByStagesRequest(request, adminToken).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['deals'][0]['taskCount']").value(2));
	}

	@Test
	@DisplayName("Deals grouped by stage - completed task is excluded from taskCount")
	void getDealsByStages_CompletedTaskExcludedFromTaskCount() throws Exception {
		CrmDeal deal = createDeal("Deal With Mixed Tasks", stage1, "a0", 1L);
		createTask(deal);
		createCompletedTask(deal);

		CrmDealsByStagesRequestDto request = new CrmDealsByStagesRequestDto();
		request.setStageIds(List.of(stage1.getId()));

		performPostDealsByStagesRequest(request, adminToken).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['deals'][0]['taskCount']").value(1));
	}

	@Test
	@DisplayName("Deals grouped by stage - soft-deleted task is excluded from taskCount")
	void getDealsByStages_DeletedTaskExcludedFromTaskCount() throws Exception {
		CrmDeal deal = createDeal("Deal With Deleted Task", stage1, "a0", 1L);
		createTask(deal);
		createDeletedTask(deal);

		CrmDealsByStagesRequestDto request = new CrmDealsByStagesRequestDto();
		request.setStageIds(List.of(stage1.getId()));

		performPostDealsByStagesRequest(request, adminToken).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['deals'][0]['taskCount']").value(1));
	}

	@Test
	@DisplayName("Deals grouped by multiple stages - taskCounts computed independently per stage")
	void getDealsByStages_MultipleStages_TaskCountsComputedPerStage() throws Exception {
		CrmDeal dealInStage1 = createDeal("Stage1 Deal", stage1, "a0", 1L);
		createTask(dealInStage1);

		createDeal("Stage2 Deal", stage2, "a0", 1L);

		CrmDealsByStagesRequestDto request = new CrmDealsByStagesRequestDto();
		request.setStageIds(List.of(stage1.getId(), stage2.getId()));

		performPostDealsByStagesRequest(request, adminToken).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['deals'][0]['taskCount']").value(1))
			.andExpect(jsonPath("['results'][1]['deals'][0]['taskCount']").value(0));
	}

	@Test
	@DisplayName("Deals grouped by stage as Sales Representative - returns only deals owned by the representative")
	void getDealsByStages_SalesRep_ReturnsOnlyOwnDeals() throws Exception {
		// Deal owned by admin (employee 1) and deal owned by rep user2 (employee 2)
		createDeal("Admin Deal", stage1, "a0", 1L);
		createDeal("Rep Deal", stage1, "b0", 2L);

		CrmDealsByStagesRequestDto request = new CrmDealsByStagesRequestDto();
		request.setStageIds(List.of(stage1.getId()));

		performPostDealsByStagesRequest(request, repToken).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['totalCount']").value(1))
			.andExpect(jsonPath(RESULTS_0_PATH + "['deals'].length()").value(1))
			.andExpect(jsonPath(RESULTS_0_PATH + "['deals'][0]['name']").value("Rep Deal"));
	}

	@Test
	@DisplayName("Deals grouped by stage - search keyword matching deal ID returns matching deal")
	void getDealsByStages_SearchKeywordMatchesDealId_ReturnsMatchingDeal() throws Exception {
		CrmDeal deal = createDeal("Deal To Find By Id", stage1, "a0", 1L);
		createDeal("Unrelated Deal", stage1, "b0", 1L);

		CrmDealsByStagesRequestDto request = new CrmDealsByStagesRequestDto();
		request.setStageIds(List.of(stage1.getId()));
		request.setSearchKeyword(deal.getId().toString());

		performPostDealsByStagesRequest(request, adminToken).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['totalCount']").value(1))
			.andExpect(jsonPath(RESULTS_0_PATH + "['deals'].length()").value(1))
			.andExpect(jsonPath(RESULTS_0_PATH + "['deals'][0]['id']").value(deal.getId().intValue()));
	}

	@Test
	@DisplayName("Deals grouped by stage - search keyword matching a soft-deleted deal's ID returns no deals")
	void getDealsByStages_SearchKeywordMatchesSoftDeletedDealId_ReturnsNoDeals() throws Exception {
		CrmDeal deal = createDeal("Deleted Deal For Id Search", stage1, "a0", 1L);
		deal.setIsDeleted(true);
		crmDealDao.save(deal);

		CrmDealsByStagesRequestDto request = new CrmDealsByStagesRequestDto();
		request.setStageIds(List.of(stage1.getId()));
		request.setSearchKeyword(deal.getId().toString());

		performPostDealsByStagesRequest(request, adminToken).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['totalCount']").value(0))
			.andExpect(jsonPath(RESULTS_0_PATH + "['deals'].length()").value(0));
	}

	private ResultActions performPostDealsByStagesRequest(CrmDealsByStagesRequestDto dto, String token)
			throws Exception {
		return mvc.perform(post("/v1/crm/board/deals-grouped-by-stages").contentType(MediaType.APPLICATION_JSON)
			.content(objectMapper.writeValueAsString(dto))
			.accept(MediaType.APPLICATION_JSON)
			.with(SecurityTestUtils.bearerToken(token)));
	}

	@Test
	@DisplayName("Board init data - returns task types ordered by orderIndex")
	void getBoardInitData_ReturnsTaskTypes() throws Exception {
		mvc.perform(get("/v1/crm/board/init-data").accept(MediaType.APPLICATION_JSON)
			.with(SecurityTestUtils.bearerToken(repToken)))
			.andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['stages']").isArray())
			.andExpect(jsonPath(RESULTS_0_PATH + "['stages']").isNotEmpty())
			.andExpect(jsonPath(RESULTS_0_PATH + "['contacts']").isArray())
			.andExpect(jsonPath(RESULTS_0_PATH + "['contacts']").isNotEmpty())
			.andExpect(jsonPath(RESULTS_0_PATH + "['owners']").isArray())
			.andExpect(jsonPath(RESULTS_0_PATH + "['crmRoles']").isArray())
			.andExpect(jsonPath(RESULTS_0_PATH + "['taskTypes']").isArray())
			.andExpect(jsonPath(RESULTS_0_PATH + "['taskTypes'][0]['id']").value(emailTaskType.getId()))
			.andExpect(jsonPath(RESULTS_0_PATH + "['taskTypes'][0]['name']").value("Email"))
			.andExpect(jsonPath(RESULTS_0_PATH + "['taskTypes'][0]['orderIndex']").value(1))
			.andExpect(jsonPath(RESULTS_0_PATH + "['taskTypes'][1]['id']").value(taskType.getId()))
			.andExpect(jsonPath(RESULTS_0_PATH + "['taskTypes'][1]['name']").value("Call"))
			.andExpect(jsonPath(RESULTS_0_PATH + "['taskTypes'][1]['orderIndex']").value(2));
	}

	@Test
	@DisplayName("Board init data - without CRM role returns Forbidden")
	void getBoardInitData_WithoutCrmRole_ReturnsForbidden() throws Exception {
		String noCrmRoleToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user4@gmail.com"),
				1L);

		mvc.perform(get("/v1/crm/board/init-data").accept(MediaType.APPLICATION_JSON)
			.with(SecurityTestUtils.bearerToken(noCrmRoleToken))).andDo(print()).andExpect(status().isForbidden());
	}

	private CrmTask createTask(CrmDeal deal) {
		CrmTask task = new CrmTask();
		task.setName("Test Task");
		task.setType(taskType);
		task.setPriority(CrmTaskPriority.MEDIUM);
		task.setOwner(employeeDao.getReferenceById(1L));
		task.setDeal(deal);
		task.setIsDeleted(false);
		task.setIsCompleted(false);
		return crmTaskDao.save(task);
	}

	private CrmTask createCompletedTask(CrmDeal deal) {
		CrmTask task = new CrmTask();
		task.setName("Completed Task");
		task.setType(taskType);
		task.setPriority(CrmTaskPriority.MEDIUM);
		task.setOwner(employeeDao.getReferenceById(1L));
		task.setDeal(deal);
		task.setIsDeleted(false);
		task.setIsCompleted(true);
		return crmTaskDao.save(task);
	}

	private CrmTask createDeletedTask(CrmDeal deal) {
		CrmTask task = new CrmTask();
		task.setName("Deleted Task");
		task.setType(taskType);
		task.setPriority(CrmTaskPriority.MEDIUM);
		task.setOwner(employeeDao.getReferenceById(1L));
		task.setDeal(deal);
		task.setIsDeleted(true);
		task.setIsCompleted(false);
		return crmTaskDao.save(task);
	}

}
