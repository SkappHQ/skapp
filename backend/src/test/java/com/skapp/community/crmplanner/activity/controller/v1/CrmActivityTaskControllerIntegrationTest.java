package com.skapp.community.crmplanner.activity.controller.v1;

import com.skapp.TestSkappApplication;
import com.skapp.community.common.service.JwtService;
import com.skapp.community.common.type.Role;
import com.skapp.community.crmplanner.model.CrmActivityTask;
import com.skapp.community.crmplanner.repository.CrmActivityTaskDao;
import com.skapp.community.crmplanner.type.CrmActivityTaskPriority;
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

}
