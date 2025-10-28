package com.skapp.community.peopleplanner.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.exception.ValidationException;
import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.UserService;
import com.skapp.community.common.type.ModuleType;
import com.skapp.community.common.type.Role;
import com.skapp.community.common.type.RoleLevel;
import com.skapp.community.common.util.CommonModuleUtils;
import com.skapp.community.common.util.DateTimeUtils;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.community.peopleplanner.constant.PeopleMessageConstant;
import com.skapp.community.peopleplanner.mapper.PeopleMapper;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.EmployeeRole;
import com.skapp.community.peopleplanner.model.ModuleRoleRestriction;
import com.skapp.community.peopleplanner.model.Team;
import com.skapp.community.peopleplanner.payload.request.ModuleRoleRestrictionRequestDto;
import com.skapp.community.peopleplanner.payload.request.RoleRequestDto;
import com.skapp.community.peopleplanner.payload.request.employee.EmployeeSystemPermissionsDto;
import com.skapp.community.peopleplanner.payload.response.AllowedModuleRolesResponseDto;
import com.skapp.community.peopleplanner.payload.response.AllowedRoleDto;
import com.skapp.community.peopleplanner.payload.response.ModuleRoleRestrictionResponseDto;
import com.skapp.community.peopleplanner.payload.response.RoleResponseDto;
import com.skapp.community.peopleplanner.repository.EmployeeDao;
import com.skapp.community.peopleplanner.repository.EmployeeRoleDao;
import com.skapp.community.peopleplanner.repository.ModuleRoleRestrictionDao;
import com.skapp.community.peopleplanner.repository.TeamDao;
import com.skapp.community.peopleplanner.service.RolesService;
import com.skapp.community.peopleplanner.type.AccountStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;

@Service
@Slf4j
@RequiredArgsConstructor
public class RolesServiceImpl implements RolesService {

	private final EmployeeRoleDao employeeRoleDao;

	@Getter
	private final UserService userService;

	private final EmployeeDao employeeDao;

	private final TeamDao teamDao;

	private final PeopleMapper peopleMapper;

	private final ModuleRoleRestrictionDao moduleRoleRestrictionDao;

	private final MessageUtil messageUtil;

	@Override
	public ResponseEntityDto getSystemRoles() {
		log.info("getSystemRoles: execution started");

		List<RoleResponseDto> roleResponseDtos = new ArrayList<>();

		for (ModuleType moduleType : ModuleType.values()) {
			if (moduleType != ModuleType.COMMON) {
				roleResponseDtos.add(createRoleResponseDto(moduleType));
			}
		}

		log.info("getSystemRoles: execution ended");
		return new ResponseEntityDto(false, roleResponseDtos);
	}

	@Override
	public EmployeeRole assignRolesToEmployee(EmployeeSystemPermissionsDto roleRequestDto, Employee employee) {
		log.info("assignRolesToEmployee: execution started");

		EmployeeRole employeeRole = createEmployeeRole(roleRequestDto, employee);

		log.info("assignRolesToEmployee: execution ended");
		return employeeRole;
	}

	@Override
	public ResponseEntityDto updateRoleRestrictions(ModuleRoleRestrictionRequestDto moduleRoleRestrictionRequestDto) {
		log.info("updateRoleRestrictions: execution started");

		ModuleRoleRestriction moduleRoleRestriction = peopleMapper
			.roleRestrictionRequestDtoToRestrictRole(moduleRoleRestrictionRequestDto);
		moduleRoleRestrictionDao.save(moduleRoleRestriction);

		log.info("updateRoleRestrictions: execution ended");
		return new ResponseEntityDto(false, messageUtil.getMessage(PeopleMessageConstant.PEOPLE_SUCCESS_ROLE_RESTRICT));
	}

	@Override
	public ModuleRoleRestrictionResponseDto getRestrictedRoleByModule(ModuleType module) {
		log.info("getRestrictedRoles: execution started");

		Optional<ModuleRoleRestriction> restrictedRole = moduleRoleRestrictionDao.findById(module);
		if (restrictedRole.isEmpty()) {
			ModuleRoleRestrictionResponseDto newRestrictRole = new ModuleRoleRestrictionResponseDto();
			newRestrictRole.setModule(module);
			newRestrictRole.setIsAdmin(false);
			newRestrictRole.setIsManager(false);

			return newRestrictRole;
		}

		ModuleRoleRestriction moduleRoleRestriction = restrictedRole.get();
		ModuleRoleRestrictionResponseDto moduleRoleRestrictionResponseDto = peopleMapper
			.restrictRoleToRestrictRoleResponseDto(moduleRoleRestriction);

		log.info("getRestrictedRoles: execution ended");
		return moduleRoleRestrictionResponseDto;
	}

