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
import com.skapp.community.peopleplanner.payload.request.EmployeeBasicDetailsResponseDto;
import com.skapp.enterprise.pm.model.GuestUserRequest;
import com.skapp.enterprise.pm.payload.EpGuestUserResponseDto;
import com.skapp.enterprise.pm.repository.GuestUserRequestDao;
import com.skapp.enterprise.pm.service.EpGuestUserCacheService;
import com.skapp.enterprise.pm.service.EpGuestUserInternalService;
import com.skapp.enterprise.pm.service.EpGuestUserService;
import com.skapp.enterprise.pm.type.GuestUserApprovalStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Primary
@Slf4j
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

	private final GuestUserRequestDao guestUserRequestDao;

	@Override
	public EpUserResponseDto createGuestUser(EpGuestUserInviteRequestDto epGuestUserInviteRequestDto) {
		if (epGuestUserInviteRequestDto == null || epGuestUserInviteRequestDto.getEmail() == null
				|| epGuestUserInviteRequestDto.getEmail().isBlank()) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_INVALID_GUEST_USER_EMAILS);
		}
		User currentUser = userService.getCurrentUser();
		if (!isPrivilegedUser(currentUser)) {
			saveGuestUserRequest(epGuestUserInviteRequestDto.getEmail(), epGuestUserInviteRequestDto.getProjects(),
					currentUser);
			return new EpUserResponseDto();
		}
		return inviteSingleGuestUser(epGuestUserInviteRequestDto.getEmail(), epGuestUserInviteRequestDto.getProjects(),
				currentUser.getEmployee().getFirstName());
	}

	@Override
	public List<EpUserResponseDto> createGuestUsers(EpGuestUserBulkInviteRequestDto epGuestUserBulkInviteRequestDto) {
		if (epGuestUserBulkInviteRequestDto == null || epGuestUserBulkInviteRequestDto.getEmails() == null
				|| epGuestUserBulkInviteRequestDto.getEmails().isEmpty()) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_INVALID_GUEST_USER_EMAILS);
		}

		User currentUser = userService.getCurrentUser();
		if (!isPrivilegedUser(currentUser)) {
			epGuestUserBulkInviteRequestDto.getEmails().forEach(Validation::validateEmail);
			for (String email : epGuestUserBulkInviteRequestDto.getEmails()) {
				saveGuestUserRequest(email, epGuestUserBulkInviteRequestDto.getProjects(), currentUser);
			}
			return Collections.emptyList();
		}

		List<EpUserResponseDto> responses = new ArrayList<>();
		for (String email : epGuestUserBulkInviteRequestDto.getEmails()) {
			responses.add(inviteSingleGuestUser(email, epGuestUserBulkInviteRequestDto.getProjects(), ""));
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
			.filter(name -> name != null && !name.isBlank())
			.collect(Collectors.joining(", "));

		epUserEmailService.sendGuestUserInvitationEmail(employee, invitationUrl, adminName, projectNames);

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

	private EpGuestUserResponseDto mapGuestUserRequestToDto(GuestUserRequest request) {
		EpGuestUserResponseDto dto = new EpGuestUserResponseDto();
		dto.setRequestId(request.getId());
		dto.setEmail(request.getEmail());
		dto.setAccountStatus(AccountStatus.PENDING);
		dto.setRequestedDate(request.getRequestedDate());

		if (request.getProjectIds() != null && !request.getProjectIds().isEmpty()) {
			List<ProjectRequestDto> projects = request.getProjectIds().stream().map(projectId -> {
				ProjectRequestDto projectRequestDto = new ProjectRequestDto();
				projectRequestDto.setProjectId(projectId);
				return projectRequestDto;
			}).toList();
			dto.setProjects(projects);
		}

		Employee requester = request.getRequestedUser();
		if (requester != null) {
			EmployeeBasicDetailsResponseDto requestedBy = new EmployeeBasicDetailsResponseDto();
			requestedBy.setEmployeeId(requester.getEmployeeId());
			requestedBy.setFirstName(requester.getFirstName());
			requestedBy.setLastName(requester.getLastName());
			requestedBy.setAuthPic(requester.getAuthPic());
			dto.setRequestedBy(requestedBy);
		}

		return dto;
	}

	@Override
	public List<EpGuestUserResponseDto> getPendingGuestUserRequests(String email, List<Long> projectIds) {
		return guestUserRequestDao.findAll()
			.stream()
			.filter(req -> email == null || email.isBlank()
					|| req.getEmail().toLowerCase().contains(email.toLowerCase()))
			.filter(req -> projectIds == null || projectIds.isEmpty()
					|| req.getProjectIds().stream().anyMatch(projectIds::contains))
			.map(this::mapGuestUserRequestToDto)
			.toList();
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
		if (epGuestUserApprovalRequestDto.getRequestId() == null) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_GUEST_USER_NOT_FOUND);
		}
		if (epGuestUserApprovalRequestDto.getStatus() == null) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_INVALID_GUEST_USER_APPROVAL_STATUS);
		}

		GuestUserRequest request = guestUserRequestDao.findById(epGuestUserApprovalRequestDto.getRequestId())
			.orElseThrow(() -> new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_GUEST_USER_NOT_FOUND));

		if (epGuestUserApprovalRequestDto.getStatus() == GuestUserApprovalStatus.APPROVED) {
			String adminName = userService.getCurrentUser().getEmployee().getFirstName();
			List<ProjectRequestDto> projects = request.getProjectIds().stream().map(projectId -> {
				ProjectRequestDto projectRequestDto = new ProjectRequestDto();
				projectRequestDto.setProjectId(projectId);
				return projectRequestDto;
			}).toList();
			inviteSingleGuestUser(request.getEmail(), projects, adminName);
		}

		guestUserRequestDao.delete(request);

		if (epGuestUserApprovalRequestDto.getStatus() == GuestUserApprovalStatus.APPROVED) {
			return new ResponseEntityDto(
					messageUtil.getMessage(EpPeopleMessageConstant.EP_PEOPLE_SUCCESS_GUEST_USER_APPROVED), false);
		}
		return new ResponseEntityDto(
				messageUtil.getMessage(EpPeopleMessageConstant.EP_PEOPLE_SUCCESS_GUEST_USER_DECLINED), false);
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

	private boolean isPrivilegedUser(User user) {
		if (user.getEmployee() == null || user.getEmployee().getEmployeeRole() == null) {
			return false;
		}
		Boolean isSuperAdmin = user.getEmployee().getEmployeeRole().getIsSuperAdmin();
		Role pmRole = user.getEmployee().getEmployeeRole().getPmRole();
		return Boolean.TRUE.equals(isSuperAdmin) || pmRole == Role.PM_ADMIN;
	}

	private void saveGuestUserRequest(String email, List<ProjectRequestDto> projects, User requester) {
		if (requester == null || requester.getEmployee() == null) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_GUEST_USER_NOT_FOUND);
		}
		Validation.validateEmail(email);
		if (userDao.findByEmail(email).isPresent()) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_INVALID_GUEST_USER_EMAILS);
		}
		if (guestUserRequestDao.existsByEmail(email)) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_INVALID_GUEST_USER_EMAILS);
		}
		List<Long> projectIds = projects != null ? projects.stream().map(ProjectRequestDto::getProjectId).toList()
				: List.of();
		GuestUserRequest request = new GuestUserRequest();
		request.setEmail(email);
		request.setRequestedUser(requester.getEmployee());
		request.setRequestedDate(LocalDateTime.now());
		request.setProjectIds(projectIds);
		guestUserRequestDao.save(request);
		log.info("saveGuestUserRequest: Guest user request saved for email: {} by employee: {}", email,
				requester.getEmployee().getEmployeeId());
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
