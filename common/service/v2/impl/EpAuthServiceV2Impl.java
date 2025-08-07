package com.skapp.enterprise.common.service.v2.impl;

import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeRequestUrl;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeTokenRequest;
import com.google.api.client.googleapis.auth.oauth2.GoogleTokenResponse;
import com.google.api.client.http.HttpRequestInitializer;
import com.google.api.client.http.HttpTransport;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.people.v1.model.Person;
import com.google.auth.http.HttpCredentialsAdapter;
import com.google.auth.oauth2.AccessToken;
import com.google.auth.oauth2.GoogleCredentials;
import com.skapp.community.common.constant.AuthConstants;
import com.skapp.community.common.constant.CommonMessageConstant;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.response.EmployeeSignInResponseDto;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.payload.response.SignInResponseDto;
import com.skapp.community.common.repository.UserDao;
import com.skapp.community.common.service.EncryptionDecryptionService;
import com.skapp.community.common.service.JwtService;
import com.skapp.community.common.type.LoginMethod;
import com.skapp.community.common.type.Role;
import com.skapp.community.common.type.TokenType;
import com.skapp.community.peopleplanner.mapper.PeopleMapper;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.repository.EmployeeDao;
import com.skapp.community.peopleplanner.type.AccountStatus;
import com.skapp.enterprise.common.config.TenantContext;
import com.skapp.enterprise.common.constant.EPCommonMessageConstant;
import com.skapp.enterprise.common.constant.EpAuthConstants;
import com.skapp.enterprise.common.constant.EpCommonConstants;
import com.skapp.enterprise.common.masterrepository.SuperAdminDao;
import com.skapp.enterprise.common.model.master.SuperAdmin;
import com.skapp.enterprise.common.payload.request.EpGoogleAuthRedirectDto;
import com.skapp.enterprise.common.payload.request.EpGoogleConsentUrlDto;
import com.skapp.enterprise.common.payload.response.EpGoogleAuthResponseDto;
import com.skapp.enterprise.common.payload.v2.GoogleUserDetailsDto;
import com.skapp.enterprise.common.payload.v2.request.EpSignInGoogleDataDto;
import com.skapp.enterprise.common.payload.v2.request.EpSignUpGoogleDataDto;
import com.skapp.enterprise.common.service.ValidationService;
import com.skapp.enterprise.common.service.v2.EpAuthServiceV2;
import com.skapp.enterprise.common.util.Validation;
import io.jsonwebtoken.Jwts;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class EpAuthServiceV2Impl implements EpAuthServiceV2 {

	private static final HttpTransport HTTP_TRANSPORT = new NetHttpTransport();

	private static final JsonFactory JSON_FACTORY = new GsonFactory();

	private final SuperAdminDao superAdminDao;

	private final UserDetailsService userDetailsService;

	private final JwtService jwtService;

	private final EmployeeDao employeeDao;

	private final PeopleMapper peopleMapper;

	private final UserDao userDao;

	private final EncryptionDecryptionService encryptionDecryptionService;

	private final ValidationService validationService;

	@Value("${jwt.refresh-token.long-duration.expiration-time}")
	private Long jwtLongDurationRefreshTokenExpirationMs;

	@Value("${jwt.refresh-token.short-duration.expiration-time}")
	private Long jwtShortDurationRefreshTokenExpirationMs;

	@Value("${jwt.access-token.expiration-time}")
	private Long jwtAccessTokenExpirationMs;

	@Value("${encryptDecryptAlgorithm.secret}")
	private String encryptSecret;

	@Value("${google.auth.client.id}")
	private String clientId;

	@Value("${google.auth.client.secret}")
	private String clientSecret;

	@Value("${google.auth.backend-redirect-uri}")
	private String backendRedirectURI;

	private static GoogleUserDetailsDto getGoogleUserDetailsDto(Person profile, String userEmail) {
		String authPicUrl = (profile.getPhotos() != null && !profile.getPhotos().isEmpty())
				? profile.getPhotos().getFirst().getUrl() : null;
		String name = (profile.getNames() != null && !profile.getNames().isEmpty())
				? String.valueOf(profile.getNames().getFirst().getDisplayName()) : null;
		GoogleUserDetailsDto googleUserDetailsDto = new GoogleUserDetailsDto();
		googleUserDetailsDto.setEmail(userEmail);
		googleUserDetailsDto.setAuthPicUrl(authPicUrl);
		googleUserDetailsDto.setName(name);
		return googleUserDetailsDto;
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
		employeeSignInResponseDto.setAuthPic(savedSuperAdmin.getAuthPic());

		signInResponseDto.setEmployee(employeeSignInResponseDto);
		signInResponseDto.setIsPasswordChangedForTheFirstTime(true);
		return signInResponseDto;
	}

	@Override
	public ResponseEntityDto ssoGoogleSignUp(EpSignUpGoogleDataDto epSignUpGoogleDataDto) {
		log.info("ssoGoogleSignUp: SSO Signup flow started for code: {}", epSignUpGoogleDataDto.getCode());
		GoogleTokenResponse googleTokenResponse = validateCodeAndGetRefreshToken(epSignUpGoogleDataDto.getCode());
		log.info("ssoGoogleSignUp: Google token response received");
		GoogleUserDetailsDto googleUserDetailsDto = getUserDetailsByAccessToken(googleTokenResponse.getAccessToken());
		log.info("ssoGoogleSignUp: Google user details fetched for email: {}", googleUserDetailsDto.getEmail());

		if (TenantContext.getCurrentTenant() == null
				|| TenantContext.getCurrentTenant().equals(EpCommonConstants.MASTER_DATABASE)) {
			log.info("ssoGoogleSignUp: Creating SuperAdmin for email: {}", googleUserDetailsDto.getEmail());
			SuperAdmin superAdmin = new SuperAdmin();
			superAdmin.setEmail(googleUserDetailsDto.getEmail());
			superAdmin.setFirstName(googleUserDetailsDto.getFirstName());
			superAdmin.setLastName(googleUserDetailsDto.getLastName());
			superAdmin.setAuthPic(googleUserDetailsDto.getAuthPicUrl());
			superAdmin.setLoginMethod(LoginMethod.GOOGLE);
			superAdmin.setActive(true);
			superAdmin.setVerified(true);

			SuperAdmin savedSuperAdmin = superAdminDao.save(superAdmin);
			log.info("ssoGoogleSignUp: SuperAdmin saved with ID: {}", savedSuperAdmin.getId());

			String accessToken = generateAccessToken(savedSuperAdmin.getId(), savedSuperAdmin);
			String refreshToken = generateRefreshToken(savedSuperAdmin.getId(), savedSuperAdmin);
			log.info("ssoGoogleSignUp: Tokens generated for SuperAdmin ID: {}", savedSuperAdmin.getId());

			SignInResponseDto signInResponseDto = getSignInResponseDto(accessToken, refreshToken, savedSuperAdmin);

			log.info("ssoGoogleSignUp: super admin flow: execution ended");
			return new ResponseEntityDto(false, signInResponseDto);
		}

		log.info("ssoGoogleSignUp: execution ended (not master tenant)");
		return new ResponseEntityDto(false, null);

	}

	@Override
	public ResponseEntityDto ssoGoogleSignIn(EpSignInGoogleDataDto epSignUpGoogleDataDto) {
		log.info("ssoGoogleSignIn: execution started for code: {}", epSignUpGoogleDataDto.getCode());

		GoogleTokenResponse googleTokenResponse = validateCodeAndGetRefreshToken(epSignUpGoogleDataDto.getCode());
		log.info("ssoGoogleSignIn: Google token response received");

		GoogleUserDetailsDto googleUserDetailsDto = getUserDetailsByAccessToken(googleTokenResponse.getAccessToken());
		log.info("ssoGoogleSignIn: Google user details fetched for email: {}", googleUserDetailsDto.getEmail());

		Optional<User> optionalUser = userDao.findByEmail(googleUserDetailsDto.getEmail());
		if (optionalUser.isEmpty()) {
			log.warn("ssoGoogleSignIn: User not found for email: {}", googleUserDetailsDto.getEmail());
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_USER_NOT_FOUND);
		}

		User user = optionalUser.get();
		if (Boolean.FALSE.equals(user.getIsActive())) {
			log.warn("ssoGoogleSignIn: User account deactivated for userId: {}", user.getUserId());
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_USER_ACCOUNT_DEACTIVATED);
		}

		Optional<Employee> employee = employeeDao.findById(user.getUserId());
		if (employee.isEmpty()) {
			log.warn("ssoGoogleSignIn: Employee not found for userId: {}", user.getUserId());
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_USER_NOT_FOUND);
		}

		Employee userEmployee = employee.get();
		boolean isUpdated = false;

		if (userEmployee.getAccountStatus() == AccountStatus.PENDING) {
			log.info("ssoGoogleSignIn: Activating employee account for userId: {}", user.getUserId());
			userEmployee.setAccountStatus(AccountStatus.ACTIVE);
			isUpdated = true;
		}

		String authPic = googleUserDetailsDto.getAuthPicUrl();

		if (authPic != null && !authPic.equals(userEmployee.getAuthPic())) {
			log.info("ssoGoogleSignIn: Updating authPic for userId: {}", user.getUserId());
			userEmployee.setAuthPic(authPic);
			isUpdated = true;
		}

		if (isUpdated) {
			employeeDao.save(userEmployee);
			log.info("ssoGoogleSignIn: Employee record updated for userId: {}", user.getUserId());
		}

		EmployeeSignInResponseDto employeeSignInResponseDto = peopleMapper
				.employeeToEmployeeSignInResponseDto(userEmployee);

		UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
		String accessToken = jwtService.generateAccessToken(userDetails, user.getUserId());
		String refreshToken = jwtService.generateRefreshToken(userDetails);

		log.info("ssoGoogleSignIn: Tokens generated for userId: {}", user.getUserId());

		SignInResponseDto signInResponseDto = new SignInResponseDto();
		signInResponseDto.setAccessToken(accessToken);
		signInResponseDto.setRefreshToken(refreshToken);
		signInResponseDto.setEmployee(employeeSignInResponseDto);
		signInResponseDto.setIsPasswordChangedForTheFirstTime(user.getIsPasswordChangedForTheFirstTime());

		log.info("ssoGoogleSignIn: execution ended for userId: {}", user.getUserId());
		return new ResponseEntityDto(false, signInResponseDto);
	}

	private GoogleUserDetailsDto getUserDetailsByAccessToken(String accessToken) {
		try {
			GoogleCredentials credentials = GoogleCredentials.create(new AccessToken(accessToken, null));

			HttpRequestInitializer httpRequestInitializer = new HttpCredentialsAdapter(credentials);

			com.google.api.services.people.v1.PeopleService peopleService = new com.google.api.services.people.v1.PeopleService.Builder(
					HTTP_TRANSPORT, JSON_FACTORY, httpRequestInitializer)
				.setApplicationName(EpCommonConstants.APPLICATION_NAME)
				.build();

			Person profile = peopleService.people()
				.get("people/me")
				.setPersonFields("names,emailAddresses,photos")
				.execute();

			if (profile.getEmailAddresses() != null && !profile.getEmailAddresses().isEmpty()) {
				String userEmail = profile.getEmailAddresses().getFirst().getValue();

				if (userEmail != null && !userEmail.isEmpty()) {
					validationService.checkBusinessEmailValidity(userEmail);
					return getGoogleUserDetailsDto(profile, userEmail);
				}
				else {
					throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_USER_EMAIL_NOT_FOUND);
				}
			}
			else {
				throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_GOOGLE_CONNECTION);
			}
		}
		catch (IOException ioException) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_GOOGLE_CONNECTION);
		}
	}

	private GoogleTokenResponse validateCodeAndGetRefreshToken(String authorizationCode) {
		try {
			JsonFactory jsonFactory = GsonFactory.getDefaultInstance();
			return new GoogleAuthorizationCodeTokenRequest(new NetHttpTransport(), jsonFactory, clientId, clientSecret,
					authorizationCode, backendRedirectURI)
				.execute();
		}
		catch (Exception exception) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_INVALID_GOOGLE_AUTH_CODE);
		}
	}

	@Override
	public String ssoGoogleSignInRedirect(EpGoogleAuthRedirectDto epGoogleAuthRedirectDto) {
		log.info("getIdTokenAndRedirect: execution started");

		String encodedState = epGoogleAuthRedirectDto.getState();
		String authorizationCode = epGoogleAuthRedirectDto.getCode();

		log.debug("getIdTokenAndRedirect: Received encodedState={}, code={}", encodedState, authorizationCode);

		if (encodedState.isEmpty()) {
			log.error("getIdTokenAndRedirect: State is empty");
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_GOOGLE_STATE_MISMATCH);
		}

		String decodedState = URLDecoder.decode(encodedState, StandardCharsets.UTF_8);
		log.debug("getIdTokenAndRedirect: Decoded state={}", decodedState);

		String frontendUrl = encryptionDecryptionService.decrypt(decodedState, encryptSecret);
		log.debug("getIdTokenAndRedirect: Decrypted frontendUrl={}", frontendUrl);

		if (Objects.equals(frontendUrl, "") || frontendUrl == null) {
			log.error("getIdTokenAndRedirect: State is invalid");
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_GOOGLE_STATE_MISMATCH);
		}

		log.debug("getIdTokenAndRedirect: Validating frontendUrl");
		Validation.validateFrontendUrl(frontendUrl);

		try {
			log.debug("getIdTokenAndRedirect: Validating GoogleAuthRedirectDto");
			Validation.validateGoogleAuthRedirectDto(epGoogleAuthRedirectDto);
		} catch (Exception exception) {
			log.error("getIdTokenAndRedirect: Validation failed - {}", exception.getMessage(), exception);
			String errorMessage = exception.getMessage() != null ? exception.getMessage() : "Unknown error";
			String encodedErrorMessage = URLEncoder.encode(errorMessage, StandardCharsets.UTF_8);

			log.info("getIdTokenAndRedirect: Returning error redirect to frontendUrl={}", frontendUrl);
			return UriComponentsBuilder.fromUriString(frontendUrl)
					.queryParam("error", encodedErrorMessage)
					.toUriString();
		}

		log.info("getIdTokenAndRedirect: execution ended, redirecting to frontendUrl={} with code", frontendUrl);
		return UriComponentsBuilder.fromUriString(frontendUrl).queryParam("code", authorizationCode).toUriString();
	}

	@Override
	public ResponseEntityDto getGoogleAuthUrl(EpGoogleConsentUrlDto epGoogleConsentUrlDto) {
		log.info("getGoogleAuthUrl: execution started");

		EpGoogleAuthResponseDto responseDto = new EpGoogleAuthResponseDto();

		String frontendRedirectUri = epGoogleConsentUrlDto.getFrontendRedirectUrl();
		log.debug("getGoogleAuthUrl: Received frontendRedirectUri={}", frontendRedirectUri);

		if (frontendRedirectUri == null || frontendRedirectUri.isEmpty()) {
			log.error("getAuthUrlGoogleCalendar: unable to fetch the organizational url");
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_UNABLE_TO_FETCH_ORGANIZATION_URL);
		}

		log.debug("getGoogleAuthUrl: Validating frontendRedirectUri");
		com.skapp.enterprise.common.util.Validation.validateFrontendUrl(frontendRedirectUri);

		String encryptedState = encryptionDecryptionService.encrypt(frontendRedirectUri, encryptSecret);
		String encodedState = URLEncoder.encode(encryptedState, StandardCharsets.UTF_8);
		log.debug("getGoogleAuthUrl: Encrypted and encoded state={}", encodedState);

		try {
			log.debug("getGoogleAuthUrl: Building GoogleAuthorizationCodeRequestUrl");
			GoogleAuthorizationCodeRequestUrl authorizationUrl = new GoogleAuthorizationCodeRequestUrl(clientId,
					backendRedirectURI, EpCommonConstants.ENTERPRISE_GOOGLE_AUTH_SCOPES)
					.setAccessType(EpCommonConstants.ENTERPRISE_GOOGLE_ACCESS_TYPE)
					.setState(encodedState);
			String authUrl = authorizationUrl.build();
			responseDto.setAuthUrl(authUrl);
			log.info("getGoogleAuthUrl: Auth URL generated successfully");
		} catch (Exception exception) {
			log.error("getGoogleAuthUrl: Exception occurred - {}", exception.getMessage(), exception);
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_UNABLE_TO_GET_GOOGLE_AUTH_URL);
		}
		log.info("getGoogleAuthUrl: execution ended");
		return new ResponseEntityDto(false, responseDto);
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

		boolean hasShortDurationRole = userDetails.getAuthorities()
			.stream()
			.anyMatch(authority -> shortDurationRoles.contains(authority.getAuthority()));

		long jwtRefreshTokenExpirationMs;

		if (hasShortDurationRole) {
			jwtRefreshTokenExpirationMs = jwtShortDurationRefreshTokenExpirationMs;
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

}
