package com.skapp.community.crmplanner.controller.v1;

import com.skapp.TestSkappApplication;
import com.skapp.community.common.service.JwtService;
import com.skapp.community.crmplanner.model.CrmTaskType;
import com.skapp.community.crmplanner.repository.CrmTaskTypeDao;
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
@DisplayName("CRM Task Type Controller Integration Tests")
class CrmTaskTypeControllerIntegrationTest {

	private static final String BASE_PATH = "/v1/crm/task/type";

	private final JwtService jwtService;

	private final UserDetailsService userDetailsService;

	private final MockMvc mvc;

	private final CrmTaskTypeDao crmTaskTypeDao;

	private String authToken;

	@BeforeEach
	void setup() {
		authToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user1@gmail.com"), 1L);

		CrmTaskType call = new CrmTaskType();
		call.setName("Call");
		call.setOrderIndex(2);
		crmTaskTypeDao.save(call);

		CrmTaskType email = new CrmTaskType();
		email.setName("Email");
		email.setOrderIndex(1);
		crmTaskTypeDao.save(email);
	}

	private ResultActions performGetRequest() throws Exception {
		MockHttpServletRequestBuilder request = get(BASE_PATH).accept(MediaType.APPLICATION_JSON);
		return mvc.perform(request.with(SecurityTestUtils.bearerToken(authToken)));
	}

	@Test
	@DisplayName("Get task types as CRM sales representative - Returns OK ordered by orderIndex")
	void getTaskTypes_AsCrmSalesRepresentative_ReturnsOkOrdered() throws Exception {
		performGetRequest().andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(RESULTS_0_PATH + "['name']").value("Email"))
			.andExpect(jsonPath(RESULTS_0_PATH + "['orderIndex']").value(1))
			.andExpect(jsonPath("['results'][1]['name']").value("Call"))
			.andExpect(jsonPath("['results'][1]['orderIndex']").value(2));
	}

	@Test
	@DisplayName("Get task types without CRM sales role - Returns Forbidden")
	void getTaskTypes_WithoutCrmRole_ReturnsForbidden() throws Exception {
		authToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user2@gmail.com"), 1L);

		performGetRequest().andDo(print()).andExpect(status().isForbidden());
	}

}
