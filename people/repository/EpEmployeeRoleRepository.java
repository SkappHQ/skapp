package com.skapp.enterprise.people.repository;

import com.skapp.community.common.type.Role;

public interface EpEmployeeRoleRepository {

	long countByEmployeeRoleIsSuperAdminAndAccountStatus(Role roleName);

}
