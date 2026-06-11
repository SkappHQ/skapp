package com.skapp.enterprise.common.service.impl;

import com.auth0.jwt.interfaces.DecodedJWT;
import com.skapp.community.common.component.ProfileActivator;
import com.skapp.community.common.constant.AuthConstants;
import com.skapp.community.common.constant.CommonMessageConstant;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.mapper.CommonMapper;
import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.request.SuperAdminSignUpRequestDto;
import com.skapp.community.common.payload.response.EmployeeSignInResponseDto;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.payload.response.SignInResponseDto;
import com.skapp.community.common.repository.OrganizationConfigDao;
import com.skapp.community.common.repository.UserDao;
import com.skapp.community.common.service.BulkContextService;
import com.skapp.community.common.service.CacheService;
import com.skapp.community.common.service.EncryptionDecryptionService;
import com.skapp.community.common.service.JwtService;
import com.skapp.community.common.service.UserService;
import com.skapp.community.common.service.impl.AuthServiceImpl;
import com.skapp.community.common.type.CacheKey;
import com.skapp.community.common.type.LoginMethod;
import com.skapp.community.common.type.Role;
import com.skapp.community.common.type.TokenType;
import com.skapp.community.common.util.CookieUtil;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.enterprise.common.service.BruteForceDetectionService;
import com.skapp.community.common.util.Validation;
import com.skapp.community.peopleplanner.mapper.PeopleMapper;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.repository.EmployeeDao;
import com.skapp.community.peopleplanner.repository.EmployeeRoleDao;
import com.skapp.community.peopleplanner.service.PeopleEmailService;
import com.skapp.community.peopleplanner.service.PeopleNotificationService;
import com.skapp.community.peopleplanner.service.RolesService;
import com.skapp.community.peopleplanner.type.AccountStatus;
import com.skapp.enterprise.common.config.RecaptchaConfig;
import com.skapp.enterprise.common.config.TenantContext;
import com.skapp.enterprise.common.constant.EPCommonMessageConstant;
import com.skapp.enterprise.common.constant.EpAuthConstants;
import com.skapp.enterprise.common.constant.EpCommonConstants;
import com.skapp.enterprise.common.constant.EpValidationConstants;
import com.skapp.enterprise.common.mapper.EpCommonMapper;
import com.skapp.enterprise.common.masterrepository.SuperAdminDao;
import com.skapp.enterprise.common.masterrepository.TenantDao;
import com.skapp.enterprise.common.model.PasswordResetOtp;
import com.skapp.enterprise.common.model.master.SuperAdmin;
import com.skapp.enterprise.common.model.master.Tenant;
import com.skapp.enterprise.common.payload.request.CodeChallengeRequestDto;
import com.skapp.enterprise.common.payload.request.EpCaptchaVerificationDto;
import com.skapp.enterprise.common.payload.request.EpGuestUserOtpVerifyRequestDto;
import com.skapp.enterprise.common.payload.request.EpGuestUserSignInRequestDto;
import com.skapp.enterprise.common.payload.request.EpPasswordResetDto;
import com.skapp.enterprise.common.payload.request.EpPasswordResetNewPasswordDto;
import com.skapp.enterprise.common.payload.request.EpPasswordResetOtpVerifyDto;
import com.skapp.enterprise.common.payload.request.EpSignInGoogleDataDto;
import com.skapp.enterprise.common.payload.request.EpSignUpGoogleDataDto;
import com.skapp.enterprise.common.payload.response.CodeChallengeResponseDto;
import com.skapp.enterprise.common.payload.response.EpDomainAvailabilityResponseDto;
import com.skapp.enterprise.common.payload.response.TenantAvailabilityResponseDto;
import com.skapp.enterprise.common.repository.PasswordResetOtpDao;
import com.skapp.enterprise.common.service.EpAuthService;
import com.skapp.enterprise.common.service.EpCommonEmailService;
import com.skapp.enterprise.common.service.TenantCookieService;
import com.skapp.enterprise.common.service.ValidationService;
import com.skapp.enterprise.common.type.EpCacheKeys;
import com.skapp.enterprise.common.type.TenantStatus;
import com.skapp.enterprise.common.util.OtpUtil;
import com.skapp.enterprise.common.validator.GoogleTokenValidator;
import com.skapp.enterprise.people.service.EpUserEmailService;
import com.skapp.enterprise.pm.service.EpGuestUserService;
import io.jsonwebtoken.Jwts;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import tools.jackson.databind.json.JsonMapper;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;

@Service
@Slf4j
@Primary
public class EpAuthServiceImpl extends AuthServiceImpl implements EpAuthService {

	private final EpCommonMapper epCommonMapper;

	private final PasswordEncoder passwordEncoder;

	private final SuperAdminDao superAdminDao;

	private final UserDetailsService userDetailsService;

	private final JwtService jwtService;

	private final EpCommonEmailService emailService;

	private final MessageUtil messageUtil;

	private final RestTemplate restTemplate;

	private final GoogleTokenValidator googleTokenValidator;

	private final EmployeeDao employeeDao;

	private final PeopleMapper peopleMapper;

	private final UserDao userDao;

	private final TenantContext tenantContext;

	private final PasswordResetOtpDao passwordResetOtpDao;

	private final EpCommonEmailService epCommonEmailService;

	private final CacheService cacheService;

	private final RecaptchaConfig recaptchaConfig;

	private final TenantDao tenantDao;

	private final SecureRandom secureRandom = new SecureRandom();

	private final ValidationService validationService;

	private final EpGuestUserService epGuestUserService;

	private final EpUserEmailService epUserEmailService;

	private final BruteForceDetectionService bruteForceDetectionService;

	private final TenantCookieService tenantCookieService;

	@Value("${jwt.refresh-token.long-duration.expiration-time}")
	private Long jwtLongDurationRefreshTokenExpirationMs;

	@Value("${jwt.refresh-token.short-duration.expiration-time}")
	private Long jwtShortDurationRefreshTokenExpirationMs;

	@Value("${jwt.refresh-token.extended-duration.expiration-time}")
	private Long jwtExtendedDurationRefreshTokenExpirationMs;

	@Value("${jwt.access-token.expiration-time}")
	private Long jwtAccessTokenExpirationMs;

	@Value("${otp.expiry-seconds}")
	private int otpExpirySeconds;

