package com.skapp.enterprise.people.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.exception.ValidationException;
import com.skapp.community.common.model.User;
import com.skapp.community.common.service.UserService;
import com.skapp.community.common.type.ModuleType;
import com.skapp.community.common.type.Role;
import com.skapp.community.common.type.RoleLevel;
import com.skapp.community.common.util.CommonModuleUtils;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.community.peopleplanner.constant.PeopleMessageConstant;
import com.skapp.community.peopleplanner.mapper.PeopleMapper;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.EmployeeRole;
import com.skapp.community.peopleplanner.payload.request.RoleRequestDto;
import com.skapp.community.peopleplanner.payload.request.employee.EmployeeSystemPermissionsDto;
import com.skapp.community.peopleplanner.payload.response.ModuleRoleRestrictionResponseDto;
import com.skapp.community.peopleplanner.repository.EmployeeDao;
import com.skapp.community.peopleplanner.repository.EmployeeRoleDao;
import com.skapp.community.peopleplanner.repository.ModuleRoleRestrictionDao;
import com.skapp.community.peopleplanner.repository.TeamDao;
import com.skapp.community.peopleplanner.service.impl.RolesServiceImpl;
import com.skapp.community.peopleplanner.type.AccountStatus;
import com.skapp.enterprise.common.constant.EpCommonConstants;
import com.skapp.enterprise.esignature.service.EnvelopeService;
import com.skapp.enterprise.people.constant.EpPeopleMessageConstant;
import com.skapp.enterprise.people.repository.EpEmployeeDao;
import com.skapp.enterprise.people.repository.EpEmployeeRoleDao;
import com.skapp.enterprise.people.service.EpRolesService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Consumer;

@Service
@Slf4j
@Primary
public class EpRolesServiceImpl extends RolesServiceImpl implements EpRolesService {

	private final EpEmployeeRoleDao epEmployeeRoleDao;

	private final EnvelopeService envelopeService;

	private final EpEmployeeDao epEmployeeDao;

	public EpRolesServiceImpl(EmployeeRoleDao employeeRoleDao, UserService userService, EmployeeDao employeeDao,
			TeamDao teamDao, PeopleMapper peopleMapper, ModuleRoleRestrictionDao moduleRoleRestrictionDao,
			MessageUtil messageUtil, EpEmployeeRoleDao epEmployeeRoleDao, EnvelopeService envelopeService,
			EpEmployeeDao epEmployeeDao) {
		super(employeeRoleDao, userService, employeeDao, teamDao, peopleMapper, moduleRoleRestrictionDao, messageUtil);
		this.epEmployeeRoleDao = epEmployeeRoleDao;
		this.envelopeService = envelopeService;
		this.epEmployeeDao = epEmployeeDao;
	}

	@Override
	protected EmployeeRole createEmployeeRole(EmployeeSystemPermissionsDto roleRequestDto, Employee employee) {
		EmployeeRole employeeRole = super.createEmployeeRole(roleRequestDto, employee);

		boolean isSuperAdmin = (employee.getEmployeeRole() != null && employee.getEmployeeRole().getIsSuperAdmin()
				&& roleRequestDto.getIsSuperAdmin() != null && roleRequestDto.getIsSuperAdmin());

		if (isSuperAdmin) {
			employeeRole.setEsignRole(Role.ESIGN_ADMIN);
		}
		else {
			CommonModuleUtils.setIfExists(roleRequestDto::getEsignRole, employeeRole::setEsignRole);
		}

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
		else if (module == ModuleType.PM) {
			return switch (roleLevel) {
				case ADMIN -> Role.PM_ADMIN;
				case EMPLOYEE -> Role.PM_EMPLOYEE;
				default -> null;
			};
		}
		return role;
	}

	@Override
	protected Map<ModuleType, List<RoleLevel>> initializeRolesForModule() {
		Map<ModuleType, List<RoleLevel>> roles = super.initializeRolesForModule();

		roles.put(ModuleType.ESIGN, List.of(RoleLevel.ADMIN, RoleLevel.SENDER, RoleLevel.EMPLOYEE));
		roles.put(ModuleType.PM, List.of(RoleLevel.ADMIN, RoleLevel.EMPLOYEE));

		return roles;
	}

