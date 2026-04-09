package com.skapp.enterprise.pm.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.repository.UserDao;
import com.skapp.community.common.service.UserService;
import com.skapp.community.common.type.LoginMethod;
import com.skapp.community.common.type.Role;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.community.common.util.Validation;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.EmployeeRole;
import com.skapp.community.peopleplanner.repository.EmployeeDao;
import com.skapp.community.peopleplanner.service.PeopleService;
import com.skapp.community.peopleplanner.type.AccountStatus;
import com.skapp.enterprise.common.config.TenantContext;
import com.skapp.enterprise.common.constant.EPCommonMessageConstant;
import com.skapp.enterprise.common.constant.EpCommonConstants;
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
import com.skapp.enterprise.people.service.EpUserEmailService;
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
import java.util.stream.Collectors;

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

	private final EpUserEmailService epUserEmailService;

	private final UserService userService;

	private final EpGuestUserInternalService epGuestUserInternalService;

	private final EpGuestUserCacheService epGuestUserCacheService;

	@Override
	public EpUserResponseDto createGuestUser(EpGuestUserInviteRequestDto epGuestUserInviteRequestDto) {
		if (epGuestUserInviteRequestDto == null || epGuestUserInviteRequestDto.getEmail() == null
				|| epGuestUserInviteRequestDto.getEmail().isBlank()) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_INVALID_GUEST_USER_EMAILS);
		}
		return inviteSingleGuestUser(epGuestUserInviteRequestDto.getEmail(), epGuestUserInviteRequestDto.getProjects(),
				userService.getCurrentUser().getEmployee().getFirstName());
	}

	@Override
	@Transactional
	public List<EpUserResponseDto> createGuestUsers(EpGuestUserBulkInviteRequestDto epGuestUserBulkInviteRequestDto) {
		if (epGuestUserBulkInviteRequestDto == null || epGuestUserBulkInviteRequestDto.getEmails() == null
				|| epGuestUserBulkInviteRequestDto.getEmails().isEmpty()) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_INVALID_GUEST_USER_EMAILS);
		}

		Employee requester = epGuestUserBulkInviteRequestDto.getRequestedByUserId() != null
				? employeeDao.findById(epGuestUserBulkInviteRequestDto.getRequestedByUserId()).orElse(null) : null;
		String adminName = requester != null && requester.getFirstName() != null ? requester.getFirstName() : "";

		List<EpUserResponseDto> responses = new ArrayList<>();
		for (String email : epGuestUserBulkInviteRequestDto.getEmails()) {
			responses.add(inviteSingleGuestUser(email, epGuestUserBulkInviteRequestDto.getProjects(), adminName));
		}

		List<ProjectRequestDto> safeProjects = epGuestUserBulkInviteRequestDto.getProjects() != null
				? epGuestUserBulkInviteRequestDto.getProjects() : List.of();
		String projectName = safeProjects.stream()
			.map(ProjectRequestDto::getProjectName)
			.collect(Collectors.joining(", "));

		Long requesterUserId = requester != null ? requester.getEmployeeId() : null;
		for (Employee pmAdmin : findAllPmAdmins()) {
			if (pmAdmin.getUser() != null && !pmAdmin.getEmployeeId().equals(requesterUserId)) {
				epUserEmailService.sendGuestUserRequestAwaitingApprovalEmail(pmAdmin.getUser().getEmail(), projectName,
						adminName);
			}
		}

		if (requester != null && requester.getUser() != null && requester.getUser().getEmail() != null) {
			epUserEmailService.sendGuestUserRequestAwaitingApprovalEmail(requester.getUser().getEmail(), projectName,
					adminName);
		}
		return responses;
	}

	private EpUserResponseDto inviteSingleGuestUser(String email, List<ProjectRequestDto> projects, String adminName) {
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

		String invitationUrl = buildInvitationUrl(employee.getUser());

		String projectNames = safeProjects.stream()
			.map(ProjectRequestDto::getProjectName)
			.collect(Collectors.joining(", "));

		epUserEmailService.sendGuestUserInvitationEmail(employee, invitationUrl, adminName, projectNames);
		peopleService.modifySubscriptionQuantity(1, true, false);

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

		List<ProjectRequestDto> userProjects = epGuestUserCacheService.getUserAssignedProjects(user.getUserId());

		String invitationUrl = buildInvitationUrl(user);
		String adminName = userService.getCurrentUser().getEmployee().getFirstName();

		String projectNames = userProjects.stream()
			.map(ProjectRequestDto::getProjectName)
			.collect(Collectors.joining(", "));

		epUserEmailService.sendGuestUserInvitationEmail(user.getEmployee(), invitationUrl, adminName, projectNames);

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

		String projectName = epGuestUserCacheService.getUserAssignedProjects(user.getUserId())
			.stream()
			.map(ProjectRequestDto::getProjectName)
			.collect(Collectors.joining(", "));

		Employee currentAdmin = userService.getCurrentUser().getEmployee();

		if (epGuestUserApprovalRequestDto.getStatus() == GuestUserApprovalStatus.APPROVE) {
			peopleService.updateUserStatus(user.getUserId(), AccountStatus.ACTIVE, false);
			epUserEmailService.sendGuestUserRequestApprovedEmail(currentAdmin, projectName);
			return new ResponseEntityDto(
					messageUtil.getMessage(EpPeopleMessageConstant.EP_PEOPLE_SUCCESS_GUEST_USER_APPROVED), false);
		}
		else {
			peopleService.updateUserStatus(user.getUserId(), AccountStatus.TERMINATED, false);
			epUserEmailService.sendGuestUserRequestDeclinedEmail(currentAdmin, projectName);
			return new ResponseEntityDto(
					messageUtil.getMessage(EpPeopleMessageConstant.EP_PEOPLE_SUCCESS_GUEST_USER_DECLINED), false);
		}
	}

	@Override
	public EpUserResponseDto updateGuestUser(EpGuestUserUpdateRequestDto epGuestUserUpdateRequestDto) {
		User user = userDao.findById(epGuestUserUpdateRequestDto.getId())
			.filter(this::isValidGuestEmployee)
			.orElseThrow(() -> new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_GUEST_USER_NOT_FOUND));

		boolean emailUpdated = false;

		if (epGuestUserUpdateRequestDto.getEmail() != null && !epGuestUserUpdateRequestDto.getEmail().isEmpty()) {
			if (user.getEmployee().getAccountStatus() == AccountStatus.PENDING) {
				Validation.validateEmail(epGuestUserUpdateRequestDto.getEmail());

				if (userDao.findByEmail(epGuestUserUpdateRequestDto.getEmail()).isPresent()) {
					throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_INVALID_GUEST_USER_EMAILS);
				}

				user.setEmail(epGuestUserUpdateRequestDto.getEmail());
				user.getEmployee().setFirstName(EmailNameExtractor.extractName(epGuestUserUpdateRequestDto.getEmail()));
				userDao.save(user);
				emailUpdated = true;
			}
		}

		if (epGuestUserUpdateRequestDto.getProjects() != null) {
			boolean isUpdateSuccess = epGuestUserInternalService.updateGuestUserProjects(user.getUserId(),
					epGuestUserUpdateRequestDto.getProjects());

			if (!isUpdateSuccess) {
				throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_GUEST_USER_PROJECT_UPDATE_FAILED);
			}
		}

		if (emailUpdated) {
			String invitationUrl = buildInvitationUrl(user);
			String adminName = userService.getCurrentUser().getEmployee().getFirstName();

			List<ProjectRequestDto> userProjects = epGuestUserUpdateRequestDto.getProjects() != null
					&& !epGuestUserUpdateRequestDto.getProjects().isEmpty() ? epGuestUserUpdateRequestDto.getProjects()
							: epGuestUserCacheService.getUserAssignedProjects(user.getUserId());

			String projectNames = userProjects.stream()
				.map(ProjectRequestDto::getProjectName)
				.collect(Collectors.joining(", "));

			epUserEmailService.sendGuestUserInvitationEmail(user.getEmployee(), invitationUrl, adminName, projectNames);
		}

		epPeopleService.invalidateAllUserCaches();

		return epUserService.mapEmployeeToUserDto(user.getEmployee());
	}

	private List<Employee> findAllPmAdmins() {
		List<AccountStatus> validStatuses = List.of(AccountStatus.PENDING, AccountStatus.ACTIVE);
		return epEmployeeDao.findAllByEmployeeRolePmRoleAndAccountStatusIn(Role.PM_ADMIN, validStatuses);
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

	private String buildInvitationUrl(User user) {
		return String.format(EpCommonConstants.GUEST_USER_BASE_INVITE_URL, TenantContext.getCurrentTenant(),
				user.getEmail());
	}

}