	public EpAuthServiceImpl(UserDao userDao, UserDetailsService userDetailsService, PeopleMapper peopleMapper,
			EmployeeDao employeeDao, JwtService jwtService, AuthenticationManager authenticationManager,
			PasswordEncoder passwordEncoder, EmployeeRoleDao employeeRoleDao, CommonMapper commonMapper,
			UserService userService, PeopleEmailService peopleEmailService,
			PeopleNotificationService peopleNotificationService,
			EncryptionDecryptionService encryptionDecryptionService, ProfileActivator profileActivator,
			PlatformTransactionManager transactionManager, BulkContextService bulkContextService,
			MessageUtil messageUtil, RolesService rolesService, OrganizationConfigDao organizationConfigDao,
			JsonMapper objectMapper, EpCommonMapper epCommonMapper, SuperAdminDao superAdminDao,
			EpCommonEmailService emailService, RestTemplate restTemplate, GoogleTokenValidator googleTokenValidator,
			TenantContext tenantContext, PasswordResetOtpDao passwordResetOtpDao,
			EpCommonEmailService epCommonEmailService, CacheService cacheService, RecaptchaConfig recaptchaConfig,
			TenantDao tenantDao, ValidationService validationService, EpGuestUserService epGuestUserService,
			EpUserEmailService epUserEmailService, CookieUtil cookieUtil,
			BruteForceDetectionService bruteForceDetectionService, TenantCookieService tenantCookieService) {
		super(userDao, userDetailsService, peopleMapper, employeeDao, jwtService, authenticationManager,
				passwordEncoder, employeeRoleDao, commonMapper, userService, peopleEmailService,
				peopleNotificationService, encryptionDecryptionService, profileActivator, transactionManager,
				bulkContextService, messageUtil, rolesService, organizationConfigDao, objectMapper, cookieUtil);
		this.epCommonMapper = epCommonMapper;
		this.passwordEncoder = passwordEncoder;
		this.superAdminDao = superAdminDao;
		this.userDetailsService = userDetailsService;
		this.jwtService = jwtService;
		this.emailService = emailService;
		this.messageUtil = messageUtil;
		this.restTemplate = restTemplate;
		this.googleTokenValidator = googleTokenValidator;
		this.employeeDao = employeeDao;
		this.peopleMapper = peopleMapper;
		this.userDao = userDao;
		this.tenantContext = tenantContext;
		this.passwordResetOtpDao = passwordResetOtpDao;
		this.epCommonEmailService = epCommonEmailService;
		this.cacheService = cacheService;
		this.recaptchaConfig = recaptchaConfig;
		this.tenantDao = tenantDao;
		this.validationService = validationService;
		this.epGuestUserService = epGuestUserService;
		this.epUserEmailService = epUserEmailService;
		this.tenantCookieService = tenantCookieService;
		this.bruteForceDetectionService = bruteForceDetectionService;
	}

	@Override
	protected void onSignInFailed(String email) {
		bruteForceDetectionService.handleFailedSignInAttempt(email);
	}

	@Override
	protected void onSignInSuccess(String email) {
		bruteForceDetectionService.resetFailedSignInAttempts(email);
	}

	@Override
	public ResponseEntityDto superAdminSignUp(SuperAdminSignUpRequestDto superAdminSignUpRequestDto,
			String bypassSecret) {
		log.info("superAdminSignUp: execution started for email={}", superAdminSignUpRequestDto.getEmail());

		log.info("superAdminSignUp: validating reCAPTCHA token");
		validateRecaptchaToken(superAdminSignUpRequestDto.getRecaptchaToken(), bypassSecret);

		log.info("superAdminSignUp: validating first name");
		Validation.isValidFirstName(superAdminSignUpRequestDto.getFirstName());

		log.info("superAdminSignUp: validating last name");
		Validation.isValidLastName(superAdminSignUpRequestDto.getLastName());

		log.info("superAdminSignUp: validating email");
		Validation.validateEmail(superAdminSignUpRequestDto.getEmail());

		log.info("superAdminSignUp: validating password");
		Validation.isValidPassword(superAdminSignUpRequestDto.getPassword());

		log.info("superAdminSignUp: checking business email validity");
		validationService.checkBusinessEmailValidity(superAdminSignUpRequestDto.getEmail());

		log.info("superAdminSignUp: mapping request DTO to SuperAdmin entity");
		SuperAdmin superAdmin = epCommonMapper.createSuperAdminRequestDtoToSuperAdmin(superAdminSignUpRequestDto);
		superAdmin.setPassword(passwordEncoder.encode(superAdminSignUpRequestDto.getPassword()));
		superAdmin.setFirstName(superAdminSignUpRequestDto.getFirstName());
		superAdmin.setLastName(superAdminSignUpRequestDto.getLastName());
		superAdmin.setLoginMethod(LoginMethod.CREDENTIALS);
		superAdmin.setActive(true);
		superAdmin.setVerified(false);

		log.info("superAdminSignUp: saving SuperAdmin to database");
		SuperAdmin savedSuperAdmin = superAdminDao.save(superAdmin);

		log.info("superAdminSignUp: generating access and refresh tokens for superAdminEmail={}",
				savedSuperAdmin.getEmail());
		String accessToken = generateAccessToken(savedSuperAdmin.getId(), savedSuperAdmin);
		String refreshToken = generateRefreshToken(savedSuperAdmin.getId(), savedSuperAdmin);

		log.info("superAdminSignUp: preparing sign-in response DTO");
		SignInResponseDto signInResponseDto = getSignInResponseDto(accessToken, refreshToken, savedSuperAdmin);

		log.info("superAdminSignUp: execution ended for  superAdminEmail={}", savedSuperAdmin.getEmail());
		return new ResponseEntityDto(false, signInResponseDto);
	}

	private SignInResponseDto getSignInResponseDto(String accessToken, String refreshToken,
			SuperAdmin savedSuperAdmin) {
		SignInResponseDto signInResponseDto = new SignInResponseDto();
		signInResponseDto.setAccessToken(accessToken);
		signInResponseDto.setRefreshToken(refreshToken);

		EmployeeSignInResponseDto employeeSignInResponseDto = new EmployeeSignInResponseDto();
		employeeSignInResponseDto.setEmployeeId(savedSuperAdmin.getId());
		employeeSignInResponseDto.setFirstName(savedSuperAdmin.getFirstName());
		employeeSignInResponseDto.setLastName(savedSuperAdmin.getLastName());

		signInResponseDto.setEmployee(employeeSignInResponseDto);
		signInResponseDto.setIsPasswordChangedForTheFirstTime(true);
		return signInResponseDto;
	}

