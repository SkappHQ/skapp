package com.skapp.community.common.security;

import com.skapp.community.common.constant.AuthConstants;
import com.skapp.community.common.model.User;
import com.skapp.community.common.type.Role;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.EmployeeRole;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthorityServiceImpl implements AuthorityService {

	public List<GrantedAuthority> getAuthorities(User user) {
		if (user.getEmployee().getEmployeeRole() == null) {
			return Collections.emptyList();
		}

		List<GrantedAuthority> authorities = new ArrayList<>();
		EmployeeRole employeeRole = Optional.ofNullable(user.getEmployee()).map(Employee::getEmployeeRole).orElse(null);

		if (employeeRole == null) {
			return Collections.emptyList();
		}

		addSuperAdminAuthority(authorities, employeeRole);
		addModuleRoleAuthorities(authorities, employeeRole);

		return authorities;
	}

	private void addSuperAdminAuthority(List<GrantedAuthority> authorities, EmployeeRole employeeRole) {
		if (Boolean.TRUE.equals(employeeRole.getIsSuperAdmin())) {
			authorities.add(new SimpleGrantedAuthority(AuthConstants.AUTH_ROLE + Role.SUPER_ADMIN));
		}
	}

	private void addModuleRoleAuthorities(List<GrantedAuthority> authorities, EmployeeRole employeeRole) {
		Optional.ofNullable(employeeRole.getPeopleRole())
			.ifPresent(role -> addRoleHierarchy(authorities, role, Role.PEOPLE_ADMIN, Role.PEOPLE_MANAGER,
					Role.PEOPLE_EMPLOYEE, null));

		Optional.ofNullable(employeeRole.getLeaveRole())
			.ifPresent(role -> addRoleHierarchy(authorities, role, Role.LEAVE_ADMIN, Role.LEAVE_MANAGER,
					Role.LEAVE_EMPLOYEE, null));

		Optional.ofNullable(employeeRole.getAttendanceRole())
			.ifPresent(role -> addRoleHierarchy(authorities, role, Role.ATTENDANCE_ADMIN, Role.ATTENDANCE_MANAGER,
					Role.ATTENDANCE_EMPLOYEE, null));

		Optional.ofNullable(employeeRole.getOkrRole())
			.ifPresent(role -> addRoleHierarchy(authorities, role, Role.OKR_ADMIN, Role.OKR_MANAGER, Role.OKR_EMPLOYEE,
					null));
	}

	protected void addRoleHierarchy(List<GrantedAuthority> authorities, Role currentRole, Role adminRole,
			Role managerRole, Role employeeRole, Role guestRole) {
		if (currentRole == adminRole) {
			authorities.add(new SimpleGrantedAuthority(AuthConstants.AUTH_ROLE + adminRole));
			authorities.add(new SimpleGrantedAuthority(AuthConstants.AUTH_ROLE + managerRole));
			authorities.add(new SimpleGrantedAuthority(AuthConstants.AUTH_ROLE + employeeRole));
		}
		else if (currentRole == managerRole) {
			authorities.add(new SimpleGrantedAuthority(AuthConstants.AUTH_ROLE + managerRole));
			authorities.add(new SimpleGrantedAuthority(AuthConstants.AUTH_ROLE + employeeRole));
		}
		else if (currentRole == employeeRole) {
			authorities.add(new SimpleGrantedAuthority(AuthConstants.AUTH_ROLE + employeeRole));
		}
		else if (currentRole == guestRole) {
			authorities.add(new SimpleGrantedAuthority(AuthConstants.AUTH_ROLE + guestRole));
		}
	}

}
