package com.skapp.enterprise.people.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.repository.UserDao;
import com.skapp.community.common.type.LoginMethod;
import com.skapp.community.common.type.Role;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.community.common.util.Validation;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.EmployeeRole;
import com.skapp.community.peopleplanner.repository.EmployeeDao;
import com.skapp.community.peopleplanner.repository.EmployeeRoleDao;
import com.skapp.community.peopleplanner.service.PeopleService;
import com.skapp.community.peopleplanner.type.AccountStatus;
import com.skapp.enterprise.common.config.TenantContext;
import com.skapp.enterprise.common.constant.EPCommonMessageConstant;
import com.skapp.enterprise.common.constant.EpCommonConstants;
import com.skapp.enterprise.common.payload.request.EpGuestUserInviteRequestDto;
import com.skapp.enterprise.common.payload.request.EpGuestUserReInviteRequestDto;
import com.skapp.enterprise.common.payload.response.EpUserResponseDto;
import com.skapp.enterprise.common.util.EmailNameExtractor;
import com.skapp.enterprise.people.constant.EpPeopleMessageConstant;
import com.skapp.enterprise.people.repository.EpEmployeeDao;
import com.skapp.enterprise.people.service.EpGuestUserService;
import com.skapp.enterprise.people.service.EpPeopleService;
import com.skapp.enterprise.people.service.EpUserEmailService;
import com.skapp.enterprise.people.service.EpUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Primary
@RequiredArgsConstructor
public class EpGuestUserServiceImpl implements EpGuestUserService {

	private final EmployeeDao employeeDao;

	private final UserDao userDao;

	private final EmployeeRoleDao employeeRoleDao;

	private final EpUserService epUserService;

	private final EpPeopleService epPeopleService;

	private final EpEmployeeDao epEmployeeDao;

	private final MessageUtil messageUtil;

	private final PeopleService peopleService;

	private final EpUserEmailService epUserEmailService;

	@Override
	@Transactional
	public EpUserResponseDto saveAndInviteGuestUsers(EpGuestUserInviteRequestDto epGuestUserInviteRequestDto) {
		if (epGuestUserInviteRequestDto == null || epGuestUserInviteRequestDto.getEmail().isEmpty()) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_INVALID_GUEST_USER_EMAILS);
		}

		String email = epGuestUserInviteRequestDto.getEmail();
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
			employee.setCreatedBy(epGuestUserInviteRequestDto.getCreatedBy());
			employee.setLastModifiedBy(epGuestUserInviteRequestDto.getCreatedBy());
			employeeDao.save(employee);

			EmployeeRole employeeRole = new EmployeeRole();
			employeeRole.setEmployee(employee);
			employeeRole.setPmRole(Role.PM_GUEST_EMPLOYEE);
			employeeRole.setIsSuperAdmin(false);
			employeeRoleDao.save(employeeRole);

			epPeopleService.invalidateAllUserCaches();

			String invitationUrl = buildInvitationUrl(user);
			Long createdBy = getCreatedBy(epGuestUserInviteRequestDto);
			String adminName = getAdminName(createdBy);
			epUserEmailService.sendGuestUserInvitationEmail(savedUser, invitationUrl, adminName,
					epGuestUserInviteRequestDto.getProjectNames().toString());

			epUserEmailService.sendGuestUserInvitationEmail(savedUser, invitationUrl, adminName,
					epGuestUserInviteRequestDto.getProjectNames().toString());

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

	@Override
	public List<EpUserResponseDto> getAllGuestUsers() {
		List<Employee> guestEmployees = epEmployeeDao.getAllGuestUsers();
		return guestEmployees.stream().map(epUserService::mapEmployeeToUserDto).toList();
	}

	@Override
	public EpUserResponseDto reInviteGuestUsers(EpGuestUserReInviteRequestDto epGuestUserReInviteRequestDto) {
		return null;
	}

	@Transactional
	@Override
	public ResponseEntityDto deleteGuestUser(Long id) {
		userDao.findById(id)
			.ifPresent(user -> peopleService.updateUserStatus(user.getUserId(), AccountStatus.DELETED, true));
		return new ResponseEntityDto(
				messageUtil.getMessage(EpPeopleMessageConstant.EP_PEOPLE_SUCCESS_GUEST_USER_DELETED), false);
	}

	@Transactional
	@Override
	public ResponseEntityDto deactivateGuestUser(Long id) {
		userDao.findById(id)
			.ifPresent(user -> peopleService.updateUserStatus(user.getUserId(), AccountStatus.DEACTIVATED, false));
		return new ResponseEntityDto(
				messageUtil.getMessage(EpPeopleMessageConstant.EP_PEOPLE_SUCCESS_GUEST_USER_DEACTIVATED), false);
	}

	@Transactional
	@Override
	public ResponseEntityDto activateGuestUser(Long id) {
		userDao.findById(id)
			.ifPresent(user -> peopleService.updateUserStatus(user.getUserId(), AccountStatus.ACTIVE, false));
		return new ResponseEntityDto(
				messageUtil.getMessage(EpPeopleMessageConstant.EP_PEOPLE_SUCCESS_GUEST_USER_ACTIVATED), false);
	}

	private boolean isValidGuestEmployee(User user) {
		return user.getEmployee() != null && user.getEmployee().getEmployeeRole().getPmRole() == Role.PM_GUEST_EMPLOYEE
				&& isActiveAccount(user.getEmployee().getAccountStatus());
	}

	private boolean isActiveAccount(AccountStatus status) {
		return status != AccountStatus.TERMINATED && status != AccountStatus.DELETED;
	}

	private String buildInvitationUrl(User user) {
		return String.format(EpCommonConstants.GUEST_USER_BASE_INVITE_URL, TenantContext.getCurrentTenant(),
				user.getEmail());
	}

	private Long getCreatedBy(EpGuestUserInviteRequestDto dto) {
		return Optional.ofNullable(dto.getCreatedBy()).map(Long::valueOf).orElse(null);
	}

	private String getAdminName(Long createdBy) {
		if (createdBy == null) {
			return EpCommonConstants.ADMIN;
		}
		return userDao.findById(createdBy)
			.map(u -> u.getEmployee().getFirstName() + " " + u.getEmployee().getLastName())
			.orElse(EpCommonConstants.ADMIN);
	}

}
