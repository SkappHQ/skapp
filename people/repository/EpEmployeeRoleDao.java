package com.skapp.enterprise.people.repository;

import com.skapp.community.common.type.Role;
import com.skapp.community.peopleplanner.model.EmployeeRole;
import com.skapp.community.peopleplanner.type.AccountStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EpEmployeeRoleDao extends JpaRepository<EmployeeRole, Long>, EpEmployeeRoleRepository {

	List<EmployeeRole> findEmployeeRoleByIsSuperAdminAndEmployeeAccountStatusIn(boolean isSuperAdmin,
			List<AccountStatus> validStatuses);

	List<EmployeeRole> findEmployeeRoleByPeopleRoleAndIsSuperAdminFalseAndEmployeeAccountStatusIn(Role role,
			List<AccountStatus> validStatuses);

	List<EmployeeRole> findEmployeeRoleByLeaveRoleAndIsSuperAdminFalseAndEmployeeAccountStatusIn(Role role,
			List<AccountStatus> validStatuses);

	List<EmployeeRole> findEmployeeRoleByAttendanceRoleAndIsSuperAdminFalseAndEmployeeAccountStatusIn(Role role,
			List<AccountStatus> validStatuses);

	List<EmployeeRole> findEmployeeRoleByEsignRoleAndIsSuperAdminFalseAndEmployeeAccountStatusIn(Role role,
			List<AccountStatus> validStatuses);

	List<EmployeeRole> findEmployeeRoleByCrmRoleAndIsSuperAdminFalseAndEmployeeAccountStatusIn(Role role,
			List<AccountStatus> validStatuses);

}