	@Override
	public ResponseEntityDto generateAndSendOTP() {
		log.info("generateAndSendOTP: execution started");

		Long userId = (Long) SecurityContextHolder.getContext().getAuthentication().getCredentials();
		log.info("generateAndSendOTP: fetched userId={}", userId);

		SuperAdmin superAdmin = superAdminDao.findById(userId).orElseThrow(() -> {
			log.warn("generateAndSendOTP: SuperAdmin not found for userId={}", userId);
			return new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_SUPER_ADMIN_NOR_FOUND);
		});

		Instant now = Instant.now();

		if (superAdmin.getOtpExpiryTime() != null) {
			Instant otpCreatedTime = superAdmin.getOtpExpiryTime().minusSeconds(otpExpirySeconds);
			Instant cooldownEndTime = otpCreatedTime.plusSeconds(EpCommonConstants.OTP_GENERATION_DELAY_TIME_SECONDS);

			if (now.isBefore(cooldownEndTime)) {
				long secondsRemaining = cooldownEndTime.getEpochSecond() - now.getEpochSecond();
				log.warn("generateAndSendOTP: Cannot generate new OTP yet. Wait {} more seconds. userId={}",
						secondsRemaining, userId);
				throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_OTP_STILL_VALID);
			}

			log.info("generateAndSendOTP: Generating new OTP after cooldown period for userId={}", userId);
		}

		String otp = OtpUtil.generateOTP();
		Instant expiryTime = now.plusSeconds(otpExpirySeconds);

		try {
			superAdmin.setVerificationCode(otp);
			superAdmin.setOtpExpiryTime(expiryTime);
			superAdminDao.save(superAdmin);
			log.info("generateAndSendOTP: OTP generated and saved for userId={}", userId);

			emailService.sendSuperAdminVerifyOtpEmail(superAdmin, otp);
			log.info("generateAndSendOTP: OTP email sent to {}", superAdmin.getEmail());

			log.info("generateAndSendOTP: execution ended successfully for userId={}", userId);
			return new ResponseEntityDto(false,
					messageUtil.getMessage(EPCommonMessageConstant.EP_COMMON_SUCCESS_OTP_GENERATED_AND_SEND,
							new String[] { superAdmin.getEmail() }));
		}
		catch (Exception e) {
			log.error("generateAndSendOTP: Exception occurred for userId={}, error={}", userId, e.getMessage(), e);
			return new ResponseEntityDto(true,
					messageUtil.getMessage(EPCommonMessageConstant.EP_COMMON_ERROR_OTP_GENERATION_OR_SEND));
		}
	}

	@Override
	public ResponseEntityDto verifyOTP(String otp) {
		log.info("verifyOTP: execution started");

		Long userId = (Long) SecurityContextHolder.getContext().getAuthentication().getCredentials();
		log.info("verifyOTP: fetched userId={}", userId);

		SuperAdmin superAdmin = superAdminDao.findById(userId).orElse(null);
		if (superAdmin == null) {
			log.warn("verifyOTP: SuperAdmin not found for userId={}", userId);
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_SUPER_ADMIN_NOR_FOUND);
		}

		try {
			if (OtpUtil.validateOTP(superAdmin.getVerificationCode(), superAdmin.getOtpExpiryTime(), otp)) {
				log.warn("verifyOTP: Invalid or expired OTP provided for userId={}", userId);
				throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_INVALID_OR_EXPIRED_OTP);
			}

			superAdmin.setVerificationCode(null);
			superAdmin.setOtpExpiryTime(null);
			superAdmin.setVerified(true);
			superAdminDao.save(superAdmin);

			log.info("verifyOTP: OTP verified successfully for userId={}", userId);
			return new ResponseEntityDto(false,
					messageUtil.getMessage(EPCommonMessageConstant.EP_COMMON_SUCCESS_OTP_VERIFIED));
		}
		catch (Exception e) {
			log.error("verifyOTP: Error in OTP verification for userId={}, error={}", userId, e.getMessage(), e);
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_OTP_VERIFICATION);
		}
	}

	@Override
	public ResponseEntityDto verifySubDomain(String subDomainName) {
		log.info("verifySubDomain: execution started for subDomainName={}", subDomainName);

		EpDomainAvailabilityResponseDto responseDto = new EpDomainAvailabilityResponseDto();
		responseDto.setSubDomainName(subDomainName);
		responseDto.setIsDomainAvailable(false);

		if (subDomainName == null || subDomainName.isEmpty()) {
			log.warn("verifySubDomain: subDomainName is null or empty");
			responseDto.setErrorMessage(messageUtil
				.getMessage(EPCommonMessageConstant.EP_COMMON_ERROR_COMPANY_DOMAIN_REQUIRED.getMessageKey()));
			return new ResponseEntityDto(false, responseDto);
		}

		if (subDomainName.length() > EpCommonConstants.MAXIMUM_COMPANY_DOMAIN_NAME_LENGTH) {
			log.warn("verifySubDomain: subDomainName length exceeded for {}", subDomainName);
			responseDto.setErrorMessage(messageUtil
				.getMessage(EPCommonMessageConstant.EP_COMMON_ERROR_COMPANY_DOMAIN_LENGTH_EXCEEDED.getMessageKey()));
			return new ResponseEntityDto(false, responseDto);
		}

		if (!subDomainName.matches(EpValidationConstants.VALID_COMPANY_DOMAIN_NAME_REGEXP)) {
			log.warn("verifySubDomain: subDomainName does not match regex for {}", subDomainName);
			responseDto.setErrorMessage(messageUtil
				.getMessage(EPCommonMessageConstant.EP_COMMON_ERROR_COMPANY_DOMAIN_INVALID.getMessageKey()));
			return new ResponseEntityDto(false, responseDto);
		}

		if (EpValidationConstants.RESTRICTED_SUBDOMAINS.contains(subDomainName.toLowerCase())) {
			log.error("verifySubDomain: Attempted to create restricted subdomain: {}", subDomainName);
			responseDto.setErrorMessage(messageUtil
				.getMessage(EPCommonMessageConstant.EP_COMMON_ERROR_RESTRICTED_SUBDOMAIN.getMessageKey()));
			return new ResponseEntityDto(false, responseDto);
		}

		if (tenantDao.findByTenantName(subDomainName) != null) {
			log.warn("verifySubDomain: subDomainName not available: {}", subDomainName);
			responseDto.setErrorMessage(messageUtil
				.getMessage(EPCommonMessageConstant.EP_COMMON_ERROR_COMPANY_DOMAIN_NOT_AVAILABLE.getMessageKey()));
			return new ResponseEntityDto(false, responseDto);
		}

		responseDto.setIsDomainAvailable(true);
		responseDto.setErrorMessage(null);

		log.info("verifySubDomain: subDomainName is available: {}", subDomainName);
		return new ResponseEntityDto(false, responseDto);
	}

	@Override
	public ResponseEntityDto ssoGoogleSignUp(EpSignUpGoogleDataDto epSignUpGoogleDataDto) {
		log.info("ssoGoogleSignUp: execution started for email={}", epSignUpGoogleDataDto.getEmail());

		Validation.isValidFirstName(epSignUpGoogleDataDto.getFirstName());
		Validation.isValidLastName(epSignUpGoogleDataDto.getLastName());
		Validation.validateEmail(epSignUpGoogleDataDto.getEmail());

		DecodedJWT decodedJWT = validateAndGetDecodedJWT(epSignUpGoogleDataDto.getToken());
		if (decodedJWT == null) {
			log.error("ssoGoogleSignUp: Google token validation failed for email: {}",
					epSignUpGoogleDataDto.getEmail());
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_GOOGLE_CONNECTION);
		}

		if (TenantContext.getCurrentTenant() == null
				|| TenantContext.getCurrentTenant().equals(EpCommonConstants.MASTER_DATABASE)) {
			log.info("ssoGoogleSignUp: SSO Signup flow executed for email: {}", epSignUpGoogleDataDto.getEmail());
			SuperAdmin superAdmin = epCommonMapper.createEpGoogleDataDtoToSuperAdmin(epSignUpGoogleDataDto);
			superAdmin.setLoginMethod(LoginMethod.GOOGLE);
			superAdmin.setFirstName(epSignUpGoogleDataDto.getFirstName());
			superAdmin.setLastName(epSignUpGoogleDataDto.getLastName());
			superAdmin.setAuthPic(epSignUpGoogleDataDto.getAuthPic());
			superAdmin.setActive(true);
			superAdmin.setVerified(true);

			SuperAdmin savedSuperAdmin = superAdminDao.save(superAdmin);

			String accessToken = generateAccessToken(savedSuperAdmin.getId(), savedSuperAdmin);
			String refreshToken = generateRefreshToken(savedSuperAdmin.getId(), savedSuperAdmin);

			SignInResponseDto signInResponseDto = getSignInResponseDto(accessToken, refreshToken, savedSuperAdmin);

			log.info("ssoGoogleSignUp: execution ended for superAdminId={}", savedSuperAdmin.getId());
			return new ResponseEntityDto(false, signInResponseDto);
		}

		log.info("ssoGoogleSignUp: execution ended with no action for email={}", epSignUpGoogleDataDto.getEmail());
		return new ResponseEntityDto(false, null);
	}

	@Override
	public ResponseEntityDto ssoGoogleSignIn(EpSignInGoogleDataDto epSignUpGoogleDataDto) {
		log.info("ssoGoogleSignIn: execution started for email={}", epSignUpGoogleDataDto.getEmail());

		Validation.validateEmail(epSignUpGoogleDataDto.getEmail());

		DecodedJWT decodedJWT = validateAndGetDecodedJWT(epSignUpGoogleDataDto.getToken());
		if (decodedJWT == null) {
			log.error("ssoGoogleSignIn: Google token validation failed for email: {}",
					epSignUpGoogleDataDto.getEmail());
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_GOOGLE_CONNECTION);
		}

		Optional<User> optionalUser = userDao.findByEmail(epSignUpGoogleDataDto.getEmail());
		if (optionalUser.isEmpty()) {
			log.warn("ssoGoogleSignIn: User not found for email={}", epSignUpGoogleDataDto.getEmail());
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_USER_NOT_FOUND);
		}

		User user = optionalUser.get();
		if (Boolean.FALSE.equals(user.getIsActive())) {
			log.warn("ssoGoogleSignIn: User account deactivated for userId={}", user.getUserId());
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_USER_ACCOUNT_DEACTIVATED);
		}

		Optional<Employee> employee = employeeDao.findById(user.getUserId());
		if (employee.isEmpty()) {
			log.warn("ssoGoogleSignIn: Employee not found for userId={}", user.getUserId());
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_USER_NOT_FOUND);
		}

		Employee userEmployee = employee.get();
		boolean isUpdated = false;

		if (userEmployee.getAccountStatus() == AccountStatus.PENDING) {
			userEmployee.setAccountStatus(AccountStatus.ACTIVE);
			isUpdated = true;
			log.info("ssoGoogleSignIn: Account status updated to ACTIVE for employeeId={}",
					userEmployee.getEmployeeId());
		}

		if (epSignUpGoogleDataDto.getAuthPic() != null
				&& !epSignUpGoogleDataDto.getAuthPic().equals(userEmployee.getAuthPic())) {
			userEmployee.setAuthPic(epSignUpGoogleDataDto.getAuthPic());
			isUpdated = true;
			log.info("ssoGoogleSignIn: AuthPic updated for employeeId={}", userEmployee.getEmployeeId());
		}

		if (isUpdated) {
			employeeDao.save(userEmployee);
			log.info("ssoGoogleSignIn: Employee entity updated for employeeId={}", userEmployee.getEmployeeId());
		}

		EmployeeSignInResponseDto employeeSignInResponseDto = peopleMapper
			.employeeToEmployeeSignInResponseDto(userEmployee);

		UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
		String accessToken = jwtService.generateAccessToken(userDetails, user.getUserId());
		String refreshToken = jwtService.generateRefreshToken(userDetails);

		SignInResponseDto signInResponseDto = new SignInResponseDto();
		signInResponseDto.setAccessToken(accessToken);
		signInResponseDto.setRefreshToken(refreshToken);
		signInResponseDto.setEmployee(employeeSignInResponseDto);
		signInResponseDto.setIsPasswordChangedForTheFirstTime(user.getIsPasswordChangedForTheFirstTime());

		log.info("ssoGoogleSignIn: execution ended for userId={}", user.getUserId());
		return new ResponseEntityDto(false, signInResponseDto);
	}

	@Override
	public ResponseEntityDto sendPasswordResetOtp(EpPasswordResetDto epPasswordResetDto) {
		log.info("sendPasswordResetOtp: execution started for email={}, tenantId={}", epPasswordResetDto.getEmail(),
				epPasswordResetDto.getTenantId());
		Optional<User> userOptional = findEligiblePasswordResetUser(epPasswordResetDto.getTenantId(),
				epPasswordResetDto.getEmail());
		if (userOptional.isEmpty()) {
			log.info("sendPasswordResetOtp: Password reset OTP request accepted without matching user");
			return buildPasswordResetOtpAcceptedResponse();
		}

		User user = userOptional.get();
		String verificationCode = OtpUtil.generateOTP();
		Instant expiryTime = Instant.now().plusSeconds(otpExpirySeconds);

		PasswordResetOtp passwordResetOtp = new PasswordResetOtp();
		passwordResetOtp.setUserId(user.getUserId());
		passwordResetOtp.setVerificationCode(verificationCode);
		passwordResetOtp.setOtpExpiryTime(expiryTime);
		passwordResetOtp.setVerified(false);

		passwordResetOtpDao.save(passwordResetOtp);
		log.info("sendPasswordResetOtp: OTP generated and saved for userId={}", user.getUserId());
		epCommonEmailService.sendPasswordResetOtpEmail(user, verificationCode);
		log.info("sendPasswordResetOtp: OTP email sent to {}", user.getEmail());

		return buildPasswordResetOtpAcceptedResponse();
	}

	@Override
	public ResponseEntityDto resendVerifyPasswordResetOTP(EpPasswordResetDto epPasswordResetDto) {
		log.info("resendVerifyPasswordResetOTP: execution started for email={}, tenantId={}",
				epPasswordResetDto.getEmail(), epPasswordResetDto.getTenantId());
		Optional<User> userOptional = findEligiblePasswordResetUser(epPasswordResetDto.getTenantId(),
				epPasswordResetDto.getEmail());
		if (userOptional.isEmpty()) {
			log.info("resendVerifyPasswordResetOTP: Password reset OTP request accepted without matching user");
			return buildPasswordResetOtpAcceptedResponse();
		}

		User user = userOptional.get();

		PasswordResetOtp passwordResetOtp = passwordResetOtpDao.findById(user.getUserId()).orElse(null);
		if (passwordResetOtp == null) {
			log.warn("resendVerifyPasswordResetOTP: OTP not found for userId={}", user.getUserId());
			return buildPasswordResetOtpAcceptedResponse();
		}

		if (passwordResetOtp.getVerificationCode() == null) {
			log.warn("resendVerifyPasswordResetOTP: OTP already verified for userId={}", user.getUserId());
			return buildPasswordResetOtpAcceptedResponse();
		}

		String verificationCode = OtpUtil.generateOTP();
		Instant expiryTime = Instant.now().plusSeconds(otpExpirySeconds);

		passwordResetOtp.setUserId(user.getUserId());
		passwordResetOtp.setVerificationCode(verificationCode);
		passwordResetOtp.setOtpExpiryTime(expiryTime);
		passwordResetOtp.setVerified(false);

		passwordResetOtpDao.save(passwordResetOtp);
		log.info("resendVerifyPasswordResetOTP: OTP regenerated and saved for userId={}", user.getUserId());
		epCommonEmailService.sendPasswordResetOtpEmail(user, verificationCode);
		log.info("resendVerifyPasswordResetOTP: OTP email resent to {}", user.getEmail());

		return buildPasswordResetOtpAcceptedResponse();
	}

	@Override
	@Transactional
	public ResponseEntityDto verifyTenantAvailability(String subDomainName) {
		log.info("verifyTenantAvailability: execution started for subDomainName={}", subDomainName);
		tenantContext.setTenantAndSwitchSchema(EpCommonConstants.MASTER_DATABASE);

		TenantAvailabilityResponseDto responseDto = new TenantAvailabilityResponseDto();
		responseDto.setIsTenantAvailable(false);
		responseDto.setSubDomainName(subDomainName);

		Tenant tenant = tenantDao.findByTenantName(subDomainName);
		if (tenant != null) {
			responseDto.setIsTenantAvailable(true);
			responseDto.setTier(tenant.getTier());
			log.info("verifyTenantAvailability: subDomainName={} is available", subDomainName);
			return new ResponseEntityDto(false, responseDto);
		}

		log.info("verifyTenantAvailability: subDomainName={} is not available", subDomainName);
		return new ResponseEntityDto(false, responseDto);
	}

	@Override
	public ResponseEntityDto validateCodeChallenge(CodeChallengeRequestDto codeChallengeRequestDto) {
		log.info("validateCodeChallenge: execution started for tenantId={}", TenantContext.getCurrentTenant());
		CodeChallengeResponseDto codeChallengeResponseDto = performCodeChallengeValidation(codeChallengeRequestDto,
				null);
		log.info("validateCodeChallenge: execution ended");
		return new ResponseEntityDto(false, codeChallengeResponseDto);
	}

	@Override
	public ResponseEntityDto validateCodeChallengeWithCookie(CodeChallengeRequestDto codeChallengeRequestDto,
			HttpServletResponse response) {
		log.info("validateCodeChallengeWithCookie: execution started for tenantId={}",
				TenantContext.getCurrentTenant());
		CodeChallengeResponseDto codeChallengeResponseDto = performCodeChallengeValidation(codeChallengeRequestDto,
				response);
		log.info("validateCodeChallengeWithCookie: execution ended");
		return new ResponseEntityDto(false, codeChallengeResponseDto);
	}

	private CodeChallengeResponseDto performCodeChallengeValidation(CodeChallengeRequestDto codeChallengeRequestDto,
			HttpServletResponse response) {
		String tenantId = TenantContext.getCurrentTenant();

		if (tenantId == null || tenantId.isEmpty()) {
			log.error("performCodeChallengeValidation: Tenant not found");
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_TENANT_NOT_FOUND);
		}

		CacheKey cacheKey = EpCacheKeys.CODE_CHALLENGE_CACHE_KEY;
		String cachedUuid = cacheService.get(cacheKey.format(tenantId));

		if (cachedUuid == null) {
			log.error("performCodeChallengeValidation: Cached UUID not found for tenantId={}", tenantId);
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_CACHED_UUID_NOT_FOUND);
		}

		if (!Objects.equals(codeChallengeRequestDto.getCode(), cachedUuid)) {
			log.warn("performCodeChallengeValidation: Unauthorized access attempt for tenantId={}", tenantId);
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_UNAUTHORIZED_ACCESS);
		}

		User user = userDao.findAll().getFirst();
		if (user == null) {
			log.error("performCodeChallengeValidation: User not found");
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_USER_NOT_FOUND);
		}

		UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
		String accessToken = jwtService.generateAccessToken(userDetails, user.getUserId());
		String refreshToken = jwtService.generateRefreshToken(userDetails);

		cacheService.invalidate(cacheKey.format(tenantId));
		log.info("performCodeChallengeValidation: Code challenge validated and tokens generated for userId={}",
				user.getUserId());

		if (response != null) {
			long cookieMaxAge = jwtService.getRefreshTokenMaxAge(userDetails);
			Cookie cookie = cookieUtil.createRefreshTokenCookie(getTenantId(), refreshToken, cookieMaxAge);
			response.addCookie(cookie);
			log.info("performCodeChallengeValidation: Added refresh token cookie for userId={}", user.getUserId());

			addTenantCookie(response, cookieMaxAge, user);
		}

		CodeChallengeResponseDto codeChallengeResponseDto = new CodeChallengeResponseDto();
		codeChallengeResponseDto.setAccessToken(accessToken);
		codeChallengeResponseDto.setIsPasswordChangedForTheFirstTime(true);

		if (response == null) {
			codeChallengeResponseDto.setRefreshToken(refreshToken);
		}

		return codeChallengeResponseDto;
	}

	@Override
	public ResponseEntityDto sendGuestUserSignInOtp(EpGuestUserSignInRequestDto epGuestUserSignInRequestDto) {
		log.info("sendGuestUserSignInOtp: execution started for email={}, tenantId={}",
				epGuestUserSignInRequestDto.getEmail(), TenantContext.getCurrentTenant());
		User user = epGuestUserService.validateGuestUserEmail(epGuestUserSignInRequestDto.getEmail());

		String otpCode = OtpUtil.generateOTP();
		Instant expiryTime = Instant.now().plusSeconds(otpExpirySeconds);

		PasswordResetOtp passwordResetOtp = new PasswordResetOtp();
		passwordResetOtp.setUserId(user.getUserId());
		passwordResetOtp.setVerificationCode(otpCode);
		passwordResetOtp.setOtpExpiryTime(expiryTime);
		passwordResetOtp.setVerified(false);

		passwordResetOtpDao.save(passwordResetOtp);
		log.info("sendGuestUserSignInOtp: OTP generated and saved for userId={}", user.getUserId());
		epUserEmailService.sendGuestUserOtpEmail(user, otpCode);
		log.info("sendGuestUserSignInOtp: OTP email sent to {}", user.getEmail());

		return new ResponseEntityDto(false, "Guest user sign in OTP sent successfully");
	}

	@Override
	public ResponseEntityDto resendGuestUserSignInOtp(EpGuestUserSignInRequestDto epGuestUserSignInRequestDto) {
		log.info("resendGuestUserSignInOtp: execution started for email={}, tenantId={}",
				epGuestUserSignInRequestDto.getEmail(), TenantContext.getCurrentTenant());
		User user = epGuestUserService.validateGuestUserEmail(epGuestUserSignInRequestDto.getEmail());

		String otpCode = OtpUtil.generateOTP();
		Instant expiryTime = Instant.now().plusSeconds(otpExpirySeconds);

		PasswordResetOtp passwordResetOtp = passwordResetOtpDao.findById(user.getUserId()).orElse(null);
		if (passwordResetOtp == null) {
			log.warn("resendGuestUserSignInOtp: OTP not found for userId={}", user.getUserId());
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_OTP_NOT_FOUND);
		}

		if (passwordResetOtp.getVerificationCode() == null) {
			log.warn("resendGuestUserSignInOtp: OTP already verified for userId={}", user.getUserId());
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_OTP_ALREADY_VERIFIED);
		}

		passwordResetOtp.setUserId(user.getUserId());
		passwordResetOtp.setVerificationCode(otpCode);
		passwordResetOtp.setOtpExpiryTime(expiryTime);
		passwordResetOtp.setVerified(false);

		passwordResetOtpDao.save(passwordResetOtp);
		log.info("resendGuestUserSignInOtp: OTP regenerated and saved for userId={}", user.getUserId());
		epUserEmailService.sendGuestUserOtpEmail(user, otpCode);
		log.info("resendGuestUserSignInOtp: OTP email resent to {}", user.getEmail());

		return new ResponseEntityDto(false, "Password reset OTP resent successfully");
	}

	@Override
	public ResponseEntityDto validateGuestUserSignInOtp(EpGuestUserOtpVerifyRequestDto epGuestUserOtpVerifyRequestDto) {
		log.info("validateGuestUserSignInOtp: execution started for email={}, tenantId={}",
				epGuestUserOtpVerifyRequestDto.getEmail(), TenantContext.getCurrentTenant());
		return performGuestUserOtpValidation(epGuestUserOtpVerifyRequestDto, null);
	}

	@Override
	public ResponseEntityDto validateGuestUserSignInOtpWithCookie(
			EpGuestUserOtpVerifyRequestDto epGuestUserOtpVerifyRequestDto, HttpServletResponse response) {
		log.info("validateGuestUserSignInOtpWithCookie: execution started for email={}, tenantId={}",
				epGuestUserOtpVerifyRequestDto.getEmail(), TenantContext.getCurrentTenant());
		return performGuestUserOtpValidation(epGuestUserOtpVerifyRequestDto, response);
	}

	private ResponseEntityDto performGuestUserOtpValidation(
			EpGuestUserOtpVerifyRequestDto epGuestUserOtpVerifyRequestDto, HttpServletResponse response) {
		User user = epGuestUserService.validateGuestUserEmail(epGuestUserOtpVerifyRequestDto.getEmail());

		PasswordResetOtp passwordResetOtp = passwordResetOtpDao.findById(user.getUserId()).orElse(null);

		if (passwordResetOtp == null) {
			log.warn("performGuestUserOtpValidation: OTP not found for userId={}", user.getUserId());
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_OTP_NOT_FOUND);
		}

		if (OtpUtil.validateOTP(passwordResetOtp.getVerificationCode(), passwordResetOtp.getOtpExpiryTime(),
				epGuestUserOtpVerifyRequestDto.getOtp())) {
			log.warn("performGuestUserOtpValidation: Invalid or expired OTP provided for userId={}", user.getUserId());
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_INVALID_OR_EXPIRED_OTP);
		}

		passwordResetOtp.setVerificationCode(null);
		passwordResetOtp.setOtpExpiryTime(null);
		passwordResetOtp.setVerified(true);
		passwordResetOtpDao.save(passwordResetOtp);

		Optional<Employee> employee = employeeDao.findById(user.getUserId());
		if (employee.isEmpty()) {
			log.warn("performGuestUserOtpValidation: Employee not found for userId={}", user.getUserId());
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_USER_NOT_FOUND);
		}

		Employee userEmployee = employee.get();
		boolean isUpdated = false;

		if (userEmployee.getAccountStatus() == AccountStatus.PENDING) {
			userEmployee.setAccountStatus(AccountStatus.ACTIVE);
			isUpdated = true;
			log.info("performGuestUserOtpValidation: Account status updated to ACTIVE for employeeId={}",
					userEmployee.getEmployeeId());
		}

		if (isUpdated) {
			employeeDao.save(userEmployee);
			log.info("performGuestUserOtpValidation: Employee entity updated for employeeId={}",
					userEmployee.getEmployeeId());
		}

		log.info("performGuestUserOtpValidation: OTP verified and updated for userId={}", user.getUserId());
		return buildSignInResponse(user, userEmployee, response);
	}

	private ResponseEntityDto buildSignInResponse(User user, Employee userEmployee, HttpServletResponse response) {
		EmployeeSignInResponseDto employeeSignInResponseDto = peopleMapper
			.employeeToEmployeeSignInResponseDto(userEmployee);

		UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
		String accessToken = jwtService.generateAccessToken(userDetails, user.getUserId());
		String refreshToken = jwtService.generateRefreshToken(userDetails);

		if (response != null) {
			long cookieMaxAge = jwtService.getRefreshTokenMaxAge(userDetails);
			Cookie cookie = cookieUtil.createRefreshTokenCookie(getTenantId(), refreshToken, cookieMaxAge);
			response.addCookie(cookie);
			log.info("buildSignInResponse: Added refresh token cookie for userId={}", user.getUserId());

			addTenantCookie(response, cookieMaxAge, user);
		}

		SignInResponseDto signInResponseDto = new SignInResponseDto();
		signInResponseDto.setAccessToken(accessToken);
		signInResponseDto.setEmployee(employeeSignInResponseDto);
		signInResponseDto.setIsPasswordChangedForTheFirstTime(user.getIsPasswordChangedForTheFirstTime());

		if (response == null) {
			signInResponseDto.setRefreshToken(refreshToken);
		}

		log.info("buildSignInResponse: Sign-in response built for userId={}", user.getUserId());
		return new ResponseEntityDto(false, signInResponseDto);
	}

	@Override
	public ResponseEntityDto verifyPasswordResetOTP(EpPasswordResetOtpVerifyDto epPasswordResetOtpVerifyDto) {
		log.info("verifyPasswordResetOTP: execution started for email={}, tenantId={}",
				epPasswordResetOtpVerifyDto.getEmail(), epPasswordResetOtpVerifyDto.getTenantId());
		User user = validateDomainAndEmail(epPasswordResetOtpVerifyDto.getTenantId(),
				epPasswordResetOtpVerifyDto.getEmail());
		try {
			PasswordResetOtp passwordResetOtp = passwordResetOtpDao.findById(user.getUserId()).orElse(null);

			if (passwordResetOtp == null) {
				log.warn("verifyPasswordResetOTP: OTP not found for userId={}", user.getUserId());
				throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_OTP_NOT_FOUND);
			}

			if (OtpUtil.validateOTP(passwordResetOtp.getVerificationCode(), passwordResetOtp.getOtpExpiryTime(),
					epPasswordResetOtpVerifyDto.getOtp())) {
				log.warn("verifyPasswordResetOTP: Invalid or expired OTP provided for userId={}", user.getUserId());
				throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_INVALID_OR_EXPIRED_OTP);
			}

			passwordResetOtp.setVerificationCode(null);
			passwordResetOtp.setOtpExpiryTime(null);
			passwordResetOtp.setVerified(true);
			passwordResetOtpDao.save(passwordResetOtp);
			log.info("verifyPasswordResetOTP: OTP verified and updated for userId={}", user.getUserId());
		}
		catch (Exception e) {
			log.error("verifyPasswordResetOTP: Error in OTP verification for email={}",
					epPasswordResetOtpVerifyDto.getEmail(), e);
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_OTP_VERIFICATION);
		}
		return new ResponseEntityDto(false, "OTP verified successfully");
	}

	@Override
	public ResponseEntityDto resetPassword(EpPasswordResetNewPasswordDto epPasswordResetNewPasswordDto) {
		log.info("resetPassword: execution started for email={}, tenantId={}", epPasswordResetNewPasswordDto.getEmail(),
				epPasswordResetNewPasswordDto.getTenantId());
		User user = validateDomainAndEmail(epPasswordResetNewPasswordDto.getTenantId(),
				epPasswordResetNewPasswordDto.getEmail());
		createNewPassword(epPasswordResetNewPasswordDto.getNewPassword(), user);
		log.info("resetPassword: Password reset successfully for userId={}", user.getUserId());

		return new ResponseEntityDto(false, "Password reset successfully");
	}

	@Override
	protected void addTenantCookie(HttpServletResponse response, long cookieMaxAge, User user) {
		tenantCookieService.addTenantCookie(response, cookieMaxAge);
	}

	@Override
	protected void clearTenantCookie(HttpServletResponse response) {
		tenantCookieService.clearTenantCookie(response);
	}

	@Override
	protected String getTenantId() {
		return TenantContext.getCurrentTenant();
	}

	@Override
	protected void validateTenantStatus(User user) {
		String currentTenant = TenantContext.getCurrentTenant();
		log.info("validateTenantStatus: execution started for tenant={}", currentTenant);
		tenantContext.setTenantAndSwitchSchema(EpCommonConstants.MASTER_DATABASE);
		Tenant tenant = tenantDao.findByTenantName(currentTenant);
		tenantContext.setTenantAndSwitchSchema(currentTenant);
		TenantStatus tenantStatus = tenant.getTenantStatus();
		if (tenantStatus != null && tenantStatus != TenantStatus.ACTIVE
				&& Boolean.FALSE.equals(user.getEmployee().getEmployeeRole().getIsSuperAdmin())) {
			log.warn("validateTenantStatus: Tenant status not active for tenant={}, userId={}", currentTenant,
					user.getUserId());
			throw new ModuleException(
					EPCommonMessageConstant.COMMON_ERROR_TENANT_STATUS_NOT_ACTIVE_CONTACT_SUPER_ADMIN);
		}
		log.info("validateTenantStatus: Tenant status validated for tenant={}, userId={}", currentTenant,
				user.getUserId());
	}

	private DecodedJWT validateAndGetDecodedJWT(String token) {
		DecodedJWT decodedJWT;

		try {
			decodedJWT = googleTokenValidator.validateToken(token);
		}
		catch (Exception e) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_VALIDATE_GOOGLE_TOKEN);
		}
		return decodedJWT;
	}

	public String generateAccessToken(Long userId, UserDetails userDetails) {
		Map<String, Object> claims = new HashMap<>();
		claims.put(AuthConstants.TOKEN_TYPE, TokenType.ACCESS);
		claims.put(AuthConstants.USER_ID, userId);
		claims.put(EpAuthConstants.TENANT_ID, EpCommonConstants.MASTER_DATABASE);
		return generateToken(claims, userDetails, jwtAccessTokenExpirationMs);
	}

	public String generateRefreshToken(Long userId, UserDetails userDetails) {
		Map<String, Object> claims = new HashMap<>();
		claims.put(AuthConstants.TOKEN_TYPE, TokenType.REFRESH);
		claims.put(AuthConstants.USER_ID, userId);
		claims.put(EpAuthConstants.TENANT_ID, EpCommonConstants.MASTER_DATABASE);

		Set<String> shortDurationRoles = new HashSet<>();
		shortDurationRoles.add(AuthConstants.AUTH_ROLE + Role.SUPER_ADMIN);
		shortDurationRoles.add(AuthConstants.AUTH_ROLE + Role.ATTENDANCE_ADMIN);
		shortDurationRoles.add(AuthConstants.AUTH_ROLE + Role.PEOPLE_ADMIN);
		shortDurationRoles.add(AuthConstants.AUTH_ROLE + Role.LEAVE_ADMIN);

		Set<String> extendedDurationRoles = new HashSet<>();
		extendedDurationRoles.add(AuthConstants.AUTH_ROLE + Role.PM_GUEST_EMPLOYEE);

		boolean hasShortDurationRole = userDetails.getAuthorities()
			.stream()
			.anyMatch(authority -> shortDurationRoles.contains(authority.getAuthority()));

		boolean hasExtendedDurationRole = userDetails.getAuthorities()
			.stream()
			.anyMatch(authority -> extendedDurationRoles.contains(authority.getAuthority()));

		long jwtRefreshTokenExpirationMs;

		if (hasShortDurationRole) {
			jwtRefreshTokenExpirationMs = jwtShortDurationRefreshTokenExpirationMs;
		}
		else if (hasExtendedDurationRole) {
			jwtRefreshTokenExpirationMs = jwtExtendedDurationRefreshTokenExpirationMs;
		}
		else {
			jwtRefreshTokenExpirationMs = jwtLongDurationRefreshTokenExpirationMs;
		}

		return generateToken(claims, userDetails, jwtRefreshTokenExpirationMs);
	}

	private String generateToken(Map<String, Object> extraClaims, UserDetails userDetails, Long expirationTime) {
		List<String> roles = userDetails.getAuthorities().stream().map(GrantedAuthority::getAuthority).toList();
		Map<String, Object> claims = new HashMap<>();
		claims.put(AuthConstants.ROLES, roles);

		if (extraClaims != null) {
			claims.putAll(extraClaims);
		}

		return Jwts.builder()
			.claims(claims)
			.subject(userDetails.getUsername())
			.issuedAt(new Date(System.currentTimeMillis()))
			.expiration(new Date(System.currentTimeMillis() + expirationTime))
			.signWith(jwtService.getSigningKey())
			.compact();
	}

	private void validateRecaptchaToken(String recaptchaToken, String bypassSecret) {
		String configuredBypassSecret = recaptchaConfig.getBypassSecret();
		if (configuredBypassSecret != null && !configuredBypassSecret.isBlank()
				&& configuredBypassSecret.equals(bypassSecret)) {
			log.warn("validateRecaptchaToken: reCAPTCHA validation bypassed via bypass secret");
			return;
		}

		if (recaptchaToken == null || recaptchaToken.isBlank()) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_RECAPTCHA_INVALID);
		}

		try {
			String url = UriComponentsBuilder.fromUriString(recaptchaConfig.getVerifyUrl())
				.queryParam("secret", recaptchaConfig.getSecret())
				.queryParam("response", recaptchaToken)
				.toUriString();

			HttpHeaders headers = new HttpHeaders();
			HttpEntity<?> requestEntity = new HttpEntity<>(headers);

			ResponseEntity<Map<String, Object>> response = restTemplate.exchange(url, HttpMethod.GET, requestEntity,
					new ParameterizedTypeReference<>() {
					});

			Map<String, Object> responseBody = response.getBody();
			if (responseBody == null || !Boolean.TRUE.equals(responseBody.get("success"))) {
				log.warn("validateRecaptchaToken: reCAPTCHA validation failed - {}", responseBody);
				throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_RECAPTCHA_INVALID);
			}

			log.info("validateRecaptchaToken: reCAPTCHA validation succeeded");
		}
		catch (RestClientException e) {
			log.error("validateRecaptchaToken: Error during reCAPTCHA validation", e);
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_VALIDATION_RECAPTCHA_INVALID);
		}
	}

	private User validateDomainAndEmail(String companyDomain, String email) {
		if (!validateTenantExist(companyDomain)) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_COMPANY_DOMAIN_NOT_AVAILABLE);
		}

		tenantContext.setTenantAndSwitchSchema(companyDomain);

		Optional<User> userOptional = userDao.findByEmail(email);

		if (userOptional.isPresent()) {
			User user = userOptional.get();
			if (user.getIsPasswordChangedForTheFirstTime()) {
				return user;
			}
		}
		throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_USER_NOT_FOUND);
	}

	private Optional<User> findEligiblePasswordResetUser(String companyDomain, String email) {
		if (companyDomain == null || companyDomain.isBlank() || email == null || email.isBlank()) {
			return Optional.empty();
		}

		tenantContext.setTenantAndSwitchSchema(EpCommonConstants.MASTER_DATABASE);
		if (tenantDao.findById(companyDomain).isEmpty()) {
			return Optional.empty();
		}

		tenantContext.setTenantAndSwitchSchema(companyDomain);
		return userDao.findByEmail(email).filter(User::getIsPasswordChangedForTheFirstTime);
	}

	private ResponseEntityDto buildPasswordResetOtpAcceptedResponse() {
		return new ResponseEntityDto(false,
				messageUtil.getMessage(EPCommonMessageConstant.EP_COMMON_SUCCESS_PASSWORD_RESET_OTP_SENT));
	}

	public boolean validateTenantExist(String tenantId) {
		tenantContext.setTenantAndSwitchSchema(EpCommonConstants.MASTER_DATABASE);
		Tenant tenant = tenantDao.findById(tenantId).orElse(null);
		tenantContext.setTenantAndSwitchSchema(tenantId);
		return tenant != null;
	}

}
