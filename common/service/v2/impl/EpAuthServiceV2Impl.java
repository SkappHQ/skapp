package com.skapp.enterprise.common.service.v2.impl;

import com.auth0.jwt.JWT;
import com.auth0.jwt.interfaces.DecodedJWT;
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
import com.microsoft.aad.msal4j.AuthorizationCodeParameters;
import com.microsoft.aad.msal4j.ClientCredentialFactory;
import com.microsoft.aad.msal4j.ConfidentialClientApplication;
import com.microsoft.aad.msal4j.IAuthenticationResult;
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
import com.skapp.community.common.util.CookieUtil;
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
import com.skapp.enterprise.common.payload.request.EpMicrosoftAuthRedirectDto;
import com.skapp.enterprise.common.payload.request.EpMicrosoftConsentUrlDto;
import com.skapp.enterprise.common.payload.response.EpAuthUrlResponseDto;
import com.skapp.enterprise.common.payload.v2.AuthUserDetailsDto;
import com.skapp.enterprise.common.payload.v2.request.EpSignInGoogleDataDto;
import com.skapp.enterprise.common.payload.v2.request.EpSignInMicrosoftDataDto;
import com.skapp.enterprise.common.payload.v2.request.EpSignUpGoogleDataDto;
import com.skapp.enterprise.common.payload.v2.request.EpSignUpMicrosoftDataDto;
import com.skapp.enterprise.common.service.ValidationService;
import com.skapp.enterprise.common.service.v2.EpAuthServiceV2;
import com.skapp.enterprise.common.util.Validation;
import io.jsonwebtoken.Jwts;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ExecutionException;

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

	private final CookieUtil cookieUtil;

	@Value("${jwt.refresh-token.long-duration.expiration-time}")
	private Long jwtLongDurationRefreshTokenExpirationMs;

	@Value("${jwt.refresh-token.short-duration.expiration-time}")
	private Long jwtShortDurationRefreshTokenExpirationMs;

	@Value("${jwt.access-token.expiration-time}")
	private Long jwtAccessTokenExpirationMs;

	@Value("${google.auth.client.id}")
	private String googleClientId;

	@Value("${google.auth.client.secret}")
	private String googleClientSecret;

	@Value("${google.auth.backend-redirect-uri}")
	private String googleBackendRedirectURI;

	@Value("${microsoft.auth.client-id}")
	private String microsoftClientId;

	@Value("${microsoft.auth.client-secret}")
	private String microsoftClientSecret;

	@Value("${microsoft.auth.backend-redirect-uri}")
	private String microsoftBackendRedirectURI;

	@Value("${microsoft.auth.tenant-id}")
	private String microsoftTenantId;

	private static AuthUserDetailsDto getGoogleUserDetailsDto(Person profile, String userEmail) {
		String authPicUrl = (profile.getPhotos() != null && !profile.getPhotos().isEmpty())
				? profile.getPhotos().getFirst().getUrl() : null;
		String name = (profile.getNames() != null && !profile.getNames().isEmpty())
				? String.valueOf(profile.getNames().getFirst().getDisplayName()) : null;
		AuthUserDetailsDto authUserDetailsDto = new AuthUserDetailsDto();
		authUserDetailsDto.setEmail(userEmail);
		authUserDetailsDto.setAuthPicUrl(authPicUrl);
		authUserDetailsDto.setName(name);
		return authUserDetailsDto;
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
		log.info("ssoGoogleSignUp: SSO Signup flow started");
		GoogleTokenResponse googleTokenResponse = validateCodeAndGetRefreshToken(epSignUpGoogleDataDto.getCode());
		AuthUserDetailsDto authUserDetailsDto = getUserDetailsByGoogleAccessToken(googleTokenResponse.getAccessToken());
		log.info("ssoGoogleSignUp: Google user details fetched for email: {}", authUserDetailsDto.getEmail());
		if (TenantContext.getCurrentTenant() == null
				|| TenantContext.getCurrentTenant().equals(EpCommonConstants.MASTER_DATABASE)) {
			log.info("ssoGoogleSignUp: Creating SuperAdmin for email: {}", authUserDetailsDto.getEmail());
			SuperAdmin superAdmin = new SuperAdmin();
			superAdmin.setEmail(authUserDetailsDto.getEmail());
			superAdmin.setFirstName(authUserDetailsDto.getFirstName());
			superAdmin.setLastName(authUserDetailsDto.getLastName());
			superAdmin.setAuthPic(authUserDetailsDto.getAuthPicUrl());
			superAdmin.setLoginMethod(LoginMethod.GOOGLE);
			superAdmin.setActive(true);
			superAdmin.setVerified(true);

			SuperAdmin savedSuperAdmin = superAdminDao.save(superAdmin);
			log.info("ssoGoogleSignUp: SuperAdmin saved with ID: {}", savedSuperAdmin.getId());

			log.info("ssoGoogleSignUp: Tokens generated for SuperAdmin ID: {}", savedSuperAdmin.getId());

			SignInResponseDto signInResponseDto = createSuperAdminAndGenerateTokens(authUserDetailsDto,
					LoginMethod.GOOGLE);

			log.info("ssoGoogleSignUp: super admin flow: execution ended");
			return new ResponseEntityDto(false, signInResponseDto);
		}

		log.info("ssoGoogleSignUp: execution ended (not master tenant)");
		return new ResponseEntityDto(false, null);

	}

	@Override
	public ResponseEntityDto ssoGoogleSignIn(EpSignInGoogleDataDto epSignUpGoogleDataDto) {
		log.info("ssoGoogleSignIn: execution started");
		SignInResponseDto signInResponseDto = performGoogleSignIn(epSignUpGoogleDataDto, null);
		log.info("ssoGoogleSignIn: execution ended");
		return new ResponseEntityDto(false, signInResponseDto);
	}

	@Override
	public ResponseEntityDto ssoGoogleSignInWithCookie(EpSignInGoogleDataDto epSignUpGoogleDataDto,
			HttpServletResponse response) {
		log.info("ssoGoogleSignInWithCookie: execution started");
		SignInResponseDto signInResponseDto = performGoogleSignIn(epSignUpGoogleDataDto, response);
		log.info("ssoGoogleSignInWithCookie: execution ended");
		return new ResponseEntityDto(false, signInResponseDto);
	}

	private SignInResponseDto performGoogleSignIn(EpSignInGoogleDataDto epSignUpGoogleDataDto,
			HttpServletResponse response) {
		GoogleTokenResponse googleTokenResponse = validateCodeAndGetRefreshToken(epSignUpGoogleDataDto.getCode());
		log.info("performGoogleSignIn: Google token response received");

		AuthUserDetailsDto authUserDetailsDto = getUserDetailsByGoogleAccessToken(googleTokenResponse.getAccessToken());
		log.info("performGoogleSignIn: Google user details fetched for email: {}", authUserDetailsDto.getEmail());

		Optional<User> optionalUser = userDao.findByEmail(authUserDetailsDto.getEmail());
		if (optionalUser.isEmpty()) {
			log.warn("performGoogleSignIn: User not found for email: {}", authUserDetailsDto.getEmail());
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_USER_NOT_FOUND);
		}

		User user = optionalUser.get();
		if (Boolean.FALSE.equals(user.getIsActive())) {
			log.warn("performGoogleSignIn: User account deactivated for userEmail: {}", user.getEmail());
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_USER_ACCOUNT_DEACTIVATED);
		}

		Optional<Employee> employee = employeeDao.findById(user.getUserId());
		if (employee.isEmpty()) {
			log.warn("performGoogleSignIn: Employee not found for userEmail: {}", user.getEmail());
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_USER_NOT_FOUND);
		}

		Employee userEmployee = employee.get();
		boolean isUpdated = false;

		if (userEmployee.getAccountStatus() == AccountStatus.PENDING) {
			log.info("performGoogleSignIn: Activating employee account for userEmail: {}", user.getEmail());
			userEmployee.setAccountStatus(AccountStatus.ACTIVE);
			isUpdated = true;
		}

		String authPic = authUserDetailsDto.getAuthPicUrl();

		if (authPic != null && !authPic.equals(userEmployee.getAuthPic())) {
			log.info("performGoogleSignIn: Updating authPic for userEmail: {}", user.getEmail());
			userEmployee.setAuthPic(authPic);
			isUpdated = true;
		}

		if (isUpdated) {
			employeeDao.save(userEmployee);
			log.info("performGoogleSignIn: Employee record updated for userEmail: {}", user.getEmail());
		}

		EmployeeSignInResponseDto employeeSignInResponseDto = peopleMapper
			.employeeToEmployeeSignInResponseDto(userEmployee);

		UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
		String accessToken = jwtService.generateAccessToken(userDetails, user.getUserId());
		String refreshToken = jwtService.generateRefreshToken(userDetails);

		log.info("performGoogleSignIn: Tokens generated for userEmail: {}", user.getEmail());

		if (response != null) {
			long cookieMaxAge = jwtService.getRefreshTokenMaxAge(userDetails);
			Cookie refreshCookie = cookieUtil.createRefreshTokenCookie(refreshToken, cookieMaxAge);
			response.addCookie(refreshCookie);
			log.info("performGoogleSignIn: Added refresh token cookie for userEmail: {}", user.getEmail());

			String tenantId = TenantContext.getCurrentTenant();
			if (tenantId != null && !tenantId.isEmpty()) {
				Cookie tenantCookie = cookieUtil.createTenantCookie(tenantId, cookieMaxAge);
				response.addCookie(tenantCookie);
				log.info("performGoogleSignIn: Added tenant cookie with tenantId={} for userEmail={}", tenantId,
						user.getEmail());
			}
		}

		SignInResponseDto signInResponseDto = new SignInResponseDto();
		signInResponseDto.setAccessToken(accessToken);
		signInResponseDto.setEmployee(employeeSignInResponseDto);
		signInResponseDto.setIsPasswordChangedForTheFirstTime(user.getIsPasswordChangedForTheFirstTime());

		if (response == null) {
			signInResponseDto.setRefreshToken(refreshToken);
		}

		return signInResponseDto;
	}

	private AuthUserDetailsDto getUserDetailsByGoogleAccessToken(String accessToken) {
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
			return new GoogleAuthorizationCodeTokenRequest(new NetHttpTransport(), jsonFactory, googleClientId,
					googleClientSecret, authorizationCode, googleBackendRedirectURI)
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

		String frontendUrl = encryptionDecryptionService.decrypt(decodedState);
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
		}
		catch (Exception exception) {
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

		EpAuthUrlResponseDto responseDto = new EpAuthUrlResponseDto();

		String frontendRedirectUri = epGoogleConsentUrlDto.getFrontendRedirectUrl();
		log.debug("getGoogleAuthUrl: Received frontendRedirectUri={}", frontendRedirectUri);

		if (frontendRedirectUri == null || frontendRedirectUri.isEmpty()) {
			log.error("getAuthUrlGoogleCalendar: unable to fetch the organizational url");
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_UNABLE_TO_FETCH_ORGANIZATION_URL);
		}

		log.debug("getGoogleAuthUrl: Validating frontendRedirectUri");
		com.skapp.enterprise.common.util.Validation.validateFrontendUrl(frontendRedirectUri);

		String encryptedState = encryptionDecryptionService.encrypt(frontendRedirectUri);
		String encodedState = URLEncoder.encode(encryptedState, StandardCharsets.UTF_8);
		log.debug("getGoogleAuthUrl: Encrypted and encoded state={}", encodedState);

		try {
			log.debug("getGoogleAuthUrl: Building GoogleAuthorizationCodeRequestUrl");
			GoogleAuthorizationCodeRequestUrl authorizationUrl = new GoogleAuthorizationCodeRequestUrl(googleClientId,
					googleBackendRedirectURI, EpCommonConstants.ENTERPRISE_GOOGLE_AUTH_SCOPES)
				.setAccessType(EpCommonConstants.ENTERPRISE_GOOGLE_ACCESS_TYPE)
				.setState(encodedState);
			String authUrl = authorizationUrl.build();
			responseDto.setAuthUrl(authUrl);
			log.info("getGoogleAuthUrl: Auth URL generated successfully");
		}
		catch (Exception exception) {
			log.error("getGoogleAuthUrl: Exception occurred - {}", exception.getMessage(), exception);
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_UNABLE_TO_GET_GOOGLE_AUTH_URL);
		}
		log.info("getGoogleAuthUrl: execution ended");
		return new ResponseEntityDto(false, responseDto);
	}

	@Override
	public ResponseEntityDto getMicrosoftAuthUrl(@Valid EpMicrosoftConsentUrlDto epMicrosoftConsentUrlDto) {
		log.info("getMicrosoftAuthUrl: execution started");

		EpAuthUrlResponseDto responseDto = new EpAuthUrlResponseDto();

		String frontendRedirectUri = epMicrosoftConsentUrlDto.getFrontendRedirectUrl();
		if (frontendRedirectUri == null || frontendRedirectUri.isEmpty()) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_UNABLE_TO_FETCH_ORGANIZATION_URL);
		}

		String encryptedState = encryptionDecryptionService.encrypt(frontendRedirectUri);
		String encodedState = Base64.getUrlEncoder().encodeToString(encryptedState.getBytes(StandardCharsets.UTF_8));

		String authUrl = EpCommonConstants.ENTERPRISE_MICROSOFT_LOGIN_URL + microsoftTenantId + "/oauth2/v2.0/authorize"
				+ "?client_id=" + microsoftClientId + "&response_type=code" + "&redirect_uri="
				+ microsoftBackendRedirectURI + "&scope=" + EpCommonConstants.ENTERPRISE_MICROSOFT_AUTH_SCOPES
				+ "&response_mode=query" + "&state=" + encodedState;

		responseDto.setAuthUrl(authUrl);
		log.info("getMicrosoftAuthUrl: execution ended");
		return new ResponseEntityDto(false, responseDto);
	}

	@Override
	public String ssoMicrosoftSignInRedirect(@Valid EpMicrosoftAuthRedirectDto epMicrosoftAuthRedirectDto) {
		log.info("ssoMicrosoftSignInRedirect: execution started");
		String encodedState = epMicrosoftAuthRedirectDto.getState();
		String authorizationCode = epMicrosoftAuthRedirectDto.getCode();
		String error = epMicrosoftAuthRedirectDto.getError();

		if (encodedState.isEmpty()) {
			log.error("ssoMicrosoftSignInRedirect: State is empty");
			error = URLEncoder.encode("STATE_EMPTY", StandardCharsets.UTF_8);
		}

		byte[] decodedBytes = Base64.getUrlDecoder().decode(encodedState);
		String frontendUrl = encryptionDecryptionService.decrypt(new String(decodedBytes, StandardCharsets.UTF_8));

		if (Objects.equals(frontendUrl, "") || frontendUrl == null) {
			log.error("ssoMicrosoftSignInRedirect: Frontend url is empty");
			frontendUrl = EpAuthConstants.DEFAULT_FRONTEND_URL;
		}

		if (authorizationCode.isEmpty()) {
			log.error("ssoMicrosoftSignInRedirect: Authorization Code is empty");
			error = URLEncoder.encode("AUTHORIZATION_CODE_EMPTY", StandardCharsets.UTF_8);
		}

		Validation.validateFrontendUrl(frontendUrl);

		if (error != null) {
			log.error("ssoMicrosoftSignInRedirect: Error: {}", error);
			return UriComponentsBuilder.fromUriString(frontendUrl).queryParam("error", error).toUriString();
		}

		log.info("ssoMicrosoftSignInRedirect: Redirecting to frontend with authorization code");
		return UriComponentsBuilder.fromUriString(frontendUrl).queryParam("code", authorizationCode).toUriString();
	}

	@Override
	public ResponseEntityDto ssoMicrosoftSignUp(EpSignUpMicrosoftDataDto epSignUpMicrosoftDataDto) {

		log.info("ssoMicrosoftSignUp: execution started");

		IAuthenticationResult result = getIdTokenFromMicrosoftAuthCode(epSignUpMicrosoftDataDto.getCode());

		AuthUserDetailsDto authUserDetailsDto = getUserDetailsByMicrosoftIdToken(result);
		log.info("ssoMicrosoftSignUp: Microsoft user details fetched for email: {}", authUserDetailsDto.getEmail());

		if (TenantContext.getCurrentTenant() == null
				|| TenantContext.getCurrentTenant().equals(EpCommonConstants.MASTER_DATABASE)) {
			log.info("ssoMicrosoftSignUp: Creating SuperAdmin for email: {}", authUserDetailsDto.getEmail());
			SuperAdmin superAdmin = new SuperAdmin();
			superAdmin.setEmail(authUserDetailsDto.getEmail());
			superAdmin.setFirstName(authUserDetailsDto.getFirstName());
			superAdmin.setLastName(authUserDetailsDto.getLastName());
			superAdmin.setAuthPic(authUserDetailsDto.getAuthPicUrl());
			superAdmin.setLoginMethod(LoginMethod.MICROSOFT);
			superAdmin.setActive(true);
			superAdmin.setVerified(true);

			SuperAdmin savedSuperAdmin = superAdminDao.save(superAdmin);
			log.info("ssoMicrosoftSignUp: SuperAdmin saved with ID: {}", savedSuperAdmin.getId());

			SignInResponseDto signInResponseDto = createSuperAdminAndGenerateTokens(authUserDetailsDto,
					LoginMethod.MICROSOFT);
			log.info("ssoMicrosoftSignUp: Tokens generated for SuperAdmin ID: {}", savedSuperAdmin.getId());
			log.info("ssoMicrosoftSignUp: super admin flow: execution ended");
			return new ResponseEntityDto(false, signInResponseDto);
		}

		log.info("ssoMicrosoftSignUp: execution ended (not master tenant)");
		return new ResponseEntityDto(false, null);

	}

	@Override
	public ResponseEntityDto ssoMicrosoftSignIn(EpSignInMicrosoftDataDto epSignUpMicrosoftDataDto) {
		log.info("ssoMicrosoftSignIn: execution started");
		SignInResponseDto signInResponseDto = performMicrosoftSignIn(epSignUpMicrosoftDataDto, null);
		log.info("ssoMicrosoftSignIn: execution ended");
		return new ResponseEntityDto(false, signInResponseDto);
	}

	@Override
	public ResponseEntityDto ssoMicrosoftSignInWithCookie(EpSignInMicrosoftDataDto epSignUpMicrosoftDataDto,
			HttpServletResponse response) {
		log.info("ssoMicrosoftSignInWithCookie: execution started");
		SignInResponseDto signInResponseDto = performMicrosoftSignIn(epSignUpMicrosoftDataDto, response);
		log.info("ssoMicrosoftSignInWithCookie: execution ended");
		return new ResponseEntityDto(false, signInResponseDto);
	}

	private SignInResponseDto performMicrosoftSignIn(EpSignInMicrosoftDataDto epSignUpMicrosoftDataDto,
			HttpServletResponse response) {
		IAuthenticationResult result = getIdTokenFromMicrosoftAuthCode(epSignUpMicrosoftDataDto.getCode());

		AuthUserDetailsDto authUserDetailsDto = getUserDetailsByMicrosoftIdToken(result);
		log.info("performMicrosoftSignIn: Microsoft user details fetched for email: {}", authUserDetailsDto.getEmail());

		Optional<User> optionalUser = userDao.findByEmail(authUserDetailsDto.getEmail());
		if (optionalUser.isEmpty()) {
			log.warn("performMicrosoftSignIn: User not found for email: {}", authUserDetailsDto.getEmail());
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_USER_NOT_FOUND);
		}

		User user = optionalUser.get();
		if (Boolean.FALSE.equals(user.getIsActive())) {
			log.warn("performMicrosoftSignIn: User account deactivated for userEmail: {}", user.getEmail());
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_USER_ACCOUNT_DEACTIVATED);
		}

		Optional<Employee> employee = employeeDao.findById(user.getUserId());
		if (employee.isEmpty()) {
			log.warn("performMicrosoftSignIn: Employee not found for userEmail: {}", user.getEmail());
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_USER_NOT_FOUND);
		}

		Employee userEmployee = employee.get();
		boolean isUpdated = false;

		if (userEmployee.getAccountStatus() == AccountStatus.PENDING) {
			userEmployee.setAccountStatus(AccountStatus.ACTIVE);
			isUpdated = true;
			log.info("performMicrosoftSignIn: Activating employee account for userEmail: {}", user.getEmail());
		}

		String authPic = authUserDetailsDto.getAuthPicUrl();

		if (authPic != null && !authPic.equals(userEmployee.getAuthPic())) {
			userEmployee.setAuthPic(authPic);
			isUpdated = true;
			log.info("performMicrosoftSignIn: Updating authPic for userEmail: {}", user.getEmail());
		}

		if (isUpdated) {
			employeeDao.save(userEmployee);
			log.info("performMicrosoftSignIn: Employee record updated for userEmail: {}", user.getEmail());
		}

		EmployeeSignInResponseDto employeeSignInResponseDto = peopleMapper
			.employeeToEmployeeSignInResponseDto(userEmployee);

		UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
		String accessToken = jwtService.generateAccessToken(userDetails, user.getUserId());
		String refreshToken = jwtService.generateRefreshToken(userDetails);

		log.info("performMicrosoftSignIn: Tokens generated for userEmail: {}", user.getEmail());

		if (response != null) {
			long cookieMaxAge = jwtService.getRefreshTokenMaxAge(userDetails);
			Cookie refreshCookie = cookieUtil.createRefreshTokenCookie(refreshToken, cookieMaxAge);
			response.addCookie(refreshCookie);
			log.info("performMicrosoftSignIn: Added refresh token cookie for userEmail: {}", user.getEmail());

			String tenantId = TenantContext.getCurrentTenant();
			if (tenantId != null && !tenantId.isEmpty()) {
				Cookie tenantCookie = cookieUtil.createTenantCookie(tenantId, cookieMaxAge);
				response.addCookie(tenantCookie);
				log.info("performMicrosoftSignIn: Added tenant cookie with tenantId={} for userEmail={}", tenantId,
						user.getEmail());
			}
		}

		SignInResponseDto signInResponseDto = new SignInResponseDto();
		signInResponseDto.setAccessToken(accessToken);
		signInResponseDto.setEmployee(employeeSignInResponseDto);
		user.setIsPasswordChangedForTheFirstTime(true);
		signInResponseDto.setIsPasswordChangedForTheFirstTime(user.getIsPasswordChangedForTheFirstTime());

		if (response == null) {
			signInResponseDto.setRefreshToken(refreshToken);
		}

		return signInResponseDto;
	}

	private IAuthenticationResult getIdTokenFromMicrosoftAuthCode(String code) {
		try {
			ConfidentialClientApplication confidentialClientApplication = ConfidentialClientApplication
				.builder(microsoftClientId, ClientCredentialFactory.createFromSecret(microsoftClientSecret))
				.authority(EpCommonConstants.ENTERPRISE_MICROSOFT_LOGIN_URL + microsoftTenantId)
				.build();

			AuthorizationCodeParameters parameters = AuthorizationCodeParameters
				.builder(code, new URI(microsoftBackendRedirectURI))
				.build();

			return confidentialClientApplication.acquireToken(parameters).get();
		}
		catch (MalformedURLException | URISyntaxException | ExecutionException e) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_INVALID_AUTH_CODE);
		}
		catch (InterruptedException e) {
			Thread.currentThread().interrupt();
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_INVALID_AUTH_CODE);
		}
	}

	private AuthUserDetailsDto getUserDetailsByMicrosoftIdToken(IAuthenticationResult result) {
		DecodedJWT decodedJWT = JWT.decode(result.idToken());

		String email = decodedJWT.getClaim(EpCommonConstants.EMAIL).asString();
		if (email == null) {
			email = decodedJWT.getClaim(EpCommonConstants.PREFERRED_USERNAME).asString();
		}
		String name = decodedJWT.getClaim(EpCommonConstants.NAME).asString();

		String authPicUrl = null;
		try {
			String accessToken = result.accessToken();
			String graphApiUrl = EpCommonConstants.ENTERPRISE_MICROSOFT_GRAPH_API;

			HttpRequestInitializer requestInitializer = request -> request.getHeaders()
				.setAuthorization(EpCommonConstants.BEARER + accessToken);

			HttpTransport httpTransport = new NetHttpTransport();
			com.google.api.client.http.HttpRequest request = httpTransport.createRequestFactory(requestInitializer)
				.buildGetRequest(new com.google.api.client.http.GenericUrl(graphApiUrl));

			authPicUrl = request.execute().getHeaders().getLocation();
		}
		catch (IOException e) {
			log.error("Failed to fetch profile picture from Microsoft Graph API", e);
		}

		AuthUserDetailsDto authUserDetailsDto = new AuthUserDetailsDto();
		authUserDetailsDto.setEmail(email);
		authUserDetailsDto.setName(name);
		authUserDetailsDto.setAuthPicUrl(authPicUrl);

		return authUserDetailsDto;
	}

	private SignInResponseDto createSuperAdminAndGenerateTokens(AuthUserDetailsDto authUserDetailsDto,
			LoginMethod loginMethod) {
		SuperAdmin superAdmin = new SuperAdmin();
		superAdmin.setEmail(authUserDetailsDto.getEmail());
		superAdmin.setFirstName(authUserDetailsDto.getFirstName());
		superAdmin.setLastName(authUserDetailsDto.getLastName());
		superAdmin.setAuthPic(authUserDetailsDto.getAuthPicUrl());
		superAdmin.setLoginMethod(loginMethod);
		superAdmin.setActive(true);
		superAdmin.setVerified(true);

		SuperAdmin savedSuperAdmin = superAdminDao.save(superAdmin);

		String accessToken = generateAccessToken(savedSuperAdmin.getId(), savedSuperAdmin);
		String refreshToken = generateRefreshToken(savedSuperAdmin.getId(), savedSuperAdmin);

		return getSignInResponseDto(accessToken, refreshToken, savedSuperAdmin);
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
