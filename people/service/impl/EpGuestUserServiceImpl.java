package com.skapp.enterprise.people.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.model.User;
import com.skapp.community.common.repository.UserDao;
import com.skapp.community.common.type.LoginMethod;
import com.skapp.community.common.type.Role;
import com.skapp.community.common.util.Validation;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.EmployeeRole;
import com.skapp.community.peopleplanner.repository.EmployeeDao;
import com.skapp.community.peopleplanner.repository.EmployeeRoleDao;
import com.skapp.community.peopleplanner.type.AccountStatus;
import com.skapp.enterprise.common.constant.EPCommonMessageConstant;
import com.skapp.enterprise.common.payload.request.EpGuestUserRequestDto;
import com.skapp.enterprise.common.payload.response.EpUserResponseDto;
import com.skapp.enterprise.common.util.EmailNameExtractor;
import com.skapp.enterprise.people.service.EpGuestUserService;
import com.skapp.enterprise.people.service.EpPeopleService;
import com.skapp.enterprise.people.service.EpUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Primary
@RequiredArgsConstructor
public class EpGuestUserServiceImpl implements EpGuestUserService {

	private final EmployeeDao employeeDao;

	private final UserDao userDao;

	private final EmployeeRoleDao employeeRoleDao;

	private final EpUserService epUserService;

	private final EpPeopleService epPeopleService;

	@Override
	@Transactional
	public EpUserResponseDto saveGuestUsers(EpGuestUserRequestDto epGuestUserRequestDto) {
		if (epGuestUserRequestDto == null || epGuestUserRequestDto.getEmail().isEmpty()) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_INVALID_GUEST_USER_EMAILS);
		}

		String email = epGuestUserRequestDto.getEmail();
		Validation.validateEmail(email);
		if (userDao.findByEmail(email).isEmpty()) {
			User user = new User();
			user.setEmail(email);
			user.setLoginMethod(LoginMethod.CREDENTIALS);
			User savedUser = userDao.save(user);

			Employee employee = new Employee();
			employee.setFirstName(EmailNameExtractor.extractName(email));
			employee.setAccountStatus(AccountStatus.PENDING);
			employee.setUser(savedUser);
			employee.setCreatedBy(epGuestUserRequestDto.getCreatedBy());
			employee.setLastModifiedBy(epGuestUserRequestDto.getCreatedBy());
			employeeDao.save(employee);

			EmployeeRole employeeRole = new EmployeeRole();
			employeeRole.setEmployee(employee);
			employeeRole.setPmRole(Role.PM_GUEST_EMPLOYEE);
			employeeRole.setIsSuperAdmin(false);
			employeeRoleDao.save(employeeRole);

			epPeopleService.invalidateAllUserCaches();
			return epUserService.mapEmployeeToUserDto(employee);
		}

		return null;
	}

	@Override
	public User validateGuestUserEmail(String email) {
		Validation.validateEmail(email);
		return userDao.findByEmail(email)
			.filter(this::isValidGuestEmployee)
			.orElseThrow(() -> new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_GUEST_USER_NOT_FOUND));
	}

	private boolean isValidGuestEmployee(User user) {
		return user.getEmployee() != null && user.getEmployee().getEmployeeRole().getPmRole() == Role.PM_GUEST_EMPLOYEE
				&& isActiveAccount(user.getEmployee().getAccountStatus());
	}

	private boolean isActiveAccount(AccountStatus status) {
		return status != AccountStatus.TERMINATED && status != AccountStatus.DELETED;
	}

}
