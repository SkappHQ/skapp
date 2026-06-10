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
import com.skapp.enterprise.common.config.TenantValidator;
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
import com.skapp.enterprise.people.repository.EpEmployeeRoleDao;
import com.skapp.enterprise.people.service.EpPeopleService;
import com.skapp.enterprise.people.service.EpUserEmailService;
import com.skapp.enterprise.people.service.EpUserService;
import com.skapp.community.peopleplanner.payload.request.EmployeeBasicDetailsResponseDto;
import com.skapp.enterprise.pm.model.GuestUserRequest;
import com.skapp.enterprise.pm.payload.EpGuestUserRequestInternalResponseDto;
import com.skapp.enterprise.pm.payload.EpGuestUserRequestResponseDto;
import com.skapp.enterprise.pm.payload.EpGuestUserResponseDto;
import com.skapp.enterprise.pm.payload.GuestInvitationValidationResponseDto;
import com.skapp.enterprise.pm.repository.GuestUserRequestDao;
import com.skapp.enterprise.pm.service.EpGuestUserCacheService;
import com.skapp.enterprise.pm.service.EpGuestUserInternalService;
import com.skapp.enterprise.pm.service.EpGuestUserService;
import com.skapp.enterprise.pm.service.EpProjectService;
import com.skapp.enterprise.pm.type.GuestInvitationValidationStatus;
import com.skapp.enterprise.pm.type.GuestUserApprovalStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@Slf4j
@Primary
@RequiredArgsConstructor
public class EpGuestUserServiceImpl implements EpGuestUserService {

	private final EmployeeDao employeeDao;

	private final UserDao userDao;

	private final EpUserService epUserService;

	private final EpPeopleService epPeopleService;

	private final EpEmployeeDao epEmployeeDao;

	private final EpEmployeeRoleDao epEmployeeRoleDao;

	private final MessageUtil messageUtil;

	private final PeopleService peopleService;

	private final EpUserEmailService epUserEmailService;

	private final UserService userService;

	private final EpGuestUserInternalService epGuestUserInternalService;

	private final EpGuestUserCacheService epGuestUserCacheService;

	private final EpProjectService epProjectService;

	private final GuestUserRequestDao guestUserRequestDao;

	private final TenantValidator tenantValidator;

