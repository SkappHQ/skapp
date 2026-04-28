package com.skapp.support;

import com.skapp.community.common.model.User;
import com.skapp.community.common.type.Role;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.EmployeeManager;
import com.skapp.community.peopleplanner.model.EmployeeRole;
import com.skapp.community.peopleplanner.type.AccountStatus;
import com.skapp.community.peopleplanner.type.EmploymentAllocation;
import lombok.experimental.UtilityClass;

import java.util.HashSet;
import java.util.Set;

@UtilityClass
public class MockUserFactory {

	private static final String DEFAULT_PASSWORD = "$2a$12$CGe4n75Yejv/O8dnOTD7R.x0LruTiKM22kcdc3YNl4RRw01srJsB6";

	/**
	 * Creates a basic super admin user (user1). Used by Holiday, Organization tests.
	 */
	public static User createSuperAdmin() {
		User mockUser = createBaseUser("user1@gmail.com", 1L);

		Employee mockEmployee = createBaseEmployee(1L);
		EmployeeRole role = new EmployeeRole();
		role.setAttendanceRole(Role.SUPER_ADMIN);
		role.setIsSuperAdmin(true);
		mockEmployee.setEmployeeRole(role);

		linkUserAndEmployee(mockUser, mockEmployee);
		return mockUser;
	}

	/**
	 * Creates a super admin with all module roles. Used by People, Job tests.
	 */
	public static User createSuperAdminWithAllRoles() {
		User mockUser = createBaseUser("user1@gmail.com", 1L);

		Employee mockEmployee = createBaseEmployee(1L);
		EmployeeRole role = new EmployeeRole();
		role.setAttendanceRole(Role.ATTENDANCE_ADMIN);
		role.setPeopleRole(Role.PEOPLE_ADMIN);
		role.setLeaveRole(Role.LEAVE_ADMIN);
		role.setIsSuperAdmin(true);
		mockEmployee.setEmployeeRole(role);

		linkUserAndEmployee(mockUser, mockEmployee);
		return mockUser;
	}

	/**
	 * Creates a super admin with manager relationship. Used by Time tests.
	 */
	public static User createSuperAdminWithManager() {
		User mockUser = createBaseUser("user1@gmail.com", 1L);

		User mockManagerUser = new User();
		mockManagerUser.setEmail("user2@gmail.com");
		mockManagerUser.setPassword("$2a$12$Z6/UrecHPvvCBVj/kEeGWezwhMzg46fPSJiAr/sLnBxhDAZfF4/1W");
		mockManagerUser.setUserId(2L);
		mockManagerUser.setIsActive(true);

		Employee mockEmployee = createBaseEmployee(1L);
		mockEmployee.setAccountStatus(AccountStatus.ACTIVE);
		mockEmployee.setEmploymentAllocation(EmploymentAllocation.FULL_TIME);

		Employee managerEmployee = new Employee();
		managerEmployee.setEmployeeId(2L);
		managerEmployee.setFirstName("name");
		managerEmployee.setAccountStatus(AccountStatus.ACTIVE);
		managerEmployee.setEmploymentAllocation(EmploymentAllocation.FULL_TIME);
		managerEmployee.setUser(mockManagerUser);

		EmployeeManager employeeManager = new EmployeeManager();
		employeeManager.setEmployee(mockEmployee);
		employeeManager.setManager(managerEmployee);
		Set<EmployeeManager> managerSet = new HashSet<>();
		managerSet.add(employeeManager);
		mockEmployee.setEmployeeManagers(managerSet);

		EmployeeRole role = new EmployeeRole();
		role.setEmployeeRoleId(1L);
		role.setAttendanceRole(Role.SUPER_ADMIN);
		role.setIsSuperAdmin(true);
		mockEmployee.setEmployeeRole(role);

		linkUserAndEmployee(mockUser, mockEmployee);
		return mockUser;
	}

	/**
	 * Creates a leave employee user (user2). Used by Leave Controller tests.
	 */
	public static User createLeaveEmployee() {
		User mockUser = createBaseUser("user2@gmail.com", 2L);

		Employee mockEmployee = createBaseEmployee(2L);
		EmployeeRole role = new EmployeeRole();
		role.setLeaveRole(Role.LEAVE_EMPLOYEE);
		role.setIsSuperAdmin(true);
		mockEmployee.setEmployeeRole(role);

		linkUserAndEmployee(mockUser, mockEmployee);
		return mockUser;
	}

	/**
	 * Creates a leave admin user (user1). Used by Leave Analytics tests.
	 */
	public static User createLeaveAdmin() {
		User mockUser = createBaseUser("user1@gmail.com", 1L);

		Employee mockEmployee = createBaseEmployee(1L);
		EmployeeRole role = new EmployeeRole();
		role.setLeaveRole(Role.LEAVE_ADMIN);
		role.setIsSuperAdmin(true);
		mockEmployee.setEmployeeRole(role);

		linkUserAndEmployee(mockUser, mockEmployee);
		return mockUser;
	}

	private static User createBaseUser(String email, Long userId) {
		User user = new User();
		user.setEmail(email);
		user.setPassword(DEFAULT_PASSWORD);
		user.setUserId(userId);
		user.setIsActive(true);
		return user;
	}

	private static Employee createBaseEmployee(Long employeeId) {
		Employee employee = new Employee();
		employee.setEmployeeId(employeeId);
		employee.setFirstName("name");
		return employee;
	}

	private static void linkUserAndEmployee(User user, Employee employee) {
		user.setEmployee(employee);
		employee.setUser(user);
	}

}