	private boolean isEmployeeDemoted(EmployeeSystemPermissionsDto roleRequestDto, Employee employee) {
		if (employee == null || employee.getEmployeeRole() == null || roleRequestDto == null) {
			return false;
		}

		EmployeeRole employeeRole = employee.getEmployeeRole();

		return isRoleDemoted(employeeRole.getPeopleRole(), roleRequestDto.getPeopleRole(), Role.PEOPLE_MANAGER,
				Role.PEOPLE_ADMIN, Role.PEOPLE_EMPLOYEE)
				|| isRoleDemoted(employeeRole.getAttendanceRole(), roleRequestDto.getAttendanceRole(),
						Role.ATTENDANCE_MANAGER, Role.ATTENDANCE_ADMIN, Role.ATTENDANCE_EMPLOYEE)
				|| isRoleDemoted(employeeRole.getLeaveRole(), roleRequestDto.getLeaveRole(), Role.LEAVE_MANAGER,
						Role.LEAVE_ADMIN, Role.LEAVE_EMPLOYEE)
				|| isRoleDemoted(employeeRole.getInvoiceRole(), roleRequestDto.getInvoiceRole(), Role.INVOICE_MANAGER,
						Role.INVOICE_ADMIN, Role.INVOICE_NONE);
	}

	private boolean isRoleDemoted(Role currentRole, Role newRole, Role managerRole, Role adminRole, Role employeeRole) {
		return (currentRole == managerRole || currentRole == adminRole) && newRole == employeeRole;
	}

	protected EmployeeRole updateEmployeeRolesSafely(EmployeeRole employeeRole, RoleRequestDto roleRequestDto,
			LocalDate currentDate, User currentUser) {
		if (employeeRole != null) {
			employeeRole.setPeopleRole(roleRequestDto.getPeopleRole());
			employeeRole.setLeaveRole(roleRequestDto.getLeaveRole());
			employeeRole.setAttendanceRole(roleRequestDto.getAttendanceRole());
			employeeRole.setIsSuperAdmin(roleRequestDto.getIsSuperAdmin());
			employeeRole.setChangedDate(currentDate);

			if (currentUser != null && currentUser.getEmployee() != null) {
				employeeRole.setRoleChangedBy(currentUser.getEmployee());
			}
		}
		return employeeRole;
	}

	@Override
	public ResponseEntityDto getAllowedRoles() {
		log.info("getAllowedRoles: execution started");

		Map<ModuleType, List<RoleLevel>> moduleTypeListMap = initializeRolesForModule();
		List<AllowedModuleRolesResponseDto> allowedModuleRolesResponseDtos = moduleTypeListMap.entrySet()
			.stream()
			.map(this::processModuleRoles)
			.toList();

		log.info("getAllowedRoles: execution ended");
		return new ResponseEntityDto(false, allowedModuleRolesResponseDtos);
	}

	private AllowedModuleRolesResponseDto processModuleRoles(Map.Entry<ModuleType, List<RoleLevel>> entry) {
		Optional<EmployeeRole> employeeRoleOpt = employeeRoleDao.findById(userService.getCurrentUser().getUserId());
		boolean isSuperAdmin = employeeRoleOpt.map(EmployeeRole::getIsSuperAdmin).orElse(false);

		ModuleType module = entry.getKey();
		List<RoleLevel> prebuiltRoles = entry.getValue();

		ModuleRoleRestriction moduleRoleRestriction = moduleRoleRestrictionDao.findById(module).orElse(null);

		boolean isAdminAllowed = isSuperAdmin
				|| (moduleRoleRestriction == null || Boolean.FALSE.equals(moduleRoleRestriction.getIsAdmin()));
		boolean isManagerAllowed = isSuperAdmin
				|| (moduleRoleRestriction == null || Boolean.FALSE.equals(moduleRoleRestriction.getIsManager()));

		List<AllowedRoleDto> rolesForModule = prebuiltRoles.stream()
			.filter(roleLevel -> isRoleAllowed(roleLevel, isAdminAllowed, isManagerAllowed))
			.map(roleLevel -> createAllowedRole(roleLevel.getDisplayName(),
					getRoleForModuleAndLevel(module, roleLevel)))
			.toList();

		AllowedModuleRolesResponseDto moduleResponse = new AllowedModuleRolesResponseDto();
		moduleResponse.setModule(module);
		moduleResponse.setRoles(rolesForModule);
		return moduleResponse;
	}

