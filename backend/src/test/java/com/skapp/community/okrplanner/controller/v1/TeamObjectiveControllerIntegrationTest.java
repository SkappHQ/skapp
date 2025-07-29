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
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.EmployeeRole;
import com.skapp.community.peopleplanner.model.Team;
import com.skapp.community.peopleplanner.repository.TeamDao;
import com.skapp.community.peopleplanner.repository.TeamRepository;
import org.junit.After;
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

import java.util.Arrays;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("Team objective controller integration tests")
public class TeamObjectiveControllerIntegrationTest {

    private static final String BASE_PATH = "/v1/team-objectives";

    private static final String STATUS_PATH = "['status']";

    private static final String RESULTS_0_PATH = "['results'][0]";

    private static final String MESSAGE_PATH = "['message']";

    private static final String STATUS_SUCCESSFUL = "successful";

    private static final String STATUS_UNSUCCESSFUL = "unsuccessful";

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

        teamObjective.setAssignedTeams(Arrays.asList(assignedTeam));
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

    @Nested
    @DisplayName("Get team objectives tests")
    class RetrieveTeamObjectivesTests {

        @DisplayName("Get team objectives by team and effective time period")
        @Test
        void getTeamObjectivesByTeamAndEffectiveTimePeriod() throws Exception {
            Long teamId = team.getTeamId();
            Long effectiveTimePeriod = 1L;

            ResultActions resultActions = performGetRequest(BASE_PATH + "?teamId=" + teamId + "&effectiveTimePeriod=" + effectiveTimePeriod);

            resultActions.andExpect(status().isOk())
                    .andExpect(jsonPath(STATUS_PATH).value(STATUS_SUCCESSFUL))
                    .andExpect(jsonPath(RESULTS_0_PATH + ".teamObjectiveId").exists())
                    .andExpect(jsonPath(RESULTS_0_PATH + ".title").exists())
                    .andExpect(jsonPath(MESSAGE_PATH).doesNotExist());
        }
    }
}