	@Override
	public ResponseEntityDto createGuestUser(EpGuestUserInviteRequestDto epGuestUserInviteRequestDto) {
		if (epGuestUserInviteRequestDto == null || epGuestUserInviteRequestDto.getEmail() == null
				|| epGuestUserInviteRequestDto.getEmail().isBlank()) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_INVALID_GUEST_USER_EMAILS);
		}
		String email = epGuestUserInviteRequestDto.getEmail().toLowerCase();
		Validation.validateEmail(email);
		if (userDao.findByEmail(email).isPresent()) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_GUEST_USER_ALREADY_EXISTS);
		}
		if (guestUserRequestDao.findByEmailIgnoreCase(email).isPresent()) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_GUEST_USER_REQUEST_ALREADY_EXISTS);
		}

		User currentUser = userService.getCurrentUser();
		if (!isPrivilegedUser(currentUser)) {
			EpGuestUserRequestResponseDto requestDto = saveGuestUserRequest(email,
					epGuestUserInviteRequestDto.getProjects(), currentUser);
			notifyApproversOfGuestUserRequest(epGuestUserInviteRequestDto.getProjects(), currentUser.getEmployee());
			return new ResponseEntityDto(false, requestDto);
		}
		EpUserResponseDto userDto = inviteSingleGuestUser(email, epGuestUserInviteRequestDto.getProjects(),
				currentUser.getEmployee().getFirstName(), currentUser.getUserId());
		return new ResponseEntityDto(false, userDto);
	}

	@Override
	public ResponseEntityDto createGuestUsers(EpGuestUserBulkInviteRequestDto epGuestUserBulkInviteRequestDto) {
		if (epGuestUserBulkInviteRequestDto == null || epGuestUserBulkInviteRequestDto.getEmails() == null
				|| epGuestUserBulkInviteRequestDto.getEmails().isEmpty()) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_INVALID_GUEST_USER_EMAILS);
		}
		List<String> uniqueEmails = new ArrayList<>(new LinkedHashSet<>(epGuestUserBulkInviteRequestDto.getEmails()));
		User currentUser = userService.getCurrentUser();
		if (!isPrivilegedUser(currentUser)) {
			uniqueEmails.forEach(Validation::validateEmail);
			for (String email : uniqueEmails) {
				if (userDao.findByEmail(email).isPresent()) {
					throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_INVALID_GUEST_USER_EMAILS);
				}
			}
			List<EpGuestUserRequestResponseDto> requestDtos = new ArrayList<>();
			for (String email : uniqueEmails) {
				requestDtos
					.add(saveGuestUserRequest(email, epGuestUserBulkInviteRequestDto.getProjects(), currentUser));
			}
			notifyApproversOfGuestUserRequest(epGuestUserBulkInviteRequestDto.getProjects(), currentUser.getEmployee());
			return new ResponseEntityDto(false, requestDtos);
		}
		String adminName = currentUser.getEmployee() != null ? currentUser.getEmployee().getFirstName() : "";
		List<EpUserResponseDto> responses = new ArrayList<>();
		for (String email : uniqueEmails) {
			responses.add(inviteSingleGuestUser(email, epGuestUserBulkInviteRequestDto.getProjects(), adminName,
					currentUser.getUserId()));
		}
		return new ResponseEntityDto(false, responses);
	}

	@Override
	public ResponseEntityDto createGuestUsersInternal(EpGuestUserBulkInviteRequestDto epGuestUserBulkInviteRequestDto) {
		if (epGuestUserBulkInviteRequestDto == null || epGuestUserBulkInviteRequestDto.getEmails() == null
				|| epGuestUserBulkInviteRequestDto.getEmails().isEmpty()) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_INVALID_GUEST_USER_EMAILS);
		}

		Long currentUserId = epGuestUserBulkInviteRequestDto.getCurrentUserId();
		if (currentUserId == null) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_INVALID_REQUESTER);
		}

		User currentUser = userDao.findById(currentUserId)
			.orElseThrow(() -> new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_INVALID_REQUESTER));

		List<String> uniqueEmails = new ArrayList<>(new LinkedHashSet<>(epGuestUserBulkInviteRequestDto.getEmails()));

		if (!isPrivilegedUser(currentUser)) {
			uniqueEmails.forEach(Validation::validateEmail);
			for (String email : uniqueEmails) {
				if (userDao.findByEmail(email).isPresent()) {
					throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_INVALID_GUEST_USER_EMAILS);
				}
			}
			List<EpGuestUserRequestResponseDto> requestDtos = new ArrayList<>();
			for (String email : uniqueEmails) {
				requestDtos
					.add(saveGuestUserRequest(email, epGuestUserBulkInviteRequestDto.getProjects(), currentUser));
			}
			notifyApproversOfGuestUserRequest(epGuestUserBulkInviteRequestDto.getProjects(), currentUser.getEmployee());
			return new ResponseEntityDto(false, requestDtos);
		}

		List<EpUserResponseDto> responses = new ArrayList<>();
		for (String email : uniqueEmails) {
			responses.add(inviteSingleGuestUser(email, epGuestUserBulkInviteRequestDto.getProjects(),
					currentUser.getEmployee().getFirstName(), currentUser.getUserId()));
		}
		return new ResponseEntityDto(false, responses);
	}

	private EpUserResponseDto inviteSingleGuestUser(String email, List<ProjectRequestDto> projects, String adminName,
			Long adminUserId) {
		Validation.validateEmail(email);
		if (userDao.findByEmail(email).isPresent()) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_INVALID_GUEST_USER_EMAILS);
		}

		List<ProjectRequestDto> safeProjects = projects != null ? projects : List.of();
		Employee employee = createAndSaveEmployee(email);
		epPeopleService.invalidateAllUserCaches();

		boolean isAssignSuccess = epGuestUserInternalService.assignGuestToProjects(employee.getUser().getUserId(),
				safeProjects, adminUserId);
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
		if (!tenantValidator.isCurrentTenantCoreOrPro()) {
			return List.of();
		}

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

	private EpGuestUserRequestResponseDto mapGuestUserRequestToDto(GuestUserRequest request) {
		EpGuestUserRequestResponseDto dto = new EpGuestUserRequestResponseDto();
		dto.setRequestId(request.getId());
		dto.setEmail(request.getEmail());
		dto.setRequestedDate(request.getRequestedDate());

		dto.setProjects(epProjectService.getProjectsByIds(request.getProjectIds()));

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

	private EpGuestUserRequestInternalResponseDto mapGuestUserRequestToInternalDto(GuestUserRequest request) {
		EpGuestUserRequestInternalResponseDto dto = new EpGuestUserRequestInternalResponseDto();
		dto.setRequestId(request.getId());
		dto.setEmail(request.getEmail());
		dto.setProjectIds(request.getProjectIds());
		dto.setRequestedDate(request.getRequestedDate());
		return dto;
	}

	@Override
	@Transactional(readOnly = true)
	public List<EpGuestUserRequestResponseDto> getPendingGuestUserRequests(String email) {
		log.info("getPendingGuestUserRequests: Fetching pending guest user requests with email: {}", email);

		List<GuestUserRequest> requests = (email != null && !email.isBlank())
				? guestUserRequestDao.findByEmailContaining(email) : guestUserRequestDao.findAll();

		return requests.stream().map(this::mapGuestUserRequestToDto).toList();
	}

	@Override
	@Transactional(readOnly = true)
	public List<EpGuestUserRequestInternalResponseDto> getPendingGuestUserRequestsInternal(String email,
			List<Long> projectIds) {
		log.info(
				"getPendingGuestUserRequestsInternal: Fetching pending guest user requests with email: {}, projectIds: {}",
				email, projectIds);

		List<GuestUserRequest> requests = (email != null && !email.isBlank())
				? guestUserRequestDao.findByEmailContaining(email) : guestUserRequestDao.findAll();

		return requests.stream()
			.filter(req -> projectIds == null || projectIds.isEmpty()
					|| (req.getProjectIds() != null && req.getProjectIds().stream().anyMatch(projectIds::contains)))
			.map(this::mapGuestUserRequestToInternalDto)
			.toList();
	}

	@Override
	public EpUserResponseDto reInviteGuestUsers(EpGuestUserReInviteRequestDto epGuestUserReInviteRequestDto) {
		User user = userDao.findById(epGuestUserReInviteRequestDto.getId())
			.filter(this::isValidGuestEmployee)
			.orElseThrow(() -> new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_GUEST_USER_NOT_FOUND));

		List<ProjectRequestDto> userProjects = epGuestUserCacheService.getUserAssignedProjects(user.getUserId());
		String invitationUrl = buildInvitationUrl(user);
		User currentUser = userService.getCurrentUser();
		String adminName = currentUser.getEmployee() != null ? currentUser.getEmployee().getFirstName() : "";
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

	@Override
	public ResponseEntityDto updateGuestUserApprovalStatus(
			EpGuestUserApprovalRequestDto epGuestUserApprovalRequestDto) {
		if (epGuestUserApprovalRequestDto.getRequestId() == null) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_GUEST_USER_NOT_FOUND);
		}
		if (epGuestUserApprovalRequestDto.getStatus() == null) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_INVALID_GUEST_USER_APPROVAL_STATUS);
		}

		GuestUserRequest request = guestUserRequestDao
			.findByIdWithRequestedUser(epGuestUserApprovalRequestDto.getRequestId())
			.orElseThrow(() -> new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_GUEST_USER_NOT_FOUND));

		Employee requester = request.getRequestedUser();

		if (epGuestUserApprovalRequestDto.getStatus() == GuestUserApprovalStatus.APPROVED) {
			List<ProjectRequestDto> projects = epProjectService.getProjectsByIds(request.getProjectIds());
			User currentUser = userService.getCurrentUser();
			String adminName = currentUser.getEmployee() != null ? currentUser.getEmployee().getFirstName() : "";

			Optional<User> existingUserOpt = userDao.findByEmail(request.getEmail());
			if (existingUserOpt.isPresent()) {
				epGuestUserInternalService.updateGuestUserProjects(existingUserOpt.get().getUserId(), projects,
						currentUser.getUserId());
			}
			else {
				inviteSingleGuestUser(request.getEmail(), projects, adminName, currentUser.getUserId());
				peopleService.modifySubscriptionQuantity(1, true, false);
			}

			guestUserRequestDao.delete(request);

			String projectNames = projects.stream()
				.map(ProjectRequestDto::getProjectName)
				.filter(name -> name != null && !name.isBlank())
				.collect(Collectors.joining(", "));
			String firstProjectKey = getFirstProjectKey(projects);
			if (requester != null) {
				epUserEmailService.sendGuestUserRequestApprovedEmail(requester, projectNames, firstProjectKey);
			}

			return new ResponseEntityDto(
					messageUtil.getMessage(EpPeopleMessageConstant.EP_PEOPLE_SUCCESS_GUEST_USER_APPROVED), false);
		}

		List<ProjectRequestDto> projects = epProjectService.getProjectsByIds(request.getProjectIds());
		String projectNames = projects.stream()
			.map(ProjectRequestDto::getProjectName)
			.filter(name -> name != null && !name.isBlank())
			.collect(Collectors.joining(", "));
		String firstProjectKey = getFirstProjectKey(projects);
		guestUserRequestDao.delete(request);
		if (requester != null) {
			epUserEmailService.sendGuestUserRequestDeclinedEmail(requester, projectNames, firstProjectKey);
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
			String updateEmail = epGuestUserUpdateRequestDto.getEmail();
			Validation.validateEmail(updateEmail);

			if (userDao.findByEmail(updateEmail).isPresent()) {
				throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_INVALID_GUEST_USER_EMAILS);
			}

			user.setEmail(updateEmail);
			user.getEmployee().setFirstName(EmailNameExtractor.extractName(updateEmail));
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
			User currentUser = userService.getCurrentUser();
			boolean isUpdateSuccess = epGuestUserInternalService.updateGuestUserProjects(user.getUserId(),
					epGuestUserUpdateRequestDto.getProjects(), currentUser.getUserId());

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
		if (user == null || user.getEmployee() == null || user.getEmployee().getEmployeeRole() == null) {
			return false;
		}
		Boolean isSuperAdmin = user.getEmployee().getEmployeeRole().getIsSuperAdmin();
		Role pmRole = user.getEmployee().getEmployeeRole().getPmRole();
		return Boolean.TRUE.equals(isSuperAdmin) || pmRole == Role.PM_ADMIN;
	}

	private EpGuestUserRequestResponseDto saveGuestUserRequest(String email, List<ProjectRequestDto> projects,
			User requester) {
		if (requester == null || requester.getEmployee() == null) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_INVALID_REQUESTER);
		}

		Validation.validateEmail(email);
		if (userDao.findByEmail(email).isPresent()) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_INVALID_GUEST_USER_EMAILS);
		}

		List<Long> projectIds = projects != null ? projects.stream()
			.map(ProjectRequestDto::getProjectId)
			.filter(Objects::nonNull)
			.collect(Collectors.toCollection(ArrayList::new)) : new ArrayList<>();

		GuestUserRequest request = new GuestUserRequest();
		request.setEmail(email);
		request.setRequestedUser(requester.getEmployee());
		request.setRequestedDate(LocalDateTime.now());
		request.setProjectIds(projectIds);
		guestUserRequestDao.save(request);

		log.info("saveGuestUserRequest: Guest user request saved by employee: {}",
				requester.getEmployee().getEmployeeId());

		return mapGuestUserRequestToDto(request);
	}

	private void notifyApproversOfGuestUserRequest(List<ProjectRequestDto> projects, Employee requester) {
		String projectNames = projects != null ? projects.stream()
			.map(ProjectRequestDto::getProjectName)
			.filter(name -> name != null && !name.isBlank())
			.collect(Collectors.joining(", ")) : "";
		String requesterName = requester.getFirstName();

		List<AccountStatus> validStatuses = List.of(AccountStatus.PENDING, AccountStatus.ACTIVE);

		List<EmployeeRole> superAdmins = epEmployeeRoleDao
			.findEmployeeRoleByIsSuperAdminAndEmployeeAccountStatusIn(true, validStatuses);
		sendAwaitingApprovalEmails(superAdmins, projectNames, requesterName);

		List<EmployeeRole> pmAdmins = epEmployeeRoleDao
			.findEmployeeRoleByPmRoleAndIsSuperAdminFalseAndEmployeeAccountStatusIn(Role.PM_ADMIN, validStatuses);
		sendAwaitingApprovalEmails(pmAdmins, projectNames, requesterName);
	}

	private void sendAwaitingApprovalEmails(List<EmployeeRole> approverRoles, String projectNames,
			String requesterName) {
		for (EmployeeRole role : approverRoles) {
			try {
				String email = role.getEmployee().getUser().getEmail();
				if (email == null || email.isBlank()) {
					continue;
				}
				String approverName = role.getEmployee().getFirstName();
				epUserEmailService.sendGuestUserRequestAwaitingApprovalEmail(email, approverName, projectNames,
						requesterName);
			}
			catch (Exception ex) {
				log.warn("sendAwaitingApprovalEmails: Failed to send email to approver employeeId: {}",
						role.getEmployee().getEmployeeId(), ex);
			}
		}
	}

	private boolean isValidGuestEmployee(User user) {
		return user.getEmployee() != null && user.getEmployee().getEmployeeRole().getPmRole() == Role.PM_GUEST_EMPLOYEE
				&& isActiveAccount(user.getEmployee().getAccountStatus());
	}

	private boolean isActiveAccount(AccountStatus status) {
		return status != AccountStatus.TERMINATED && status != AccountStatus.DELETED;
	}

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getPendingGuestUsersCount() {
		log.info("getPendingGuestUsersCount: execution started");
		long count = guestUserRequestDao.count();
		return new ResponseEntityDto(false, count);
	}

	@Transactional
	@Override
	public ResponseEntityDto revokeGuestUserRequest(Long requestId) {
		log.info("revokeGuestUserRequest: Revoking guest user request with ID: {}", requestId);

		if (requestId == null) {
			throw new ModuleException(EpPeopleMessageConstant.EP_PEOPLE_ERROR_INVALID_GUEST_USER_REQUEST_ID);
		}

		Optional<GuestUserRequest> request = guestUserRequestDao.findById(requestId);
		request.ifPresent(guestUserRequestDao::delete);

		return new ResponseEntityDto(
				messageUtil.getMessage(EpPeopleMessageConstant.EP_PEOPLE_SUCCESS_GUEST_USER_REQUEST_REVOKED), false);
	}

	private String buildInvitationUrl(User user) {
		return String.format(EpCommonConstants.GUEST_USER_BASE_INVITE_URL, TenantContext.getCurrentTenant(),
				user.getEmail());
	}

	private String getFirstProjectKey(List<ProjectRequestDto> projects) {
		return projects.stream()
			.map(ProjectRequestDto::getProjectKey)
			.filter(key -> key != null && !key.isBlank())
			.findFirst()
			.orElse("");
	}

	@Override
	@Transactional(readOnly = true)
	public List<GuestInvitationValidationResponseDto> validateGuestInvitations(List<String> emails) {
		if (emails == null || emails.isEmpty()) {
			return List.of();
		}
		log.info("validateGuestInvitations: Validating guest invitations for {} email(s)", emails.size());

		return emails.stream()
			.filter(email -> email != null && !email.isBlank())
			.map(email -> email.trim().toLowerCase())
			.distinct()
			.map(email -> {
				GuestInvitationValidationResponseDto result = new GuestInvitationValidationResponseDto();
				result.setEmail(email);
				result.setStatus(resolveValidationStatus(email));
				return result;
			})
			.toList();
	}

	private GuestInvitationValidationStatus resolveValidationStatus(String email) {
		if (!Pattern.compile(Validation.EMAIL_REGEX).matcher(email).matches()) {
			return GuestInvitationValidationStatus.INVALID_EMAIL;
		}

		Optional<User> existingUserOpt = userDao.findByEmail(email);

		if (existingUserOpt.isPresent()) {
			return GuestInvitationValidationStatus.USER_ALREADY_EXISTS;
		}

		Optional<GuestUserRequest> pendingRequest = guestUserRequestDao.findByEmailIgnoreCase(email);
		if (pendingRequest.isPresent()) {
			return GuestInvitationValidationStatus.PENDING_INVITATION_EXISTS;
		}

		return GuestInvitationValidationStatus.VALID;
	}

}
