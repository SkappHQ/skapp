package com.skapp.community.leaveplanner.controller.v1;

import com.skapp.TestSkappApplication;
import com.skapp.community.common.security.AuthorityService;
import com.skapp.community.common.service.JwtService;
import com.skapp.community.common.util.DateTimeUtils;
import com.skapp.support.MockUserFactory;
import com.skapp.support.SecurityTestUtils;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
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
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = TestSkappApplication.class)
@AutoConfigureMockMvc
@Transactional
@RequiredArgsConstructor
@DisplayName("Leave Entitlement Controller Integration Tests")
class LeaveEntitlementControllerIntegrationTest {

	private static final String BASE_PATH = "/v1/leave/entitlement";

	private final AuthorityService authorityService;

	private final JwtService jwtService;

	private final UserDetailsService userDetailsService;

	private final MockMvc mvc;

	private String authToken;

	@BeforeEach
	void setup() {
		SecurityTestUtils.setupSecurityContext(authorityService, MockUserFactory.createSuperAdminWithAllRoles());
		authToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user1@gmail.com"), 1L);
	}

	private ResultActions performGetEntitlements(String queryParams) throws Exception {
		return mvc.perform(get(BASE_PATH + queryParams).with(SecurityTestUtils.bearerToken(authToken))
			.accept(MediaType.APPLICATION_JSON));
	}

	@Nested
	@DisplayName("Get Leave Entitlements By Date Tests")
	class GetLeaveEntitlementsByDateTests {

		private String currentYearParam() {
			return "?year=" + DateTimeUtils.getCurrentYear();
		}

		@Test
		@DisplayName("Get entitlements for current year - Returns 2 employees with non-manual entitlements")
		void getEntitlements_CurrentYear_ReturnsTwoEmployees() throws Exception {
			// Only user4 (Casual, is_manual=false) and user5 (Study, is_manual=false)
			// have
			// non-manual entitlements in current year
			performGetEntitlements(currentYearParam()).andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
				.andExpect(jsonPath(RESULTS_0_PATH + "['totalItems']").value(2))
				.andExpect(jsonPath(RESULTS_0_PATH + "['items']").isArray())
				.andExpect(jsonPath(RESULTS_0_PATH + "['items']", hasSize(2)));
		}

		@Test
		@DisplayName("Get entitlements with pagination size=1 - Returns 1 item, totalItems=2, totalPages=2")
		void getEntitlements_WithPagination_ReturnsPagedResults() throws Exception {
			performGetEntitlements(currentYearParam() + "&page=0&size=1").andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
				.andExpect(jsonPath(RESULTS_0_PATH + "['totalItems']").value(2))
				.andExpect(jsonPath(RESULTS_0_PATH + "['totalPages']").value(2))
				.andExpect(jsonPath(RESULTS_0_PATH + "['currentPage']").value(0))
				.andExpect(jsonPath(RESULTS_0_PATH + "['items']", hasSize(1)));
		}

		@Test
		@DisplayName("Get entitlements page 1 (second page) with size=1 - Returns second employee")
		void getEntitlements_SecondPage_ReturnsSecondEmployee() throws Exception {
			performGetEntitlements(currentYearParam() + "&page=1&size=1").andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
				.andExpect(jsonPath(RESULTS_0_PATH + "['totalItems']").value(2))
				.andExpect(jsonPath(RESULTS_0_PATH + "['totalPages']").value(2))
				.andExpect(jsonPath(RESULTS_0_PATH + "['currentPage']").value(1))
				.andExpect(jsonPath(RESULTS_0_PATH + "['items']", hasSize(1)));
		}

		@Test
		@DisplayName("Get entitlements for next cycle year with no data - Returns empty items from DB query")
		void getEntitlements_NextCycleYearNoData_ReturnsEmptyFromDb() throws Exception {
			// Year currentYear+1 is in the valid range (next cycle) but has no
			// entitlements in DB.
			// This tests the DB query path returning 0 results (not the early-return
			// path).
			int nextYear = DateTimeUtils.getCurrentYear() + 1;
			performGetEntitlements("?year=" + nextYear).andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
				.andExpect(jsonPath(RESULTS_0_PATH + "['totalItems']").value(0))
				.andExpect(jsonPath(RESULTS_0_PATH + "['items']", hasSize(0)));
		}

		@Test
		@DisplayName("Get entitlements for year outside valid range - Returns empty PageDto via early return")
		void getEntitlements_YearOutOfRange_ReturnsEmptyPageDto() throws Exception {
			// Year 2000 is not in current/previous/next cycle, so the service returns
			// an empty PageDto immediately without querying DB (items=null, totalItems=0)
			performGetEntitlements("?year=2000").andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
				.andExpect(jsonPath(RESULTS_0_PATH + "['totalItems']").value(0));
		}

		@Test
		@DisplayName("Get entitlements with sortOrder DESC - Returns OK with 2 results")
		void getEntitlements_WithSortOrderDesc_ReturnsResults() throws Exception {
			performGetEntitlements(currentYearParam() + "&sortOrder=DESC&sortKey=CREATED_DATE").andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
				.andExpect(jsonPath(RESULTS_0_PATH + "['totalItems']").value(2))
				.andExpect(jsonPath(RESULTS_0_PATH + "['items']", hasSize(2)));
		}

		@Test
		@DisplayName("Get entitlements with isExport=true - Returns flat list without pagination wrapper")
		void getEntitlements_WithExport_ReturnsFlatList() throws Exception {
			// When isExport=true, the response puts items directly in results array
			performGetEntitlements(currentYearParam() + "&isExport=true").andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
				.andExpect(jsonPath("['results']", hasSize(2)));
		}

		@Test
		@DisplayName("Get entitlements - Each employee has entitlements array with leave type details")
		void getEntitlements_VerifyResponseStructure_HasEntitlementDetails() throws Exception {
			performGetEntitlements(currentYearParam() + "&size=5&sortOrder=ASC").andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
				.andExpect(jsonPath(RESULTS_0_PATH + "['items'][0]['employeeId']").isNumber())
				.andExpect(jsonPath(RESULTS_0_PATH + "['items'][0]['firstName']").isString())
				.andExpect(jsonPath(RESULTS_0_PATH + "['items'][0]['entitlements']").isArray());
		}

	}

}
