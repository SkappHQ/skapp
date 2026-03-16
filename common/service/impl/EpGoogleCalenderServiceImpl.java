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
import com.skapp.community.common.model.Organization;
import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.repository.OrganizationDao;
import com.skapp.community.common.repository.UserDao;
import com.skapp.community.common.service.EncryptionDecryptionService;
import com.skapp.community.common.service.UserService;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.enterprise.common.config.TenantContext;
import com.skapp.enterprise.common.constant.EPCommonMessageConstant;
import com.skapp.enterprise.common.constant.EpCommonConstants;
import com.skapp.enterprise.common.model.EmployeeCalendar;
import com.skapp.enterprise.common.model.OrganizationCalendar;
import com.skapp.enterprise.common.payload.request.EpGoogleAuthRedirectDto;
import com.skapp.enterprise.common.payload.request.EpGoogleConsentUrlDto;
import com.skapp.enterprise.common.payload.response.EpAuthUrlResponseDto;
import com.skapp.enterprise.common.repository.EmployeeCalendarDao;
import com.skapp.enterprise.common.repository.EpOrganizationCalenderDao;
import com.skapp.enterprise.common.service.EpGoogleCalenderService;
import com.skapp.enterprise.common.type.EpCalendarType;
import com.skapp.enterprise.common.util.EpDateTimeUtils;
import com.skapp.enterprise.leaveplanner.repository.CalendarEventDao;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.net.URI;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class EpGoogleCalenderServiceImpl implements EpGoogleCalenderService {

	private static final HttpTransport HTTP_TRANSPORT = new NetHttpTransport();

	private static final JsonFactory JSON_FACTORY = new GsonFactory();

	private final EncryptionDecryptionService encryptionDecryptionService;

	private final TenantContext tenantContext;

	private final EmployeeCalendarDao employeeCalendarDao;

	private final UserService userService;

	private final EpOrganizationCalenderDao epOrganizationCalenderDao;

	private final UserDao userDao;

	private final CalendarEventDao calendarEventDao;

	private final MessageUtil messageUtil;

	private final OrganizationDao organizationDao;

	@Value("${google.calendar.client.id}")
	private String clientId;

	@Value("${google.calendar.client.secret}")
	private String clientSecret;

	@Value("${google.calendar.backend-redirect-uri}")
	private String backendRedirectURI;

	@Override
	public void setupOrganizationCalendar() {
		log.info("setupOrganizationCalendar: execution started");

		OrganizationCalendar organizationCalendar = new OrganizationCalendar();
		organizationCalendar.setIsGoogleCalendarEnabled(false);
		epOrganizationCalenderDao.save(organizationCalendar);

		log.info("setupOrganizationCalendar: execution ended");
	}

	@Override
	public String connectGoogleCalendar(EpGoogleAuthRedirectDto epGoogleAuthRedirectDto) {
		log.info("connectGoogleCalendar: execution started");

		RestTemplate restTemplate = new RestTemplate();
		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.APPLICATION_JSON);
		HttpEntity<EpGoogleAuthRedirectDto> request = new HttpEntity<>(epGoogleAuthRedirectDto, headers);
		ResponseEntity<String> response = restTemplate.postForEntity(backendRedirectURI, request, String.class);

		try {
			ObjectMapper objectMapper = new ObjectMapper();
			JsonNode jsonNode = objectMapper.readTree(response.getBody());

			if (jsonNode.has(EpCommonConstants.RESULTS) && jsonNode.get(EpCommonConstants.RESULTS).isArray()
					&& !jsonNode.get(EpCommonConstants.RESULTS).isEmpty()) {
				String redirectUrl = jsonNode.get(EpCommonConstants.RESULTS).get(0).asString();

				log.info("connectGoogleCalendar: execution end");

				return redirectUrl;
			}
		}
		catch (Exception e) {
			log.error("Error parsing JSON response: ", e);
		}

		log.info("connectGoogleCalendar: execution end");
		return "/error";
	}

	@Override
	@Transactional(propagation = Propagation.REQUIRED)
	public ResponseEntityDto saveGoogleCalendarConfig(EpGoogleAuthRedirectDto epGoogleAuthRedirectDto) {
		log.info("saveGoogleCalendarConfig: execution started");

		String encodedState = epGoogleAuthRedirectDto.getState();
		String authorizationCode = epGoogleAuthRedirectDto.getCode();

		if (encodedState.isEmpty()) {
			log.error("connectGoogleCalendar: State is empty");
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_GOOGLE_STATE_MISMATCH);
		}

		String decodedState = URLDecoder.decode(encodedState, StandardCharsets.UTF_8);
		String decryptedState = encryptionDecryptionService.decrypt(decodedState);
		String[] state = decryptedState.split(EpCommonConstants.ENTERPRISE_CALENDER_CONCAT_PATTERN_FOR_STATE);

		if (state.length != 3) {
			log.error("connectGoogleCalendar: State is invalid");
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_GOOGLE_STATE_MISMATCH);
		}

		Long userId = Long.parseLong(state[0]);
		String frontendRedirectUri = state[1];
		String currentTenant = state[2];
		tenantContext.setTenantAndSwitchSchema(currentTenant);

		log.info("connectGoogleCalendar: User: {}, currentTenant: {}", userId, currentTenant);
		validateFrontendUrl(frontendRedirectUri);

		User currentUser = getUser(userId);

		EmployeeCalendar employeeCalendar = employeeCalendarDao.findByUserAndCalendarTypeIn(currentUser,
				Set.of(EpCalendarType.GOOGLE, EpCalendarType.NONE));

		if (employeeCalendar == null) {
			employeeCalendar = new EmployeeCalendar();
			employeeCalendar.setUser(currentUser);
			employeeCalendar.setCalendarType(EpCalendarType.GOOGLE);
			employeeCalendar = employeeCalendarDao.save(employeeCalendar);
		}

		String tokenGenerated = "";
		JsonFactory jsonFactory = GsonFactory.getDefaultInstance();

		try {
			validateGoogleCalendarAuthRedirectDto(epGoogleAuthRedirectDto);
			GoogleTokenResponse response = new GoogleAuthorizationCodeTokenRequest(new NetHttpTransport(), jsonFactory,
					clientId, clientSecret, authorizationCode, backendRedirectURI)
				.execute();
			String accessToken = response.getAccessToken();
			if (accessToken != null) {
				verifyConnectedEmailWithUserEmail(accessToken, currentUser);
			}
			if (response.getRefreshToken() != null) {
				tokenGenerated = response.getRefreshToken();
				String encryptedToken = encryptionDecryptionService.encrypt(tokenGenerated);
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
			employeeCalendar.setCalendarType(EpCalendarType.GOOGLE);
			employeeCalendarDao.save(employeeCalendar);
		}
		catch (Exception exception) {
			log.error("connectGoogleCalendar: {}", exception.getMessage(), exception);
			rollbackCalendarConnect(currentUser, tokenGenerated);

			String errorMessage = exception.getMessage() != null ? exception.getMessage() : "Unknown error";
			String encodedErrorMessage = URLEncoder.encode(errorMessage, StandardCharsets.UTF_8);

			frontendRedirectUri = frontendRedirectUri.replace("success=true", "success=false");

			return new ResponseEntityDto(false,
					UriComponentsBuilder.fromUriString(frontendRedirectUri)
						.queryParam("error", encodedErrorMessage)
						.toUriString());
		}

		log.info("saveGoogleCalendarConfig: execution ended");
		return new ResponseEntityDto(false, frontendRedirectUri);
	}

	private void verifyConnectedEmailWithUserEmail(String accessToken, User currentUser) throws IOException {
		GoogleCredentials credentials = GoogleCredentials.create(new AccessToken(accessToken, null));

		HttpRequestInitializer httpRequestInitializer = new HttpCredentialsAdapter(credentials);

		PeopleService googlePeopleService = new PeopleService.Builder(HTTP_TRANSPORT, JSON_FACTORY,
				httpRequestInitializer)
			.setApplicationName(EpCommonConstants.APPLICATION_NAME)
			.build();

		Person profile = googlePeopleService.people()
			.get(EpCommonConstants.GOOGLE_PERMISSION_PEOPLE_ME)
			.setPersonFields(EpCommonConstants.GOOGLE_PERMISSION_EMAIL_ADDRESS)
			.execute();

		if (profile.getEmailAddresses() != null && !profile.getEmailAddresses().isEmpty()) {
			String userEmail = profile.getEmailAddresses().getFirst().getValue();
			if (!currentUser.getEmail().equals(userEmail)) {
				throw new ModuleException(
						EPCommonMessageConstant.EP_COMMON_ERROR_USER_EMAIL_MISMATCH_WITH_CURRENT_USER);
			}
		}
		else {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_UNABLE_TO_CONNECT_GOOGLE_CALENDAR);
		}
	}

	@Override
	public ResponseEntityDto isGoogleCalendarConnected() {
		return new ResponseEntityDto(false, getIsGoogleCalenderConnected());
	}

	public Boolean getIsGoogleCalenderConnected() {
		User currentUser = userService.getCurrentUser();
		boolean isConnected = false;

		try {
			EmployeeCalendar employeeCalendar = employeeCalendarDao.findByUserAndCalendarTypeIn(currentUser,
					Set.of(EpCalendarType.GOOGLE));

			if (employeeCalendar != null && employeeCalendar.getCalendarToken() != null
					&& !employeeCalendar.getCalendarToken().isEmpty()
					&& Boolean.TRUE.equals(employeeCalendar.getIsEnabled())) {
				String accessToken = generateGoogleAccessToken(currentUser);
				if (accessToken != null) {
					isConnected = true;
				}
			}

			List<OrganizationCalendar> organizationCalendars = epOrganizationCalenderDao.findAll();

			if (organizationCalendars.isEmpty()
					|| Boolean.FALSE.equals(organizationCalendars.getFirst().getIsGoogleCalendarEnabled())) {
				isConnected = false;
			}
		}
		catch (ModuleException e) {
			log.error("Error checking Google Calendar connection: ", e);
			return false;
		}

		return isConnected;
	}

	@Override
	public ResponseEntityDto getGoogleAuthUrl(EpGoogleConsentUrlDto epGoogleConsentUrlDto) {

		List<OrganizationCalendar> organizationCalendars = epOrganizationCalenderDao.findAll();

		if (organizationCalendars.isEmpty() || organizationCalendars.getFirst().getIsGoogleCalendarEnabled() == null
				|| !organizationCalendars.getFirst().getIsGoogleCalendarEnabled()) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_CALENDAR_CONFIG_NOT_FOUND);
		}

		User currentUser = userService.getCurrentUser();
		log.info("getAuthUrlGoogleCalendar: execution started by user: {}", currentUser.getUserId());

		EpAuthUrlResponseDto responseDto = new EpAuthUrlResponseDto();

		String frontendRedirectUri = epGoogleConsentUrlDto.getFrontendRedirectUrl();

		if (frontendRedirectUri == null || frontendRedirectUri.isEmpty()) {
			log.error("getAuthUrlGoogleCalendar: unable to the organizational url");
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_UNABLE_TO_FETCH_ORGANIZATION_URL);
		}

		validateFrontendUrl(frontendRedirectUri);

		String state = currentUser.getUserId() + EpCommonConstants.ENTERPRISE_CALENDER_CONCAT_PATTERN_FOR_STATE
				+ frontendRedirectUri + EpCommonConstants.ENTERPRISE_CALENDER_CONCAT_PATTERN_FOR_STATE
				+ TenantContext.getCurrentTenant();

		String encryptedState = encryptionDecryptionService.encrypt(state);
		String encodedState = URLEncoder.encode(encryptedState, StandardCharsets.UTF_8);

		try {
			GoogleAuthorizationCodeRequestUrl authorizationUrl = new GoogleAuthorizationCodeRequestUrl(clientId,
					backendRedirectURI, EpCommonConstants.ENTERPRISE_GOOGLE_CALENDAR_SCOPES)
				.setAccessType(EpCommonConstants.ENTERPRISE_GOOGLE_ACCESS_TYPE)
				.setApprovalPrompt(EpCommonConstants.ENTERPRISE_GOOGLE_APPROVAL_PROMPT)
				.setState(encodedState);
			String authUrl = authorizationUrl.build();
			responseDto.setAuthUrl(authUrl);
		}
		catch (Exception exception) {
			log.error("getAuthUrlGoogleCalendar: {}", exception.getMessage(), exception);
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_UNABLE_TO_GET_GOOGLE_AUTH_URL);
		}
		log.info("getAuthUrlGoogleCalendar: execution ended");
		return new ResponseEntityDto(false, responseDto);
	}

	@Override
	@Transactional
	public ResponseEntityDto disconnectGoogleCalendar() {
		User currentUser = userService.getCurrentUser();

		log.info("disconnectGoogleCalendar: execution started by user: {}", currentUser.getUserId());
		EmployeeCalendar employeeCalendar = employeeCalendarDao.findByUserAndCalendarTypeIn(currentUser,
				Set.of(EpCalendarType.GOOGLE));

		if (!employeeCalendar.getCalendarType().equals(EpCalendarType.GOOGLE)
				|| employeeCalendar.getCalendarToken() == null) {
			log.error("disconnectGoogleCalendar: user {} is not connected to Google Calendar", currentUser.getUserId());
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_UNABLE_TO_DISCONNECT_FROM_GOOGLE_CALENDAR);
		}

		disconnectCalendarFromDatabase(currentUser);

		return new ResponseEntityDto(
				messageUtil.getMessage(EPCommonMessageConstant.EP_COMMON_SUCCESS_DISCONNECT_GOOGLE_CALENDAR), false);
	}

	@Override
	public String generateGoogleAccessToken(@NonNull User user) {
		log.info("GoogleCalendar: generateAccessToken: execution started for {}", user.getUserId());
		EmployeeCalendar employeeCalendar = employeeCalendarDao.findByUserAndCalendarTypeIn(user,
				Set.of(EpCalendarType.GOOGLE));

		if (employeeCalendar == null || employeeCalendar.getCalendarToken() == null
				|| employeeCalendar.getCalendarToken().isEmpty()
				|| Boolean.FALSE.equals(employeeCalendar.getIsEnabled())) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_CALENDAR_CONFIG_NOT_FOUND);
		}

		String refreshToken = employeeCalendar.getCalendarToken();
		JsonFactory jsonFactory = GsonFactory.getDefaultInstance();

		try {
			String decryptedAccessToken = encryptionDecryptionService.decrypt(refreshToken);
			TokenResponse response = new GoogleRefreshTokenRequest(new NetHttpTransport(), jsonFactory,
					decryptedAccessToken, clientId, clientSecret)
				.execute();
			return response.getAccessToken();
		}
		catch (IOException exception) {
			log.error("GoogleCalendar: generateAccessToken: {}", exception.getMessage(), exception);
			employeeCalendar.setCalendarToken(null);
			employeeCalendar.setIsEnabled(false);
			employeeCalendar.setCalendarType(EpCalendarType.NONE);
			employeeCalendarDao.save(employeeCalendar);
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_UNABLE_TO_GENERATE_ACCESS_TOKEN_TO_CALENDAR);
		}
	}

	@Override
	public String createOutOfOfficeEvent(LocalDateTime startDateTime, LocalDateTime endDateTime, String accessToken,
			String autoDeclineMode, String declineMessage) {

		String organizationTimeZone = organizationDao.findTopByOrderByOrganizationIdDesc()
			.map(Organization::getOrganizationTimeZone)
			.orElse("UTC");

		ZonedDateTime startInOrgTz = startDateTime.atZone(ZoneId.of(organizationTimeZone));
		ZonedDateTime endInOrgTz = endDateTime.atZone(ZoneId.of(organizationTimeZone));

		ZonedDateTime startUtc = startInOrgTz.withZoneSameInstant(ZoneId.of("UTC"));
		ZonedDateTime endUtc = endInOrgTz.withZoneSameInstant(ZoneId.of("UTC"));

		String startFormatted = EpDateTimeUtils.formatUtcDateTime(startUtc);
		String endFormatted = EpDateTimeUtils.formatUtcDateTime(endUtc);

		log.info("startDateTime: {}, endDateTime: {}", startFormatted, endFormatted);

		Event event = new Event().setSummary(EpCommonConstants.GOOGLE_CALENDAR_EVENT_SUMMARY)
			.setStart(new EventDateTime().setDateTime(new DateTime(startFormatted)))
			.setEnd(new EventDateTime().setDateTime(new DateTime(endFormatted)))
			.setTransparency(EpCommonConstants.GOOGLE_CALENDAR_EVENT_TRANSPARENCY)
			.setVisibility(EpCommonConstants.GOOGLE_CALENDAR_EVENT_VISIBILITY)
			.setEventType(EpCommonConstants.GOOGLE_CALENDAR_EVENT_TYPE);

		EventOutOfOfficeProperties outOfOfficeProperties = new EventOutOfOfficeProperties()
			.setAutoDeclineMode(autoDeclineMode)
			.setDeclineMessage(declineMessage);

		event.setOutOfOfficeProperties(outOfOfficeProperties);
		Calendar service = createCalendarInstance(accessToken);

		try {
			event = service.events().insert(EpCommonConstants.CALENDAR_ID, event).execute();
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
			Event event = service.events().get(EpCommonConstants.CALENDAR_ID, eventId).execute();
			if (!Objects.equals(event.getStatus(), EpCommonConstants.GOOGLE_CALENDAR_EVENT_CANCELLED)) {
				service.events().delete(EpCommonConstants.CALENDAR_ID, eventId).execute();
				log.info("GoogleCalendar: deleted Event: {}", eventId);

				calendarEventDao.deleteByEventId(eventId);
			}
			else {
				log.warn("GoogleCalendar: Event {} not found, nothing to delete", eventId);
			}
		}
		catch (Exception exception) {
			log.error("GoogleCalendar: Error deleting Event {}: {}", eventId, exception.getMessage(), exception);
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_UNABLE_TO_DELETE_GOOGLE_CALENDAR);
		}
	}

	public Calendar createCalendarInstance(String accessToken) {
		JsonFactory jsonFactory = GsonFactory.getDefaultInstance();
		Credential credential = new Credential(BearerToken.authorizationHeaderAccessMethod())
			.setAccessToken(accessToken);
		return new Calendar.Builder(new NetHttpTransport(), jsonFactory, credential)
			.setApplicationName(EpCommonConstants.APPLICATION_NAME)
			.build();
	}

	private User getUser(Long userId) {
		Optional<User> currentUser = userDao.findById(userId);
		if (currentUser.isEmpty()) {
			log.error("connectGoogleCalendar: User not found");
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_GOOGLE_STATE_MISMATCH);
		}
		return currentUser.get();
	}

	private void rollbackCalendarConnect(@NonNull User currentUser, @NonNull String generatedToken) {
		EmployeeCalendar employeeCalendar = employeeCalendarDao.findByUserAndCalendarTypeIn(currentUser,
				Set.of(EpCalendarType.GOOGLE));
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

	private void revokeToken(@NonNull String accessToken) {
		try (CloseableHttpClient httpClient = HttpClients.createDefault()) {

			HttpPost httpPost = new HttpPost(EpCommonConstants.ENTERPRISE_GOOGLE_TOKEN_REVOKE_URL);
			httpPost.setHeader(EpCommonConstants.HTTP_POST_HEADER_CONTENT_TYPE,
					EpCommonConstants.HTTP_POST_HEADER_VALUE);
			StringEntity entity = new StringEntity(EpCommonConstants.TOKEN + accessToken);
			httpPost.setEntity(entity);
			httpClient.execute(httpPost);
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
		EmployeeCalendar employeeCalendar = employeeCalendarDao.findByUserAndCalendarTypeIn(user,
				Set.of(EpCalendarType.GOOGLE));
		employeeCalendar.setCalendarToken(null);
		employeeCalendar.setIsEnabled(false);
		employeeCalendarDao.save(employeeCalendar);
	}

	private void validateGoogleCalendarAuthRedirectDto(EpGoogleAuthRedirectDto epGoogleAuthRedirectDto) {
		if (epGoogleAuthRedirectDto.getError() != null && !epGoogleAuthRedirectDto.getError().isEmpty()
				|| epGoogleAuthRedirectDto.getCode().isEmpty()) {
			log.error("connectGoogleCalendar: Error: {}", epGoogleAuthRedirectDto.getError());
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_UNABLE_TO_CONNECT_GOOGLE_CALENDAR);
		}
	}

}
