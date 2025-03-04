package com.skapp.enterprise.people.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.model.User;
import com.skapp.community.common.service.UserService;
import com.skapp.community.common.service.UserVersionService;
import com.skapp.community.common.type.ModuleType;
import com.skapp.community.common.type.Role;
import com.skapp.community.common.type.RoleLevel;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.community.peopleplanner.constant.PeopleMessageConstant;
import com.skapp.community.peopleplanner.mapper.PeopleMapper;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.EmployeeRole;
import com.skapp.community.peopleplanner.payload.request.RoleRequestDto;
import com.skapp.community.peopleplanner.payload.response.ModuleRoleRestrictionResponseDto;
import com.skapp.community.peopleplanner.repository.EmployeeDao;
import com.skapp.community.peopleplanner.repository.EmployeeRoleDao;
import com.skapp.community.peopleplanner.repository.ModuleRoleRestrictionDao;
import com.skapp.community.peopleplanner.repository.TeamDao;
import com.skapp.community.peopleplanner.service.impl.RolesServiceImpl;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
@Primary
public class EpRolesServiceImpl extends RolesServiceImpl {

	public EpRolesServiceImpl(EmployeeRoleDao employeeRoleDao, UserService userService, EmployeeDao employeeDao,
			TeamDao teamDao, PeopleMapper peopleMapper, ModuleRoleRestrictionDao moduleRoleRestrictionDao,
			MessageUtil messageUtil, UserVersionService userVersionService) {
		super(employeeRoleDao, userService, employeeDao, teamDao, peopleMapper, moduleRoleRestrictionDao, messageUtil,
				userVersionService);
	}

	@Override
	protected EmployeeRole createEmployeeRole(RoleRequestDto roleRequestDto, Employee employee) {
		EmployeeRole employeeRole = super.createEmployeeRole(roleRequestDto, employee);

		employeeRole.setEsignRole(roleRequestDto.getEsignRole());

		return employeeRole;
	}

	@Override
	protected EmployeeRole updateEmployeeRolesSafely(EmployeeRole employeeRole, RoleRequestDto roleRequestDto,
			LocalDate currentDate, User currentUser) {
		employeeRole = super.updateEmployeeRolesSafely(employeeRole, roleRequestDto, currentDate, currentUser);

		employeeRole.setEsignRole(roleRequestDto.getEsignRole());

		return employeeRole;
	}

	@Override
	protected Role getRoleForModuleAndLevel(ModuleType module, RoleLevel roleLevel) {
		Role role = super.getRoleForModuleAndLevel(module, roleLevel);

		if (module == ModuleType.ESIGN) {
			return switch (roleLevel) {
				case ADMIN -> Role.ESIGN_ADMIN;
				case SENDER -> Role.ESIGN_SENDER;
				case EMPLOYEE -> Role.ESIGN_EMPLOYEE;
				default -> null;
			};
		}
		return role;
	}

	@Override
	protected Map<ModuleType, List<RoleLevel>> initializeRolesForModule() {
		Map<ModuleType, List<RoleLevel>> roles = super.initializeRolesForModule();

		roles.put(ModuleType.ESIGN, List.of(RoleLevel.ADMIN, RoleLevel.SENDER, RoleLevel.EMPLOYEE));

		return roles;
	}

	@Override
	public void validateRoles(RoleRequestDto userRoles) {
		User currentUser = getUserService().getCurrentUser();

		super.validateRoles(userRoles);

		if (hasOnlyAdminPermissions(currentUser) && userRoles.getEsignRole() != null && Boolean.TRUE
			.equals(validateEpRestrictedRoleAssignment(userRoles.getEsignRole(), ModuleType.ESIGN))) {
			throw new ModuleException(PeopleMessageConstant.PEOPLE_ERROR_SUPER_ADMIN_RESTRICTED_ASSIGNING_ROLE_ACCESS);
		}

		if (Boolean.TRUE.equals(userRoles.getIsSuperAdmin()) && (userRoles.getEsignRole() != Role.ESIGN_ADMIN)) {
			throw new ModuleException(PeopleMessageConstant.PEOPLE_ERROR_SHOULD_ASSIGN_PROPER_PERMISSIONS);
		}
	}

	// New Ep Module Role restriction can be validated here
	private Boolean validateEpRestrictedRoleAssignment(Role role, ModuleType moduleType) {
		ModuleRoleRestrictionResponseDto restrictedRole = getRestrictedRoleByModule(moduleType);
		return switch (role) {
			case ESIGN_ADMIN -> Boolean.TRUE.equals(restrictedRole.getIsAdmin());
			default -> false;
		};
	}

	@Override
	public EmployeeRole setupBulkEmployeeRoles(Employee employee) {
		EmployeeRole employeeRole = super.setupBulkEmployeeRoles(employee);
		employeeRole.setEsignRole(Role.ESIGN_EMPLOYEE);
		return employeeRole;
	}

}
