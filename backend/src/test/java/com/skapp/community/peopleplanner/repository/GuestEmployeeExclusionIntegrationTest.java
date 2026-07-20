package com.skapp.community.peopleplanner.repository;

import com.skapp.TestSkappApplication;
import com.skapp.community.common.model.User;
import com.skapp.community.common.repository.UserDao;
import com.skapp.community.peopleplanner.model.Employee;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(classes = TestSkappApplication.class)
@Transactional
@DisplayName("Guest Employee Exclusion Repository Tests")
class GuestEmployeeExclusionIntegrationTest {

	private static final long GUEST_ID = 100L;

	@Autowired
	private EmployeeDao employeeDao;

	@Autowired
	private TeamDao teamDao;

	@Autowired
	private UserDao userDao;

	@Autowired
	private EmployeeManagerDao employeeManagerDao;

	@Autowired
	private JdbcTemplate jdbcTemplate;

	@BeforeEach
	void seedGuestEmployee() {
		jdbcTemplate.update("INSERT INTO \"user\" (user_id, email, is_active, password, login_method) "
				+ "VALUES (?, 'guest1@gmail.com', true, 'guest-pwd', 'CREDENTIALS')", GUEST_ID);
		jdbcTemplate.update("INSERT INTO employee (employee_id, first_name, last_name, account_status) "
				+ "VALUES (?, 'Guestonly', 'Member', 'ACTIVE')", GUEST_ID);
		jdbcTemplate.update(
				"INSERT INTO employee_role (employee_id, pm_role, is_super_admin) VALUES (?, 'PM_GUEST_EMPLOYEE', false)",
				GUEST_ID);
		jdbcTemplate.update("INSERT INTO employee_team (team_id, employee_id, is_supervisor) VALUES (1, ?, false)",
				GUEST_ID);
		jdbcTemplate.update("INSERT INTO employee_manager (employee_id, manager_id, is_direct_manager, manager_type) "
				+ "VALUES (?, 1, true, 'PRIMARY')", GUEST_ID);
	}

	@Test
	@DisplayName("findEmployeeByName excludes guests but keeps employees with null pmRole")
	void findEmployeeByName_ExcludesGuestsAndKeepsNullPmRoleEmployees() {
		List<Employee> guestMatches = employeeDao.findEmployeeByName("Guestonly");

		assertThat(guestMatches).isEmpty();

		// seeded employees have no pm_role set; the left-join branch must keep them
		List<Employee> nullPmRoleMatches = employeeDao.findEmployeeByName("Employee User One");

		assertThat(nullPmRoleMatches).extracting(Employee::getEmployeeId).contains(1L);
	}

	@Test
	@DisplayName("findEmployeesInManagerLeadingTeams excludes guests")
	void findEmployeesInManagerLeadingTeams_ExcludesGuests() {
		User attendanceAdmin = userDao.findByEmail("user1@gmail.com").orElseThrow();

		Page<Employee> employees = teamDao.findEmployeesInManagerLeadingTeams(List.of(-1L), PageRequest.of(0, 20),
				attendanceAdmin);

		assertThat(employees.getContent()).extracting(Employee::getEmployeeId).contains(1L).doesNotContain(GUEST_ID);
	}

	@Test
	@DisplayName("findEmployeesInTeamByTeamId excludes guest team members")
	void findEmployeesInTeamByTeamId_ExcludesGuests() {
		List<Employee> teamMembers = teamDao.findEmployeesInTeamByTeamId(1L, PageRequest.of(0, 20));

		assertThat(teamMembers).extracting(Employee::getEmployeeId).contains(1L).doesNotContain(GUEST_ID);
	}

	@Test
	@DisplayName("findManagerSupervisingEmployee excludes guests managed by the manager")
	void findManagerSupervisingEmployee_ExcludesGuests() {
		List<Long> supervisedEmployeeIds = employeeManagerDao.findManagerSupervisingEmployee(1L);

		assertThat(supervisedEmployeeIds).contains(2L).doesNotContain(GUEST_ID);
	}

	@Test
	@DisplayName("findEmployeeByNameEmail excludes guests but keeps employees with null pmRole")
	void findEmployeeByNameEmail_ExcludesGuestsAndKeepsNullPmRoleEmployees() {
		List<Employee> guestMatches = employeeDao.findEmployeeByNameEmail("Guestonly", null);

		assertThat(guestMatches).isEmpty();

		List<Employee> nullPmRoleMatches = employeeDao.findEmployeeByNameEmail("Employee User One", null);

		assertThat(nullPmRoleMatches).extracting(Employee::getEmployeeId).contains(1L);
	}

}
