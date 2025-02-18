package com.skapp.enterprise.people.service.impl;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.type.Role;
import com.skapp.community.peopleplanner.repository.EmployeeDao;
import com.skapp.community.peopleplanner.repository.EmployeeRoleDao;
import com.skapp.community.peopleplanner.type.AccountStatus;
import com.skapp.enterprise.common.config.TenantValidator;
import com.skapp.enterprise.common.constant.EpCommonConstants;
import com.skapp.enterprise.people.payload.response.EpEmployeeRoleLimitDto;
import com.skapp.enterprise.people.service.EpPeopleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Set;

@RequiredArgsConstructor
@Slf4j
@Service
public class EpPeopleServiceImpl implements EpPeopleService {

	private final EmployeeDao employeeDao;

	private final EmployeeRoleDao employeeRoleDao;

	private final TenantValidator tenantValidator;

	@Override
	public ResponseEntityDto getEmployeesLimit() {
		boolean isLimitExceeded = checkEmployeesLimit();
		return new ResponseEntityDto(false, isLimitExceeded);
	}

	@Override
	public boolean checkEmployeesLimit() {
		if (tenantValidator.isCurrentTenantPro()) {
			return false;
		}

		return employeeDao
			.countByAccountStatus(AccountStatus.ACTIVE) >= EpCommonConstants.ENTERPRISE_FREE_MAX_EMPLOYEE_COUNT;
	}

	@Override
	public ResponseEntityDto getEmployeesCount() {
		long count = countActiveAndPendingEmployees();
		return new ResponseEntityDto(false, count);
	}

	private long countActiveAndPendingEmployees() {
		return employeeDao.countByAccountStatusIn(Set.of(AccountStatus.ACTIVE, AccountStatus.PENDING));
	}

	@Override
	public ResponseEntityDto getEmployeeRoleLimit() {
		EpEmployeeRoleLimitDto roleLimits = checkEmployeeRoleLimits();
		return new ResponseEntityDto(false, roleLimits);
	}

	private EpEmployeeRoleLimitDto checkEmployeeRoleLimits() {
		if (tenantValidator.isCurrentTenantPro()) {
			return new EpEmployeeRoleLimitDto(false, false, false, false, false, false, false, false, false);
		}

		return new EpEmployeeRoleLimitDto(checkLeaveAdminLimit(), checkAttendanceAdminLimit(), checkPeopleAdminLimit(),
				checkESignAdminLimit(), checkLeaveManagerLimit(), checkAttendanceManagerLimit(),
				checkPeopleManagerLimit(), checkSuperAdminLimit(), checkEsignSenderLimit());
	}

	private boolean checkLeaveAdminLimit() {
		return employeeRoleDao.countByLeaveRoleAndIsSuperAdmin(Role.LEAVE_ADMIN,
				false) >= EpCommonConstants.ENTERPRISE_FREE_MAX_LEAVE_ADMIN_COUNT;
	}

	private boolean checkAttendanceAdminLimit() {
		return employeeRoleDao.countByAttendanceRoleAndIsSuperAdmin(Role.ATTENDANCE_ADMIN,
				false) >= EpCommonConstants.ENTERPRISE_FREE_MAX_ATTENDANCE_ADMIN_COUNT;
	}

	private boolean checkPeopleAdminLimit() {
		return employeeRoleDao.countByPeopleRoleAndIsSuperAdmin(Role.PEOPLE_ADMIN,
				false) >= EpCommonConstants.ENTERPRISE_FREE_MAX_PEOPLE_ADMIN_COUNT;
	}

	private boolean checkESignAdminLimit() {
		return employeeRoleDao.countByEsignRoleAndIsSuperAdmin(Role.ESIGN_ADMIN,
				false) >= EpCommonConstants.ENTERPRISE_FREE_MAX_ESIGN_ADMIN_COUNT;
	}

	private boolean checkLeaveManagerLimit() {
		return employeeRoleDao.countByLeaveRoleAndIsSuperAdmin(Role.LEAVE_MANAGER,
				false) >= EpCommonConstants.ENTERPRISE_FREE_MAX_LEAVE_MANAGER_COUNT;
	}

	private boolean checkAttendanceManagerLimit() {
		return employeeRoleDao.countByAttendanceRoleAndIsSuperAdmin(Role.ATTENDANCE_MANAGER,
				false) >= EpCommonConstants.ENTERPRISE_FREE_MAX_ATTENDANCE_MANAGER_COUNT;
	}

	private boolean checkPeopleManagerLimit() {
		return employeeRoleDao.countByPeopleRoleAndIsSuperAdmin(Role.PEOPLE_MANAGER,
				false) >= EpCommonConstants.ENTERPRISE_FREE_MAX_PEOPLE_MANAGER_COUNT;
	}

	private boolean checkSuperAdminLimit() {
		return employeeRoleDao.countByIsSuperAdminTrue() >= EpCommonConstants.ENTERPRISE_FREE_MAX_SUPER_ADMIN_COUNT;
	}

	private boolean checkEsignSenderLimit() {
		return employeeRoleDao.countByEsignRoleAndIsSuperAdmin(Role.ESIGN_SENDER,
				false) >= EpCommonConstants.ENTERPRISE_FREE_MAX_ESIGN_SENDER_COUNT;
	}

}
