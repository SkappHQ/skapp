package com.skapp.community.peopleplanner.controller.v1;

import com.skapp.community.common.model.User;
import com.skapp.community.common.security.AuthorityService;
import com.skapp.community.common.security.SkappUserDetails;
import com.skapp.community.common.service.JwtService;
import com.skapp.community.common.type.Role;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.EmployeeRole;
import com.skapp.community.peopleplanner.payload.request.JobFamilyDto;
import com.skapp.community.peopleplanner.payload.request.JobTitleDto;
import com.skapp.community.peopleplanner.payload.request.TransferJobTitleRequestDto;
import com.skapp.community.peopleplanner.payload.request.UpdateJobFamilyRequestDto;
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
import tools.jackson.databind.json.JsonMapper;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("Job Controller Integration Tests")
class JobControllerIntegrationTest {

	private static final String BASE_PATH = "/v1/job";

	private static final String STATUS_PATH = "['status']";

	private static final String RESULTS_PATH = "['results']";

	private static final String RESULTS_0_PATH = "['results'][0]";

	private static final String MESSAGE_PATH = "['message']";

	private static final String STATUS_SUCCESSFUL = "successful";

	private static final String STATUS_UNSUCCESSFUL = "unsuccessful";

	@Autowired
	private JsonMapper objectMapper;

	@Autowired
	private AuthorityService authorityService;

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

	private ResultActions performGetRequest(String path) throws Exception {
		return performRequest(get(path).accept(MediaType.APPLICATION_JSON));
	}

	private <T> ResultActions performPostRequest(String path, T content) throws Exception {
		return performRequest(post(path).contentType(MediaType.APPLICATION_JSON)
			.content(objectMapper.writeValueAsString(content))
			.accept(MediaType.APPLICATION_JSON));
	}

	private <T> ResultActions performPatchRequest(String path, T content) throws Exception {
		return performRequest(patch(path).contentType(MediaType.APPLICATION_JSON)
			.content(objectMapper.writeValueAsString(content))
			.accept(MediaType.APPLICATION_JSON));
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
		role.setPeopleRole(Role.PEOPLE_ADMIN);
		role.setLeaveRole(Role.LEAVE_ADMIN);
		role.setAttendanceRole(Role.ATTENDANCE_ADMIN);

		mockEmployee.setEmployeeRole(role);
		mockUser.setEmployee(mockEmployee);
		return mockUser;
	}

	@Nested
	@DisplayName("Job Family Tests")
	class JobFamilyTests {

		private String getFamilyPath(String suffix) {
			return BASE_PATH + "/family" + suffix;
		}

