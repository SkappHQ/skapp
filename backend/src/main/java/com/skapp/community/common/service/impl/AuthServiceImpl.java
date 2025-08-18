package com.skapp.community.common.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.skapp.community.common.component.ProfileActivator;
import com.skapp.community.common.constant.CommonMessageConstant;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.mapper.CommonMapper;
import com.skapp.community.common.model.OrganizationConfig;
import com.skapp.community.common.model.User;
import com.skapp.community.common.model.UserSettings;
import com.skapp.community.common.payload.ReInvitationSkippedCountDto;
import com.skapp.community.common.payload.request.ChangePasswordRequestDto;
import com.skapp.community.common.payload.request.ForgotPasswordRequestDto;
import com.skapp.community.common.payload.request.ReInvitationRequestDto;
import com.skapp.community.common.payload.request.RefreshTokenRequestDto;
import com.skapp.community.common.payload.request.ResetPasswordRequestDto;
import com.skapp.community.common.payload.request.SignInRequestDto;
import com.skapp.community.common.payload.request.SuperAdminSignUpRequestDto;
import com.skapp.community.common.payload.response.AccessTokenResponseDto;
import com.skapp.community.common.payload.response.BulkResponseDto;
import com.skapp.community.common.payload.response.BulkStatusSummaryDto;
import com.skapp.community.common.payload.response.EmployeeSignInResponseDto;
import com.skapp.community.common.payload.response.ErrorLogDto;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.payload.response.SharePasswordResponseDto;
import com.skapp.community.common.payload.response.SignInResponseDto;
import com.skapp.community.common.repository.OrganizationConfigDao;
import com.skapp.community.common.repository.UserDao;
import com.skapp.community.common.service.AuthService;
import com.skapp.community.common.service.BulkContextService;
import com.skapp.community.common.service.EncryptionDecryptionService;
import com.skapp.community.common.service.JwtService;
import com.skapp.community.common.service.UserService;
import com.skapp.community.common.type.BulkItemStatus;
import com.skapp.community.common.type.LoginMethod;
import com.skapp.community.common.type.NotificationSettingsType;
import com.skapp.community.common.type.OrganizationConfigType;
import com.skapp.community.common.util.CommonModuleUtils;
import com.skapp.community.common.util.DateTimeUtils;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.community.common.util.Validation;
import com.skapp.community.peopleplanner.mapper.PeopleMapper;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.payload.response.EmployeeCredentialsResponseDto;
import com.skapp.community.peopleplanner.repository.EmployeeDao;
import com.skapp.community.peopleplanner.repository.EmployeeRoleDao;
import com.skapp.community.peopleplanner.service.PeopleEmailService;
import com.skapp.community.peopleplanner.service.PeopleNotificationService;
import com.skapp.community.peopleplanner.service.RolesService;
import com.skapp.community.peopleplanner.type.AccountStatus;
import com.skapp.community.peopleplanner.type.EmploymentAllocation;
import com.skapp.community.peopleplanner.util.Validations;
import jakarta.transaction.Transactional;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.TransactionCallbackWithoutResult;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

	private final UserDao userDao;

	private final UserDetailsService userDetailsService;

	private final PeopleMapper peopleMapper;

	private final EmployeeDao employeeDao;

	private final JwtService jwtService;

	private final AuthenticationManager authenticationManager;

	private final PasswordEncoder passwordEncoder;

	private final EmployeeRoleDao employeeRoleDao;

	private final CommonMapper commonMapper;

	private final UserService userService;

	private final PeopleEmailService peopleEmailService;

	private final PeopleNotificationService peopleNotificationService;

	private final EncryptionDecryptionService encryptionDecryptionService;

	private final ProfileActivator profileActivator;

	private final PlatformTransactionManager transactionManager;

	private final BulkContextService bulkContextService;

	private final MessageUtil messageUtil;

	private final RolesService rolesService;

	private final OrganizationConfigDao organizationConfigDao;

	private final ObjectMapper objectMapper;

	@Value("${encryptDecryptAlgorithm.secret}")
	private String encryptSecret;

	@Override
	@Transactional
	public ResponseEntityDto signIn(SignInRequestDto signInRequestDto) {
		log.info("signIn: execution started for email={}", signInRequestDto.getEmail());

		log.info("signIn: Authenticating user with email={}", signInRequestDto.getEmail());
		authenticationManager.authenticate(
				new UsernamePasswordAuthenticationToken(signInRequestDto.getEmail(), signInRequestDto.getPassword()));

		Optional<User> optionalUser = userDao.findByEmail(signInRequestDto.getEmail());
		if (optionalUser.isEmpty()) {
			log.warn("signIn: User not found for email={}", signInRequestDto.getEmail());
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_USER_NOT_FOUND);
		}
		User user = optionalUser.get();
		log.info("signIn: User found: userEmail={}, isActive={}", user.getEmail(), user.getIsActive());

		validateTenantStatus(user);
		log.info("signIn: Tenant status validated for userEmail={}", user.getEmail());

		if (Boolean.FALSE.equals(user.getIsActive())) {
			log.warn("signIn: User account deactivated: userEmail={}", user.getEmail());
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_USER_ACCOUNT_DEACTIVATED);
		}

		Optional<Employee> employee = employeeDao.findById(user.getUserId());
		if (employee.isEmpty()) {
			log.warn("signIn: Employee not found for userEmail={}", user.getEmail());
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_USER_NOT_FOUND);
		}
		log.info("signIn: Employee found for userEmail={}", user.getEmail());

		EmployeeSignInResponseDto employeeSignInResponseDto = peopleMapper
			.employeeToEmployeeSignInResponseDto(employee.get());
		log.info("signIn: Mapped EmployeeSignInResponseDto for userEmail={}", user.getEmail());

		UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
		log.info("signIn: Loaded UserDetails for email={}", user.getEmail());

		String accessToken = jwtService.generateAccessToken(userDetails, user.getUserId());
		String refreshToken = jwtService.generateRefreshToken(userDetails);
		log.info("signIn: Generated access and refresh tokens for userEmail={}", user.getEmail());

		SignInResponseDto signInResponseDto = new SignInResponseDto();
		signInResponseDto.setAccessToken(accessToken);
		signInResponseDto.setRefreshToken(refreshToken);
		signInResponseDto.setEmployee(employeeSignInResponseDto);
		signInResponseDto.setIsPasswordChangedForTheFirstTime(user.getIsPasswordChangedForTheFirstTime());

		log.info("signIn: execution ended for userEmail={}", user.getEmail());
		return new ResponseEntityDto(false, signInResponseDto);
	}

	protected void validateTenantStatus(User user) {
		// This is only for Pro version
	}

	@Transactional
	@Override
	public ResponseEntityDto superAdminSignUp(SuperAdminSignUpRequestDto superAdminSignUpRequestDto) {
		log.info("superAdminSignUp: execution started for email={}", superAdminSignUpRequestDto.getEmail());

		boolean isSuperAdminExists = employeeRoleDao
			.existsByIsSuperAdminTrueAndEmployee_AccountStatusIn(Set.of(AccountStatus.ACTIVE, AccountStatus.PENDING));
		if (isSuperAdminExists) {
			log.warn("superAdminSignUp: Super admin already exists. Aborting sign up.");
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_SUPER_ADMIN_ALREADY_EXISTS);
		}

		Optional<User> optionalUser = userDao.findByEmail(superAdminSignUpRequestDto.getEmail());
		if (optionalUser.isPresent()) {
			log.warn("superAdminSignUp: User already exists for email={}", superAdminSignUpRequestDto.getEmail());
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_USER_ALREADY_EXISTS);
		}

		log.info("superAdminSignUp: Validating super admin sign up request for email={}",
				superAdminSignUpRequestDto.getEmail());
		Validation.isValidFirstName(superAdminSignUpRequestDto.getFirstName());
		Validation.isValidLastName(superAdminSignUpRequestDto.getLastName());
		Validation.validateEmail(superAdminSignUpRequestDto.getEmail());
		Validation.isValidPassword(superAdminSignUpRequestDto.getPassword());

		User user = commonMapper.createSuperAdminRequestDtoToUser(superAdminSignUpRequestDto);
		user.setPassword(passwordEncoder.encode(superAdminSignUpRequestDto.getPassword()));
		user.setIsPasswordChangedForTheFirstTime(true);

		Employee employee = peopleMapper.createSuperAdminRequestDtoToEmployee(superAdminSignUpRequestDto);
		employee.setAccountStatus(AccountStatus.ACTIVE);
		employee.setEmploymentAllocation(EmploymentAllocation.FULL_TIME);
		user.setEmployee(employee);

		UserSettings userSettings = createNotificationSettings(user);
		user.setSettings(userSettings);

		employee.setUser(user);

		log.info("superAdminSignUp: Saving new super admin user and employee for email={}", user.getEmail());
		userDao.save(user);

		rolesService.saveSuperAdminRoles(employee);
		employeeDao.save(employee);

		log.info("superAdminSignUp: Super admin roles assigned and employee saved for email={}", user.getEmail());

		EmployeeSignInResponseDto employeeSignInResponseDto = peopleMapper
			.employeeToEmployeeSignInResponseDto(employee);

		UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
		String accessToken = jwtService.generateAccessToken(userDetails, user.getUserId());
		String refreshToken = jwtService.generateRefreshToken(userDetails);

		log.info("superAdminSignUp: Generated access and refresh tokens for userEmail={}", user.getEmail());

		SignInResponseDto signInResponseDto = new SignInResponseDto();
		signInResponseDto.setAccessToken(accessToken);
		signInResponseDto.setRefreshToken(refreshToken);
		signInResponseDto.setEmployee(employeeSignInResponseDto);
		signInResponseDto.setIsPasswordChangedForTheFirstTime(true);

		log.info("superAdminSignUp: execution ended for userEmail{}", user.getEmail());
		return new ResponseEntityDto(false, signInResponseDto);
	}

	@Override
	public ResponseEntityDto refreshAccessToken(RefreshTokenRequestDto refreshTokenRequestDto) {
		log.info("refreshAccessToken: execution started");

		String refreshToken = refreshTokenRequestDto.getRefreshToken();

		if (!jwtService.isRefreshToken(refreshToken) || jwtService.isTokenExpired(refreshToken)) {
			log.warn("refreshAccessToken: Invalid or expired refresh token");
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_INVALID_REFRESH_TOKEN);
		}

		String userEmail = jwtService.extractUserEmail(refreshToken);
		log.info("refreshAccessToken: Extracted userEmail={} from refresh token", userEmail);

		UserDetails userDetails = userDetailsService.loadUserByUsername(userEmail);

		if (!jwtService.isTokenValid(refreshToken, userDetails)) {
			log.warn("refreshAccessToken: Refresh token is not valid for userEmail={}", userEmail);
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_INVALID_REFRESH_TOKEN);
		}

		Optional<User> optionalUser = userDao.findByEmail(userEmail);
		if (optionalUser.isEmpty()) {
			log.warn("refreshAccessToken: User not found for email={}", userEmail);
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_USER_NOT_FOUND);
		}
		User user = optionalUser.get();
		log.info("refreshAccessToken: User found: email={}", user.getEmail());

		if (employeeDao.existsByEmployeeIdAndAccountStatusIn(user.getUserId(),
				Set.of(AccountStatus.TERMINATED, AccountStatus.DELETED))) {
			log.warn("refreshAccessToken: User is terminated or deleted: email={}", user.getEmail());
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_USER_TERMINATED_OR_DELETED);
		}

		String accessToken = jwtService.generateAccessToken(userDetails, user.getUserId());
		log.info("refreshAccessToken: Generated new access token for email={}", user.getEmail());

		AccessTokenResponseDto accessTokenResponseDto = new AccessTokenResponseDto();
		accessTokenResponseDto.setAccessToken(accessToken);

		log.info("refreshAccessToken: execution ended for email", user.getEmail());
		return new ResponseEntityDto(false, accessTokenResponseDto);
	}

	@Override
	public ResponseEntityDto employeeResetPassword(ResetPasswordRequestDto resetPasswordRequestDto) {
		log.info("employeeResetPassword: execution started");

		User user = userService.getCurrentUser();
		if (user == null) {
			log.warn("employeeResetPassword: Current user not found during password reset");
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_USER_NOT_FOUND);
		}

		if (Boolean.TRUE.equals(user.getIsPasswordChangedForTheFirstTime())) {
			log.warn("employeeResetPassword: Password already reset for email={}", user.getEmail());
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_ALREADY_PASSWORD_RESET);
		}

		String newPassword = resetPasswordRequestDto.getNewPassword();
		log.info("employeeResetPassword: Setting new password for userEmail={}", user.getEmail());
		createNewPassword(newPassword, user);

		Employee employee = user.getEmployee();
		employee.setAccountStatus(AccountStatus.ACTIVE);
		employeeDao.save(employee);
		log.info("employeeResetPassword: Employee account status set to ACTIVE for userEmail={}", user.getEmail());

		log.info("employeeResetPassword: execution ended for userEmail={}", user.getEmail());
		return new ResponseEntityDto(false, "User password reset successfully");
	}

	@Override
	public ResponseEntityDto sharePassword(Long userId) {
		log.info("sharePassword: execution started");

		Optional<User> optionalUser = userDao.findById(userId);
		if (optionalUser.isEmpty()) {
			log.warn("sharePassword: User not found for sharePassword");
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_USER_NOT_FOUND);
		}
		User user = optionalUser.get();

		log.info("sharePassword: User found for sharePassword: userEmail={}", user.getEmail());
		SharePasswordResponseDto sharePasswordResponseDto = getSharePasswordResponseDto(user, user,
				encryptionDecryptionService.decrypt(user.getTempPassword(), encryptSecret));

		log.info("sharePassword: execution ended for  ={}", user.getEmail());
		return new ResponseEntityDto(false, sharePasswordResponseDto);
	}

	@Override
	public ResponseEntityDto resetAndSharePassword(Long userId) {
		log.info("resetAndSharePassword: execution started");

		Optional<User> optionalUser = userDao.findById(userId);
		if (optionalUser.isEmpty()) {
			log.warn("resetAndSharePassword: User not found for resetAndSharePassword");
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_USER_NOT_FOUND);
		}
		User user = optionalUser.get();

		String tempPassword = CommonModuleUtils.generateSecureRandomPassword();
		log.info("resetAndSharePassword: Generated new temp password for userEmail={}", user.getEmail());
		user.setTempPassword(encryptionDecryptionService.encrypt(tempPassword, encryptSecret));
		user.setPassword(passwordEncoder.encode(tempPassword));
		user.setIsPasswordChangedForTheFirstTime(true);
		User savedUser = userDao.save(user);

		log.info("resetAndSharePassword: User password reset and saved for  userEmail={}", user.getEmail());
		SharePasswordResponseDto sharePasswordResponseDto = getSharePasswordResponseDto(savedUser, user, tempPassword);

		log.info("resetAndSharePassword: execution ended for  userEmail={}", user.getEmail());
		return new ResponseEntityDto(false, sharePasswordResponseDto);
	}

	@Override
	public ResponseEntityDto sendReInvitation(ReInvitationRequestDto reInvitationRequestDto) {
		log.info("sendReInvitation: execution started");

		if (!profileActivator.isEpProfile()) {
			Optional<OrganizationConfig> optionalOrganizationConfig = organizationConfigDao
				.findOrganizationConfigByOrganizationConfigType(OrganizationConfigType.EMAIL_CONFIGS.name());

			if (optionalOrganizationConfig.isEmpty()) {
				log.error("sendReInvitation: Email configuration not found in sendReInvitation");
				throw new ModuleException(CommonMessageConstant.COMMON_ERROR_EMAIL_CONFIG_NOT_FOUND);
			}
			log.info("sendReInvitation: Email configuration found for re-invitation");
		}

		List<Long> ids = reInvitationRequestDto.getIds();
		if (ids != null) {
			Set<Long> uniqueEmails = new HashSet<>(ids);
			ids = new ArrayList<>(uniqueEmails);
			reInvitationRequestDto.setIds(ids);
			log.info("sendReInvitation: Deduplicated ids for re-invitation: {}", ids);
		}

		String currentTenant = bulkContextService.getContext();
		log.info("sendReInvitation: Current tenant context: {}", currentTenant);

		ExecutorService executorService = Executors.newFixedThreadPool(5);
		List<ErrorLogDto> bulkRecordErrorLogs = Collections.synchronizedList(new ArrayList<>());
		ReInvitationSkippedCountDto reInvitationSkippedCountDto = new ReInvitationSkippedCountDto(0);
		BulkStatusSummaryDto bulkStatusSummary = new BulkStatusSummaryDto();

		List<CompletableFuture<Void>> tasks = new ArrayList<>();
		List<List<Long>> chunkedIds = CommonModuleUtils.chunkData(reInvitationRequestDto.getIds());
		TransactionTemplate transactionTemplate = new TransactionTemplate(transactionManager);

		for (List<Long> chunkedIdsChunkDtoList : chunkedIds) {
			for (Long id : chunkedIdsChunkDtoList) {
				CompletableFuture<Void> task = CompletableFuture.runAsync(() -> {
					bulkContextService.setContext(currentTenant);
					try {
						transactionTemplate.execute(new TransactionCallbackWithoutResult() {
							@Override
							protected void doInTransactionWithoutResult(@NonNull TransactionStatus status) {
								log.info("sendReInvitation: Processing re-invitation for userId={}", id);
								validateAndSendReInvitation(id, reInvitationSkippedCountDto, bulkRecordErrorLogs,
										bulkStatusSummary);
							}
						});
					}
					catch (Exception e) {
						log.error("sendReInvitation: Exception occurred when saving entitlement for userId={}: {}", id,
								e.getMessage());
						List<String> errorMessages = Collections.singletonList(e.getMessage());
						bulkRecordErrorLogs.add(createErrorLog(id, errorMessages));
						bulkStatusSummary.incrementFailedCount();
					}
				}, executorService);
				tasks.add(task);
			}
		}

		CompletableFuture<Void> allTasks = CompletableFuture.allOf(tasks.toArray(new CompletableFuture[0]));
		allTasks.thenRun(executorService::shutdown);
		allTasks.join();

		try {
			if (!executorService.awaitTermination(5, TimeUnit.MINUTES)) {
				log.error("sendReInvitation: ExecutorService failed to terminate after 5 minutes, shutting down");
				executorService.shutdownNow();
			}
		}
		catch (InterruptedException e) {
			Thread.currentThread().interrupt();
			log.error("sendReInvitation: Interrupted while waiting for termination of ExecutorService", e);
		}

		BulkResponseDto responseDto = new BulkResponseDto();
		responseDto.setBulkRecordErrorLogs(bulkRecordErrorLogs);
		responseDto.setBulkStatusSummary(bulkStatusSummary);

		log.info("sendReInvitation: execution ended");
		return new ResponseEntityDto(false, responseDto);
	}

	@Override
	public ResponseEntityDto forgotPassword(ForgotPasswordRequestDto forgotPasswordRequestDto) {
		log.info("forgotPassword: execution started for email={}", forgotPasswordRequestDto.getEmail());

		Validations.validateEmail(forgotPasswordRequestDto.getEmail());

		Optional<User> optionalUser = userDao.findByEmail(forgotPasswordRequestDto.getEmail());
		if (optionalUser.isEmpty()) {
			log.warn("forgotPassword: User not found for email={} in forgotPassword",
					forgotPasswordRequestDto.getEmail());
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_USER_NOT_FOUND);
		}

		LocalDateTime nowUtc = DateTimeUtils.getCurrentUtcDateTime();
		DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
		String requestDateTime = nowUtc.format(formatter);

		log.info("forgotPassword: Sending password reset email and notification for userEmail={}",
				optionalUser.get().getEmail());
		peopleEmailService.sendPasswordResetRequestManagerEmail(optionalUser.get(), requestDateTime);
		peopleNotificationService.sendPasswordResetRequestManagerNotification(optionalUser.get(), requestDateTime);

		log.info("forgotPassword: execution ended for userId={}", optionalUser.get().getEmail());
		return new ResponseEntityDto(false, "The email has been successfully sent to all people admins.");
	}

	@Override
	public ResponseEntityDto changePassword(ChangePasswordRequestDto changePasswordRequestDto, Long userId) {
		log.info("changePassword: execution started for userId={}", userId);

		User user = userService.getCurrentUser();
		if (!Objects.equals(user.getUserId(), userId)) {
			log.warn("changePassword: UserId mismatch in changePassword: currentUserId={}, requestedUserId={}",
					user.getUserId(), userId);
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_USER_NOT_FOUND);
		}

		if (!passwordEncoder.matches(changePasswordRequestDto.getOldPassword(), user.getPassword())) {
			log.warn("changePassword: Old password incorrect for userEmail={}", user.getEmail());
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_OLD_PASSWORD_INCORRECT);
		}

		if (passwordEncoder.matches(changePasswordRequestDto.getNewPassword(), user.getPassword())) {
			log.warn("changePassword: New password same as old password for userEmail={}", user.getEmail());
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_SAME_PASSWORD);
		}

		String newPassword = changePasswordRequestDto.getNewPassword();
		log.info("changePassword: Setting new password for userEmail={}", user.getEmail());
		createNewPassword(newPassword, user);

		log.info("changePassword: changePassword: execution ended for userEmail={}", user.getEmail());
		return new ResponseEntityDto(false, "User password changed successfully");
	}

	private SharePasswordResponseDto getSharePasswordResponseDto(User savedUser, User user, String tempPassword) {
		SharePasswordResponseDto sharePasswordResponseDto = new SharePasswordResponseDto();
		sharePasswordResponseDto.setUserId(savedUser.getUserId());

		EmployeeCredentialsResponseDto employeeCredentialsResponseDto = new EmployeeCredentialsResponseDto();
		employeeCredentialsResponseDto.setEmail(user.getEmail());
		employeeCredentialsResponseDto.setTempPassword(tempPassword);

		sharePasswordResponseDto.setEmployeeCredentials(employeeCredentialsResponseDto);
		sharePasswordResponseDto.setFirstName(user.getEmployee().getFirstName());
		sharePasswordResponseDto.setLastName(user.getEmployee().getLastName());
		return sharePasswordResponseDto;
	}

	private UserSettings createNotificationSettings(User user) {
		log.info("createNotificationSettings: execution started={}", user.getEmail());
		UserSettings userSettings = new UserSettings();

		ObjectNode notificationsObjectNode = objectMapper.createObjectNode();

		boolean isLeaveRequestNotificationsEnabled = true;
		boolean isTimeEntryNotificationsEnabled = true;
		boolean isNudgeNotificationsEnabled = true;

		notificationsObjectNode.put(NotificationSettingsType.LEAVE_REQUEST.getKey(),
				isLeaveRequestNotificationsEnabled);
		notificationsObjectNode.put(NotificationSettingsType.TIME_ENTRY.getKey(), isTimeEntryNotificationsEnabled);
		notificationsObjectNode.put(NotificationSettingsType.LEAVE_REQUEST_NUDGE.getKey(), isNudgeNotificationsEnabled);

		userSettings.setNotifications(notificationsObjectNode);
		userSettings.setUser(user);

		log.info("createNotificationSettings: execution ended={}", user.getEmail());
		return userSettings;
	}

	protected void createNewPassword(String newPassword, User user) {
		log.info("createNewPassword: execution started={}", user.getEmail());
		String tempPassword = user.getTempPassword();
		if (tempPassword != null
				&& Objects.equals(encryptionDecryptionService.decrypt(tempPassword, encryptSecret), newPassword)) {
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_CANNOT_USE_PREVIOUS_PASSWORDS);
		}

		if (passwordEncoder.matches(newPassword, user.getPassword()) || user.getPreviousPasswordsList()
			.stream()
			.anyMatch(prevPassword -> passwordEncoder.matches(newPassword, prevPassword))) {
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_CANNOT_USE_PREVIOUS_PASSWORDS);
		}

		String encodedNewPassword = passwordEncoder.encode(newPassword);

		if (user.getPassword() != null) {
			user.addPreviousPassword(user.getPassword());
		}

		user.setPassword(encodedNewPassword);
		user.setIsPasswordChangedForTheFirstTime(true);
		user.setTempPassword(null);
		log.info("createNewPassword: execution ended={}", user.getEmail());

		userDao.save(user);
	}

	private void validateAndSendReInvitation(Long id, ReInvitationSkippedCountDto reInvitationSkippedCountDto,
			List<ErrorLogDto> bulkRecordErrorLogs, BulkStatusSummaryDto bulkStatusSummary) {
		List<String> errors = new ArrayList<>();

		Optional<User> optionalUser = userDao.findById(id);

		if (optionalUser.isEmpty()) {
			errors.add(messageUtil.getMessage(CommonMessageConstant.COMMON_ERROR_USER_NOT_FOUND,
					new String[] { String.valueOf(id) }));
		}
		else {
			if (optionalUser.get().getEmployee().getAccountStatus() != AccountStatus.PENDING) {
				errors.add(messageUtil.getMessage(CommonMessageConstant.COMMON_ERROR_USER_ACCOUNT_ACTIVATED,
						new String[] { String.valueOf(id) }));
			}
		}

		if (!errors.isEmpty()) {
			reInvitationSkippedCountDto.incrementSkippedCount();
			bulkStatusSummary.incrementFailedCount();
			bulkRecordErrorLogs.add(createErrorLog(id, errors));
			return;
		}

		try {
			User user = optionalUser.get();
			Optional<User> firstUser = userDao.findById(1L);
			LoginMethod loginMethod = firstUser.isPresent() ? firstUser.get().getLoginMethod()
					: LoginMethod.CREDENTIALS;

			if (loginMethod.equals(LoginMethod.CREDENTIALS)) {
				String tempPassword = CommonModuleUtils.generateSecureRandomPassword();
				user.setTempPassword(encryptionDecryptionService.encrypt(tempPassword, encryptSecret));
				user.setPassword(passwordEncoder.encode(tempPassword));
			}

			userDao.save(user);
			peopleEmailService.sendUserInvitationEmail(user);
			bulkStatusSummary.incrementSuccessCount();
		}
		catch (Exception e) {
			log.error("Error re invitation for : {}, error: {}", id, e.getMessage());
			bulkStatusSummary.incrementFailedCount();
			bulkRecordErrorLogs.add(createErrorLog(id, List.of(e.getMessage())));
		}

	}

	private ErrorLogDto createErrorLog(Long id, List<String> errors) {
		ErrorLogDto errorLog = new ErrorLogDto();
		errorLog.setEmployeeId(id);
		errorLog.setStatus(BulkItemStatus.ERROR);
		errorLog.setMessage(String.join("; ", errors));
		return errorLog;
	}

}
