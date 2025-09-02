package com.skapp.community.okrplanner.controller.v1;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skapp.community.common.model.User;
import com.skapp.community.common.security.AuthorityService;
import com.skapp.community.common.security.SkappUserDetails;
import com.skapp.community.common.service.JwtService;
import com.skapp.community.common.type.Role;
import com.skapp.community.okrplanner.model.TeamObjective;
import com.skapp.community.okrplanner.model.TeamObjectiveAssignedTeam;
import com.skapp.community.okrplanner.repository.TeamObjectiveRepository;
import com.skapp.community.okrplanner.type.KeyResultType;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.EmployeeRole;
import com.skapp.community.peopleplanner.model.Team;
import com.skapp.community.peopleplanner.repository.TeamDao;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import java.util.List;

import static com.skapp.community.okrplanner.constant.OkrMessageConstant.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

import com.skapp.community.okrplanner.payload.request.TeamObjectiveRequestDto;
import com.skapp.community.okrplanner.payload.request.KeyResultRequestDto;

@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("Team objective controller integration tests")
public class TeamObjectiveControllerIntegrationTest {

	private static final String BASE_PATH = "/v1/team-objectives";

	private static final String STATUS_PATH = "['status']";

	private static final String RESULTS_0_PATH = "['results'][0]";

	private static final String MESSAGE_PATH = "['message']";

	private static final String STATUS_SUCCESSFUL = "successful";

	@Autowired
	private ObjectMapper objectMapper;

	@Autowired
	private AuthorityService authorityService;

	@Autowired
	private JwtService jwtService;

	@Autowired
	private UserDetailsService userDetailsService;

	@Autowired
	private TeamDao teamDao;

	@Autowired
	private TeamObjectiveRepository teamObjectiveRepository;

	@Autowired
	private MockMvc mvc;

	private String authToken;

	private TeamObjective teamObjective;

	private Team team;

	@BeforeEach
	void setup() {
		setupSecurityContext();
		authToken = jwtService.generateAccessToken(userDetailsService.loadUserByUsername("user2@gmail.com"), 2L);
		setupTeamObective();
	}

	@AfterEach
	void tearDown() {
		teamObjectiveRepository.deleteAll();
		teamDao.deleteAll();
		SecurityContextHolder.clearContext();
	}

	private void setupTeamObective() {
		team = new Team();
		team.setTeamName("Test Team");
		team = teamDao.save(team);

		teamObjective = new TeamObjective();
		teamObjective.setTitle("Test Objective");
		teamObjective.setEffectiveTimePeriod(1L);
		teamObjective = teamObjectiveRepository.save(teamObjective);

		TeamObjectiveAssignedTeam assignedTeam = new TeamObjectiveAssignedTeam();
		assignedTeam.setTeam(team);
		assignedTeam.setTeamObjective(teamObjective);

		teamObjective.setAssignedTeams(List.of(assignedTeam));
		teamObjectiveRepository.save(teamObjective);
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
		mockUser.setEmail("user2@gmail.com");
		mockUser.setPassword("$2a$12$CGe4n75Yejv/O8dnOTD7R.x0LruTiKM22kcdc3YNl4RRw01srJsB6");
		mockUser.setIsActive(true);
		mockUser.setUserId(2L);

		Employee mockEmployee = new Employee();
		mockEmployee.setEmployeeId(2L);
		mockEmployee.setFirstName("name");

		EmployeeRole role = new EmployeeRole();
		role.setLeaveRole(Role.LEAVE_EMPLOYEE);
		role.setIsSuperAdmin(true);

		mockEmployee.setEmployeeRole(role);
		mockUser.setEmployee(mockEmployee);

		return mockUser;
	}

	private ResultActions performGetRequest(String path) throws Exception {
		return performRequest(get(path).accept(MediaType.APPLICATION_JSON));
	}

	public ObjectMapper getObjectMapper() {
		return objectMapper;
	}

	public void setObjectMapper(ObjectMapper objectMapper) {
		this.objectMapper = objectMapper;
	}

