package com.skapp.community.leaveplanner.service.impl;

import com.skapp.community.common.model.User;
import com.skapp.community.common.service.TimeZoneService;
import com.skapp.community.common.service.UserService;
import com.skapp.community.common.type.Role;
import com.skapp.community.leaveplanner.mapper.LeaveMapper;
import com.skapp.community.leaveplanner.mapper.LeaveMapperImpl;
import com.skapp.community.leaveplanner.model.LeavePolicy;
import com.skapp.community.leaveplanner.model.PolicyLeaveRequest;
import com.skapp.community.leaveplanner.model.PolicyLeaveType;
import com.skapp.community.leaveplanner.payload.request.PolicyEmployeesOnLeaveFilterDto;
import com.skapp.community.leaveplanner.payload.response.PolicyEmployeeOnLeaveResponseDto;
import com.skapp.community.leaveplanner.payload.response.PolicyEmployeesOnLeaveByTeamResponseDto;
import com.skapp.community.leaveplanner.payload.response.PolicyOnLeaveRequestResponseDto;
import com.skapp.community.leaveplanner.repository.PolicyLeaveRequestDao;
import com.skapp.community.leaveplanner.service.LeavePolicyService;
import com.skapp.community.leaveplanner.type.LeaveRequestStatus;
import com.skapp.community.leaveplanner.type.LeaveState;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.EmployeeRole;
import com.skapp.community.peopleplanner.model.Holiday;
import com.skapp.community.peopleplanner.repository.HolidayDao;
import com.skapp.community.timeplanner.model.TimeConfig;
import com.skapp.community.timeplanner.repository.TimeConfigDao;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
@DisplayName("Policy Leave Service Unit Tests")
class PolicyLeaveServiceImplUnitTest {

	private static final LocalDate TODAY = LocalDate.of(2025, 6, 11);

	private static final long MANAGER_EMPLOYEE_ID = 3L;

	@InjectMocks
	private PolicyLeaveServiceImpl policyLeaveService;

	@Mock
	private TimeZoneService timeZoneService;

	@Mock
	private UserService userService;

	@Mock
	private LeavePolicyService leavePolicyService;

	@Mock
	private PolicyLeaveRequestDao policyLeaveRequestDao;

	@Mock
	private HolidayDao holidayDao;

	@Mock
	private TimeConfigDao timeConfigDao;

	@Spy
	private LeaveMapper leaveMapper = new LeaveMapperImpl();

	@BeforeEach
	void setUp() {
		when(leavePolicyService.isLeavePoliciesEnabled()).thenReturn(true);
		when(timeZoneService.currentOrganizationDate()).thenReturn(TODAY);
		when(holidayDao.findAllByIsActiveTrueAndDate(TODAY)).thenReturn(List.of());
		when(timeConfigDao.findAll()).thenReturn(List.of(timeConfig(TODAY.getDayOfWeek())));
		when(userService.getCurrentUser()).thenReturn(user(1L, Role.LEAVE_ADMIN));
	}

	private static User user(Long employeeId, Role leaveRole) {
		EmployeeRole employeeRole = new EmployeeRole();
		employeeRole.setIsSuperAdmin(false);
		employeeRole.setLeaveRole(leaveRole);

		Employee employee = employee(employeeId, "Current", "User");
		employee.setEmployeeRole(employeeRole);

		User user = new User();
		user.setEmployee(employee);
		return user;
	}

	private static Employee employee(Long employeeId, String firstName, String lastName) {
		Employee employee = new Employee();
		employee.setEmployeeId(employeeId);
		employee.setFirstName(firstName);
		employee.setLastName(lastName);
		return employee;
	}

	private static TimeConfig timeConfig(DayOfWeek day) {
		TimeConfig timeConfig = new TimeConfig();
		timeConfig.setDay(day);
		return timeConfig;
	}

