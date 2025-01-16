package com.skapp.enterprise.people.service.impl;

import com.skapp.community.common.model.User;
import com.skapp.community.common.service.UserService;
import com.skapp.community.common.type.ModuleType;
import com.skapp.community.common.type.Role;
import com.skapp.community.common.type.RoleLevel;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.community.peopleplanner.mapper.PeopleMapper;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.EmployeeRole;
import com.skapp.community.peopleplanner.payload.request.RoleRequestDto;
import com.skapp.community.peopleplanner.repository.EmployeeDao;
import com.skapp.community.peopleplanner.repository.EmployeeRoleDao;
import com.skapp.community.peopleplanner.repository.EmployeeTimelineDao;
import com.skapp.community.peopleplanner.repository.ModuleRoleRestrictionDao;
import com.skapp.community.peopleplanner.repository.TeamDao;
import com.skapp.community.peopleplanner.service.impl.RolesServiceImpl;
import jakarta.validation.constraints.NotNull;
import lombok.NonNull;
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

	public EpRolesServiceImpl(@NonNull EmployeeRoleDao employeeRoleDao, @NonNull UserService userService,
			@NonNull EmployeeDao employeeDao, @NonNull TeamDao teamDao,
			@NonNull EmployeeTimelineDao employeeTimelineDao, @NonNull PeopleMapper peopleMapper,
			@NonNull ModuleRoleRestrictionDao moduleRoleRestrictionDao, @NonNull MessageUtil messageUtil) {
		super(employeeRoleDao, userService, employeeDao, teamDao, employeeTimelineDao, peopleMapper,
				moduleRoleRestrictionDao, messageUtil);
	}

	@Override
	protected EmployeeRole createEmployeeRole(RoleRequestDto roleRequestDto, @NotNull Employee employee) {
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

}
