package com.skapp.community.crmplanner.controller.v1;

import com.skapp.TestSkappApplication;
import com.skapp.community.common.service.JwtService;
import com.skapp.community.crmplanner.model.CrmTask;
import com.skapp.community.crmplanner.model.CrmTaskType;
import com.skapp.community.crmplanner.repository.CrmTaskDao;
import com.skapp.community.crmplanner.repository.CrmTaskTypeDao;
import com.skapp.community.crmplanner.type.CrmTaskPriority;
import com.skapp.community.peopleplanner.repository.EmployeeDao;
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

import static com.skapp.support.TestConstants.RESULTS_0_PATH;
import static com.skapp.support.TestConstants.STATUS_PATH;
import static com.skapp.support.TestConstants.STATUS_SUCCESSFUL;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = TestSkappApplication.class)
@AutoConfigureMockMvc
@Transactional
@RequiredArgsConstructor
@DisplayName("CRM Task Controller Integration Tests")
class CrmTaskControllerIntegrationTest {

	private static final String BASE_PATH = "/v1/crm/task";

	private final MockMvc mvc;

	private final JwtService jwtService;

	private final UserDetailsService userDetailsService;

	private final CrmTaskDao crmTaskDao;

	private final CrmTaskTypeDao crmTaskTypeDao;

	private final EmployeeDao employeeDao;

	private String authToken;

	private CrmTaskType taskType;

	@BeforeEach
	void setup() {
		authToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user1@gmail.com"), 1L);

		taskType = new CrmTaskType();
		taskType.setName("Call");
		taskType.setOrderIndex(1);
		crmTaskTypeDao.save(taskType);
	}

	private ResultActions performGetRequest(String token) throws Exception {
		return mvc
			.perform(get(BASE_PATH).accept(MediaType.APPLICATION_JSON).with(SecurityTestUtils.bearerToken(token)));
	}

	private CrmTask savedTask(String name, boolean isDeleted) {
		CrmTask task = new CrmTask();
		task.setName(name);
		task.setType(taskType);
		task.setPriority(CrmTaskPriority.MEDIUM);
		task.setOwner(employeeDao.getReferenceById(1L));
		task.setIsDeleted(isDeleted);
		return crmTaskDao.save(task);
	}

	@Test
	@DisplayName("Get tasks with no tasks - Returns OK with empty tasks list")
	void getTasks_NoTasks_ReturnsOkEmpty() throws Exception {
		performGetRequest(authToken).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['tasks']").isArray())
			.andExpect(jsonPath(RESULTS_0_PATH + "['tasks']").isEmpty());
	}

	@Test
	@DisplayName("Get tasks excludes soft-deleted tasks - Returns only non-deleted")
	void getTasks_WithDeletedTask_ExcludesDeleted() throws Exception {
		savedTask("Active task", false);
		savedTask("Deleted task", true);

		performGetRequest(authToken).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['tasks'].length()").value(1))
			.andExpect(jsonPath(RESULTS_0_PATH + "['tasks'][0]['name']").value("Active task"));
	}

}