		@Test
		@DisplayName("Create job family - Returns Created status")
		void createJobFamily_ReturnsCreated() throws Exception {
			JobFamilyDto jobFamilyDto = new JobFamilyDto();
			jobFamilyDto.setName("Engineer");
			jobFamilyDto.setTitles(Stream.of("Senior", "Junior").toList());

			performPostRequest(getFamilyPath(""), jobFamilyDto).andDo(print())
				.andExpect(status().isCreated())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL));
		}

		@Test
		@DisplayName("Get job family by ID - Returns OK")
		void getJobFamily_ReturnsOk() throws Exception {
			performGetRequest(getFamilyPath("/2")).andExpect(status().isOk())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL));
		}

		@Test
		@DisplayName("Get non-existent job family - Returns Not Found")
		void getJobFamilyWithNotExistingId_ReturnsNotFound() throws Exception {
			performGetRequest(getFamilyPath("/12")).andExpect(status().isNotFound())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
				.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH).value("Job family isn't found"));
		}

		@Test
		@DisplayName("Create job family with empty titles - Returns Bad Request")
		void createJobFamilyWithEmptyTitles_ReturnsBadRequest() throws Exception {
			JobFamilyDto jobFamilyDto = new JobFamilyDto();
			jobFamilyDto.setName("Engineer");
			jobFamilyDto.setTitles(new ArrayList<>());

			performPostRequest(getFamilyPath(""), jobFamilyDto).andExpect(status().isBadRequest())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
				.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH).value("Insufficient data for job family"));
		}

		@Test
		@DisplayName("Get all job families - Returns OK")
		void getAllJobFamily_ReturnsHttpStatusOk() throws Exception {
			performGetRequest(getFamilyPath("")).andExpect(status().isOk())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
				.andExpect(jsonPath(RESULTS_PATH).isArray())
				.andExpect(jsonPath(RESULTS_PATH + "[0]['jobFamilyId']").exists())
				.andExpect(jsonPath(RESULTS_PATH + "[0]['name']").exists())
				.andExpect(jsonPath(RESULTS_PATH + "[0]['jobTitles']").isArray());
		}

		@Test
		@DisplayName("Add job family with invalid role level - Returns Bad Request")
		void addJobFamily_invalidJobRoleLevel_ReturnsBadRequest() throws Exception {
			JobFamilyDto jobFamilyDto = new JobFamilyDto();
			jobFamilyDto.setName("Engineer");
			jobFamilyDto.setTitles(Stream.of("Lead#1", "Junior").toList());

			performPostRequest(getFamilyPath(""), jobFamilyDto).andExpect(status().isBadRequest())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
				.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH).value(
						"Job family name & job title fields can only contain alphabets, numbers, whitespaces, and following symbols -_&/|[]"));
		}

		@Test
		@DisplayName("Update job family - Returns Created")
		void updateJobFamily_ReturnsHttpStatusCreated() throws Exception {
			UpdateJobFamilyRequestDto updateRequest = new UpdateJobFamilyRequestDto();
			updateRequest.setName("Consultation");

			JobTitleDto jobTitleDto = new JobTitleDto();
			jobTitleDto.setJobTitleId(1L);
			jobTitleDto.setName("trainee");

			List<JobTitleDto> jobTitleList = new ArrayList<>();
			jobTitleList.add(jobTitleDto);
			updateRequest.setTitles(jobTitleList);

			performPatchRequest(getFamilyPath("/1"), updateRequest).andExpect(status().isCreated())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
				.andExpect(jsonPath(RESULTS_0_PATH + "['name']").value("Consultation"));
		}

	}

	@Nested
	@DisplayName("Job Title Tests")
	class JobTitleTests {

		private String getTitlePath(String suffix) {
			return BASE_PATH + "/title" + suffix;
		}

		@Test
		@DisplayName("Get invalid job title by ID - Returns Not Found")
		void getInvalidJobTitleById_ReturnsNotFound() throws Exception {
			performGetRequest(getTitlePath("/10")).andExpect(status().isNotFound())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL));
		}

		@Test
		@DisplayName("Get job title by ID - Returns OK")
		void getJobTitleById_ReturnsOk() throws Exception {
			performGetRequest(getTitlePath("/2")).andExpect(status().isOk())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
				.andExpect(jsonPath(RESULTS_0_PATH + "['name']").value("Senior"));
		}

		@Test
		@DisplayName("Delete job title with invalid title - Returns Not Found")
		void deleteJobTitle_WithInvalidJobTitle_ReturnsNotFound() throws Exception {
			List<TransferJobTitleRequestDto> transferDtos = createTransferRequestList(2L);

			performPatchRequest(getTitlePath("/transfer/10"), transferDtos).andExpect(status().isNotFound())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
				.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH).value("Job title isn't found"));
		}

		@Test
		@DisplayName("Delete job title with transferring - Returns OK")
		void deleteJobTitle_WithTransferring_ReturnsOk() throws Exception {
			List<TransferJobTitleRequestDto> transferDtos = createTransferRequestList(4L);

			performPatchRequest(getTitlePath("/transfer/5"), transferDtos).andExpect(status().isOk())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
				.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
					.value("Successfully transferred employees to another job title in the same job family"));
		}

		@Test
		@DisplayName("Delete job title with not matching title - Returns Bad Request")
		void deleteJobTitle_WithNotMatchingTitle_ReturnsBadRequest() throws Exception {
			List<TransferJobTitleRequestDto> transferDtos = createTransferRequestList(1L);

			performPatchRequest(getTitlePath("/transfer/5"), transferDtos).andExpect(status().isBadRequest())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
				.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
					.value("Job title and job family do not match or invalid job title"));
		}

		@Test
		@DisplayName("Delete job title without transferring all employees - Returns Not Found")
		void deleteJobTitle_WithoutTransferringAllEmployees_ReturnsNotFound() throws Exception {
			List<TransferJobTitleRequestDto> transferDtos = new ArrayList<>();

			performPatchRequest(getTitlePath("/transfer/5"), transferDtos).andExpect(status().isNotFound())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
				.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
					.value("No job title transfer data provided. Unable to process the transfer request."));
		}

		private List<TransferJobTitleRequestDto> createTransferRequestList(Long jobTitleId) {
			List<TransferJobTitleRequestDto> transferDtos = new ArrayList<>();
			TransferJobTitleRequestDto transferDto = new TransferJobTitleRequestDto();
			transferDto.setJobTitleId(jobTitleId);
			transferDto.setEmployeeId(3L);
			transferDtos.add(transferDto);
			return transferDtos;
		}

	}

}