	// Helper method to determine if a role is allowed based on restrictions
	private boolean isRoleAllowed(RoleLevel roleLevel, boolean isAdminAllowed, boolean isManagerAllowed) {
		return switch (roleLevel) {
			case ADMIN -> isAdminAllowed;
			case MANAGER -> isManagerAllowed;
			default -> true; // other roles are always allowed
		};
	}

	protected Map<ModuleType, List<RoleLevel>> initializeRolesForModule() {
		Map<ModuleType, List<RoleLevel>> roles = new EnumMap<>(ModuleType.class);

		roles.put(ModuleType.ATTENDANCE, List.of(RoleLevel.ADMIN, RoleLevel.MANAGER, RoleLevel.EMPLOYEE));
		roles.put(ModuleType.PEOPLE, List.of(RoleLevel.ADMIN, RoleLevel.MANAGER, RoleLevel.EMPLOYEE));
		roles.put(ModuleType.LEAVE, List.of(RoleLevel.ADMIN, RoleLevel.MANAGER, RoleLevel.EMPLOYEE));
		roles.put(ModuleType.OKR, List.of(RoleLevel.ADMIN, RoleLevel.MANAGER, RoleLevel.EMPLOYEE));
		roles.put(ModuleType.INVOICE, List.of(RoleLevel.ADMIN, RoleLevel.MANAGER));
		roles.put(ModuleType.PM, List.of(RoleLevel.ADMIN, RoleLevel.EMPLOYEE));

		return roles;
	}

	@Override
	public ResponseEntityDto getSuperAdminCount() {
		log.info("getSuperAdminCount: execution started");

		long superAdminCount = employeeRoleDao
			.countByIsSuperAdminTrueAndEmployee_AccountStatusIn(Set.of(AccountStatus.ACTIVE, AccountStatus.PENDING));

		log.info("getSuperAdminCount: execution ended");
		return new ResponseEntityDto(false, superAdminCount);
	}

	@Override
	public void saveEmployeeRoles(@NotNull Employee employee) {
		log.info("saveEmployeeRoles: execution started");

		EmployeeRole employeeRole = setupBulkEmployeeRoles(employee);

		employeeRoleDao.save(employeeRole);
		employee.setEmployeeRole(employeeRole);

		log.info("saveEmployeeRoles: execution started");
	}

	@Override
	public EmployeeRole setupBulkEmployeeRoles(Employee employee) {
		EmployeeRole employeeRole = new EmployeeRole();
		employeeRole.setEmployee(employee);
		employeeRole.setPeopleRole(Role.PEOPLE_EMPLOYEE);
		employeeRole.setLeaveRole(Role.LEAVE_EMPLOYEE);
		employeeRole.setAttendanceRole(Role.ATTENDANCE_EMPLOYEE);
		employeeRole.setIsSuperAdmin(false);
		employeeRole.setChangedDate(DateTimeUtils.getCurrentUtcDate());
		employeeRole.setRoleChangedBy(employee);
		return employeeRole;
	}

	@Override
	public EmployeeSystemPermissionsDto getDefaultEmployeeRoles() {
		EmployeeSystemPermissionsDto defaultEmployeeRoles = new EmployeeSystemPermissionsDto();
		defaultEmployeeRoles.setPeopleRole(Role.PEOPLE_EMPLOYEE);
		defaultEmployeeRoles.setLeaveRole(Role.LEAVE_EMPLOYEE);
		defaultEmployeeRoles.setAttendanceRole(Role.ATTENDANCE_EMPLOYEE);
		defaultEmployeeRoles.setEsignRole(Role.ESIGN_EMPLOYEE);
		defaultEmployeeRoles.setInvoiceRole(Role.INVOICE_NONE);
		defaultEmployeeRoles.setPmRole(Role.PM_EMPLOYEE);
		defaultEmployeeRoles.setOkrRole(Role.OKR_EMPLOYEE);
		return defaultEmployeeRoles;
	}

