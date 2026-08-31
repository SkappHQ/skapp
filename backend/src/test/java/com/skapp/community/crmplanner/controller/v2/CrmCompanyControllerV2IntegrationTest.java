package com.skapp.community.crmplanner.controller.v2;

import com.jayway.jsonpath.JsonPath;
import com.skapp.TestSkappApplication;
import com.skapp.community.common.service.JwtService;
import com.skapp.community.crmplanner.model.CrmCompany;
import com.skapp.community.crmplanner.model.CrmContact;
import com.skapp.community.crmplanner.model.CrmDeal;
import com.skapp.community.crmplanner.model.CrmDealStage;
import com.skapp.community.crmplanner.model.CrmTask;
import com.skapp.community.crmplanner.model.CrmTaskType;
import com.skapp.community.crmplanner.repository.CrmCompanyDao;
import com.skapp.community.crmplanner.repository.CrmContactDao;
import com.skapp.community.crmplanner.repository.CrmDealDao;
import com.skapp.community.crmplanner.repository.CrmDealStageDao;
import com.skapp.community.crmplanner.repository.CrmTaskDao;
import com.skapp.community.crmplanner.repository.CrmTaskTypeDao;
import com.skapp.community.crmplanner.type.CrmDealPriority;
import com.skapp.community.crmplanner.type.CrmDealStageType;
import com.skapp.community.crmplanner.type.CrmIndustry;
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
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static com.skapp.support.TestConstants.STATUS_PATH;
import static com.skapp.support.TestConstants.STATUS_SUCCESSFUL;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = TestSkappApplication.class)
@AutoConfigureMockMvc
@Transactional
@RequiredArgsConstructor
@DisplayName("CRM Company Controller V2 Integration Tests")
class CrmCompanyControllerV2IntegrationTest {

	private static final String METRICS_PATH = "/v2/crm/company";

	private final MockMvc mvc;

	private final JwtService jwtService;

	private final UserDetailsService userDetailsService;

	private final CrmCompanyDao crmCompanyDao;

	private final CrmContactDao crmContactDao;

	private final CrmDealDao crmDealDao;

	private final CrmDealStageDao crmDealStageDao;

	private final CrmTaskDao crmTaskDao;

	private final CrmTaskTypeDao crmTaskTypeDao;

	private final EmployeeDao employeeDao;

	private String authToken;

	@BeforeEach
	void setup() {
		authToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user1@gmail.com"), 1L);
	}

	private ResultActions performRequest(MockHttpServletRequestBuilder request, String token) throws Exception {
		return mvc.perform(request.with(SecurityTestUtils.bearerToken(token)));
	}

	private ResultActions performGetMetricsRequest(String searchKeyword) throws Exception {
		return performRequest(get(METRICS_PATH).param("page", "0")
			.param("size", "10")
			.param("searchKeyword", searchKeyword)
			.accept(MediaType.APPLICATION_JSON), authToken);
	}

	private CrmCompany savedCompany(String name) {
		CrmCompany company = new CrmCompany();
		company.setName(name);
		company.setIndustry(CrmIndustry.TECHNOLOGY_INFORMATION_AND_MEDIA);
		company.setWebsite("https://metrics-v2.com");
		company.setAddress("123 Metrics St");
		company.setContactNumber("94771234567");
		return crmCompanyDao.save(company);
	}

	private CrmContact savedContact(CrmCompany company, String email) {
		CrmContact contact = new CrmContact();
		contact.setName("Metrics Contact");
		contact.setEmail(email);
		contact.setOwner(employeeDao.getReferenceById(1L));
		contact.setCompany(company);
		return crmContactDao.save(contact);
	}

	private CrmDealStage savedStage(String name, CrmDealStageType stageType, int orderIndex) {
		CrmDealStage stage = new CrmDealStage();
		stage.setName(name);
		stage.setColor("#123456");
		stage.setOrderIndex(orderIndex);
		stage.setStageType(stageType);
		return crmDealStageDao.save(stage);
	}

	private void savedDeal(String name, CrmCompany company, CrmContact contact, CrmDealStage stage, String amount,
			String orderIndex) {
		CrmDeal deal = new CrmDeal();
		deal.setName(name);
		deal.setStage(stage);
		deal.setCompany(company);
		deal.setContact(contact);
		deal.setOwner(employeeDao.getReferenceById(1L));
		deal.setPriority(CrmDealPriority.MEDIUM);
		deal.setOrderIndex(orderIndex);
		deal.setAmount(amount);
		crmDealDao.save(deal);
	}