	@Override
	public void validateRoles(EmployeeSystemPermissionsDto userRoles, User user) {
		User currentUser = getUserService().getCurrentUser();

		super.validateRoles(userRoles, user);

		if ((user.getEmployee() == null || user.getEmployee().getEmployeeRole() == null)
				&& userRoles.getEsignRole() == null) {
			throw new ValidationException(EpPeopleMessageConstant.PEOPLE_ERROR_ESIGN_ROLE_REQUIRED);
		}

		if (userRoles != null && userRoles.getEsignRole() != null) {
			Role esignRole = userRoles.getEsignRole();
			EnumSet<Role> validEsignRoles = EnumSet.of(Role.ESIGN_EMPLOYEE, Role.ESIGN_SENDER, Role.ESIGN_ADMIN);
			if (!validEsignRoles.contains(esignRole)) {
				throw new ValidationException(EpPeopleMessageConstant.PEOPLE_ERROR_INVALID_ESIGN_ROLE,
						new String[] { esignRole.name() });
			}
		}

		if ((user.getEmployee() == null || user.getEmployee().getEmployeeRole() == null)
				&& Boolean.TRUE.equals(userRoles.getIsSuperAdmin()) && userRoles.getEsignRole() != Role.ESIGN_ADMIN) {
			throw new ModuleException(PeopleMessageConstant.PEOPLE_ERROR_SHOULD_ASSIGN_PROPER_PERMISSIONS);
		}

		if (user.getEmployee() != null && user.getEmployee().getEmployeeRole() != null
				&& user.getEmployee().getEmployeeRole().getIsSuperAdmin() && userRoles != null
				&& Boolean.TRUE.equals(userRoles.getIsSuperAdmin()) && userRoles.getEsignRole() != Role.ESIGN_ADMIN) {
			throw new ValidationException(PeopleMessageConstant.PEOPLE_ERROR_SUPER_ADMIN_ROLES_CANNOT_BE_CHANGED);
		}

		if (userRoles != null && hasOnlyPeopleAdminPermissions(currentUser) && userRoles.getEsignRole() != null
				&& Boolean.TRUE.equals(validateRestrictedRoleAssignment(userRoles.getEsignRole(), ModuleType.ESIGN))) {
			throw new ModuleException(EpPeopleMessageConstant.PEOPLE_ERROR_ESIGN_RESTRICTED_ROLE_ACCESS,
					new String[] { userRoles.getEsignRole().name() });
		}
	}

	@Override
	protected Boolean validateRestrictedRoleAssignment(Role role, ModuleType moduleType) {
		ModuleRoleRestrictionResponseDto restrictedRole = getRestrictedRoleByModule(moduleType);

		if (role == Role.ESIGN_ADMIN) {
			return Boolean.TRUE.equals(restrictedRole.getIsAdmin());
		}

		return super.validateRestrictedRoleAssignment(role, moduleType);
	}

	@Override
	public EmployeeRole setupBulkEmployeeRoles(Employee employee) {
		EmployeeRole employeeRole = super.setupBulkEmployeeRoles(employee);
		employeeRole.setEsignRole(Role.ESIGN_EMPLOYEE);
		employeeRole.setPmRole(Role.PM_EMPLOYEE);
		employeeRole.setInvoiceRole(Role.INVOICE_NONE);
		return employeeRole;
	}

	@Override
	public void downgradeUserRolesToEmployeeRole() {
		List<EmployeeRole> rolesToUpdate = new ArrayList<>();

		processSuperAdmins(rolesToUpdate);
		processRoleAdmins(rolesToUpdate);

		if (!rolesToUpdate.isEmpty()) {

			List<Employee> employees = epEmployeeDao.findAllByEmployeeIdInAndAccountStatusIn(
					rolesToUpdate.stream().map(role -> role.getEmployee().getEmployeeId()).toList(),
					Set.of(AccountStatus.ACTIVE, AccountStatus.PENDING));

			envelopeService.transferEmployeeEnvelopes(employees);
			epEmployeeRoleDao.saveAll(rolesToUpdate);
		}
	}

	@Override
	protected List<String> getRoleDisplayNames(ModuleType moduleType) {
		List<String> roles = new ArrayList<>();
		roles.add(RoleLevel.ADMIN.getDisplayName());
		if (moduleType == ModuleType.ESIGN) {
			roles.add(RoleLevel.SENDER.getDisplayName());
		}
		else if (moduleType != ModuleType.PM) {
			roles.add(RoleLevel.MANAGER.getDisplayName());
		}
		roles.add(RoleLevel.EMPLOYEE.getDisplayName());
		return roles;
	}

	private void processSuperAdmins(List<EmployeeRole> rolesToUpdate) {
		List<AccountStatus> validStatuses = Arrays.asList(AccountStatus.PENDING, AccountStatus.ACTIVE);
		List<EmployeeRole> superAdmins = epEmployeeRoleDao
			.findEmployeeRoleByIsSuperAdminAndEmployeeAccountStatusIn(true, validStatuses);
		superAdmins.sort(Comparator.comparing(role -> role.getEmployee().getCreatedDate()));

		if (superAdmins.size() > EpCommonConstants.ENTERPRISE_FREE_MAX_SUPER_ADMIN_COUNT) {
			List<EmployeeRole> excessSuperAdmins = superAdmins
				.subList(EpCommonConstants.ENTERPRISE_FREE_MAX_SUPER_ADMIN_COUNT, superAdmins.size());

			for (EmployeeRole role : excessSuperAdmins) {
				role.setIsSuperAdmin(false);
				role.setPeopleRole(Role.PEOPLE_EMPLOYEE);
				role.setLeaveRole(Role.LEAVE_EMPLOYEE);
				role.setAttendanceRole(Role.ATTENDANCE_EMPLOYEE);
				role.setEsignRole(Role.ESIGN_EMPLOYEE);
				role.setInvoiceRole(Role.INVOICE_ADMIN);
				rolesToUpdate.add(role);
			}
		}
	}