	@Nested
	@DisplayName("Get team objectives tests")
	class RetrieveTeamObjectivesTests {

		@DisplayName("Get team objectives by team and effective time period")
		@Test
		void getTeamObjectivesByTeamAndEffectiveTimePeriod() throws Exception {
			Long teamId = team.getTeamId();
			Long effectiveTimePeriod = 1L;

			ResultActions resultActions = performGetRequest(
					BASE_PATH + "?teamId=" + teamId + "&effectiveTimePeriod=" + effectiveTimePeriod);

			resultActions.andExpect(status().isOk())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
				.andExpect(jsonPath(RESULTS_0_PATH + ".teamObjectiveId").exists())
				.andExpect(jsonPath(RESULTS_0_PATH + ".title").exists())
				.andExpect(jsonPath(MESSAGE_PATH).doesNotExist());
		}

		@DisplayName("Get team objective by ID")
		@Test
		void getTeamObjective() throws Exception {
			Long teamObjectiveId = teamObjective.getId();

			ResultActions resultActions = performGetRequest(BASE_PATH + "/" + teamObjectiveId);

			resultActions.andExpect(status().isOk())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
				.andExpect(jsonPath(RESULTS_0_PATH + ".teamObjectiveId").value(teamObjectiveId))
				.andExpect(jsonPath(RESULTS_0_PATH + ".title").value(teamObjective.getTitle()))
				.andExpect(jsonPath(MESSAGE_PATH).doesNotExist());
		}

		@DisplayName("An error is returned if team objective does not exist")
		@Test
		void getTeamObjectiveNotFound() throws Exception {
			Long teamObjectiveId = 999999999999L;
			ResultActions resultActions = performGetRequest(BASE_PATH + "/" + teamObjectiveId);

			resultActions.andExpect(status().isBadRequest())
				.andExpect(jsonPath(STATUS_PATH).value("unsuccessful"))
				.andExpect(jsonPath(RESULTS_0_PATH + MESSAGE_PATH).exists());
		}

	}

	@Nested
	@DisplayName("Create team objectives tests")
	class CreateTeamObjectivesTests {

		@DisplayName("Successfully create a team objective")
		@Test
		void createTeamObjectiveSuccessfully() throws Exception {
			String payload = objectMapper.writeValueAsString(new TeamObjectiveRequestDto() {
				{
					setTitle("Improve QA Process");
					setEffectiveTimePeriod(2025L);
					setDuration("Q4");
					setAssignedTeamIds(List.of(team.getTeamId()));
					setKeyResults(List.of(new KeyResultRequestDto() {
						{
							setTitle("Automate 80% of test cases");
							setType(KeyResultType.GREATER_THAN.name());
							setLowerLimit(40.0);
							setUpperLimit(null);
							setAssignedTeamIds(List.of(team.getTeamId()));
						}
					}));
				}
			});

			MockHttpServletRequestBuilder request = post(BASE_PATH).contentType(MediaType.APPLICATION_JSON)
				.accept(MediaType.APPLICATION_JSON)
				.content(payload);

			ResultActions result = performRequest(request);

			result.andExpect(status().isCreated())
				.andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
				.andExpect(jsonPath(RESULTS_0_PATH).value("Team Objective created successfully"));
		}

		@DisplayName("Fail to create objective with missing title")
		@Test
		void failCreateWithMissingTitle() throws Exception {
			String payload = objectMapper.writeValueAsString(new TeamObjectiveRequestDto() {
				{
					setEffectiveTimePeriod(2025L);
					setDuration("Q4");
					setAssignedTeamIds(List.of(team.getTeamId()));
					setKeyResults(List.of(new KeyResultRequestDto() {
						{
							setTitle("Test Result");
							setType(KeyResultType.GREATER_THAN.name());
							setLowerLimit(10.0);
							setUpperLimit(20.0);
							setAssignedTeamIds(List.of(team.getTeamId()));
						}
					}));
				}
			});

			MockHttpServletRequestBuilder request = post(BASE_PATH).contentType(MediaType.APPLICATION_JSON)
				.content(payload);

			performRequest(request).andExpect(status().isUnprocessableEntity())
				.andExpect(jsonPath("$.results[0].errors[0].field").value("title"));
		}