	public void validateRoles(EmployeeSystemPermissionsDto userRoles, User user) {
		if ((user.getEmployee() == null || user.getEmployee().getEmployeeRole() == null) && userRoles == null) {
			throw new ValidationException(PeopleMessageConstant.PEOPLE_ERROR_SYSTEM_PERMISSION_REQUIRED);
		}

		User currentUser = userService.getCurrentUser();
		if (user.getEmployee() != null && userRoles != null
				&& Objects.equals(currentUser.getUserId(), user.getEmployee().getEmployeeId())) {
			throw new ModuleException(PeopleMessageConstant.PEOPLE_ERROR_CANNOT_CHANGE_OWN_PERMISSIONS);
		}

		if (userRoles != null && user.getEmployee() != null
				&& Boolean.TRUE.equals(user.getEmployee().getEmployeeRole().getIsSuperAdmin())
				&& employeeRoleDao.countByIsSuperAdminTrueAndEmployee_AccountStatusIn(
						Set.of(AccountStatus.ACTIVE, AccountStatus.PENDING)) == 1
				&& isUserRoleDowngraded(userRoles)) {
			throw new ModuleException(PeopleMessageConstant.PEOPLE_ERROR_ONLY_ONE_SUPER_ADMIN);
		}

		if (isEmployeeDemoted(userRoles, user.getEmployee())) {
			List<Team> teams = teamDao.findTeamsManagedByUser(user.getEmployee().getEmployeeId(), true);

			Long managingEmployeeCount = employeeDao.countEmployeesByManagerId(user.getEmployee().getEmployeeId());

			if (!teams.isEmpty()) {
				throw new ModuleException(PeopleMessageConstant.PEOPLE_ERROR_LEADING_TEAMS);
			}

			if (managingEmployeeCount > 0) {
				throw new ModuleException(PeopleMessageConstant.PEOPLE_ERROR_SUPERVISING_EMPLOYEES);
			}
		}

		if ((user.getEmployee() == null || user.getEmployee().getEmployeeRole() == null) && userRoles != null
				&& userRoles.getIsSuperAdmin() == null) {
			throw new ValidationException(PeopleMessageConstant.PEOPLE_ERROR_SUPER_ADMIN_REQUIRED);
		}

		if ((user.getEmployee() == null || user.getEmployee().getEmployeeRole() == null) && userRoles != null
				&& userRoles.getPeopleRole() == null) {
			throw new ValidationException(PeopleMessageConstant.PEOPLE_ERROR_PEOPLE_ROLE_REQUIRED);
		}

		if ((user.getEmployee() == null || user.getEmployee().getEmployeeRole() == null) && userRoles != null
				&& userRoles.getAttendanceRole() == null) {
			throw new ValidationException(PeopleMessageConstant.PEOPLE_ERROR_ATTENDANCE_ROLE_REQUIRED);
		}

		if ((user.getEmployee() == null || user.getEmployee().getEmployeeRole() == null) && userRoles != null
				&& userRoles.getLeaveRole() == null) {
			throw new ValidationException(PeopleMessageConstant.PEOPLE_ERROR_LEAVE_ROLE_REQUIRED);
		}

		if ((user.getEmployee() == null || user.getEmployee().getEmployeeRole() == null) && userRoles != null
				&& userRoles.getInvoiceRole() == null) {
			throw new ValidationException(PeopleMessageConstant.PEOPLE_ERROR_INVOICE_ROLE_REQUIRED);
		}

		if (userRoles != null && userRoles.getPeopleRole() != null) {
			Role peopleRole = userRoles.getPeopleRole();
			EnumSet<Role> validPeopleRoles = EnumSet.of(Role.PEOPLE_EMPLOYEE, Role.PEOPLE_MANAGER, Role.PEOPLE_ADMIN);
			if (!validPeopleRoles.contains(peopleRole)) {
				throw new ValidationException(PeopleMessageConstant.PEOPLE_ERROR_INVALID_PEOPLE_ROLE,
						new String[] { peopleRole.name() });
			}
		}

		if (user.getEmployee() != null && user.getEmployee().getEmployeeRole() != null
				&& user.getEmployee().getEmployeeRole().getIsSuperAdmin() && userRoles != null
				&& Boolean.TRUE.equals(userRoles.getIsSuperAdmin())
				&& (userRoles.getPeopleRole() != Role.PEOPLE_ADMIN || userRoles.getLeaveRole() != Role.LEAVE_ADMIN
						|| userRoles.getAttendanceRole() != Role.ATTENDANCE_ADMIN
						|| userRoles.getInvoiceRole() != Role.INVOICE_ADMIN)) {
			throw new ValidationException(PeopleMessageConstant.PEOPLE_ERROR_SUPER_ADMIN_ROLES_CANNOT_BE_CHANGED);
		}

		if (userRoles != null && userRoles.getAttendanceRole() != null) {
			Role attendanceRole = userRoles.getAttendanceRole();
			EnumSet<Role> validAttendanceRoles = EnumSet.of(Role.ATTENDANCE_EMPLOYEE, Role.ATTENDANCE_MANAGER,
					Role.ATTENDANCE_ADMIN);
			if (!validAttendanceRoles.contains(attendanceRole)) {
				throw new ValidationException(PeopleMessageConstant.PEOPLE_ERROR_INVALID_ATTENDANCE_ROLE,
						new String[] { attendanceRole.name() });
			}
		}

		if (userRoles != null && userRoles.getLeaveRole() != null) {
			Role leaveRole = userRoles.getLeaveRole();
			EnumSet<Role> validLeaveRoles = EnumSet.of(Role.LEAVE_EMPLOYEE, Role.LEAVE_MANAGER, Role.LEAVE_ADMIN);
			if (!validLeaveRoles.contains(leaveRole)) {
				throw new ValidationException(PeopleMessageConstant.PEOPLE_ERROR_INVALID_LEAVE_ROLE,
						new String[] { leaveRole.name() });
			}
		}

		if (userRoles != null && userRoles.getInvoiceRole() != null) {
			Role invoiceRole = userRoles.getInvoiceRole();
			EnumSet<Role> validInvoiceRoles = EnumSet.of(Role.INVOICE_MANAGER, Role.INVOICE_ADMIN, Role.INVOICE_NONE);
			if (!validInvoiceRoles.contains(invoiceRole)) {
				throw new ValidationException(PeopleMessageConstant.PEOPLE_ERROR_INVALID_INVOICE_ROLE,
						new String[] { invoiceRole.name() });
			}
		}

		if ((user.getEmployee() == null || user.getEmployee().getEmployeeRole() == null) && userRoles != null
				&& Boolean.TRUE.equals(userRoles.getIsSuperAdmin())
				&& (userRoles.getPeopleRole() != Role.PEOPLE_ADMIN || userRoles.getLeaveRole() != Role.LEAVE_ADMIN
						|| userRoles.getAttendanceRole() != Role.ATTENDANCE_ADMIN
						|| userRoles.getInvoiceRole() != Role.INVOICE_ADMIN)) {
			throw new ValidationException(PeopleMessageConstant.PEOPLE_ERROR_SHOULD_ASSIGN_PROPER_PERMISSIONS);
		}

		if (userRoles != null && hasOnlyPeopleAdminPermissions(currentUser) && Boolean.TRUE
			.equals(validateRestrictedRoleAssignment(userRoles.getAttendanceRole(), ModuleType.ATTENDANCE))) {
			throw new ValidationException(PeopleMessageConstant.PEOPLE_ERROR_ATTENDANCE_RESTRICTED_ROLE_ACCESS,
					new String[] { userRoles.getAttendanceRole().name() });
		}

		if (userRoles != null && hasOnlyPeopleAdminPermissions(currentUser) && Boolean.TRUE
			.equals(validateRestrictedRoleAssignment(userRoles.getPeopleRole(), ModuleType.PEOPLE))) {
			throw new ValidationException(PeopleMessageConstant.PEOPLE_ERROR_PEOPLE_RESTRICTED_ROLE_ACCESS,
					new String[] { userRoles.getPeopleRole().name() });
		}

		if (userRoles != null && hasOnlyPeopleAdminPermissions(currentUser)
				&& Boolean.TRUE.equals(validateRestrictedRoleAssignment(userRoles.getLeaveRole(), ModuleType.LEAVE))) {
			throw new ValidationException(PeopleMessageConstant.PEOPLE_ERROR_LEAVE_RESTRICTED_ROLE_ACCESS,
					new String[] { userRoles.getLeaveRole().name() });
		}

		if (userRoles != null && hasOnlyPeopleAdminPermissions(currentUser) && Boolean.TRUE
			.equals(validateRestrictedRoleAssignment(userRoles.getInvoiceRole(), ModuleType.INVOICE))) {
			throw new ValidationException(PeopleMessageConstant.PEOPLE_ERROR_INVOICE_RESTRICTED_ROLE_ACCESS,
					new String[] { userRoles.getInvoiceRole().name() });
		}
	}

