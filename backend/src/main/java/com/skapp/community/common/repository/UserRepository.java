package com.skapp.community.common.repository;

import com.skapp.community.common.model.User;
import com.skapp.community.common.model.WorkLocation;
import com.skapp.community.common.type.Role;

import java.util.List;
import java.util.Set;

public interface UserRepository {

	List<User> findAllByIsActiveTrueAndEmployeeWorkLocationInAndEmployeeRolePmRoleNot(Set<WorkLocation> workLocations,
			Role pmRole);

	List<User> findAllByIsActiveTrueAndEmployeeRolePmRoleNot(Role pmRole);

}