		@DisplayName("Fail to create objective with title exceeding 250 characters")
		@Test
		void failCreateWithTooLongTitle() throws Exception {
			String longTitle = "A".repeat(251);
			TeamObjectiveRequestDto dto = new TeamObjectiveRequestDto();
			dto.setTitle(longTitle);
			dto.setEffectiveTimePeriod(2025L);
			dto.setDuration("Q4");
			dto.setAssignedTeamIds(List.of(team.getTeamId()));

			String payload = objectMapper.writeValueAsString(dto);

			performRequest(post(BASE_PATH).contentType(MediaType.APPLICATION_JSON).content(payload))
				.andExpect(status().isUnprocessableEntity())
				.andExpect(jsonPath("$.results[0].errors[0].field").value("title"))
				.andExpect(jsonPath("$.results[0].errors[0].message").value("Title cannot exceed 250 characters"));
		}

		@DisplayName("Fail to create objective with too long description")
		@Test
		void failCreateWithTooLongDescription() throws Exception {
			String longDesc = "D".repeat(1001);
			TeamObjectiveRequestDto dto = new TeamObjectiveRequestDto();
			dto.setTitle("Valid title");
			dto.setEffectiveTimePeriod(2025L);
			dto.setDuration("Q4");
			dto.setDescription(longDesc);
			dto.setAssignedTeamIds(List.of(team.getTeamId()));

			String payload = objectMapper.writeValueAsString(dto);

			performRequest(post(BASE_PATH).contentType(MediaType.APPLICATION_JSON).content(payload))
				.andExpect(status().isUnprocessableEntity())
				.andExpect(jsonPath("$.results[0].errors[0].field").value("description"))
				.andExpect(
						jsonPath("$.results[0].errors[0].message").value("Description cannot exceed 1000 characters"));
		}

		@DisplayName("Fail to create objective with invalid key result type")
		@Test
		void failCreateWithInvalidKeyResultType() throws Exception {
			TeamObjectiveRequestDto dto = new TeamObjectiveRequestDto();
			dto.setTitle("Bad Type Test");
			dto.setEffectiveTimePeriod(2025L);
			dto.setDuration("Q4");
			dto.setAssignedTeamIds(List.of(team.getTeamId()));

			KeyResultRequestDto kr = new KeyResultRequestDto();
			kr.setTitle("Invalid Type");
			kr.setType("INVALID_TYPE");
			kr.setLowerLimit(10.0);
			kr.setUpperLimit(20.0);
			kr.setAssignedTeamIds(List.of(team.getTeamId()));
			dto.setKeyResults(List.of(kr));

			String payload = objectMapper.writeValueAsString(dto);

			MockHttpServletRequestBuilder request = post(BASE_PATH).contentType(MediaType.APPLICATION_JSON)
				.content(payload);

			performRequest(request).andExpect(status().isBadRequest())
				.andExpect(
						jsonPath("$.results[0].messageKey").value(TEAM_OBJECTIVE_ERROR_INVALID_KEY_RESULT_TYPE.name()));

		}

		@DisplayName("Fail to create objective with invalid key result limits")
		@Test
		void failCreateWithInvalidKeyResultLimits() throws Exception {
			TeamObjectiveRequestDto dto = new TeamObjectiveRequestDto();
			dto.setTitle("Limit Test");
			dto.setEffectiveTimePeriod(2025L);
			dto.setDuration("Q4");
			dto.setAssignedTeamIds(List.of(team.getTeamId()));

			KeyResultRequestDto kr = new KeyResultRequestDto();
			kr.setTitle("Bad Limits");
			kr.setType(KeyResultType.LESS_THAN.name());
			kr.setLowerLimit(50.0);
			kr.setUpperLimit(10.0);
			kr.setAssignedTeamIds(List.of(team.getTeamId()));
			dto.setKeyResults(List.of(kr));

			String payload = objectMapper.writeValueAsString(dto);

			MockHttpServletRequestBuilder request = post(BASE_PATH).contentType(MediaType.APPLICATION_JSON)
				.content(payload);

			performRequest(request).andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.results[0].messageKey")
					.value(TEAM_OBJECTIVE_ERROR_INVALID_KEY_RESULT_LIMITS.name()));

		}

