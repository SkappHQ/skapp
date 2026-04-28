package com.skapp.community.peopleplanner.controller.v1;

import com.skapp.community.common.security.AuthorityService;
import com.skapp.community.common.service.JwtService;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.community.peopleplanner.constant.PeopleMessageConstant;
import com.skapp.community.peopleplanner.payload.request.JobFamilyDto;
import com.skapp.community.peopleplanner.payload.request.JobTitleDto;
import com.skapp.community.peopleplanner.payload.request.TransferJobTitleRequestDto;
import com.skapp.community.peopleplanner.payload.request.UpdateJobFamilyRequestDto;
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
import tools.jackson.databind.json.JsonMapper;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;

import static com.skapp.support.TestConstants.MESSAGE_PATH;
import static com.skapp.support.TestConstants.RESULTS_0_PATH;
import static com.skapp.support.TestConstants.RESULTS_PATH;
import static com.skapp.support.TestConstants.STATUS_PATH;
import static com.skapp.support.TestConstants.STATUS_SUCCESSFUL;
import static com.skapp.support.TestConstants.STATUS_UNSUCCESSFUL;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = TestSkappApplication.class)
@AutoConfigureMockMvc
@Transactional
@RequiredArgsConstructor
@DisplayName("Job Controller Integration Tests")
class JobControllerIntegrationTest {

	private static final String BASE_PATH = "/v1/job";

	private final JsonMapper objectMapper;

	private final AuthorityService authorityService;

	private final JwtService jwtService;

	private final UserDetailsService userDetailsService;

	private final MockMvc mvc;

	private final MessageUtil messageUtil;

	private String authToken;

	@BeforeEach
	void setup() {
		SecurityTestUtils.setupSecurityContext(authorityService, MockUserFactory.createSuperAdminWithAllRoles());
		authToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user1@gmail.com"), 1L);
	}

	private ResultActions performRequest(MockHttpServletRequestBuilder request) throws Exception {
		return mvc.perform(request.with(SecurityTestUtils.bearerToken(authToken)));
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
				.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
					.value(messageUtil.getMessage(PeopleMessageConstant.PEOPLE_ERROR_JOB_FAMILY_NOT_FOUND)));
		}

		@Test
		@DisplayName("Create job family with empty titles - Returns Bad Request")
		void createJobFamilyWithEmptyTitles_ReturnsBadRequest() throws Exception {
			JobFamilyDto jobFamilyDto = new JobFamilyDto();
			jobFamilyDto.setName("Engineer");
			jobFamilyDto.setTitles(new ArrayList<>());

			performPostRequest(getFamilyPath(""), jobFamilyDto).andExpect(status().isBadRequest())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
				.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
					.value(messageUtil.getMessage(PeopleMessageConstant.PEOPLE_ERROR_JOB_FAMILY_INSUFFICIENT_DATA)));
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
				.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH).value(messageUtil
					.getMessage(PeopleMessageConstant.PEOPLE_ERROR_JOB_FAMILY_AND_JOB_TITLE_NAME_INVALID)));
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
				.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
					.value(messageUtil.getMessage(PeopleMessageConstant.PEOPLE_ERROR_JOB_TITLE_NOT_FOUND)));
		}

		@Test
		@DisplayName("Delete job title with transferring - Returns OK")
		void deleteJobTitle_WithTransferring_ReturnsOk() throws Exception {
			List<TransferJobTitleRequestDto> transferDtos = createTransferRequestList(4L);

			performPatchRequest(getTitlePath("/transfer/5"), transferDtos).andExpect(status().isOk())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
				.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
					.value(messageUtil.getMessage(PeopleMessageConstant.PEOPLE_SUCCESS_TRANSFER_JOB_TITLE)));
		}

		@Test
		@DisplayName("Delete job title with not matching title - Returns Bad Request")
		void deleteJobTitle_WithNotMatchingTitle_ReturnsBadRequest() throws Exception {
			List<TransferJobTitleRequestDto> transferDtos = createTransferRequestList(1L);

			performPatchRequest(getTitlePath("/transfer/5"), transferDtos).andExpect(status().isBadRequest())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
				.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH).value(
						messageUtil.getMessage(PeopleMessageConstant.PEOPLE_ERROR_JOB_FAMILY_AND_JOB_TITLE_NOT_MATCH)));
		}

		@Test
		@DisplayName("Delete job title without transferring all employees - Returns Not Found")
		void deleteJobTitle_WithoutTransferringAllEmployees_ReturnsNotFound() throws Exception {
			List<TransferJobTitleRequestDto> transferDtos = new ArrayList<>();

			performPatchRequest(getTitlePath("/transfer/5"), transferDtos).andExpect(status().isNotFound())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_UNSUCCESSFUL))
				.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH)
					.value(messageUtil.getMessage(PeopleMessageConstant.PEOPLE_ERROR_JOB_TITLE_REQUEST_EMPTY)));
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
