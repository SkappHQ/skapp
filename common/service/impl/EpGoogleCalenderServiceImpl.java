package com.skapp.enterprise.common.service.impl;

import com.google.api.client.auth.oauth2.BearerToken;
import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.auth.oauth2.TokenResponse;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeRequestUrl;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeTokenRequest;
import com.google.api.client.googleapis.auth.oauth2.GoogleRefreshTokenRequest;
import com.google.api.client.googleapis.auth.oauth2.GoogleTokenResponse;
import com.google.api.client.http.HttpRequestInitializer;
import com.google.api.client.http.HttpTransport;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.client.util.DateTime;
import com.google.api.services.calendar.Calendar;
import com.google.api.services.calendar.model.Event;
import com.google.api.services.calendar.model.EventDateTime;
import com.google.api.services.calendar.model.EventOutOfOfficeProperties;
import com.google.api.services.people.v1.PeopleService;
import com.google.api.services.people.v1.model.Person;
import com.google.auth.http.HttpCredentialsAdapter;
import com.google.auth.oauth2.AccessToken;
import com.google.auth.oauth2.GoogleCredentials;
import com.skapp.community.common.constant.CommonMessageConstant;
import com.skapp.community.common.exception.EntityNotFoundException;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.repository.UserDao;
import com.skapp.community.common.service.EncryptionDecryptionService;
import com.skapp.community.common.service.UserService;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.repository.EmployeeDao;
import com.skapp.enterprise.common.config.TenantContext;
import com.skapp.enterprise.common.constant.EPCommonMessageConstant;
import com.skapp.enterprise.common.constant.EpCommonConstants;
import com.skapp.enterprise.common.model.EmployeeCalendar;
import com.skapp.enterprise.common.model.OrganizationCalendar;
import com.skapp.enterprise.common.payload.request.EpGoogleCalendarAuthRedirectDto;
import com.skapp.enterprise.common.payload.request.EpGoogleCalendarConsentUrlDto;
import com.skapp.enterprise.common.payload.response.EpCalendarGetAuthResponseDto;
import com.skapp.enterprise.common.repository.EmployeeCalendarDao;
import com.skapp.enterprise.common.repository.EpOrganizationCalenderDao;
import com.skapp.enterprise.common.service.EpGoogleCalenderService;
import com.skapp.enterprise.common.type.EpCalendarType;
import com.skapp.enterprise.leaveplanner.constant.EpLeaveConstant;
import com.skapp.enterprise.leaveplanner.repository.CalendarEventDao;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.http.HttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.net.URI;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class EpGoogleCalenderServiceImpl implements EpGoogleCalenderService {

	private final EncryptionDecryptionService encryptionDecryptionService;

	private final TenantContext tenantContext;

	private final EmployeeCalendarDao employeeCalendarDao;

	private final EmployeeDao employeeDao;

	private final UserService userService;

	private final EpOrganizationCalenderDao epOrganizationCalenderDao;

	private final UserDao userDao;

	private final CalendarEventDao calendarEventDao;

	private static final HttpTransport HTTP_TRANSPORT = new NetHttpTransport();

	private static final JsonFactory JSON_FACTORY = new GsonFactory();

	@Value("${encryptDecryptAlgorithm.secret}")
	private String encryptSecret;

	@Value("${calendar.google.client.id}")
	private String clientId;

	@Value("${calendar.google.client.secret}")
	private String clientSecret;

	@Value("${calendar.google.backend-redirect-uri}")
	private String backendRedirectURI;

	@Override
	@Transactional(propagation = Propagation.REQUIRED)
	public String connectGoogleCalendar(EpGoogleCalendarAuthRedirectDto epGoogleCalendarAuthRedirectDto) {
		log.info("connectGoogleCalendar: execution started");

		String encodedState = epGoogleCalendarAuthRedirectDto.getState();
		String authorizationCode = epGoogleCalendarAuthRedirectDto.getCode();

		if (encodedState.isEmpty()) {
			log.error("connectGoogleCalendar: State is empty");
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_GOOGLE_CALENDAR_STATE_MISMATCH);
		}

		String decodedState = URLDecoder.decode(encodedState, StandardCharsets.UTF_8);
		String decryptedState = encryptionDecryptionService.decrypt(decodedState, encryptSecret);
		String[] state = decryptedState.split(EpCommonConstants.ENTERPRISE_CALENDER_CONCAT_PATTERN_FOR_STATE);

		if (state.length != 3) {
			log.error("connectGoogleCalendar: State is invalid");
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_GOOGLE_CALENDAR_STATE_MISMATCH);
		}

		Long userId = Long.parseLong(state[0]);
		String frontendRedirectUri = state[1];
		String currentTenant = state[2];
		tenantContext.setTenantAndSwitchSchema(currentTenant);

		log.info("connectGoogleCalendar: User: {}, currentTenant: {}", userId, currentTenant);
		validateFrontendUrl(frontendRedirectUri);

		User currentUser = getUser(userId);

		EmployeeCalendar employeeCalendar = employeeCalendarDao.findByUserAndCalendarType(currentUser,
				EpCalendarType.GOOGLE);

		if (employeeCalendar == null) {
			employeeCalendar = new EmployeeCalendar();
			employeeCalendar.setUser(currentUser);
			employeeCalendar.setCalendarType(EpCalendarType.GOOGLE);
			employeeCalendar = employeeCalendarDao.save(employeeCalendar);
		}

		String tokenGenerated = "";
		JsonFactory jsonFactory = GsonFactory.getDefaultInstance();

		try {
			validateGoogleCalendarAuthRedirectDto(epGoogleCalendarAuthRedirectDto);
			GoogleTokenResponse response = new GoogleAuthorizationCodeTokenRequest(new NetHttpTransport(), jsonFactory,
					clientId, clientSecret, authorizationCode, backendRedirectURI)
				.execute();
			String accessToken = response.getAccessToken();
			if (accessToken != null) {
				verifyConnectedEmailWithUserEmail(accessToken, currentUser);
			}
			if (response.getRefreshToken() != null) {
				tokenGenerated = response.getRefreshToken();
				String encryptedToken = encryptionDecryptionService.encrypt(tokenGenerated, encryptSecret);
				if (encryptedToken == null) {
					throw new ModuleException(CommonMessageConstant.COMMON_ERROR_ENCRYPTION_FAILED);
				}
				employeeCalendar.setCalendarToken(encryptedToken);
			}
			else {
				if (employeeCalendar.getCalendarToken() == null) {
					throw new EntityNotFoundException(
							EPCommonMessageConstant.EP_COMMON_UNABLE_TO_CONNECT_GOOGLE_CALENDAR);
				}
				tokenGenerated = employeeCalendar.getCalendarToken();
			}
			employeeCalendar.setIsEnabled(true);
			employeeCalendarDao.save(employeeCalendar);
		}
		catch (Exception exception) {
			log.error("connectGoogleCalendar: {}", exception.getMessage(), exception);
			rollbackCalendarConnect(currentUser, tokenGenerated);

			String errorMessage = exception.getMessage() != null ? exception.getMessage() : "Unknown error";
			String encodedErrorMessage = URLEncoder.encode(errorMessage, StandardCharsets.UTF_8);

			return UriComponentsBuilder.fromUriString(frontendRedirectUri)
				.queryParam("error", encodedErrorMessage)
				.toUriString();
		}

		log.info("connectGoogleCalendar: execution ended");
		return frontendRedirectUri;
	}

	private void verifyConnectedEmailWithUserEmail(String accessToken, User currentUser) throws IOException {
		GoogleCredentials credentials = GoogleCredentials.create(new AccessToken(accessToken, null));

		HttpRequestInitializer httpRequestInitializer = new HttpCredentialsAdapter(credentials);

		PeopleService peopleService = new PeopleService.Builder(HTTP_TRANSPORT, JSON_FACTORY,
				httpRequestInitializer)
				.setApplicationName("Your App Name")
				.build();

		Person profile = peopleService.people().get("people/me").setPersonFields("emailAddresses").execute();

		if (profile.getEmailAddresses() != null && !profile.getEmailAddresses().isEmpty()) {
			String userEmail = profile.getEmailAddresses().getFirst().getValue();
			if(!currentUser.getEmail().equals(userEmail)) {
				throw new ModuleException(
						EPCommonMessageConstant.EP_COMMON_ERROR_USER_EMAIL_MISMATCH_WITH_CURRENT_USER);
			}
		}
		else {
			throw new ModuleException(
					EPCommonMessageConstant.EP_COMMON_UNABLE_TO_CONNECT_GOOGLE_CALENDAR);
		}
	}

	@Override
	public ResponseEntityDto isGoogleCalendarConnected() {
		log.info("isGoogleCalendarConnected: execution started");
		User currentUser = userService.getCurrentUser();
		boolean isConnected = false;

		EmployeeCalendar employeeCalendar = employeeCalendarDao.findByUserAndCalendarType(currentUser,
				EpCalendarType.GOOGLE);

		if (employeeCalendar != null && employeeCalendar.getCalendarType() == EpCalendarType.GOOGLE
				&& employeeCalendar.getCalendarToken() != null && !employeeCalendar.getCalendarToken().isEmpty()
				&& Boolean.TRUE.equals(employeeCalendar.getIsEnabled())) {
			isConnected = true;
		}

		log.info("isGoogleCalendarConnected: execution ended");

		return new ResponseEntityDto(false, isConnected);
	}

	@Override
	public ResponseEntityDto getGoogleAuthUrl(EpGoogleCalendarConsentUrlDto epGoogleCalendarConsentUrlDto) {

		List<OrganizationCalendar> organizationCalendars = epOrganizationCalenderDao.findAll();

		if (organizationCalendars.isEmpty() || organizationCalendars.getFirst().getIsGoogleCalendarEnabled() == null
				|| Boolean.TRUE.equals(!organizationCalendars.getFirst().getIsGoogleCalendarEnabled())) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_CALENDAR_CONFIG_NOT_FOUND);
		}

		User currentUser = userService.getCurrentUser();
		log.info("getAuthUrlGoogleCalendar: execution started by user: {}", currentUser.getUserId());

		EpCalendarGetAuthResponseDto responseDto = new EpCalendarGetAuthResponseDto();

		String frontendRedirectUri = epGoogleCalendarConsentUrlDto.getFrontendRedirectUrl();

		if (frontendRedirectUri == null || frontendRedirectUri.isEmpty()) {
			log.error("getAuthUrlGoogleCalendar: unable to the organizational url");
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_UNABLE_TO_FETCH_ORGANIZATION_URL);
		}

		validateFrontendUrl(frontendRedirectUri);

		String state = currentUser.getUserId() + EpCommonConstants.ENTERPRISE_CALENDER_CONCAT_PATTERN_FOR_STATE
				+ frontendRedirectUri + EpCommonConstants.ENTERPRISE_CALENDER_CONCAT_PATTERN_FOR_STATE
				+ TenantContext.getCurrentTenant();

		String encryptedState = encryptionDecryptionService.encrypt(state, encryptSecret);
		String encodedState = URLEncoder.encode(encryptedState, StandardCharsets.UTF_8);

		try {
			GoogleAuthorizationCodeRequestUrl authorizationUrl = new GoogleAuthorizationCodeRequestUrl(clientId,
					backendRedirectURI, EpCommonConstants.ENTERPRISE_GOOGLE_SCOPES)
				.setAccessType(EpCommonConstants.ENTERPRISE_GOOGLE_ACCESS_TYPE)
				.setState(encodedState);
			String authUrl = authorizationUrl.build();
			responseDto.setAuthUrl(authUrl);
		}
		catch (Exception exception) {
			log.error("getAuthUrlGoogleCalendar: {}", exception.getMessage(), exception);
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_UNABLE_TO_GET_AUTH_URL_CALENDAR);
		}
		log.info("getAuthUrlGoogleCalendar: execution ended");
		return new ResponseEntityDto(false, responseDto);
	}

	@Override
	@Transactional
	public ResponseEntityDto disconnectGoogleCalendar() {
		User currentUser = userService.getCurrentUser();

		log.info("disconnectGoogleCalendar: execution started by user: {}", currentUser.getUserId());
		EmployeeCalendar employeeCalendar = employeeCalendarDao.findByUserAndCalendarType(currentUser,
				EpCalendarType.GOOGLE);

		if (!employeeCalendar.getCalendarType().equals(EpCalendarType.GOOGLE)
				|| employeeCalendar.getCalendarToken() == null) {
			log.error("disconnectGoogleCalendar: user {} is not connected to Google Calendar", currentUser.getUserId());
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_UNABLE_TO_DISCONNECT_FROM_GOOGLE_CALENDAR);
		}

		try {
			String accessToken = generateAccessToken(currentUser);
			HttpResponse response = revokeToken(accessToken);
			if (response.getStatusLine().getStatusCode() == 200) {
				disconnectCalendarFromDatabase(currentUser);
			}
			else {
				log.error("disconnectGoogleCalendar: unable to disconnect for user {}", currentUser.getUserId());
				throw new ModuleException(EPCommonMessageConstant.EP_COMMON_UNABLE_TO_REVOKE_PERMISSION_FROM_CALENDAR);
			}
		}
		catch (Exception exception) {
			log.error("disconnectGoogleCalendar: {}", exception.getMessage(), exception);
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_UNABLE_TO_REVOKE_PERMISSION_FROM_CALENDAR);
		}

		return new ResponseEntityDto("Successfully disconnected from Google Calendar", false);
	}

	@Override
	public String generateAccessToken(@NonNull User user) {
		log.info("GoogleCalendar: generateAccessToken: execution started for {}", user.getUserId());
		Employee employee = user.getEmployee();
		EmployeeCalendar employeeCalendar = employeeCalendarDao.findByUserAndCalendarType(user, EpCalendarType.GOOGLE);
		String refreshToken = employeeCalendar.getCalendarToken();
		JsonFactory jsonFactory = GsonFactory.getDefaultInstance();

		try {
			String decryptedAccessToken = encryptionDecryptionService.decrypt(refreshToken, encryptSecret);
			TokenResponse response = new GoogleRefreshTokenRequest(new NetHttpTransport(), jsonFactory,
					decryptedAccessToken, clientId, clientSecret)
				.execute();
			return response.getAccessToken();
		}
		catch (Exception exception) {
			log.error("GoogleCalendar: generateAccessToken: {}", exception.getMessage(), exception);
			employeeCalendar.setCalendarType(EpCalendarType.NONE);
			employeeDao.save(employee);
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_UNABLE_TO_GENERATE_ACCESS_TOKEN_TO_CALENDAR);
		}
	}

	@Override
	public String createOutOfOfficeEvent(LocalDateTime startDateTime, LocalDateTime endDateTime, String accessToken,
			String autoDeclineMode, String declineMessage) {
		DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");

		ZonedDateTime startUtc = startDateTime.atZone(ZoneId.systemDefault()).withZoneSameInstant(ZoneId.of("UTC"));
		ZonedDateTime endUtc = endDateTime.atZone(ZoneId.systemDefault()).withZoneSameInstant(ZoneId.of("UTC"));

		String startFormatted = startUtc.format(formatter);
		String endFormatted = endUtc.format(formatter);

		log.info("startDateTime: {}, endDateTime: {}", startFormatted, endFormatted);

		Event event = new Event().setSummary("Out of Office")
			.setStart(new EventDateTime().setDateTime(new DateTime(startFormatted)))
			.setEnd(new EventDateTime().setDateTime(new DateTime(endFormatted)))
			.setTransparency("opaque")
			.setVisibility("default")
			.setEventType("outOfOffice");

		EventOutOfOfficeProperties outOfOfficeProperties = new EventOutOfOfficeProperties()
			.setAutoDeclineMode(autoDeclineMode)
			.setDeclineMessage(declineMessage);

		event.setOutOfOfficeProperties(outOfOfficeProperties);
		Calendar service = createCalendarInstance(accessToken);

		try {
			event = service.events().insert(EpLeaveConstant.CALENDAR_ID, event).execute();
			log.info("GoogleCalendar: create Event: {}", event.getId());
			return event.getId();
		}
		catch (Exception exception) {
			log.error("GoogleCalendar: create Event: {}", exception.getMessage(), exception);
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_UNABLE_TO_CONNECT_GOOGLE_CALENDAR);
		}
	}

	@Override
	public void deleteOutOfOfficeEvent(String eventId, String accessToken) {
		Calendar service = createCalendarInstance(accessToken);
		try {
			service.events().delete(EpLeaveConstant.CALENDAR_ID, eventId).execute();
			log.info("GoogleCalendar: delete Event: {}", eventId);

			calendarEventDao.deleteByEventId(eventId);
		}
		catch (Exception exception) {
			log.error("GoogleCalendar: delete Event: {}", exception.getMessage(), exception);
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_UNABLE_TO_DELETE_GOOGLE_CALENDAR);
		}
	}

	public Calendar createCalendarInstance(String accessToken) {
		JsonFactory jsonFactory = GsonFactory.getDefaultInstance();
		Credential credential = new Credential(BearerToken.authorizationHeaderAccessMethod())
			.setAccessToken(accessToken);
		return new Calendar.Builder(new NetHttpTransport(), jsonFactory, credential)
			.setApplicationName(EpLeaveConstant.APPLICATION_NAME)
			.build();
	}

	private User getUser(Long userId) {
		Optional<User> currentUser = userDao.findById(userId);
		if (currentUser.isEmpty()) {
			log.error("connectGoogleCalendar: User not found");
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_GOOGLE_CALENDAR_STATE_MISMATCH);
		}
		return currentUser.get();
	}

	private void rollbackCalendarConnect(@NonNull User currentUser, @NonNull String generatedToken) {
		EmployeeCalendar employeeCalendar = employeeCalendarDao.findByUserAndCalendarType(currentUser,
				EpCalendarType.GOOGLE);
		if (!generatedToken.isEmpty()) {
			try {
				revokeToken(generatedToken);
			}
			catch (Exception e) {
				log.warn("connectGoogleCalendar: revokeToken: {}", e.getMessage(), e);
			}
		}
		if (employeeCalendar.getCalendarType() != EpCalendarType.NONE || employeeCalendar.getCalendarToken() != null) {
			disconnectCalendarFromDatabase(currentUser);
		}
	}

	private HttpResponse revokeToken(@NonNull String accessToken) {
		try (CloseableHttpClient httpClient = HttpClients.createDefault()) {

			HttpPost httpPost = new HttpPost(EpCommonConstants.ENTERPRISE_GOOGLE_TOKEN_REVOKE_URL);
			httpPost.setHeader("Content-Type", "application/x-www-form-urlencoded");
			StringEntity entity = new StringEntity("token=" + accessToken);
			httpPost.setEntity(entity);
			return httpClient.execute(httpPost);
		}
		catch (Exception exception) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_UNABLE_TO_REVOKE_PERMISSION_FROM_CALENDAR);
		}
	}

	private void validateFrontendUrl(@NonNull String url) throws ModuleException {
		try {
			new URI(url);
		}
		catch (Exception e) {
			log.error("validateUrl: url is invalid");
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_INVALID_ORGANIZATION_URL);
		}
	}

	private void disconnectCalendarFromDatabase(@NonNull User user) {
		EmployeeCalendar employeeCalendar = employeeCalendarDao.findByUserAndCalendarType(user, EpCalendarType.GOOGLE);
		employeeCalendar.setCalendarToken(null);
		employeeCalendar.setIsEnabled(false);
		employeeCalendarDao.save(employeeCalendar);
	}

	private void validateGoogleCalendarAuthRedirectDto(
			EpGoogleCalendarAuthRedirectDto epGoogleCalendarAuthRedirectDto) {
		if (epGoogleCalendarAuthRedirectDto.getError() != null && !epGoogleCalendarAuthRedirectDto.getError().isEmpty()
				|| epGoogleCalendarAuthRedirectDto.getCode().isEmpty()) {
			log.error("connectGoogleCalendar: Error: {}", epGoogleCalendarAuthRedirectDto.getError());
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_UNABLE_TO_CONNECT_GOOGLE_CALENDAR);
		}
	}

}
