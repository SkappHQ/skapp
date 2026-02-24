package com.skapp.community.peopleplanner.controller.v1;

import com.skapp.community.common.model.User;
import com.skapp.community.common.security.AuthorityService;
import com.skapp.community.common.security.SkappUserDetails;
import com.skapp.community.common.service.JwtService;
import com.skapp.community.common.type.Role;
import com.skapp.community.common.util.DateTimeUtils;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.EmployeeRole;
import com.skapp.community.peopleplanner.payload.request.HolidayBulkRequestDto;
import com.skapp.community.peopleplanner.payload.request.HolidayRequestDto;
import com.skapp.community.peopleplanner.payload.request.HolidaysDeleteRequestDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.request.RequestPostProcessor;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import tools.jackson.databind.json.JsonMapper;

import java.util.ArrayList;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("Holiday Controller Integration Tests")
class HolidayControllerIntegrationTest {

	private static final String BASE_PATH = "/v1/holiday";

	private static final String STATUS_PATH = "['status']";

	private static final String RESULTS_0_PATH = "['results'][0]";

	private static final String MESSAGE_PATH = "['message']";

	private static final String STATUS_SUCCESSFUL = "successful";

	private static final String FULL_DAY = "FULL_DAY";

	@Autowired
	private AuthorityService authorityService;

	@Autowired
	private JsonMapper objectMapper;

	@Autowired
	private JwtService jwtService;

	@Autowired
	private UserDetailsService userDetailsService;

	@Autowired
	private MockMvc mvc;

	private String authToken;

	@BeforeEach
	void setup() {
		setupSecurityContext();
		authToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user1@gmail.com"), 1L);
	}

	private RequestPostProcessor bearerToken() {
		return request -> {
			request.addHeader("Authorization", "Bearer " + authToken);
			return request;
		};
	}

	private ResultActions performRequest(MockHttpServletRequestBuilder request) throws Exception {
		return mvc.perform(request.with(bearerToken()));
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

	private void setupSecurityContext() {
		User mockUser = createMockUser();
		SkappUserDetails userDetails = SkappUserDetails.builder()
			.username(mockUser.getEmail())
			.password(mockUser.getPassword())
			.enabled(mockUser.getIsActive())
			.authorities(authorityService.getAuthorities(mockUser))
			.build();

		UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(userDetails, null,
				userDetails.getAuthorities());

		SecurityContext securityContext = SecurityContextHolder.createEmptyContext();
		securityContext.setAuthentication(authentication);
		SecurityContextHolder.setContext(securityContext);
	}

	private User createMockUser() {
		User mockUser = new User();
		mockUser.setEmail("user1@gmail.com");
		mockUser.setPassword("$2a$12$CGe4n75Yejv/O8dnOTD7R.x0LruTiKM22kcdc3YNl4RRw01srJsB6");
		mockUser.setIsActive(true);

		Employee mockEmployee = new Employee();
		mockEmployee.setEmployeeId(1L);
		mockEmployee.setFirstName("name");

		EmployeeRole role = new EmployeeRole();
		role.setAttendanceRole(Role.SUPER_ADMIN);
		role.setIsSuperAdmin(true);
		mockEmployee.setEmployeeRole(role);
		mockUser.setEmployee(mockEmployee);

		return mockUser;
	}

	private HolidayRequestDto createHolidayDto(String date, String name) {
		HolidayRequestDto holidayDto = new HolidayRequestDto();
		holidayDto.setDate(date);
		holidayDto.setName(name);
		holidayDto.setHolidayDuration(HolidayControllerIntegrationTest.FULL_DAY);
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
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL));
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
				.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH).value("Selected holidays deleted successfully."));
		}

		@Test
		@DisplayName("Delete all holidays - Returns OK")
		void deleteAllHolidays_ReturnsSuccessful() throws Exception {
			performDeleteRequest(BASE_PATH + "/" + DateTimeUtils.getCurrentYear()).andDo(print())
				.andExpect(status().isOk())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
				.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH).value("holidays deleted successfully"));
		}

	}

}
