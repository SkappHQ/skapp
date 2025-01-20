package com.skapp.enterprise.common.service.impl;

import com.auth0.jwt.interfaces.DecodedJWT;
import com.skapp.community.common.constant.AuthConstants;
import com.skapp.community.common.constant.CommonMessageConstant;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.request.SuperAdminSignUpRequestDto;
import com.skapp.community.common.payload.response.EmployeeSignInResponseDto;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.payload.response.SignInResponseDto;
import com.skapp.community.common.repository.UserDao;
import com.skapp.community.common.service.JwtService;
import com.skapp.community.common.type.LoginMethod;
import com.skapp.community.common.type.TokenType;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.community.common.util.Validation;
import com.skapp.community.peopleplanner.mapper.PeopleMapper;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.repository.EmployeeDao;
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
import com.skapp.enterprise.common.payload.request.EpCaptchaVerificationDto;
import com.skapp.enterprise.common.payload.request.EpPasswordResetDto;
import com.skapp.enterprise.common.payload.request.EpPasswordResetNewPasswordDto;
import com.skapp.enterprise.common.payload.request.EpPasswordResetOtpVerifyDto;
import com.skapp.enterprise.common.payload.request.EpSignInGoogleDataDto;
import com.skapp.enterprise.common.payload.request.EpSignUpGoogleDataDto;
import com.skapp.enterprise.common.payload.response.EpDomainAvailabilityResponseDto;
import com.skapp.enterprise.common.payload.response.TenantAvailabilityResponseDto;
import com.skapp.enterprise.common.repository.PasswordResetOtpDao;
import com.skapp.enterprise.common.service.EpAuthService;
import com.skapp.enterprise.common.service.EpCommonEmailService;
import com.skapp.enterprise.common.service.Route53Service;
import com.skapp.enterprise.common.validator.GoogleTokenValidator;
import com.skapp.enterprise.people.service.EpPeopleService;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class EpAuthServiceImpl implements EpAuthService {

	private final EpCommonMapper epCommonMapper;

	private final PasswordEncoder passwordEncoder;

	private final SuperAdminDao superAdminDao;

	private final UserDetailsService userDetailsService;

	private final JwtService jwtService;

	private final EpCommonEmailService emailService;

	private final MessageUtil messageUtil;

	private final Route53Service route53Service;

	private final RestTemplate restTemplate;

	private final GoogleTokenValidator googleTokenValidator;

	private final EmployeeDao employeeDao;

	private final PeopleMapper peopleMapper;

	private final UserDao userDao;

	private final TenantContext tenantContext;

	private final PasswordResetOtpDao passwordResetOtpDao;

	private final EpCommonEmailService epCommonEmailService;

	private final EpPeopleService epPeopleService;

	@Value("${jwt.refresh-token.expiration-time}")
	private Long jwtRefreshTokenExpirationMs;

	@Value("${jwt.access-token.expiration-time}")
	private Long jwtAccessTokenExpirationMs;

	@Value("${otp.expiry-minutes}")
	private int otpExpiryMinutes;

	private final RecaptchaConfig recaptchaConfig;

	private final TenantDao tenantDao;

	private final SecureRandom secureRandom = new SecureRandom();

	@Override
	public ResponseEntityDto superAdminSignUp(SuperAdminSignUpRequestDto superAdminSignUpRequestDto) {
		log.info("superAdminSignUp: execution started");

		Validation.isValidFirstName(superAdminSignUpRequestDto.getFirstName());
		Validation.isValidLastName(superAdminSignUpRequestDto.getLastName());
		Validation.validateEmail(superAdminSignUpRequestDto.getEmail());
		Validation.isValidPassword(superAdminSignUpRequestDto.getPassword());

		SuperAdmin superAdmin = epCommonMapper.createSuperAdminRequestDtoToSuperAdmin(superAdminSignUpRequestDto);
		superAdmin.setPassword(passwordEncoder.encode(superAdminSignUpRequestDto.getPassword()));
		superAdmin.setFirstName(superAdminSignUpRequestDto.getFirstName());
		superAdmin.setLastName(superAdminSignUpRequestDto.getLastName());
		superAdmin.setLoginMethod(LoginMethod.CREDENTIALS);
		superAdmin.setActive(true);
		superAdmin.setVerified(false);

		SuperAdmin savedSuperAdmin = superAdminDao.save(superAdmin);

		String accessToken = generateAccessToken(savedSuperAdmin.getId(), savedSuperAdmin);
		String refreshToken = generateRefreshToken(savedSuperAdmin.getId(), savedSuperAdmin);

		SignInResponseDto signInResponseDto = new SignInResponseDto();
		signInResponseDto.setAccessToken(accessToken);
		signInResponseDto.setRefreshToken(refreshToken);

		EmployeeSignInResponseDto employeeSignInResponseDto = new EmployeeSignInResponseDto();
		employeeSignInResponseDto.setEmployeeId(savedSuperAdmin.getId());
		employeeSignInResponseDto.setFirstName(savedSuperAdmin.getFirstName());
		employeeSignInResponseDto.setLastName(savedSuperAdmin.getLastName());

		signInResponseDto.setEmployee(employeeSignInResponseDto);
		signInResponseDto.setIsPasswordChangedForTheFirstTime(true);

		log.info("superAdminSignUp: execution ended");
		return new ResponseEntityDto(false, signInResponseDto);
	}

	@Override
	public ResponseEntityDto generateAndSendOTP() {
		log.info("generateAndSendOTP: execution started");

		Long userId = (Long) SecurityContextHolder.getContext().getAuthentication().getCredentials();
		SuperAdmin superAdmin = superAdminDao.findById(userId).orElse(null);
		if (superAdmin == null) {
			log.warn("generateAndSendOTP: SuperAdmin not found");
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_SUPER_ADMIN_NOR_FOUND);
		}

		String otp = generateOTP();
		log.info("generateAndSendOTP: OTP generated successfully");

		Instant expiryTime = Instant.now().plusSeconds(otpExpiryMinutes * 60L);

		try {
			superAdmin.setVerificationCode(otp);
			superAdmin.setOtpExpiryTime(expiryTime);
			superAdminDao.save(superAdmin);

			emailService.sendSuperAdminVerifyOtpEmail(superAdmin, otp);

			log.info("generateAndSendOTP: OTP generated and sent successfully");
			return new ResponseEntityDto(false,
					messageUtil.getMessage(EPCommonMessageConstant.EP_COMMON_SUCCESS_OTP_GENERATED_AND_SEND));
		}
		catch (Exception e) {
			log.error("generateAndSendOTP: Error in OTP generation or sending", e);
			return new ResponseEntityDto(true,
					messageUtil.getMessage(EPCommonMessageConstant.EP_COMMON_ERROR_OTP_GENERATION_OR_SEND));
		}
	}

	@Override
	public ResponseEntityDto verifyOTP(String otp) {
		log.info("verifyOTP: execution started");

		Long userId = (Long) SecurityContextHolder.getContext().getAuthentication().getCredentials();
		SuperAdmin superAdmin = superAdminDao.findById(userId).orElse(null);
		if (superAdmin == null) {
			log.warn("verifyOTP: SuperAdmin not found");
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_SUPER_ADMIN_NOR_FOUND);
		}

		try {
			if (!validateOTP(superAdmin.getVerificationCode(), superAdmin.getOtpExpiryTime(), otp)) {
				log.warn("verifyOTP: Invalid or expired OTP provided");
				throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_INVALID_OR_EXPIRED_OTP);
			}

			superAdmin.setVerificationCode(null);
			superAdmin.setOtpExpiryTime(null);
			superAdmin.setVerified(true);
			superAdminDao.save(superAdmin);

			log.info("verifyOTP: OTP verified successfully");
			return new ResponseEntityDto(false,
					messageUtil.getMessage(EPCommonMessageConstant.EP_COMMON_SUCCESS_OTP_VERIFIED));
		}
		catch (Exception e) {
			log.error("verifyOTP: Error in OTP verification", e);
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_OTP_VERIFICATION);
		}
	}

	@Override
	public ResponseEntityDto resendOTP() {
		log.info("resendOTP: execution started");
		return generateAndSendOTP();
	}

	@Override
	public ResponseEntityDto verifySubDomain(String subDomainName) {
		EpDomainAvailabilityResponseDto responseDto = new EpDomainAvailabilityResponseDto();
		responseDto.setSubDomainName(subDomainName);
		responseDto.setIsDomainAvailable(false);

		if (subDomainName == null || subDomainName.isEmpty()) {
			responseDto.setErrorMessage(messageUtil
				.getMessage(EPCommonMessageConstant.EP_COMMON_ERROR_COMPANY_DOMAIN_REQUIRED.getMessageKey()));
			return new ResponseEntityDto(false, responseDto);
		}

		if (subDomainName.length() > EpCommonConstants.MAXIMUM_COMPANY_DOMAIN_NAME_LENGTH) {
			responseDto.setErrorMessage(messageUtil
				.getMessage(EPCommonMessageConstant.EP_COMMON_ERROR_COMPANY_DOMAIN_LENGTH_EXCEEDED.getMessageKey()));
			return new ResponseEntityDto(false, responseDto);
		}

		if (!subDomainName.matches(EpValidationConstants.VALID_COMPANY_DOMAIN_NAME_REGEXP)) {
			responseDto.setErrorMessage(messageUtil
				.getMessage(EPCommonMessageConstant.EP_COMMON_ERROR_COMPANY_DOMAIN_INVALID.getMessageKey()));
			return new ResponseEntityDto(false, responseDto);
		}

		if (EpValidationConstants.RESTRICTED_SUBDOMAINS.contains(subDomainName.toLowerCase())) {
			log.error("Attempted to create restricted subdomain: {}", subDomainName);
			responseDto.setErrorMessage(messageUtil
				.getMessage(EPCommonMessageConstant.EP_COMMON_ERROR_RESTRICTED_SUBDOMAIN.getMessageKey()));
			return new ResponseEntityDto(false, responseDto);
		}

		if (route53Service.isDomainNotAvailable(subDomainName)) {
			responseDto.setErrorMessage(messageUtil
				.getMessage(EPCommonMessageConstant.EP_COMMON_ERROR_COMPANY_DOMAIN_NOT_AVAILABLE.getMessageKey()));
			return new ResponseEntityDto(false, responseDto);
		}

		responseDto.setIsDomainAvailable(true);
		responseDto.setErrorMessage(null);

		return new ResponseEntityDto(false, responseDto);
	}

	@Override
	public ResponseEntityDto ssoGoogleSignUp(EpSignUpGoogleDataDto epSignUpGoogleDataDto) {
		Validation.isValidFirstName(epSignUpGoogleDataDto.getFirstName());
		Validation.isValidLastName(epSignUpGoogleDataDto.getLastName());
		Validation.validateEmail(epSignUpGoogleDataDto.getEmail());

		DecodedJWT decodedJWT = validateAndGetDecodedJWT(epSignUpGoogleDataDto.getToken());
		if (decodedJWT == null) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_GOOGLE_CONNECTION);
		}

		if (TenantContext.getCurrentTenant() == null
				|| TenantContext.getCurrentTenant().equals(EpCommonConstants.MASTER_DATABASE)) {
			log.info("ssoGoogleSignUp: SSO Signup flow executed");
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

			SignInResponseDto signInResponseDto = new SignInResponseDto();
			signInResponseDto.setAccessToken(accessToken);
			signInResponseDto.setRefreshToken(refreshToken);

			EmployeeSignInResponseDto employeeSignInResponseDto = new EmployeeSignInResponseDto();
			employeeSignInResponseDto.setEmployeeId(savedSuperAdmin.getId());
			employeeSignInResponseDto.setFirstName(savedSuperAdmin.getFirstName());
			employeeSignInResponseDto.setLastName(savedSuperAdmin.getLastName());

			signInResponseDto.setEmployee(employeeSignInResponseDto);
			signInResponseDto.setIsPasswordChangedForTheFirstTime(true);

			log.info("ssoGoogleSignUp: execution ended");
			return new ResponseEntityDto(false, signInResponseDto);
		}

		return new ResponseEntityDto(false, null);

	}

	@Override
	public ResponseEntityDto ssoGoogleSignIn(EpSignInGoogleDataDto epSignUpGoogleDataDto) {
		log.info("ssoGoogleSignIn: execution started");

		Validation.validateEmail(epSignUpGoogleDataDto.getEmail());

		DecodedJWT decodedJWT = validateAndGetDecodedJWT(epSignUpGoogleDataDto.getToken());
		if (decodedJWT == null) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_GOOGLE_CONNECTION);
		}

		Optional<User> optionalUser = userDao.findByEmail(epSignUpGoogleDataDto.getEmail());
		if (optionalUser.isEmpty()) {
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_USER_NOT_FOUND);
		}

		User user = optionalUser.get();
		if (Boolean.FALSE.equals(user.getIsActive())) {
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_USER_ACCOUNT_DEACTIVATED);
		}

		Optional<Employee> employee = employeeDao.findById(user.getUserId());
		if (employee.isEmpty()) {
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_USER_NOT_FOUND);
		}

		Employee userEmployee = employee.get();
		boolean isUpdated = false;

		if (userEmployee.getAccountStatus() == AccountStatus.PENDING) {
			if (epPeopleService.checkEmployeesLimit()) {
				throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_FREE_USER_LIMIT_EXCEEDED);
			}

			userEmployee.setAccountStatus(AccountStatus.ACTIVE);
			isUpdated = true;
		}

		if (epSignUpGoogleDataDto.getAuthPic() != null
				&& !epSignUpGoogleDataDto.getAuthPic().equals(userEmployee.getAuthPic())) {
			userEmployee.setAuthPic(epSignUpGoogleDataDto.getAuthPic());
			isUpdated = true;
		}

		if (isUpdated) {
			employeeDao.save(userEmployee);
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

		log.info("ssoGoogleSignIn: execution ended");
		return new ResponseEntityDto(false, signInResponseDto);
	}

	@Override
	public ResponseEntityDto sendPasswordResetOtp(EpPasswordResetDto epPasswordResetDto) {
		User user = validateDomainAndEmail(epPasswordResetDto.getTenantId(), epPasswordResetDto.getEmail());
		String verificationCode = generateOTP();
		Instant expiryTime = Instant.now().plusSeconds(otpExpiryMinutes * 60L);

		PasswordResetOtp passwordResetOtp = new PasswordResetOtp();
		passwordResetOtp.setUserId(user.getUserId());
		passwordResetOtp.setVerificationCode(verificationCode);
		passwordResetOtp.setOtpExpiryTime(expiryTime);
		passwordResetOtp.setVerified(false);

		passwordResetOtpDao.save(passwordResetOtp);
		epCommonEmailService.sendPasswordResetOtpEmail(user, verificationCode);

		return new ResponseEntityDto(false, "Password reset OTP sent successfully");
	}

	@Override
	public ResponseEntityDto resendVerifyPasswordResetOTP(EpPasswordResetDto epPasswordResetDto) {
		User user = validateDomainAndEmail(epPasswordResetDto.getTenantId(), epPasswordResetDto.getEmail());
		String verificationCode = generateOTP();
		Instant expiryTime = Instant.now().plusSeconds(otpExpiryMinutes * 60L);

		PasswordResetOtp passwordResetOtp = passwordResetOtpDao.findById(user.getUserId()).orElse(null);
		if (passwordResetOtp == null) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_OTP_NOT_FOUND);
		}

		if (passwordResetOtp.getVerificationCode() == null) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_OTP_ALREADY_VERIFIED);
		}

		passwordResetOtp.setUserId(user.getUserId());
		passwordResetOtp.setVerificationCode(verificationCode);
		passwordResetOtp.setOtpExpiryTime(expiryTime);
		passwordResetOtp.setVerified(false);

		passwordResetOtpDao.save(passwordResetOtp);
		epCommonEmailService.sendPasswordResetOtpEmail(user, verificationCode);

		return new ResponseEntityDto(false, "Password reset OTP resent successfully");
	}

	@Override
	@Transactional
	public ResponseEntityDto verifyTenantAvailability(String subDomainName) {
		tenantContext.setTenantAndSwitchSchema(EpCommonConstants.MASTER_DATABASE);

		TenantAvailabilityResponseDto responseDto = new TenantAvailabilityResponseDto();
		responseDto.setIsTenantAvailable(false);
		responseDto.setSubDomainName(subDomainName);

		Tenant tenant = tenantDao.findByTenantName(subDomainName);
		if (tenant != null) {
			responseDto.setIsTenantAvailable(true);
			return new ResponseEntityDto(false, responseDto);
		}

		return new ResponseEntityDto(false, responseDto);
	}

	@Override
	public ResponseEntityDto verifyPasswordResetOTP(EpPasswordResetOtpVerifyDto epPasswordResetOtpVerifyDto) {
		User user = validateDomainAndEmail(epPasswordResetOtpVerifyDto.getTenantId(),
				epPasswordResetOtpVerifyDto.getEmail());
		try {
			PasswordResetOtp passwordResetOtp = passwordResetOtpDao.findById(user.getUserId()).orElse(null);

			if (passwordResetOtp == null) {
				throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_OTP_NOT_FOUND);
			}

			if (!validateOTP(passwordResetOtp.getVerificationCode(), passwordResetOtp.getOtpExpiryTime(),
					epPasswordResetOtpVerifyDto.getOtp())) {
				log.warn("verifyPasswordResetOTP: Invalid or expired OTP provided");
				throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_INVALID_OR_EXPIRED_OTP);
			}

			passwordResetOtp.setVerificationCode(null);
			passwordResetOtp.setOtpExpiryTime(null);
			passwordResetOtp.setVerified(true);
			passwordResetOtpDao.save(passwordResetOtp);
		}
		catch (Exception e) {
			log.error("verifyOTP: Error in OTP verification", e);
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_OTP_VERIFICATION);
		}
		return new ResponseEntityDto(false, "OTP verified successfully");

	}

	@Override
	public ResponseEntityDto resetPassword(EpPasswordResetNewPasswordDto epPasswordResetNewPasswordDto) {
		User user = validateDomainAndEmail(epPasswordResetNewPasswordDto.getTenantId(),
				epPasswordResetNewPasswordDto.getEmail());

		user.setPassword(passwordEncoder.encode(epPasswordResetNewPasswordDto.getNewPassword()));
		userDao.save(user);

		return new ResponseEntityDto(false, "Password reset successfully");

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
			.setClaims(claims)
			.setSubject(userDetails.getUsername())
			.setIssuedAt(new Date(System.currentTimeMillis()))
			.setExpiration(new Date(System.currentTimeMillis() + expirationTime))
			.signWith(jwtService.getSigningKey(), SignatureAlgorithm.HS256)
			.compact();
	}

	private String generateOTP() {
		return String.format("%06d", secureRandom.nextInt(999999));
	}

	private boolean validateOTP(String storedOTP, Instant expiryTime, String providedOTP) {
		if (storedOTP == null || expiryTime == null) {
			return false;
		}

		if (Instant.now().isAfter(expiryTime)) {
			return false;
		}

		return storedOTP.equals(providedOTP);
	}

	@Override
	public ResponseEntityDto validateCaptcha(EpCaptchaVerificationDto epCaptchaVerificationDto) {
		log.info("validateCaptcha: execution started");

		if (epCaptchaVerificationDto == null || epCaptchaVerificationDto.getRecaptchaToken() == null) {
			log.warn("validateCaptcha: recaptchaToken is null or missing");
			return new ResponseEntityDto(true,
					messageUtil.getMessage(EPCommonMessageConstant.EP_COMMON_ERROR_RECAPTCHA_INVALID));
		}

		try {
			String url = UriComponentsBuilder.fromUriString(recaptchaConfig.getVerifyUrl())
				.queryParam("secret", recaptchaConfig.getSecret())
				.queryParam("response", epCaptchaVerificationDto.getRecaptchaToken())
				.toUriString();

			HttpHeaders headers = new HttpHeaders();
			HttpEntity<?> requestEntity = new HttpEntity<>(headers);

			ResponseEntity<Map<String, Object>> response = restTemplate.exchange(url, HttpMethod.GET, requestEntity,
					new ParameterizedTypeReference<>() {
					});

			Map<String, Object> responseBody = response.getBody();

			if (responseBody != null && Boolean.TRUE.equals(responseBody.get("success"))) {
				log.info("validateCaptcha: reCAPTCHA validation succeeded");
				return new ResponseEntityDto(false,
						messageUtil.getMessage(EPCommonMessageConstant.EP_COMMON_SUCCESS_RECAPTCHA_VALID));
			}
			else {
				log.warn("validateCaptcha: reCAPTCHA validation failed - {}", responseBody);
				return new ResponseEntityDto(true,
						messageUtil.getMessage(EPCommonMessageConstant.EP_COMMON_ERROR_RECAPTCHA_INVALID));
			}
		}
		catch (RestClientException e) {
			log.error("validateCaptcha: Error during reCAPTCHA validation", e);
			return new ResponseEntityDto(true,
					messageUtil.getMessage(EPCommonMessageConstant.EP_COMMON_ERROR_VALIDATION_RECAPTCHA_INVALID));
		}
	}

	private User validateDomainAndEmail(String companyDomain, String email) {
		if (!validateTenantExist(companyDomain)) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_COMPANY_DOMAIN_NOT_AVAILABLE);
		}

		tenantContext.setTenantAndSwitchSchema(companyDomain);

		Optional<User> userOptional = userDao.findByEmail(email);

		if (userOptional.isPresent()) {
			return userOptional.get();
		}
		else {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_USER_NOT_FOUND);
		}
	}

	public boolean validateTenantExist(String tenantId) {
		tenantContext.setTenantAndSwitchSchema(EpCommonConstants.MASTER_DATABASE);
		Tenant tenant = tenantDao.findById(tenantId).orElse(null);
		tenantContext.setTenantAndSwitchSchema(tenantId);
		return tenant != null;
	}

}
