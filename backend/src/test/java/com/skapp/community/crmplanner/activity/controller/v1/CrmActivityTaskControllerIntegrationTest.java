package com.skapp.community.crmplanner.activity.controller.v1;

import com.skapp.TestSkappApplication;
import com.skapp.community.common.service.JwtService;
import com.skapp.community.common.type.Role;
import com.skapp.community.crmplanner.model.CrmActivityTask;
import com.skapp.community.crmplanner.model.CrmCompany;
import com.skapp.community.crmplanner.model.CrmContact;
import com.skapp.community.crmplanner.model.CrmDeal;
import com.skapp.community.crmplanner.model.CrmDealStage;
import com.skapp.community.crmplanner.repository.CrmActivityTaskDao;
import com.skapp.community.crmplanner.repository.CrmCompanyDao;
import com.skapp.community.crmplanner.repository.CrmContactDao;
import com.skapp.community.crmplanner.repository.CrmDealDao;
import com.skapp.community.crmplanner.repository.CrmDealStageDao;
import com.skapp.community.crmplanner.type.CrmActivityTaskPriority;
import com.skapp.community.crmplanner.type.CrmDealPriority;
import com.skapp.community.crmplanner.type.CrmDealStageType;
import com.skapp.community.leaveplanner.type.ManagerType;
import com.skapp.community.peopleplanner.model.EmployeeManager;
import com.skapp.community.peopleplanner.repository.EmployeeDao;
import com.skapp.community.peopleplanner.repository.EmployeeManagerDao;
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
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

import static com.skapp.support.TestConstants.RESULTS_0_PATH;
import static com.skapp.support.TestConstants.STATUS_PATH;
import static com.skapp.support.TestConstants.STATUS_SUCCESSFUL;
import static com.skapp.support.TestConstants.STATUS_UNSUCCESSFUL;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = TestSkappApplication.class)
@AutoConfigureMockMvc
@Transactional
@RequiredArgsConstructor
@DisplayName("CRM Activity Task Controller Integration Tests")
class CrmActivityTaskControllerIntegrationTest {

	private static final String FEED_PATH = "/v1/crm/activities";

	private static final String COMPLETE_PATH = "/v1/crm/activities/tasks/{id}/complete";

	private static final String TASK_PATH = "/v1/crm/activities/tasks/{id}";

	private static final String RELATED_PATH = "/v1/crm/activities/tasks/{id}/related";

	private static final String TIMEZONE_HEADER = "X-Timezone";

	private static final String COMPLETED_BODY = "{\"isCompleted\":true}";

	private static final String REOPENED_BODY = "{\"isCompleted\":false}";

	private final MockMvc mvc;

	private final JwtService jwtService;

	private final UserDetailsService userDetailsService;

	private final CrmActivityTaskDao crmActivityTaskDao;

	private final EmployeeDao employeeDao;

	private final EmployeeRoleDao employeeRoleDao;

	private final EmployeeManagerDao employeeManagerDao;

	private final CrmCompanyDao crmCompanyDao;

	private final CrmContactDao crmContactDao;

	private final CrmDealDao crmDealDao;

	private final CrmDealStageDao crmDealStageDao;

	private String authToken;

	private Instant now;

	@BeforeEach
	void setup() {
		authToken = tokenFor("user1@gmail.com");
		now = Instant.now().truncatedTo(ChronoUnit.SECONDS);
	}

	private String tokenFor(String email) {
		return jwtService.generateAccessToken(userDetailsService.loadUserByUsername(email), 1L);
	}

	private ResultActions performRequest(MockHttpServletRequestBuilder request) throws Exception {
		return mvc.perform(request.header(TIMEZONE_HEADER, "UTC")
			.accept(MediaType.APPLICATION_JSON)
			.with(SecurityTestUtils.bearerToken(authToken)));
	}