	private static PolicyLeaveRequest leaveRequest(Long id, Employee employee, LeaveState leaveState) {
		PolicyLeaveType leaveType = new PolicyLeaveType();
		leaveType.setId(100L);
		leaveType.setName("PolicyAnnual");

		LeavePolicy policy = new LeavePolicy();
		policy.setId(500L);
		policy.setName("Annual Policy");
		policy.setLeaveType(leaveType);

		PolicyLeaveRequest leaveRequest = new PolicyLeaveRequest();
		leaveRequest.setId(id);
		leaveRequest.setEmployee(employee);
		leaveRequest.setPolicy(policy);
		leaveRequest.setStartDate(TODAY);
		leaveRequest.setEndDate(TODAY);
		leaveRequest.setLeaveState(leaveState);
		leaveRequest.setStatus(LeaveRequestStatus.APPROVED);
		return leaveRequest;
	}

	private static PolicyEmployeesOnLeaveFilterDto filter(Long... teamIds) {
		PolicyEmployeesOnLeaveFilterDto filterDto = new PolicyEmployeesOnLeaveFilterDto();
		filterDto.setTeamIds(teamIds.length == 0 ? null : List.of(teamIds));
		return filterDto;
	}

	private PolicyEmployeesOnLeaveByTeamResponseDto getByTeam(PolicyEmployeesOnLeaveFilterDto filterDto) {
		return (PolicyEmployeesOnLeaveByTeamResponseDto) policyLeaveService.getEmployeesOnLeaveTodayByTeam(filterDto)
			.getResults()
			.getFirst();
	}

	@Nested
	@DisplayName("Get Employees On Leave Today By Team")
	class GetEmployeesOnLeaveTodayByTeamTests {

		@Test
		@DisplayName("Groups two requests for the same employee into one entry")
		void getEmployeesOnLeaveTodayByTeam_TwoRequestsSameEmployee_GroupedIntoOneEntry() {
			Employee employee = employee(2L, "Employee", "Two");
			when(policyLeaveRequestDao.findApprovedRequestsOnDate(eq(TODAY), anyList(), any()))
				.thenReturn(List.of(leaveRequest(970L, employee, LeaveState.HALFDAY_MORNING),
						leaveRequest(971L, employee, LeaveState.HALFDAY_EVENING)));
			when(policyLeaveRequestDao.countEmployeesInScope(anyList(), any())).thenReturn(5L);

			PolicyEmployeesOnLeaveByTeamResponseDto response = getByTeam(filter());

			assertFalse(response.getIsNonWorkingDay());
			assertEquals(1L, response.getOnLeaveCount());
			assertEquals(4L, response.getOnlineCount());
			assertEquals(1, response.getEmployees().size());

			PolicyEmployeeOnLeaveResponseDto employeeOnLeave = response.getEmployees().getFirst();
			assertEquals(2L, employeeOnLeave.getEmployee().getEmployeeId());
			assertEquals(List.of(LeaveState.HALFDAY_MORNING, LeaveState.HALFDAY_EVENING),
					employeeOnLeave.getLeaveRequests()
						.stream()
						.map(PolicyOnLeaveRequestResponseDto::getLeaveState)
						.toList());

			PolicyOnLeaveRequestResponseDto leaveRequest = employeeOnLeave.getLeaveRequests().getFirst();
			assertEquals(970L, leaveRequest.getLeaveRequestId());
			assertEquals(500L, leaveRequest.getPolicyId());
			assertEquals("Annual Policy", leaveRequest.getPolicyName());
			assertEquals("PolicyAnnual", leaveRequest.getLeaveType().getName());
			assertEquals(TODAY, leaveRequest.getStartDate());
			assertEquals(TODAY, leaveRequest.getEndDate());
		}

		@Test
		@DisplayName("Sorts employees by first name then last name, ignoring case")
		void getEmployeesOnLeaveTodayByTeam_SeveralEmployees_SortedByName() {
			when(policyLeaveRequestDao.findApprovedRequestsOnDate(eq(TODAY), anyList(), any()))
				.thenReturn(List.of(leaveRequest(1L, employee(10L, "zoe", "Adams"), LeaveState.FULLDAY),
						leaveRequest(2L, employee(11L, "Adam", "Smith"), LeaveState.FULLDAY),
						leaveRequest(3L, employee(12L, "adam", "Brown"), LeaveState.FULLDAY)));
			when(policyLeaveRequestDao.countEmployeesInScope(anyList(), any())).thenReturn(3L);

			PolicyEmployeesOnLeaveByTeamResponseDto response = getByTeam(filter());

			assertEquals(List.of(12L, 11L, 10L),
					response.getEmployees().stream().map(entry -> entry.getEmployee().getEmployeeId()).toList());
			assertEquals(3L, response.getOnLeaveCount());
			assertEquals(0L, response.getOnlineCount());
		}