		@DisplayName("Fail to create KR of type GREATER_THAN with both lower and upper limits")
		@Test
		void failCreateWithGreaterThanAndBothLimits() throws Exception {
			TeamObjectiveRequestDto dto = new TeamObjectiveRequestDto();
			dto.setTitle("Test");
			dto.setEffectiveTimePeriod(2025L);
			dto.setDuration("Q4");
			dto.setAssignedTeamIds(List.of(team.getTeamId()));
			dto.setKeyResults(List.of(new KeyResultRequestDto() {
				{
					setTitle("KR Type Issue");
					setType(KeyResultType.GREATER_THAN.name());
					setLowerLimit(10.0);
					setUpperLimit(30.0);
					setAssignedTeamIds(List.of(team.getTeamId()));
				}
			}));

			String payload = objectMapper.writeValueAsString(dto);

			performRequest(post(BASE_PATH).contentType(MediaType.APPLICATION_JSON).content(payload))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.results[0].messageKey")
					.value(TEAM_OBJECTIVE_ERROR_INVALID_KEY_RESULT_LIMITS.name()));
		}

		@Test
		@DisplayName("Fail if key result assigned teams are not subset of parent teams")
		void failKeyResultTeamNotInParentAssignedTeams() throws Exception {
			Team unrelatedTeam = new Team();
			unrelatedTeam.setTeamName("Unrelated");
			unrelatedTeam = teamDao.save(unrelatedTeam);

			TeamObjectiveRequestDto dto = new TeamObjectiveRequestDto();
			dto.setTitle("Subset Test");
			dto.setEffectiveTimePeriod(2025L);
			dto.setDuration("Q4");
			dto.setAssignedTeamIds(List.of(team.getTeamId()));

			KeyResultRequestDto kr = new KeyResultRequestDto();
			kr.setTitle("Outsider Team");
			kr.setType(KeyResultType.GREATER_THAN.name());
			kr.setLowerLimit(10.0);
			kr.setAssignedTeamIds(List.of(unrelatedTeam.getTeamId()));
			dto.setKeyResults(List.of(kr));

			String payload = objectMapper.writeValueAsString(dto);

			MockHttpServletRequestBuilder request = post(BASE_PATH).contentType(MediaType.APPLICATION_JSON)
				.content(payload);

			performRequest(request).andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.results[0].messageKey")
					.value(TEAM_OBJECTIVE_ERROR_INVALID_ASSIGNED_TEAM_FOR_KEY_RESULT.name()));
		}

		@DisplayName("Fail to create objective with duplicate team IDs")
		@Test
		void failWithDuplicateAssignedTeamIds() throws Exception {
			Long id = team.getTeamId();

			TeamObjectiveRequestDto dto = new TeamObjectiveRequestDto();
			dto.setTitle("Duplicate Teams");
			dto.setEffectiveTimePeriod(2025L);
			dto.setDuration("Q4");
			dto.setAssignedTeamIds(List.of(id, id));

			KeyResultRequestDto kr = new KeyResultRequestDto();
			kr.setTitle("KR with dup team");
			kr.setType(KeyResultType.GREATER_THAN.name());
			kr.setLowerLimit(10.0);
			kr.setUpperLimit(30.0);
			kr.setAssignedTeamIds(List.of(id));
			dto.setKeyResults(List.of(kr));

			String payload = objectMapper.writeValueAsString(dto);

			MockHttpServletRequestBuilder request = post(BASE_PATH).contentType(MediaType.APPLICATION_JSON)
				.content(payload);

			performRequest(request).andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.results[0].messageKey").value(TEAM_OBJECTIVE_ERROR_DUPLICATE_TEAM_ID.name()));
		}

	}

}