	@Override
	public void saveSuperAdminRoles(Employee employee) {
		log.info("saveSuperAdminRoles: execution started");

		EmployeeRole superAdminRoles = new EmployeeRole();
		superAdminRoles.setEmployee(employee);
		superAdminRoles.setPeopleRole(Role.PEOPLE_ADMIN);
		superAdminRoles.setLeaveRole(Role.LEAVE_ADMIN);
		superAdminRoles.setAttendanceRole(Role.ATTENDANCE_ADMIN);
		superAdminRoles.setInvoiceRole(Role.INVOICE_ADMIN);
		superAdminRoles.setIsSuperAdmin(true);
		superAdminRoles.setChangedDate(DateTimeUtils.getCurrentUtcDate());
		superAdminRoles.setRoleChangedBy(employee);

		employeeRoleDao.save(superAdminRoles);
		employee.setEmployeeRole(superAdminRoles);

		log.info("saveSuperAdminRoles: execution ended");
	}

	protected boolean hasOnlyPeopleAdminPermissions(User currentUser) {
		return Boolean.FALSE.equals(currentUser.getEmployee().getEmployeeRole().getIsSuperAdmin())
				&& currentUser.getEmployee().getEmployeeRole().getPeopleRole() == Role.PEOPLE_ADMIN;
	}

