package com.skapp.community.crmplanner.controller.v1;

import com.skapp.TestSkappApplication;
import com.skapp.community.common.service.JwtService;
import com.skapp.community.crmplanner.model.CrmIndustry;
import com.skapp.community.crmplanner.repository.CrmIndustryDao;
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
import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.containsInRelativeOrder;
import static org.hamcrest.Matchers.everyItem;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = TestSkappApplication.class)
@AutoConfigureMockMvc
@Transactional
@RequiredArgsConstructor
@DisplayName("CRM Industry Controller Integration Tests")
class CrmIndustryControllerIntegrationTest {

	private static final String LOOKUP_PATH = "/v1/crm/industry/lookup";

	private static final String ITEMS_PATH = RESULTS_0_PATH + "['items']";

	private final JwtService jwtService;

	private final UserDetailsService userDetailsService;

	private final MockMvc mvc;

	private final CrmIndustryDao crmIndustryDao;

	private String authToken;

	@BeforeEach
	void setup() {
		authToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user1@gmail.com"), 1L);

		createIndustry("RETAIL", false);
		createIndustry("HOSPITALS_AND_HEALTH_CARE", false);
		createIndustry("Deep Sea Tourism", false);
		createIndustry("EDUCATION", false);
		createIndustry("DELETED_INDUSTRY", true);
	}

	private ResultActions performLookup(String searchKeyword, Integer size) throws Exception {
		MockHttpServletRequestBuilder request = get(LOOKUP_PATH).accept(MediaType.APPLICATION_JSON);
		if (searchKeyword != null) {
			request.param("searchKeyword", searchKeyword);
		}
		if (size != null) {
			request.param("size", String.valueOf(size));
		}
		return mvc.perform(request.with(SecurityTestUtils.bearerToken(authToken)));
	}

	@Test
	@DisplayName("Lookup without search - Returns industries as id and name pairs ordered by name")
	void getIndustriesLookup_NoSearch_ReturnsOrderedByName() throws Exception {
		performLookup(null, null).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
			.andExpect(jsonPath(ITEMS_PATH + "[*]['name']")
				.value(containsInRelativeOrder("Deep Sea Tourism", "EDUCATION", "HOSPITALS_AND_HEALTH_CARE", "RETAIL")))
			.andExpect(jsonPath(ITEMS_PATH + "[*]['id']").value(everyItem(notNullValue())));
	}

	@Test
	@DisplayName("Lookup - Omits soft-deleted industries")
	void getIndustriesLookup_OmitsSoftDeletedIndustries() throws Exception {
		performLookup(null, null).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(ITEMS_PATH + "[*]['name']").value(not(hasItem("DELETED_INDUSTRY"))));
	}

	@Test
	@DisplayName("Lookup with search keyword - Matches ignoring case")
	void getIndustriesLookup_SearchKeyword_MatchesIgnoringCase() throws Exception {
		performLookup("deep sea", null).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(ITEMS_PATH + "[*]['name']").value(contains("Deep Sea Tourism")));
	}

	@Test
	@DisplayName("Lookup with spaces in search keyword - Matches built-in names stored with underscores")
	void getIndustriesLookup_SearchKeywordWithSpaces_MatchesUnderscoredNames() throws Exception {
		performLookup("health care", null).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(ITEMS_PATH + "[*]['name']").value(contains("HOSPITALS_AND_HEALTH_CARE")));
	}

	@Test
	@DisplayName("Lookup with search keyword matching nothing - Returns empty items")
	void getIndustriesLookup_NoMatch_ReturnsEmptyItems() throws Exception {
		performLookup("no such industry", null).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(ITEMS_PATH).isEmpty());
	}

	@Test
	@DisplayName("Lookup with size - Limits the page size")
	void getIndustriesLookup_WithSize_LimitsItems() throws Exception {
		performLookup(null, 2).andDo(print())
			.andExpect(status().isOk())
			.andExpect(jsonPath(ITEMS_PATH).value(hasSize(2)));
	}

	@Test
	@DisplayName("Lookup without CRM sales role - Returns Forbidden")
	void getIndustriesLookup_WithoutCrmRole_ReturnsForbidden() throws Exception {
		authToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user2@gmail.com"), 1L);

		performLookup(null, null).andDo(print()).andExpect(status().isForbidden());
	}

	private CrmIndustry createIndustry(String name, boolean isDeleted) {
		CrmIndustry industry = new CrmIndustry();
		industry.setName(name);
		industry.setIsDeleted(isDeleted);
		return crmIndustryDao.save(industry);
	}

}
