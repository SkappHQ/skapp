package com.skapp.enterprise.common.repository;

import com.skapp.community.common.type.Role;
import org.springframework.stereotype.Repository;

@Repository
public interface EpEmployeeRoleRepository {

	long countByEmployeeRoleIsSuperAdminAndAccountStatus(Role roleName);

}
