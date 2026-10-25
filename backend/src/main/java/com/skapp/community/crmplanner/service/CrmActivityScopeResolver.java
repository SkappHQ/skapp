package com.skapp.community.crmplanner.service;

import com.skapp.community.common.model.User;
import com.skapp.community.peopleplanner.type.AccountStatus;
import com.skapp.community.common.type.Role;
import com.skapp.community.crmplanner.type.CrmActivityScope;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.EmployeeManager;
import com.skapp.community.peopleplanner.model.EmployeeRole;
import com.skapp.community.peopleplanner.repository.EmployeeManagerDao;
import com.skapp.community.peopleplanner.repository.TeamDao;
import com.skapp.community.leaveplanner.type.ManagerType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class CrmActivityScopeResolver {

	private static final List<AccountStatus> REPORT_ACCOUNT_STATUSES = List.of(AccountStatus.ACTIVE,
			AccountStatus.PENDING);

	private final EmployeeManagerDao employeeManagerDao;

	private final TeamDao teamDao;

	public CrmActivityScope resolveScope(User user) {
		Employee employee = user.getEmployee();
		Long viewerId = employee.getEmployeeId();
		EmployeeRole employeeRole = employee.getEmployeeRole();

		if (Boolean.TRUE.equals(employeeRole.getIsSuperAdmin()) || employeeRole.getCrmRole() == Role.CRM_ADMIN) {
			return new CrmActivityScope(viewerId, true, true, Set.of());
		}
		if (employeeRole.getCrmRole() == Role.CRM_SALES_MANAGER) {
			return new CrmActivityScope(viewerId, true, false, findTeamOwnerIds(employee));
		}
		return new CrmActivityScope(viewerId, false, false, Set.of(viewerId));
	}

	private Set<Long> findTeamOwnerIds(Employee manager) {
		Set<Long> ownerIds = new HashSet<>();
		ownerIds.add(manager.getEmployeeId());

		employeeManagerDao
			.findByManagerAndManagerTypeAndEmployeeAccountStatusIn(manager, ManagerType.PRIMARY,
					REPORT_ACCOUNT_STATUSES)
			.stream()
			.map(EmployeeManager::getEmployee)
			.map(Employee::getEmployeeId)
			.forEach(ownerIds::add);

		List<Long> teamIds = teamDao.findLeadingTeamIdsByManagerId(manager.getEmployeeId());
		if (!teamIds.isEmpty()) {
			teamDao.findEmployeesByTeamIds(teamIds).stream().map(Employee::getEmployeeId).forEach(ownerIds::add);
		}
		return Set.copyOf(ownerIds);
	}

}