	private ResultActions performComplete(Long id, String body) throws Exception {
		return performRequest(patch(COMPLETE_PATH, id).contentType(MediaType.APPLICATION_JSON).content(body))
			.andDo(print());
	}

	private void setCrmRole(long employeeId, Role role) {
		employeeDao.findById(employeeId).orElseThrow().getEmployeeRole().setCrmRole(role);
		employeeRoleDao.flush();
	}

	private void loginAs(long employeeId, String email, Role role) {
		setCrmRole(employeeId, role);
		authToken = tokenFor(email);
	}

	private void addPrimaryReport(long employeeId, long managerId) {
		EmployeeManager primary = new EmployeeManager();
		primary.setEmployee(employeeDao.getReferenceById(employeeId));
		primary.setManager(employeeDao.getReferenceById(managerId));
		primary.setIsPrimaryManager(true);
		primary.setManagerType(ManagerType.PRIMARY);
		employeeManagerDao.save(primary);
		employeeManagerDao.flush();
	}

	private CrmActivityTask savedTask(String name, long ownerId) {
		CrmActivityTask task = new CrmActivityTask();
		task.setName(name);
		task.setDueAt(now.plus(2, ChronoUnit.DAYS));
		task.setPriority(CrmActivityTaskPriority.MEDIUM);
		task.setOwner(employeeDao.getReferenceById(ownerId));
		return crmActivityTaskDao.save(task);
	}

	private CrmActivityTask reloaded(Long id) {
		crmActivityTaskDao.flush();
		return crmActivityTaskDao.findById(id).orElseThrow();
	}

	@Test
	@DisplayName("Complete task as owner - Sets completedAt and returns the updated feed row")
	void completeTask_AsOwner_SetsCompletedAt() throws Exception {
		setCrmRole(2L, Role.CRM_SALES_REPRESENTATIVE);
		CrmActivityTask task = savedTask("Owner completes", 2L);
		authToken = tokenFor("user2@gmail.com");

		performComplete(task.getId(), COMPLETED_BODY).andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['id']").value(task.getId()))
			.andExpect(jsonPath(RESULTS_0_PATH + "['type']").value("TASK"))
			.andExpect(jsonPath(RESULTS_0_PATH + "['isCompleted']").value(true))
			.andExpect(jsonPath(RESULTS_0_PATH + "['completedAt']").isNotEmpty())
			.andExpect(jsonPath(RESULTS_0_PATH + "['canComplete']").value(true))
			.andExpect(jsonPath(RESULTS_0_PATH + "['owner']['id']").value(2));

		CrmActivityTask saved = reloaded(task.getId());
		assertTrue(saved.getIsCompleted());
		assertNotNull(saved.getCompletedAt());
	}

	@Test
	@DisplayName("Reopen task as owner - Clears completedAt")
	void completeTask_ReopenAsOwner_ClearsCompletedAt() throws Exception {
		CrmActivityTask task = savedTask("Owner reopens", 1L);
		performComplete(task.getId(), COMPLETED_BODY).andExpect(status().isOk());

		performComplete(task.getId(), REOPENED_BODY).andExpect(status().isOk())
			.andExpect(jsonPath(RESULTS_0_PATH + "['isCompleted']").value(false))
			.andExpect(jsonPath(RESULTS_0_PATH + "['completedAt']").isEmpty());

		CrmActivityTask saved = reloaded(task.getId());
		assertFalse(saved.getIsCompleted());
		assertNull(saved.getCompletedAt());
	}

	@Test
	@DisplayName("Complete task as Sales Manager for a task in scope - Succeeds")
	void completeTask_AsManagerInScope_Succeeds() throws Exception {
		setCrmRole(5L, Role.CRM_SALES_REPRESENTATIVE);
		addPrimaryReport(5L, 3L);
		CrmActivityTask task = savedTask("Manager completes report task", 5L);
		loginAs(3L, "user3@gmail.com", Role.CRM_SALES_MANAGER);

		performComplete(task.getId(), COMPLETED_BODY).andExpect(status().isOk())
			.andExpect(jsonPath(RESULTS_0_PATH + "['isCompleted']").value(true));
	}