	private void savedTask(CrmCompany company, LocalDateTime dueAt) {
		CrmTaskType taskType = new CrmTaskType();
		taskType.setName("V2 Task Type");
		taskType.setOrderIndex(1);
		crmTaskTypeDao.save(taskType);

		CrmTask task = new CrmTask();
		task.setName("V2 Company Task");
		task.setType(taskType);
		task.setPriority(CrmTaskPriority.MEDIUM);
		task.setOwner(employeeDao.getReferenceById(1L));
		task.setCompany(company);
		task.setDueAt(dueAt);
		crmTaskDao.save(task);
	}

	@Test
	@DisplayName("Get company metrics - Returns flat company fields and nested metrics with seeded values")
	void getCompanyMetrics_HappyPath_ReturnsFlatCompanyFieldsAndMetrics() throws Exception {
		CrmCompany company = savedCompany("MetricsCoV2Unique");
		CrmContact contact = savedContact(company, "metrics.v2.unique@example.com");

		CrmDealStage openStage = savedStage("V2 Open Stage", CrmDealStageType.OPEN, 1);
		CrmDealStage wonStage = savedStage("V2 Won Stage", CrmDealStageType.WON, 2);

		savedDeal("V2 Open Deal", company, contact, openStage, "200", "a0");
		savedDeal("V2 Won Deal", company, contact, wonStage, "400", "a1");

		ResultActions result = performGetMetricsRequest("MetricsCoV2Unique").andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath("['results'][0]['totalItems']").value(1))
			.andExpect(jsonPath("['results'][0]['items'][0]['id']").value(company.getId()))
			.andExpect(jsonPath("['results'][0]['items'][0]['name']").value("MetricsCoV2Unique"))
			.andExpect(jsonPath("['results'][0]['items'][0]['industry']")
				.value(CrmIndustry.TECHNOLOGY_INFORMATION_AND_MEDIA.name()))
			.andExpect(jsonPath("['results'][0]['items'][0]['website']").value("https://metrics-v2.com"))
			.andExpect(jsonPath("['results'][0]['items'][0]['address']").value("123 Metrics St"))
			.andExpect(jsonPath("['results'][0]['items'][0]['contactNumber']").value("94771234567"))
			.andExpect(jsonPath("['results'][0]['items'][0]['metrics']['openDealsCount']").value(1))
			.andExpect(jsonPath("['results'][0]['items'][0]['metrics']['closedDealsCount']").value(1));

		String content = result.andReturn().getResponse().getContentAsString();
		String openValue = JsonPath.read(content, "$.results[0].items[0].metrics.openValue");
		String accountValue = JsonPath.read(content, "$.results[0].items[0].metrics.accountValue");
		assertThat(new BigDecimal(openValue)).as("open value sums INITIAL + OPEN deals only")
			.isEqualByComparingTo("200");
		assertThat(new BigDecimal(accountValue)).as("account value sums WON deals only").isEqualByComparingTo("400");
	}

	@Test
	@DisplayName("Get company metrics - Counts open and overdue tasks")
	void getCompanyMetrics_WithTasks_ReturnsOpenAndOverdueCounts() throws Exception {
		CrmCompany company = savedCompany("TaskMetricsCoV2Unique");

		savedTask(company, LocalDateTime.now().plusDays(5));
		savedTask(company, LocalDateTime.now().minusDays(1));

		performGetMetricsRequest("TaskMetricsCoV2Unique").andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath("['results'][0]['totalItems']").value(1))
			.andExpect(jsonPath("['results'][0]['items'][0]['metrics']['openTasksCount']").value(2))
			.andExpect(jsonPath("['results'][0]['items'][0]['metrics']['overdueTasksCount']").value(1));
	}

	@Test
	@DisplayName("Get company metrics - No paging params falls back to defaults and returns OK")
	void getCompanyMetrics_NoPagingParams_ReturnsOk() throws Exception {
		performRequest(get(METRICS_PATH).accept(MediaType.APPLICATION_JSON), authToken).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL));
	}

	@Test
	@DisplayName("Get company metrics - Search matching nothing returns empty page")
	void getCompanyMetrics_NoMatch_ReturnsEmptyPage() throws Exception {
		savedCompany("MetricsCoV2Unique");

		performGetMetricsRequest("NoSuchCompanyXyz").andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath("['results'][0]['totalItems']").value(0))
			.andExpect(jsonPath("['results'][0]['items']").isEmpty());
	}

	@Test
	@DisplayName("Get company metrics without CRM role - Returns Forbidden")
	void getCompanyMetrics_WithoutCrmRole_ReturnsForbidden() throws Exception {
		String noRoleToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user2@gmail.com"),
				1L);

		performRequest(get(METRICS_PATH).param("page", "0").param("size", "10").accept(MediaType.APPLICATION_JSON),
				noRoleToken)
			.andDo(print())
			.andExpect(status().isForbidden());
	}

}
