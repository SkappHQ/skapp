package com.skapp.enterprise.people.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.model.User;
import com.skapp.community.common.repository.UserDao;
import com.skapp.community.common.service.CacheService;
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
import com.skapp.enterprise.common.type.EpCacheKeys;
import com.skapp.enterprise.common.util.EmailNameExtractor;
import com.skapp.enterprise.people.service.EpGuestUserService;
import com.skapp.enterprise.people.service.EpUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@Primary
@RequiredArgsConstructor
public class EpGuestUserServiceImpl implements EpGuestUserService {

	private final EmployeeDao employeeDao;

	private final CacheService cacheService;

	private final UserDao userDao;

	private final EmployeeRoleDao employeeRoleDao;

	private final EpUserService epUserService;

	@Override
	@Transactional
	public List<EpUserResponseDto> saveGuestUsers(EpGuestUserRequestDto epGuestUserRequestDto) {
		if (epGuestUserRequestDto == null || epGuestUserRequestDto.getEmails().isEmpty()) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_INVALID_GUEST_USER_EMAILS);
		}

		List<Employee> employees = new ArrayList<>();

		for (String email : epGuestUserRequestDto.getEmails()) {
			Validation.validateEmail(email);
			if (userDao.findByEmail(email).isEmpty()) {
				User user = new User();
				user.setEmail(email);
				user.setLoginMethod(LoginMethod.CREDENTIALS);
				user.setIsGuest(true);
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
				employeeRole.setPmRole(Role.PM_GUEST);
				employeeRole.setIsSuperAdmin(false);
				employeeRoleDao.save(employeeRole);

				employees.add(employee);
			}
		}

		if (!employees.isEmpty()) {
			EpCacheKeys userCacheKey = EpCacheKeys.TENANT_ALL_USERS_CACHE_KEY;
			cacheService.invalidate(userCacheKey.getKey());
			EpCacheKeys userAuthPicCacheKey = EpCacheKeys.TENANT_ALL_USERS_AUTH_PICS_CACHE_KEY;
			cacheService.invalidate(userAuthPicCacheKey.getKey());
			return employees.stream().map(epUserService::mapEmployeeToUserDto).toList();
		}

		return List.of();
	}

	@Override
	public User validateGuestUserEmail(String email) {
		Validation.validateEmail(email);
		return userDao.findByEmail(email)
			.filter(User::getIsGuest)
			.filter(u -> isActiveAccount(u.getEmployee().getAccountStatus()))
			.orElseThrow(() -> new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_GUEST_USER_NOT_FOUND));
	}

	private boolean isActiveAccount(AccountStatus status) {
		return status != AccountStatus.TERMINATED && status != AccountStatus.DELETED;
	}

}