	@Test
	@DisplayName("Complete task as Sales Manager for a task outside scope - Returns forbidden")
	void completeTask_AsManagerOutOfScope_ReturnsForbidden() throws Exception {
		CrmActivityTask task = savedTask("Outside manager scope", 1L);
		loginAs(3L, "user3@gmail.com", Role.CRM_SALES_MANAGER);

		performComplete(task.getId(), COMPLETED_BODY).andExpect(status().isForbidden())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL));

		assertFalse(reloaded(task.getId()).getIsCompleted());
	}

	@Test
	@DisplayName("Complete task as Sales Representative on someone else's task - Returns forbidden")
	void completeTask_AsRepresentativeOnOthersTask_ReturnsForbidden() throws Exception {
		CrmActivityTask task = savedTask("Someone else's task", 1L);
		loginAs(2L, "user2@gmail.com", Role.CRM_SALES_REPRESENTATIVE);

		performComplete(task.getId(), COMPLETED_BODY).andExpect(status().isForbidden());

		assertFalse(reloaded(task.getId()).getIsCompleted());
	}

	@Test
	@DisplayName("Complete task as CRM Admin on any task - Succeeds")
	void completeTask_AsAdmin_Succeeds() throws Exception {
		setCrmRole(4L, Role.CRM_SALES_REPRESENTATIVE);
		CrmActivityTask task = savedTask("Admin completes any task", 4L);

		performComplete(task.getId(), COMPLETED_BODY).andExpect(status().isOk())
			.andExpect(jsonPath(RESULTS_0_PATH + "['isCompleted']").value(true));
	}

	@Test
	@DisplayName("Complete a missing task - Returns not found")
	void completeTask_MissingTask_ReturnsNotFound() throws Exception {
		performComplete(999_999L, COMPLETED_BODY).andExpect(status().isNotFound())
			.andExpect(jsonPath(RESULTS_0_PATH + "['messageKey']").value("CRM_ERROR_ACTIVITY_TASK_NOT_FOUND"));
	}

	@Test
	@DisplayName("Complete a deleted task - Returns not found")
	void completeTask_DeletedTask_ReturnsNotFound() throws Exception {
		CrmActivityTask task = savedTask("Deleted task", 1L);
		task.setIsDeleted(true);
		crmActivityTaskDao.flush();

		performComplete(task.getId(), COMPLETED_BODY).andExpect(status().isNotFound());
	}

	@Test
	@DisplayName("Complete task without isCompleted - Returns status required error")
	void completeTask_WithoutStatus_ReturnsBadRequest() throws Exception {
		CrmActivityTask task = savedTask("No status task", 1L);

		performComplete(task.getId(), "{}").andExpect(status().isBadRequest())
			.andExpect(jsonPath(RESULTS_0_PATH + "['messageKey']").value("CRM_ERROR_ACTIVITY_TASK_STATUS_REQUIRED"));
	}

	@Test
	@DisplayName("Complete a task due in the future - Moves it to By month in the feed")
	void completeTask_ThenFeed_MovesTaskToByMonth() throws Exception {
		CrmActivityTask task = savedTask("Moves to history", 1L);

		performRequest(get(FEED_PATH).param("search", "moves to history")).andExpect(status().isOk())
			.andExpect(jsonPath(RESULTS_0_PATH + "['upcoming'].length()").value(1))
			.andExpect(jsonPath(RESULTS_0_PATH + "['byMonth']['items'].length()").value(0));

		performComplete(task.getId(), COMPLETED_BODY).andExpect(status().isOk());

		performRequest(get(FEED_PATH).param("search", "moves to history")).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(RESULTS_0_PATH + "['upcoming'].length()").value(0))
			.andExpect(jsonPath(RESULTS_0_PATH + "['byMonth']['items'].length()").value(1))
			.andExpect(jsonPath(RESULTS_0_PATH + "['byMonth']['items'][0]['isCompleted']").value(true));
	}

	private ResultActions performEdit(Long id, String body) throws Exception {
		return performRequest(patch(TASK_PATH, id).contentType(MediaType.APPLICATION_JSON).content(body))
			.andDo(print());
	}

	private CrmContact savedContact(String name, CrmCompany company) {
		CrmContact contact = new CrmContact();
		contact.setName(name);
		contact.setEmail(name.replace(' ', '.').toLowerCase() + "@example.com");
		contact.setOwner(employeeDao.getReferenceById(1L));
		contact.setCompany(company);
		return crmContactDao.save(contact);
	}

	private CrmDeal savedDeal(String name, CrmContact contact) {
		CrmDealStage stage = new CrmDealStage();
		stage.setName("Task Panel Stage");
		stage.setColor("#000000");
		stage.setOrderIndex(1);
		stage.setStageType(CrmDealStageType.OPEN);
		stage = crmDealStageDao.save(stage);

		CrmDeal deal = new CrmDeal();
		deal.setName(name);
		deal.setPriority(CrmDealPriority.MEDIUM);
		deal.setStage(stage);
		deal.setContact(contact);
		deal.setCompany(contact.getCompany());
		deal.setOwner(employeeDao.getReferenceById(1L));
		deal.setOrderIndex("a0");
		return crmDealDao.save(deal);
	}

	@Test
	@DisplayName("Get task by ID as owner - Returns the task details")
	void getTaskById_AsOwner_ReturnsTask() throws Exception {
		CrmCompany company = new CrmCompany();
		company.setName("Panel Company");
		company = crmCompanyDao.save(company);
		CrmContact contact = savedContact("Panel Contact", company);
		CrmActivityTask task = savedTask("Panel task", 1L);
		task.setContact(contact);
		task.setCompany(company);
		task.setNotes("Panel notes");
		crmActivityTaskDao.flush();

		performRequest(get(TASK_PATH, task.getId())).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['id']").value(task.getId()))
			.andExpect(jsonPath(RESULTS_0_PATH + "['name']").value("Panel task"))
			.andExpect(jsonPath(RESULTS_0_PATH + "['priority']").value("MEDIUM"))
			.andExpect(jsonPath(RESULTS_0_PATH + "['isCompleted']").value(false))
			.andExpect(jsonPath(RESULTS_0_PATH + "['notes']").value("Panel notes"))
			.andExpect(jsonPath(RESULTS_0_PATH + "['ownerId']").value(1))
			.andExpect(jsonPath(RESULTS_0_PATH + "['contactId']").value(contact.getId()))
			.andExpect(jsonPath(RESULTS_0_PATH + "['companyId']").value(company.getId()))
			.andExpect(jsonPath(RESULTS_0_PATH + "['dueAt']").isNotEmpty());
	}

	@Test
	@DisplayName("Get task by ID as Sales Manager for a task in scope - Returns the task")
	void getTaskById_AsManagerInScope_ReturnsTask() throws Exception {
		setCrmRole(5L, Role.CRM_SALES_REPRESENTATIVE);
		addPrimaryReport(5L, 3L);
		CrmActivityTask task = savedTask("Report panel task", 5L);
		loginAs(3L, "user3@gmail.com", Role.CRM_SALES_MANAGER);

		performRequest(get(TASK_PATH, task.getId())).andExpect(status().isOk())
			.andExpect(jsonPath(RESULTS_0_PATH + "['ownerId']").value(5));
	}

	@Test
	@DisplayName("Get task by ID as Sales Representative for someone else's task - Returns forbidden")
	void getTaskById_AsRepresentativeOnOthersTask_ReturnsForbidden() throws Exception {
		CrmActivityTask task = savedTask("Not my panel task", 1L);
		loginAs(2L, "user2@gmail.com", Role.CRM_SALES_REPRESENTATIVE);

		performRequest(get(TASK_PATH, task.getId())).andDo(print()).andExpect(status().isForbidden());
	}

	@Test
	@DisplayName("Get task by ID for a missing or deleted task - Returns not found")
	void getTaskById_MissingOrDeleted_ReturnsNotFound() throws Exception {
		CrmActivityTask task = savedTask("Deleted panel task", 1L);
		task.setIsDeleted(true);
		crmActivityTaskDao.flush();

		performRequest(get(TASK_PATH, task.getId())).andExpect(status().isNotFound());
		performRequest(get(TASK_PATH, 999_999L)).andExpect(status().isNotFound())
			.andExpect(jsonPath(RESULTS_0_PATH + "['messageKey']").value("CRM_ERROR_ACTIVITY_TASK_NOT_FOUND"));
	}

	@Test
	@DisplayName("Edit task as owner - Updates the given fields and leaves the rest unchanged")
	void editTask_AsOwner_UpdatesFields() throws Exception {
		setCrmRole(2L, Role.CRM_SALES_REPRESENTATIVE);
		CrmActivityTask task = savedTask("Before edit", 2L);
		Instant dueAt = task.getDueAt();
		authToken = tokenFor("user2@gmail.com");

		performEdit(task.getId(), "{\"name\":\"After edit\",\"priority\":\"HIGH\",\"notes\":\"Edited notes\"}")
			.andExpect(status().isOk())
			.andExpect(jsonPath(RESULTS_0_PATH + "['name']").value("After edit"))
			.andExpect(jsonPath(RESULTS_0_PATH + "['priority']").value("HIGH"))
			.andExpect(jsonPath(RESULTS_0_PATH + "['notes']").value("Edited notes"));

		CrmActivityTask saved = reloaded(task.getId());
		assertEquals("After edit", saved.getName());
		assertEquals(dueAt, saved.getDueAt());
	}

	@Test
	@DisplayName("Edit task isCompleted - Sets and clears completedAt")
	void editTask_ToggleCompletion_SetsAndClearsCompletedAt() throws Exception {
		CrmActivityTask task = savedTask("Edit completion", 1L);

		performEdit(task.getId(), COMPLETED_BODY).andExpect(status().isOk())
			.andExpect(jsonPath(RESULTS_0_PATH + "['isCompleted']").value(true))
			.andExpect(jsonPath(RESULTS_0_PATH + "['completedAt']").isNotEmpty());
		assertNotNull(reloaded(task.getId()).getCompletedAt());

		performEdit(task.getId(), REOPENED_BODY).andExpect(status().isOk())
			.andExpect(jsonPath(RESULTS_0_PATH + "['completedAt']").isEmpty());
		assertNull(reloaded(task.getId()).getCompletedAt());
	}

	@Test
	@DisplayName("Edit task contact and deal - Company follows the contact and clearing works")
	void editTask_ContactAndDeal_SetsAndClearsLinks() throws Exception {
		CrmCompany company = new CrmCompany();
		company.setName("Edit Link Company");
		company = crmCompanyDao.save(company);
		CrmContact contact = savedContact("Edit Link Contact", company);
		CrmDeal deal = savedDeal("Edit Link Deal", contact);
		CrmActivityTask task = savedTask("Edit links", 1L);

		performEdit(task.getId(), "{\"contactId\":" + contact.getId() + ",\"dealId\":" + deal.getId() + "}")
			.andExpect(status().isOk())
			.andExpect(jsonPath(RESULTS_0_PATH + "['contactId']").value(contact.getId()))
			.andExpect(jsonPath(RESULTS_0_PATH + "['companyId']").value(company.getId()))
			.andExpect(jsonPath(RESULTS_0_PATH + "['dealId']").value(deal.getId()));

		performEdit(task.getId(), "{\"contactId\":null,\"dealId\":null}").andExpect(status().isOk())
			.andExpect(jsonPath(RESULTS_0_PATH + "['contactId']").isEmpty())
			.andExpect(jsonPath(RESULTS_0_PATH + "['companyId']").isEmpty())
			.andExpect(jsonPath(RESULTS_0_PATH + "['dealId']").isEmpty());
	}

	@Test
	@DisplayName("Edit task with a deal from another contact - Returns deal contact mismatch error")
	void editTask_DealContactMismatch_ReturnsBadRequest() throws Exception {
		CrmContact contact = savedContact("Mismatch Contact", null);
		CrmContact otherContact = savedContact("Other Mismatch Contact", null);
		CrmDeal otherDeal = savedDeal("Other Contact Deal", otherContact);
		CrmActivityTask task = savedTask("Mismatch task", 1L);

		performEdit(task.getId(), "{\"contactId\":" + contact.getId() + ",\"dealId\":" + otherDeal.getId() + "}")
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath(RESULTS_0_PATH + "['messageKey']").value("CRM_ERROR_TASK_DEAL_CONTACT_MISMATCH"));
	}

	@Test
	@DisplayName("Edit task with a blank name or notes over the limit - Returns validation errors")
	void editTask_InvalidNameOrNotes_ReturnsBadRequest() throws Exception {
		CrmActivityTask task = savedTask("Validation task", 1L);

		performEdit(task.getId(), "{\"name\":\"   \"}").andExpect(status().isBadRequest())
			.andExpect(jsonPath(RESULTS_0_PATH + "['messageKey']").value("CRM_ERROR_TASK_NAME_REQUIRED"));

		performEdit(task.getId(), "{\"notes\":\"" + "n".repeat(1001) + "\"}").andExpect(status().isBadRequest())
			.andExpect(jsonPath(RESULTS_0_PATH + "['messageKey']").value("CRM_ERROR_TASK_NOTES_TOO_LONG"));
	}

	@Test
	@DisplayName("Edit task as Sales Representative on someone else's task - Returns forbidden")
	void editTask_AsRepresentativeOnOthersTask_ReturnsForbidden() throws Exception {
		CrmActivityTask task = savedTask("Not mine to edit", 1L);
		loginAs(2L, "user2@gmail.com", Role.CRM_SALES_REPRESENTATIVE);

		performEdit(task.getId(), "{\"name\":\"Hijacked\"}").andExpect(status().isForbidden());

		assertEquals("Not mine to edit", reloaded(task.getId()).getName());
	}

	@Test
	@DisplayName("Edit task as Sales Manager outside scope - Returns forbidden")
	void editTask_AsManagerOutOfScope_ReturnsForbidden() throws Exception {
		CrmActivityTask task = savedTask("Outside manager edit", 1L);
		loginAs(3L, "user3@gmail.com", Role.CRM_SALES_MANAGER);

		performEdit(task.getId(), "{\"name\":\"Changed\"}").andExpect(status().isForbidden());
	}

	@Test
	@DisplayName("Edit task as Sales Manager reassigning to an owner outside scope - Returns forbidden")
	void editTask_AsManagerReassignOutOfScope_ReturnsForbidden() throws Exception {
		setCrmRole(5L, Role.CRM_SALES_REPRESENTATIVE);
		addPrimaryReport(5L, 3L);
		CrmActivityTask task = savedTask("Reassign task", 5L);
		loginAs(3L, "user3@gmail.com", Role.CRM_SALES_MANAGER);

		performEdit(task.getId(), "{\"ownerId\":1}").andExpect(status().isForbidden());
		performEdit(task.getId(), "{\"ownerId\":3}").andExpect(status().isOk())
			.andExpect(jsonPath(RESULTS_0_PATH + "['ownerId']").value(3));
	}

	@Test
	@DisplayName("Edit task as CRM Admin on any task - Succeeds")
	void editTask_AsAdmin_Succeeds() throws Exception {
		setCrmRole(4L, Role.CRM_SALES_REPRESENTATIVE);
		CrmActivityTask task = savedTask("Admin edits", 4L);

		performEdit(task.getId(), "{\"name\":\"Admin edited\"}").andExpect(status().isOk())
			.andExpect(jsonPath(RESULTS_0_PATH + "['name']").value("Admin edited"));
	}

	@Test
	@DisplayName("Edit a missing task - Returns not found")
	void editTask_MissingTask_ReturnsNotFound() throws Exception {
		performEdit(999_999L, "{\"name\":\"Nothing\"}").andExpect(status().isNotFound());
	}

	@Test
	@DisplayName("Delete task as owner - Soft-deletes the task")
	void deleteTask_AsOwner_SoftDeletes() throws Exception {
		CrmActivityTask task = savedTask("Delete me", 1L);

		performRequest(delete(TASK_PATH, task.getId())).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL));

		assertTrue(reloaded(task.getId()).getIsDeleted());
		performRequest(get(TASK_PATH, task.getId())).andExpect(status().isNotFound());
	}

	@Test
	@DisplayName("Delete task as Sales Representative on someone else's task - Returns forbidden")
	void deleteTask_AsRepresentativeOnOthersTask_ReturnsForbidden() throws Exception {
		CrmActivityTask task = savedTask("Do not delete", 1L);
		loginAs(2L, "user2@gmail.com", Role.CRM_SALES_REPRESENTATIVE);

		performRequest(delete(TASK_PATH, task.getId())).andExpect(status().isForbidden());

		assertFalse(reloaded(task.getId()).getIsDeleted());
	}

	@Test
	@DisplayName("Delete a missing task - Returns not found")
	void deleteTask_MissingTask_ReturnsNotFound() throws Exception {
		performRequest(delete(TASK_PATH, 999_999L)).andExpect(status().isNotFound());
	}

	@Test
	@DisplayName("Get related tasks - Returns tasks sharing the contact within the caller's scope")
	void getRelatedTasks_SharedContact_ReturnsScopedTasks() throws Exception {
		setCrmRole(2L, Role.CRM_SALES_REPRESENTATIVE);
		CrmContact contact = savedContact("Related Contact", null);
		CrmActivityTask source = savedTask("Related source", 2L);
		CrmActivityTask sibling = savedTask("Related sibling", 2L);
		CrmActivityTask othersSibling = savedTask("Related other owner", 1L);
		CrmActivityTask unrelated = savedTask("Unrelated", 2L);
		source.setContact(contact);
		sibling.setContact(contact);
		othersSibling.setContact(contact);
		crmActivityTaskDao.flush();
		authToken = tokenFor("user2@gmail.com");

		performRequest(get(RELATED_PATH, source.getId())).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(RESULTS_0_PATH + "['items'].length()").value(1))
			.andExpect(jsonPath(RESULTS_0_PATH + "['items'][0]['id']").value(sibling.getId()))
			.andExpect(jsonPath(RESULTS_0_PATH + "['totalItems']").value(1));

		performRequest(get(RELATED_PATH, unrelated.getId())).andExpect(status().isOk())
			.andExpect(jsonPath(RESULTS_0_PATH + "['items'].length()").value(0));
	}

	@Test
	@DisplayName("Get related tasks for someone else's task as Sales Representative - Returns forbidden")
	void getRelatedTasks_AsRepresentativeOnOthersTask_ReturnsForbidden() throws Exception {
		CrmActivityTask task = savedTask("Others related source", 1L);
		loginAs(2L, "user2@gmail.com", Role.CRM_SALES_REPRESENTATIVE);

		performRequest(get(RELATED_PATH, task.getId())).andExpect(status().isForbidden());
	}

}
