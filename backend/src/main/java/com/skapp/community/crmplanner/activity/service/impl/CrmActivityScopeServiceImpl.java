package com.skapp.community.crmplanner.activity.service.impl;

import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.UserService;
import com.skapp.community.common.type.Role;
import com.skapp.community.crmplanner.activity.payload.request.CrmActivityTeamMemberFilterDto;
import com.skapp.community.crmplanner.activity.payload.response.CrmActivityPersonResponseDto;
import com.skapp.community.crmplanner.activity.repository.CrmActivityTeamMemberRepository;
import com.skapp.community.crmplanner.activity.service.CrmActivityScopeService;
import com.skapp.community.crmplanner.activity.type.CrmActivityScope;
import com.skapp.community.crmplanner.activity.util.CrmActivityFeedUtil;
import com.skapp.community.leaveplanner.type.ManagerType;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.EmployeeManager;
import com.skapp.community.peopleplanner.model.EmployeeRole;
import com.skapp.community.peopleplanner.repository.EmployeeManagerDao;
import com.skapp.community.peopleplanner.repository.TeamDao;
import com.skapp.community.peopleplanner.type.AccountStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@Slf4j
@RequiredArgsConstructor
public class CrmActivityScopeServiceImpl implements CrmActivityScopeService {

	private static final List<AccountStatus> REPORT_ACCOUNT_STATUSES = List.of(AccountStatus.ACTIVE,
			AccountStatus.PENDING);

	private final UserService userService;

	private final EmployeeManagerDao employeeManagerDao;

	private final TeamDao teamDao;

	private final CrmActivityTeamMemberRepository crmActivityTeamMemberRepository;

	@Override
	@Transactional(readOnly = true)
	public CrmActivityScope resolveScope(User user) {
		Employee employee = user.getEmployee();
		Long viewerId = employee.getEmployeeId();
		EmployeeRole employeeRole = employee.getEmployeeRole();

		if (Boolean.TRUE.equals(employeeRole.getIsSuperAdmin()) || employeeRole.getCrmRole() == Role.CRM_ADMIN) {
			return new CrmActivityScope(viewerId, Role.CRM_ADMIN, true, Set.of());
		}

		if (employeeRole.getCrmRole() == Role.CRM_SALES_MANAGER) {
			return new CrmActivityScope(viewerId, Role.CRM_SALES_MANAGER, false, findTeamOwnerIds(employee));
		}

		return new CrmActivityScope(viewerId, Role.CRM_SALES_REPRESENTATIVE, false, Set.of(viewerId));
	}

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getTeamMembers(CrmActivityTeamMemberFilterDto filterDto) {
		log.info("getTeamMembers: execution started");

		CrmActivityScope scope = resolveScope(userService.getCurrentUser());
		String searchPattern = CrmActivityFeedUtil.toSearchPattern(filterDto.getSearch());
		List<CrmActivityPersonResponseDto> members = scope.orgWide()
				? crmActivityTeamMemberRepository.findAllCrmMembers(searchPattern)
				: crmActivityTeamMemberRepository.findCrmMembersByEmployeeIds(scope.ownerIds(), searchPattern);

		log.info("getTeamMembers: execution ended");
		return new ResponseEntityDto(false, members);
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