	protected Boolean validateRestrictedRoleAssignment(Role role, ModuleType moduleType) {
		ModuleRoleRestrictionResponseDto restrictedRole = getRestrictedRoleByModule(moduleType);

		if (role == Role.PEOPLE_ADMIN || role == Role.ATTENDANCE_ADMIN || role == Role.LEAVE_ADMIN
				|| role == Role.INVOICE_ADMIN) {
			return Boolean.TRUE.equals(restrictedRole.getIsAdmin());
		}

		if (role == Role.PEOPLE_MANAGER || role == Role.ATTENDANCE_MANAGER || role == Role.LEAVE_MANAGER
				|| role == Role.INVOICE_MANAGER) {
			return Boolean.TRUE.equals(restrictedRole.getIsManager());
		}

		return false;
	}

	private AllowedRoleDto createAllowedRole(String roleName, Role role) {
		AllowedRoleDto allowedRole = new AllowedRoleDto();
		allowedRole.setName(roleName);
		allowedRole.setRole(role);
		return allowedRole;
	}

	protected Role getRoleForModuleAndLevel(ModuleType module, RoleLevel roleLevel) {
		return switch (module) {
			case ATTENDANCE -> switch (roleLevel) {
				case ADMIN -> Role.ATTENDANCE_ADMIN;
				case MANAGER -> Role.ATTENDANCE_MANAGER;
				case EMPLOYEE -> Role.ATTENDANCE_EMPLOYEE;
				default -> null;
			};
			case PEOPLE -> switch (roleLevel) {
				case ADMIN -> Role.PEOPLE_ADMIN;
				case MANAGER -> Role.PEOPLE_MANAGER;
				case EMPLOYEE -> Role.PEOPLE_EMPLOYEE;
				default -> null;
			};
			case LEAVE -> switch (roleLevel) {
				case ADMIN -> Role.LEAVE_ADMIN;
				case MANAGER -> Role.LEAVE_MANAGER;
				case EMPLOYEE -> Role.LEAVE_EMPLOYEE;
				default -> null;
			};
			case OKR -> switch (roleLevel) {
				case ADMIN -> Role.OKR_ADMIN;
				case MANAGER -> Role.OKR_MANAGER;
				case EMPLOYEE -> Role.OKR_EMPLOYEE;
				default -> null;
			};
			case PM -> switch (roleLevel) {
				case ADMIN -> Role.PM_ADMIN;
				case EMPLOYEE -> Role.PM_EMPLOYEE;
				default -> null;
			};
			case INVOICE -> switch (roleLevel) {
				case ADMIN -> Role.INVOICE_ADMIN;
				case MANAGER -> Role.INVOICE_MANAGER;
				default -> null;
			};
			default -> null;
		};
	}

