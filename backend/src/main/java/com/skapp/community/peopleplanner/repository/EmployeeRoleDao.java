package com.skapp.community.peopleplanner.repository;

import com.skapp.community.common.type.Role;
import com.skapp.community.peopleplanner.model.EmployeeRole;
import com.skapp.community.peopleplanner.type.AccountStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;

@Repository
public interface EmployeeRoleDao extends JpaRepository<EmployeeRole, Long>, EmployeeRepository {

	boolean existsByIsSuperAdminTrueAndEmployee_AccountStatusIn(Set<AccountStatus> accountStatuses);

	List<EmployeeRole> findEmployeesByPeopleRole(Role roleName);

	long countByEsignRoleAndIsSuperAdmin(Role roleName, boolean isSuperAdmin);

	long countByIsSuperAdminTrueAndEmployee_AccountStatusIn(Set<AccountStatus> accountStatuses);

}