		@Test
		@DisplayName("Passes the requested teams to both queries")
		void getEmployeesOnLeaveTodayByTeam_TeamFilter_PassedToQueries() {
			when(policyLeaveRequestDao.findApprovedRequestsOnDate(eq(TODAY), anyList(), any())).thenReturn(List.of());

			getByTeam(filter(1L, 2L));

			verify(policyLeaveRequestDao).findApprovedRequestsOnDate(TODAY, List.of(1L, 2L), null);
			verify(policyLeaveRequestDao).countEmployeesInScope(List.of(1L, 2L), null);
		}

		@Test
		@DisplayName("Treats a team id of -1 as all teams")
		void getEmployeesOnLeaveTodayByTeam_AllTeams_PassesNoTeams() {
			when(policyLeaveRequestDao.findApprovedRequestsOnDate(eq(TODAY), anyList(), any())).thenReturn(List.of());

			getByTeam(filter(-1L, 2L));

			verify(policyLeaveRequestDao).findApprovedRequestsOnDate(TODAY, List.of(), null);
			verify(policyLeaveRequestDao).countEmployeesInScope(List.of(), null);
		}

		@Test
		@DisplayName("Scopes a leave manager to the people they supervise")
		void getEmployeesOnLeaveTodayByTeam_LeaveManager_ScopedToSupervisees() {
			when(userService.getCurrentUser()).thenReturn(user(MANAGER_EMPLOYEE_ID, Role.LEAVE_MANAGER));
			when(policyLeaveRequestDao.findApprovedRequestsOnDate(eq(TODAY), anyList(), any())).thenReturn(List.of());

			getByTeam(filter());

			verify(policyLeaveRequestDao).findApprovedRequestsOnDate(TODAY, List.of(), MANAGER_EMPLOYEE_ID);
			verify(policyLeaveRequestDao).countEmployeesInScope(List.of(), MANAGER_EMPLOYEE_ID);
		}

		@Test
		@DisplayName("Returns the holidays and no employees on a holiday")
		void getEmployeesOnLeaveTodayByTeam_Holiday_ReturnsHolidaysOnly() {
			Holiday holiday = new Holiday();
			holiday.setDate(TODAY);
			holiday.setName("Founders Day");
			when(holidayDao.findAllByIsActiveTrueAndDate(TODAY)).thenReturn(List.of(holiday));

			PolicyEmployeesOnLeaveByTeamResponseDto response = getByTeam(filter());

			assertTrue(response.getIsNonWorkingDay());
			assertEquals("Founders Day", response.getHolidays().getFirst().getName());
			assertNull(response.getOnLeaveCount());
			assertNull(response.getOnlineCount());
			assertNull(response.getEmployees());
			verify(policyLeaveRequestDao, never()).findApprovedRequestsOnDate(any(), anyList(), any());
			verify(policyLeaveRequestDao, never()).countEmployeesInScope(anyList(), any());
		}

		@Test
		@DisplayName("Returns a day off and no employees on a non-working day")
		void getEmployeesOnLeaveTodayByTeam_NonWorkingDay_ReturnsDayOff() {
			when(timeConfigDao.findAll()).thenReturn(List.of(timeConfig(TODAY.plusDays(1).getDayOfWeek())));

			PolicyEmployeesOnLeaveByTeamResponseDto response = getByTeam(filter());

			assertTrue(response.getIsNonWorkingDay());
			assertEquals("Day Off!", response.getHolidays().getFirst().getName());
			assertNull(response.getEmployees());
			verify(policyLeaveRequestDao, never()).findApprovedRequestsOnDate(any(), anyList(), any());
		}

	}

}