	protected EmployeeRole createEmployeeRole(EmployeeSystemPermissionsDto roleRequestDto, Employee employee) {
		EmployeeRole employeeRole = employee.getEmployeeRole();
		if (employeeRole == null) {
			employeeRole = new EmployeeRole();
		}

		User currentUser = userService.getCurrentUser();

		boolean isSuperAdmin = (roleRequestDto.getIsSuperAdmin() != null && roleRequestDto.getIsSuperAdmin())
				|| (roleRequestDto.getIsSuperAdmin() == null && employeeRole.getIsSuperAdmin() != null
						&& employeeRole.getIsSuperAdmin());

		if (isSuperAdmin) {
			employeeRole.setPeopleRole(Role.PEOPLE_ADMIN);
			employeeRole.setLeaveRole(Role.LEAVE_ADMIN);
			employeeRole.setAttendanceRole(Role.ATTENDANCE_ADMIN);
			employeeRole.setEsignRole(Role.ESIGN_ADMIN);
			employeeRole.setOkrRole(Role.OKR_ADMIN);
			employeeRole.setPmRole(Role.PM_ADMIN);
			employeeRole.setInvoiceRole(Role.INVOICE_ADMIN);
			employeeRole.setIsSuperAdmin(true);
		}
		else {
			CommonModuleUtils.setIfExists(roleRequestDto::getPeopleRole, employeeRole::setPeopleRole);
			CommonModuleUtils.setIfExists(roleRequestDto::getLeaveRole, employeeRole::setLeaveRole);
			CommonModuleUtils.setIfExists(roleRequestDto::getAttendanceRole, employeeRole::setAttendanceRole);
			CommonModuleUtils.setIfExists(roleRequestDto::getEsignRole, employeeRole::setEsignRole);
			CommonModuleUtils.setIfExists(roleRequestDto::getOkrRole, employeeRole::setOkrRole);
			CommonModuleUtils.setIfExists(roleRequestDto::getInvoiceRole, employeeRole::setInvoiceRole);
			CommonModuleUtils.setIfExists(roleRequestDto::getPmRole, employeeRole::setPmRole);
			CommonModuleUtils.setIfExists(roleRequestDto::getIsSuperAdmin, employeeRole::setIsSuperAdmin);
		}

		CommonModuleUtils.setIfExists(DateTimeUtils::getCurrentUtcDate, employeeRole::setChangedDate);
		CommonModuleUtils.setIfExists(currentUser::getEmployee, employeeRole::setRoleChangedBy);
		CommonModuleUtils.setIfExists(() -> employee, employeeRole::setEmployee);

		return employeeRole;
	}

	private RoleResponseDto createRoleResponseDto(ModuleType moduleType) {
		RoleResponseDto roleResponseDto = new RoleResponseDto();
		String displayName = moduleType.getDisplayName();
		if (displayName == null || displayName.isEmpty()) {
			throw new ModuleException(PeopleMessageConstant.PEOPLE_ERROR_INVALID_MODULE_NAME);
		}
		String capitalizedModuleName = Character.toUpperCase(displayName.charAt(0))
				+ displayName.substring(1).toLowerCase();
		roleResponseDto.setModule(capitalizedModuleName);

		List<String> roles = getRoleDisplayNames(moduleType);

		roleResponseDto.setRoles(roles);
		return roleResponseDto;
	}

	protected List<String> getRoleDisplayNames(ModuleType moduleType) {
		List<String> roles = new ArrayList<>();
		roles.add(RoleLevel.ADMIN.getDisplayName());
		roles.add(RoleLevel.MANAGER.getDisplayName());
		roles.add(RoleLevel.EMPLOYEE.getDisplayName());
		return roles;
	}

	private boolean isUserRoleDowngraded(EmployeeSystemPermissionsDto roleRequestDto) {
		return roleRequestDto.getPeopleRole() == null || !roleRequestDto.getPeopleRole().equals(Role.PEOPLE_ADMIN)
				|| !roleRequestDto.getAttendanceRole().equals(Role.ATTENDANCE_ADMIN)
				|| !roleRequestDto.getLeaveRole().equals(Role.LEAVE_ADMIN);
	}

}
