package com.skapp.enterprise.pm.service.impl;

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
import com.skapp.community.peopleplanner.service.PeopleService;
import com.skapp.community.peopleplanner.type.AccountStatus;
import com.skapp.enterprise.common.constant.EPCommonMessageConstant;
import com.skapp.enterprise.common.payload.request.EpGuestUserApprovalRequestDto;
import com.skapp.enterprise.common.payload.request.EpGuestUserBulkInviteRequestDto;
import com.skapp.enterprise.common.payload.request.EpGuestUserInviteRequestDto;
import com.skapp.enterprise.common.payload.request.EpGuestUserReInviteRequestDto;
import com.skapp.enterprise.common.payload.request.EpGuestUserUpdateRequestDto;
import com.skapp.enterprise.common.payload.request.ProjectRequestDto;
import com.skapp.enterprise.common.payload.response.EmployeeRolesDto;
import com.skapp.enterprise.common.payload.response.EpUserResponseDto;
import com.skapp.enterprise.common.util.EmailNameExtractor;
import com.skapp.enterprise.people.constant.EpPeopleMessageConstant;
import com.skapp.enterprise.people.repository.EpEmployeeDao;
import com.skapp.enterprise.people.service.EpPeopleService;
import com.skapp.enterprise.people.service.EpUserService;
import com.skapp.enterprise.pm.payload.EpGuestUserResponseDto;
import com.skapp.enterprise.pm.service.EpGuestUserCacheService;
import com.skapp.enterprise.pm.service.EpGuestUserInternalService;
import com.skapp.enterprise.pm.service.EpGuestUserService;
import com.skapp.enterprise.pm.type.GuestUserApprovalStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Service
@Primary
@RequiredArgsConstructor
public class EpGuestUserServiceImpl implements EpGuestUserService {

	private final EmployeeDao employeeDao;

	private final UserDao userDao;

	private final EpUserService epUserService;

	private final EpPeopleService epPeopleService;

	private final EpEmployeeDao epEmployeeDao;

	private final MessageUtil messageUtil;

	private final PeopleService peopleService;

	private final EpGuestUserInternalService epGuestUserInternalService;

	private final EpGuestUserCacheService epGuestUserCacheService;