	private void processRoleAdmins(List<EmployeeRole> rolesToUpdate) {
		List<AccountStatus> validStatuses = Arrays.asList(AccountStatus.PENDING, AccountStatus.ACTIVE);

		processRoleType(rolesToUpdate,
				epEmployeeRoleDao.findEmployeeRoleByPeopleRoleAndIsSuperAdminFalseAndEmployeeAccountStatusIn(
						Role.PEOPLE_ADMIN, validStatuses),
				EpCommonConstants.ENTERPRISE_FREE_MAX_PEOPLE_ADMIN_COUNT,
				role -> role.setPeopleRole(Role.PEOPLE_EMPLOYEE));

		processRoleType(rolesToUpdate,
				epEmployeeRoleDao.findEmployeeRoleByLeaveRoleAndIsSuperAdminFalseAndEmployeeAccountStatusIn(
						Role.LEAVE_ADMIN, validStatuses),
				EpCommonConstants.ENTERPRISE_FREE_MAX_LEAVE_ADMIN_COUNT,
				role -> role.setLeaveRole(Role.LEAVE_EMPLOYEE));

		processRoleType(rolesToUpdate,
				epEmployeeRoleDao.findEmployeeRoleByAttendanceRoleAndIsSuperAdminFalseAndEmployeeAccountStatusIn(
						Role.ATTENDANCE_ADMIN, validStatuses),
				EpCommonConstants.ENTERPRISE_FREE_MAX_ATTENDANCE_ADMIN_COUNT,
				role -> role.setAttendanceRole(Role.ATTENDANCE_EMPLOYEE));

		processRoleType(rolesToUpdate,
				epEmployeeRoleDao.findEmployeeRoleByEsignRoleAndIsSuperAdminFalseAndEmployeeAccountStatusIn(
						Role.ESIGN_ADMIN, validStatuses),
				EpCommonConstants.ENTERPRISE_FREE_MAX_ESIGN_ADMIN_COUNT,
				role -> role.setEsignRole(Role.ESIGN_EMPLOYEE));

		processRoleType(rolesToUpdate,
				epEmployeeRoleDao.findEmployeeRoleByPeopleRoleAndIsSuperAdminFalseAndEmployeeAccountStatusIn(
						Role.PEOPLE_MANAGER, validStatuses),
				EpCommonConstants.ENTERPRISE_FREE_MAX_PEOPLE_MANAGER_COUNT,
				role -> role.setPeopleRole(Role.PEOPLE_EMPLOYEE));

		processRoleType(rolesToUpdate,
				epEmployeeRoleDao.findEmployeeRoleByLeaveRoleAndIsSuperAdminFalseAndEmployeeAccountStatusIn(
						Role.LEAVE_MANAGER, validStatuses),
				EpCommonConstants.ENTERPRISE_FREE_MAX_LEAVE_MANAGER_COUNT,
				role -> role.setLeaveRole(Role.LEAVE_EMPLOYEE));

		processRoleType(rolesToUpdate,
				epEmployeeRoleDao.findEmployeeRoleByAttendanceRoleAndIsSuperAdminFalseAndEmployeeAccountStatusIn(
						Role.ATTENDANCE_MANAGER, validStatuses),
				EpCommonConstants.ENTERPRISE_FREE_MAX_ATTENDANCE_MANAGER_COUNT,
				role -> role.setAttendanceRole(Role.ATTENDANCE_EMPLOYEE));

		processRoleType(rolesToUpdate,
				epEmployeeRoleDao.findEmployeeRoleByEsignRoleAndIsSuperAdminFalseAndEmployeeAccountStatusIn(
						Role.ESIGN_SENDER, validStatuses),
				EpCommonConstants.ENTERPRISE_FREE_MAX_ESIGN_SENDER_COUNT,
				role -> role.setEsignRole(Role.ESIGN_EMPLOYEE));
	}

	private void processRoleType(List<EmployeeRole> rolesToUpdate, List<EmployeeRole> roles, int maxAllowedCount,
			Consumer<EmployeeRole> roleDowngrader) {
		roles.sort(Comparator.comparing(role -> role.getEmployee().getCreatedDate()));

		if (roles.size() > maxAllowedCount) {
			List<EmployeeRole> excessRoles = roles.subList(maxAllowedCount, roles.size());

			for (EmployeeRole role : excessRoles) {
				roleDowngrader.accept(role);
				rolesToUpdate.add(role);
			}
		}
	}

}
