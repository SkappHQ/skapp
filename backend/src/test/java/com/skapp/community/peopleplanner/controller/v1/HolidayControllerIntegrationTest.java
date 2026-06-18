package com.skapp.community.peopleplanner.controller.v1;

import com.skapp.community.common.security.AuthorityService;
import com.skapp.community.common.service.JwtService;
import com.skapp.community.common.util.DateTimeUtils;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.community.peopleplanner.constant.PeopleMessageConstant;
import com.skapp.community.peopleplanner.payload.request.HolidayBulkRequestDto;
import com.skapp.community.peopleplanner.payload.request.HolidayRequestDto;
import com.skapp.community.peopleplanner.payload.request.HolidaysDeleteRequestDto;
import com.skapp.support.MockUserFactory;
import com.skapp.support.SecurityTestUtils;
import com.skapp.TestSkappApplication;
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
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import tools.jackson.databind.json.JsonMapper;

import java.util.ArrayList;
import java.util.List;

import static com.skapp.support.TestConstants.MESSAGE_PATH;
import static com.skapp.support.TestConstants.RESULTS_0_PATH;
import static com.skapp.support.TestConstants.STATUS_PATH;
import static com.skapp.support.TestConstants.STATUS_SUCCESSFUL;
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
@DisplayName("Holiday Controller Integration Tests")
class HolidayControllerIntegrationTest {

	private static final String BASE_PATH = "/v1/holiday";

	private static final String FULL_DAY = "FULL_DAY";

	private final AuthorityService authorityService;

	private final JsonMapper objectMapper;

	private final JwtService jwtService;

	private final UserDetailsService userDetailsService;

	private final MockMvc mvc;

	private final MessageUtil messageUtil;

	private String authToken;

	@BeforeEach
	void setup() {
		SecurityTestUtils.setupSecurityContext(authorityService, MockUserFactory.createSuperAdmin());
		authToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user1@gmail.com"), 1L);
	}

	private ResultActions performRequest(MockHttpServletRequestBuilder request) throws Exception {
		return mvc.perform(request.with(SecurityTestUtils.bearerToken(authToken)));
	}

	private ResultActions performGetRequest() throws Exception {
		return performRequest(get(HolidayControllerIntegrationTest.BASE_PATH).accept(MediaType.APPLICATION_JSON));
	}

	private ResultActions performGetRequestWithParams(MultiValueMap<String, String> params) throws Exception {
		return performRequest(
				get(HolidayControllerIntegrationTest.BASE_PATH).params(params).accept(MediaType.APPLICATION_JSON));
	}

	private <T> ResultActions performPostRequest(T content) throws Exception {
		return performRequest(post("/v1/holiday/bulk").contentType(MediaType.APPLICATION_JSON)
			.content(objectMapper.writeValueAsString(content))
			.accept(MediaType.APPLICATION_JSON));
	}

	private <T> ResultActions performDeleteRequest(T content) throws Exception {
		return performRequest(delete("/v1/holiday/selected").contentType(MediaType.APPLICATION_JSON)
			.content(objectMapper.writeValueAsString(content))
			.accept(MediaType.APPLICATION_JSON));
	}

	private ResultActions performDeleteRequest(String path) throws Exception {
		return performRequest(delete(path).accept(MediaType.APPLICATION_JSON));
	}

	private HolidayRequestDto createHolidayDto(String date, String name) {
		HolidayRequestDto holidayDto = new HolidayRequestDto();
		holidayDto.setDate(date);
		holidayDto.setName(name);
		holidayDto.setHolidayDuration(HolidayControllerIntegrationTest.FULL_DAY);
		holidayDto.setWorkLocations(List.of("All locations"));
		return holidayDto;
	}

	@Nested
	@DisplayName("Get Holiday Tests")
	class GetHolidayTests {

		@Test
		@DisplayName("Get all holidays - Returns OK")
		void getAllHolidays_ReturnsSuccessful() throws Exception {
			performGetRequest().andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
				.andExpect(jsonPath(RESULTS_0_PATH + "['items']").isArray())
				.andExpect(jsonPath(RESULTS_0_PATH + "['items'][0]['id']").exists())
				.andExpect(jsonPath(RESULTS_0_PATH + "['items'][0]['date']").exists())
				.andExpect(jsonPath(RESULTS_0_PATH + "['items'][0]['name']").exists())
				.andExpect(jsonPath(RESULTS_0_PATH + "['items'][0]['holidayDuration']").exists());
		}

		@Test
		@DisplayName("Get all holidays with filtration - Returns OK")
		void getAllHolidays_WithFiltration_ReturnsSuccessful() throws Exception {
			MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
			params.add("isPagination", String.valueOf(true));
			params.add("holidayDurations", FULL_DAY);

			performGetRequestWithParams(params).andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
				.andExpect(jsonPath(RESULTS_0_PATH + "['items']").isArray())
				.andExpect(jsonPath(RESULTS_0_PATH + "['currentPage']").exists())
				.andExpect(jsonPath(RESULTS_0_PATH + "['totalItems']").exists())
				.andExpect(jsonPath(RESULTS_0_PATH + "['totalPages']").exists());
		}

	}

	@Nested
	@DisplayName("Create Holiday Tests")
	class CreateHolidayTests {

		@Test
		@DisplayName("Save bulk holidays - Returns Created")
		void saveBulkHolidays_ReturnsCreated() throws Exception {
			int currentYear = DateTimeUtils.getCurrentYear();
			List<HolidayRequestDto> holidayDtoList = new ArrayList<>();

			holidayDtoList.add(createHolidayDto(String.format("%d-11-30", currentYear), "Poya day"));

			holidayDtoList.add(createHolidayDto(String.format("%d-11-29", currentYear), "Christmas Day"));

			HolidayBulkRequestDto holidayBulkRequestDto = new HolidayBulkRequestDto();
			holidayBulkRequestDto.setYear(currentYear);
			holidayBulkRequestDto.setHolidayDtoList(holidayDtoList);

			performPostRequest(holidayBulkRequestDto).andDo(print())
				.andExpect(status().isCreated())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
				.andExpect(jsonPath(RESULTS_0_PATH + "['bulkStatusSummary']['successCount']").value(2))
				.andExpect(jsonPath(RESULTS_0_PATH + "['bulkStatusSummary']['failedCount']").value(0));
		}

	}

	@Nested
	@DisplayName("Delete Holiday Tests")
	class DeleteHolidayTests {

		@Test
		@DisplayName("Delete selected holidays - Returns OK")
		void deleteSelectedHolidays_ReturnsSuccessful() throws Exception {
			HolidaysDeleteRequestDto holidaysDeleteRequestDto = new HolidaysDeleteRequestDto();
			List<Long> holidayIds = List.of(7L);
			holidaysDeleteRequestDto.setHolidayIds(holidayIds);

			performDeleteRequest(holidaysDeleteRequestDto).andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
				.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
					.value(messageUtil.getMessage(PeopleMessageConstant.PEOPLE_SUCCESS_DELETE_SELECTED_HOLIDAYS)));
		}

		@Test
		@DisplayName("Delete all holidays - Returns OK")
		void deleteAllHolidays_ReturnsSuccessful() throws Exception {
			performDeleteRequest(BASE_PATH + "/" + DateTimeUtils.getCurrentYear()).andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
				.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
					.value(messageUtil.getMessage(PeopleMessageConstant.PEOPLE_SUCCESS_DELETE_HOLIDAYS)));
		}

	}

}