	@Override
	public EpUserResponseDto createGuestUser(EpGuestUserInviteRequestDto epGuestUserInviteRequestDto) {
		if (epGuestUserInviteRequestDto == null || epGuestUserInviteRequestDto.getEmail() == null
				|| epGuestUserInviteRequestDto.getEmail().isBlank()) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_INVALID_GUEST_USER_EMAILS);
		}
		return inviteSingleGuestUser(epGuestUserInviteRequestDto.getEmail(), epGuestUserInviteRequestDto.getProjects());
	}

	@Override
	public List<EpUserResponseDto> createGuestUsers(EpGuestUserBulkInviteRequestDto epGuestUserBulkInviteRequestDto) {
		if (epGuestUserBulkInviteRequestDto == null || epGuestUserBulkInviteRequestDto.getEmails() == null
				|| epGuestUserBulkInviteRequestDto.getEmails().isEmpty()) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_INVALID_GUEST_USER_EMAILS);
		}

		List<EpUserResponseDto> responses = new ArrayList<>();
		for (String email : epGuestUserBulkInviteRequestDto.getEmails()) {
			responses.add(inviteSingleGuestUser(email, epGuestUserBulkInviteRequestDto.getProjects()));
		}
		return responses;
	}

	private EpUserResponseDto inviteSingleGuestUser(String email, List<ProjectRequestDto> projects) {
		Validation.validateEmail(email);
		if (userDao.findByEmail(email).isPresent()) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_INVALID_GUEST_USER_EMAILS);
		}

		List<ProjectRequestDto> safeProjects = projects != null ? projects : List.of();
		Employee employee = createAndSaveEmployee(email);

		boolean isAssignSuccess = epGuestUserInternalService.assignGuestToProjects(employee.getUser().getUserId(),
				safeProjects);

		if (!isAssignSuccess) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_GUEST_USER_PROJECT_ASSIGNMENT_FAILED);
		}

		return epUserService.mapEmployeeToUserDto(employee);
	}

	private Employee createAndSaveEmployee(String email) {
		User user = new User();
		Employee employee = new Employee();

		user.setEmail(email);
		user.setLoginMethod(LoginMethod.CREDENTIALS);
		User savedUser = userDao.save(user);

		employee.setFirstName(EmailNameExtractor.extractName(email));
		employee.setAccountStatus(AccountStatus.PENDING);
		employee.setUser(savedUser);
		savedUser.setEmployee(employee);

		EmployeeRole employeeRole = new EmployeeRole();
		employeeRole.setEmployee(employee);
		employee.setEmployeeRole(employeeRole);
		employeeRole.setPmRole(Role.PM_GUEST_EMPLOYEE);
		employeeRole.setIsSuperAdmin(false);

		employeeDao.save(employee);

		epPeopleService.invalidateAllUserCaches();

		return employee;
	}

	@Override
	public User validateGuestUserEmail(String email) {
		Validation.validateEmail(email);
		return userDao.findByEmail(email)
			.filter(this::isValidGuestEmployee)
			.orElseThrow(() -> new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_GUEST_USER_NOT_FOUND));
	}

	@Override
	public List<EpGuestUserResponseDto> getAllGuestUsers(String email, List<AccountStatus> statuses,
			List<Long> projectIds) {
		List<Employee> guestEmployees = epEmployeeDao.getAllGuestUsers(email, statuses);

		Map<Long, List<ProjectRequestDto>> guestUsersProjectsMap = epGuestUserCacheService
			.getAllGuestUsersWithProjects(guestEmployees);

		return guestEmployees.stream().map(employee -> {
			EpGuestUserResponseDto userDto = mapEmployeeToGuestUserDto(employee);
			List<ProjectRequestDto> userProjects = guestUsersProjectsMap.getOrDefault(employee.getUser().getUserId(),
					Collections.emptyList());
			userDto.setProjects(userProjects);
			return userDto;
		}).filter(userDto -> {
			if (projectIds == null || projectIds.isEmpty()) {
				return true;
			}
			return userDto.getProjects().stream().anyMatch(project -> projectIds.contains(project.getProjectId()));
		}).toList();
	}

	@Override
	public EpUserResponseDto reInviteGuestUsers(EpGuestUserReInviteRequestDto epGuestUserReInviteRequestDto) {
		User user = userDao.findById(epGuestUserReInviteRequestDto.getId())
			.filter(this::isValidGuestEmployee)
			.orElseThrow(() -> new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_GUEST_USER_NOT_FOUND));

		return epUserService.mapEmployeeToUserDto(user.getEmployee());
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

	@Transactional
	@Override
	public ResponseEntityDto updateGuestUserApprovalStatus(
			EpGuestUserApprovalRequestDto epGuestUserApprovalRequestDto) {
		if (epGuestUserApprovalRequestDto.getUserId() == null) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_GUEST_USER_NOT_FOUND);
		}
		if (epGuestUserApprovalRequestDto.getStatus() == null) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_INVALID_GUEST_USER_APPROVAL_STATUS);
		}

		User user = userDao.findById(epGuestUserApprovalRequestDto.getUserId())
			.filter(this::isValidGuestEmployee)
			.filter(u -> u.getEmployee().getAccountStatus() == AccountStatus.PENDING)
			.orElseThrow(() -> new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_GUEST_USER_NOT_FOUND));

		if (epGuestUserApprovalRequestDto.getStatus() == GuestUserApprovalStatus.APPROVED) {
			user.getEmployee().setAccountStatus(AccountStatus.ACTIVE);
			userDao.save(user);
			peopleService.modifySubscriptionQuantity(1, true, false);
			return new ResponseEntityDto(
					messageUtil.getMessage(EpPeopleMessageConstant.EP_PEOPLE_SUCCESS_GUEST_USER_APPROVED), false);
		}
		else {
			user.getEmployee().setAccountStatus(AccountStatus.TERMINATED);
			userDao.save(user);
			return new ResponseEntityDto(
					messageUtil.getMessage(EpPeopleMessageConstant.EP_PEOPLE_SUCCESS_GUEST_USER_DECLINED), false);
		}
	}

	@Override
	public EpUserResponseDto updateGuestUser(EpGuestUserUpdateRequestDto epGuestUserUpdateRequestDto) {
		User user = userDao.findById(epGuestUserUpdateRequestDto.getId())
			.filter(this::isValidGuestEmployee)
			.orElseThrow(() -> new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_GUEST_USER_NOT_FOUND));

		if (epGuestUserUpdateRequestDto.getEmail() != null && !epGuestUserUpdateRequestDto.getEmail().isEmpty()
				&& user.getEmployee().getAccountStatus() == AccountStatus.PENDING) {
			Validation.validateEmail(epGuestUserUpdateRequestDto.getEmail());

			if (userDao.findByEmail(epGuestUserUpdateRequestDto.getEmail()).isPresent()) {
				throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_INVALID_GUEST_USER_EMAILS);
			}

			user.setEmail(epGuestUserUpdateRequestDto.getEmail());
			user.getEmployee().setFirstName(EmailNameExtractor.extractName(epGuestUserUpdateRequestDto.getEmail()));
			userDao.save(user);
		}

		if (epGuestUserUpdateRequestDto.getProjects() != null) {
			boolean isUpdateSuccess = epGuestUserInternalService.updateGuestUserProjects(user.getUserId(),
					epGuestUserUpdateRequestDto.getProjects());

			if (!isUpdateSuccess) {
				throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_GUEST_USER_PROJECT_UPDATE_FAILED);
			}
		}

		epPeopleService.invalidateAllUserCaches();

		return epUserService.mapEmployeeToUserDto(user.getEmployee());
	}

	private EpGuestUserResponseDto mapEmployeeToGuestUserDto(Employee employee) {
		EpGuestUserResponseDto dto = new EpGuestUserResponseDto();
		dto.setUserId(employee.getEmployeeId().toString());
		dto.setFirstName(employee.getFirstName());
		dto.setLastName(employee.getLastName());
		dto.setAccountStatus(employee.getAccountStatus());

		EmployeeRolesDto employeeRolesDto = new EmployeeRolesDto();
		employeeRolesDto.setPmRole(employee.getEmployeeRole().getPmRole());

		dto.setRoles(employeeRolesDto);

		if (employee.getUser() != null) {
			dto.setEmail(employee.getUser().getEmail());
			dto.setLoginMethod(employee.getUser().getLoginMethod());
		}

		dto.setAuthPic(employee.getAuthPic());
		return dto;
	}

	private boolean isValidGuestEmployee(User user) {
		return user.getEmployee() != null && user.getEmployee().getEmployeeRole().getPmRole() == Role.PM_GUEST_EMPLOYEE
				&& isActiveAccount(user.getEmployee().getAccountStatus());
	}

	private boolean isActiveAccount(AccountStatus status) {
		return status != AccountStatus.TERMINATED && status != AccountStatus.DELETED;
	}

}
