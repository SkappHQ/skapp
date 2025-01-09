package com.skapp.enterprise.people.service.impl;

import com.skapp.community.common.service.UserService;
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

	public EmployeeRole createEmployeeRole(RoleRequestDto roleRequestDto, @NotNull Employee employee) {
		EmployeeRole employeeRole = super.createEmployeeRole(roleRequestDto, employee);

		// Assign enterprise related roles here

		return employeeRole;
	}

}
