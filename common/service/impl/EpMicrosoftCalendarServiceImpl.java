package com.skapp.enterprise.common.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.microsoft.graph.models.*;
import com.microsoft.graph.requests.GraphServiceClient;
import com.microsoft.graph.authentication.IAuthenticationProvider;
import com.microsoft.graph.options.QueryOption;
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
import com.skapp.enterprise.common.payload.request.EpMicrosoftAuthRedirectDto;
import com.skapp.enterprise.common.payload.request.EpMicrosoftConsentUrlDto;
import com.skapp.enterprise.common.payload.response.EpAuthUrlResponseDto;
import com.skapp.enterprise.common.payload.response.MicrosoftTokenResponse;
import com.skapp.enterprise.common.repository.EmployeeCalendarDao;
import com.skapp.enterprise.common.repository.EpOrganizationCalenderDao;
import com.skapp.enterprise.common.service.EpMicrosoftCalendarService;
import com.skapp.enterprise.common.type.EpCalendarType;
import com.skapp.enterprise.leaveplanner.repository.CalendarEventDao;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.Arrays;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
@Slf4j
public class EpMicrosoftCalendarServiceImpl implements EpMicrosoftCalendarService {

	private final EncryptionDecryptionService encryptionDecryptionService;

	private final TenantContext tenantContext;

	private final EmployeeCalendarDao employeeCalendarDao;

	private final UserService userService;

	private final EpOrganizationCalenderDao epOrganizationCalenderDao;

	private final UserDao userDao;

	private final CalendarEventDao calendarEventDao;

	private final MessageUtil messageUtil;

	private final OrganizationDao organizationDao;

	@Value("${encryptDecryptAlgorithm.secret}")
	private String encryptSecret;

	@Value("${microsoft.calendar.client-id}")
	private String clientId;

	@Value("${microsoft.calendar.client-secret}")
	private String clientSecret;

	@Value("${microsoft.calendar.tenant-id}")
	private String tenantId;

	@Value("${microsoft.calendar.backend-redirect-uri}")
	private String backendRedirectURI;

	@Override
	public void setupOrganizationCalendar() {
		log.info("setupOrganizationCalendar: execution started");

		OrganizationCalendar organizationCalendar = new OrganizationCalendar();
		organizationCalendar.setIsMicrosoftCalendarEnabled(false);
		epOrganizationCalenderDao.save(organizationCalendar);

		log.info("setupOrganizationCalendar: execution ended");
	}

	@Override
	public String connectMicrosoftCalendar(EpMicrosoftAuthRedirectDto epMicrosoftAuthRedirectDto) {
		log.info("connectMicrosoftCalendar: execution started");

		RestTemplate restTemplate = new RestTemplate();
		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.APPLICATION_JSON);
		HttpEntity<EpMicrosoftAuthRedirectDto> request = new HttpEntity<>(epMicrosoftAuthRedirectDto, headers);
		ResponseEntity<String> response = restTemplate.postForEntity(backendRedirectURI, request, String.class);

		try {
			ObjectMapper objectMapper = new ObjectMapper();
			JsonNode jsonNode = objectMapper.readTree(response.getBody());

			if (jsonNode.has(EpCommonConstants.RESULTS) && jsonNode.get(EpCommonConstants.RESULTS).isArray()
					&& !jsonNode.get(EpCommonConstants.RESULTS).isEmpty()) {
				String redirectUrl = jsonNode.get(EpCommonConstants.RESULTS).get(0).asText();

				log.info("connectMicrosoftCalendar: execution end");
				return redirectUrl;
			}
		}
		catch (Exception e) {
			log.error("Error parsing JSON response: ", e);
		}

		log.info("connectMicrosoftCalendar: execution end");
		return "/error";
	}

	@Override
	@Transactional(propagation = Propagation.REQUIRED)
	public ResponseEntityDto saveMicrosoftCalendarConfig(EpMicrosoftAuthRedirectDto epMicrosoftAuthRedirectDto) {
		log.info("saveMicrosoftCalendarConfig: execution started");

		String encodedState = epMicrosoftAuthRedirectDto.getState();
		String authorizationCode = epMicrosoftAuthRedirectDto.getCode();

		if (encodedState.isEmpty()) {
			log.error("saveMicrosoftCalendarConfig: State is empty");
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_MICROSOFT_STATE_MISMATCH);
		}

		String decryptedState;
		byte[] decodedBytes = Base64.getUrlDecoder().decode(encodedState);
		String encryptedState = new String(decodedBytes, StandardCharsets.UTF_8);
		decryptedState = encryptionDecryptionService.decrypt(encryptedState, encryptSecret);

		String[] state = decryptedState.split(EpCommonConstants.ENTERPRISE_CALENDER_CONCAT_PATTERN_FOR_STATE);

		if (state.length != 3) {
			log.error("saveMicrosoftCalendarConfig: State is invalid");
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_MICROSOFT_STATE_MISMATCH);
		}

		Long userId = Long.parseLong(state[0]);
		String frontendRedirectUri = state[1];
		String currentTenant = state[2];
		tenantContext.setTenantAndSwitchSchema(currentTenant);

		log.info("saveMicrosoftCalendarConfig: User: {}, currentTenant: {}", userId, currentTenant);
		validateFrontendUrl(frontendRedirectUri);

		Optional<User> currentUserOpt = userDao.findById(userId);
		if (currentUserOpt.isEmpty()) {
			log.error("saveMicrosoftCalendarConfig: User not found");
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_USER_NOT_FOUND);
		}
		User currentUser = currentUserOpt.get();

		EmployeeCalendar employeeCalendar = employeeCalendarDao.findByUserAndCalendarTypeIn(currentUser,
				Set.of(EpCalendarType.OUTLOOK, EpCalendarType.NONE));

		if (employeeCalendar == null) {
			employeeCalendar = new EmployeeCalendar();
			employeeCalendar.setUser(currentUser);
			employeeCalendar.setCalendarType(EpCalendarType.OUTLOOK);
			employeeCalendar = employeeCalendarDao.save(employeeCalendar);
		}

		String tokenGenerated = "";

		try {
			validateMicrosoftCalendarAuthRedirectDto(epMicrosoftAuthRedirectDto);
			MicrosoftTokenResponse result = exchangeCodeForTokens(authorizationCode);

			if (result.getAccessToken() != null) {
				verifyConnectedEmailWithUserEmail(result.getAccessToken(), currentUser);
			}

			if (result.getRefreshToken() != null) {
				String encryptedRefreshToken = encryptionDecryptionService.encrypt(result.getRefreshToken(),
						encryptSecret);
				if (encryptedRefreshToken == null) {
					throw new ModuleException(CommonMessageConstant.COMMON_ERROR_ENCRYPTION_FAILED);
				}
				employeeCalendar.setCalendarToken(encryptedRefreshToken);
				tokenGenerated = encryptedRefreshToken;
				if (employeeCalendar.getCalendarToken() == null) {
					throw new EntityNotFoundException(
							EPCommonMessageConstant.EP_COMMON_UNABLE_TO_CONNECT_MICROSOFT_CALENDAR);
				}
				tokenGenerated = employeeCalendar.getCalendarToken();
			}
			else {
				throw new EntityNotFoundException(
						EPCommonMessageConstant.EP_COMMON_UNABLE_TO_CONNECT_MICROSOFT_CALENDAR);
			}

			employeeCalendar.setIsEnabled(true);
			employeeCalendar.setCalendarType(EpCalendarType.OUTLOOK);
			employeeCalendarDao.save(employeeCalendar);
		}
		catch (Exception exception) {
			log.error("saveMicrosoftCalendarConfig: {}", exception.getMessage(), exception);
			rollbackCalendarConnect(currentUser, tokenGenerated);

			String errorMessage = exception.getMessage() != null ? exception.getMessage() : "Unknown error";
			String encodedErrorMessage = URLEncoder.encode(errorMessage, StandardCharsets.UTF_8);

			frontendRedirectUri = frontendRedirectUri.replace("success=true", "success=false");

			return new ResponseEntityDto(false,
					UriComponentsBuilder.fromUriString(frontendRedirectUri)
						.queryParam("error", encodedErrorMessage)
						.toUriString());
		}

		log.info("saveMicrosoftCalendarConfig: execution ended");
		return new ResponseEntityDto(false, frontendRedirectUri);
	}

	@Override
	public ResponseEntityDto isMicrosoftCalendarConnected() {
		return new ResponseEntityDto(false, getIsMicrosoftCalendarConnected());
	}

	@Override
	public Boolean getIsMicrosoftCalendarConnected() {
		User currentUser = userService.getCurrentUser();
		boolean isConnected = false;

		EmployeeCalendar employeeCalendar = employeeCalendarDao.findByUserAndCalendarTypeIn(currentUser,
				Set.of(EpCalendarType.OUTLOOK));

		if (employeeCalendar != null && employeeCalendar.getCalendarToken() != null
				&& !employeeCalendar.getCalendarToken().isEmpty()
				&& Boolean.TRUE.equals(employeeCalendar.getIsEnabled())) {
			String accessToken = generateMicrosoftAccessToken(currentUser);
			if (accessToken != null) {
				isConnected = true;
			}
		}

		List<OrganizationCalendar> organizationCalendars = epOrganizationCalenderDao.findAll();

		if (organizationCalendars.isEmpty()
				|| Boolean.FALSE.equals(organizationCalendars.getFirst().getIsMicrosoftCalendarEnabled())) {
			isConnected = false;
		}
		return isConnected;
	}

	@Override
	public ResponseEntityDto getMicrosoftAuthUrl(EpMicrosoftConsentUrlDto epMicrosoftConsentUrlDto) {
		List<OrganizationCalendar> organizationCalendars = epOrganizationCalenderDao.findAll();

		if (organizationCalendars.isEmpty() || organizationCalendars.getFirst().getIsMicrosoftCalendarEnabled() == null
				|| !organizationCalendars.getFirst().getIsMicrosoftCalendarEnabled()) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_CALENDAR_CONFIG_NOT_FOUND);
		}

		User currentUser = userService.getCurrentUser();
		log.info("getMicrosoftAuthUrl: execution started by user: {}", currentUser.getUserId());

		EpAuthUrlResponseDto responseDto = new EpAuthUrlResponseDto();

		String frontendRedirectUri = epMicrosoftConsentUrlDto.getFrontendRedirectUrl();

		if (frontendRedirectUri == null || frontendRedirectUri.isEmpty()) {
			log.error("getMicrosoftAuthUrl: unable to get the organizational url");
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_UNABLE_TO_FETCH_ORGANIZATION_URL);
		}

		validateFrontendUrl(frontendRedirectUri);

		String state = currentUser.getUserId() + EpCommonConstants.ENTERPRISE_CALENDER_CONCAT_PATTERN_FOR_STATE
				+ frontendRedirectUri + EpCommonConstants.ENTERPRISE_CALENDER_CONCAT_PATTERN_FOR_STATE
				+ TenantContext.getCurrentTenant();

		String encryptedState = encryptionDecryptionService.encrypt(state, encryptSecret);
		String encodedState = Base64.getUrlEncoder()
			.withoutPadding()
			.encodeToString(encryptedState.getBytes(StandardCharsets.UTF_8));

		String authUrl = EpCommonConstants.ENTERPRISE_MICROSOFT_LOGIN_URL + tenantId + "/oauth2/v2.0/authorize"
				+ "?client_id=" + clientId + "&response_type=code" + "&redirect_uri="
				+ URLEncoder.encode(backendRedirectURI, StandardCharsets.UTF_8) + "&scope="
				+ URLEncoder.encode(EpCommonConstants.ENTERPRISE_MICROSOFT_CALENDAR_SCOPES, StandardCharsets.UTF_8)
				+ "&state=" + encodedState + "&response_mode=query";

		responseDto.setAuthUrl(authUrl);

		log.info("getMicrosoftAuthUrl: execution ended");
		return new ResponseEntityDto(false, responseDto);
	}

	@Override
	@Transactional
	public ResponseEntityDto disconnectMicrosoftCalendar() {
		User currentUser = userService.getCurrentUser();

		log.info("disconnectMicrosoftCalendar: execution started by user: {}", currentUser.getUserId());
		EmployeeCalendar employeeCalendar = employeeCalendarDao.findByUserAndCalendarTypeIn(currentUser,
				Set.of(EpCalendarType.OUTLOOK));

		if (!employeeCalendar.getCalendarType().equals(EpCalendarType.OUTLOOK)
				|| employeeCalendar.getCalendarToken() == null) {
			log.error("disconnectMicrosoftCalendar: user {} is not connected to Microsoft Calendar",
					currentUser.getUserId());
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_UNABLE_TO_DISCONNECT_FROM_MICROSOFT_CALENDAR);
		}

		disconnectCalendarFromDatabase(currentUser);

		return new ResponseEntityDto(
				messageUtil.getMessage(EPCommonMessageConstant.EP_COMMON_SUCCESS_DISCONNECT_MICROSOFT_CALENDAR), false);
	}

	@Override
	public String generateMicrosoftAccessToken(@NonNull User user) {
		log.info("MicrosoftCalendar: generateAccessToken: execution started for {}", user.getUserId());
		EmployeeCalendar employeeCalendar = employeeCalendarDao.findByUserAndCalendarTypeIn(user,
				Set.of(EpCalendarType.OUTLOOK));

		if (employeeCalendar == null || employeeCalendar.getCalendarToken() == null
				|| employeeCalendar.getCalendarToken().isEmpty()
				|| Boolean.FALSE.equals(employeeCalendar.getIsEnabled())) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_CALENDAR_CONFIG_NOT_FOUND);
		}

		String refreshToken = employeeCalendar.getCalendarToken();

		try {
			String decryptedRefreshToken = encryptionDecryptionService.decrypt(refreshToken, encryptSecret);
			return refreshAccessToken(decryptedRefreshToken);
		}
		catch (Exception exception) {
			log.error("MicrosoftCalendar: generateAccessToken: {}", exception.getMessage(), exception);
			employeeCalendar.setCalendarToken(null);
			employeeCalendar.setIsEnabled(false);
			employeeCalendar.setCalendarType(EpCalendarType.NONE);
			employeeCalendarDao.save(employeeCalendar);
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_UNABLE_TO_GENERATE_ACCESS_TOKEN_TO_CALENDAR);
		}
	}

	private GraphServiceClient<?> createClient(String accessToken) {
		IAuthenticationProvider authProvider = requestUrl -> CompletableFuture.completedFuture(accessToken);
		return GraphServiceClient.builder().authenticationProvider(authProvider).buildClient();
	}

	@Override
	public String createOutOfOfficeEvent(LocalDateTime startDateTime, LocalDateTime endDateTime, String accessToken,
			String autoDeclineMode, String declineMessage) {
		log.info("createOutOfOfficeEvent: execution started");

		String organizationTimeZone = organizationDao.findTopByOrderByOrganizationIdDesc()
			.map(Organization::getOrganizationTimeZone)
			.orElse("UTC");
		ZonedDateTime startOrgTz = startDateTime.atZone(ZoneId.of(organizationTimeZone));
		ZonedDateTime endOrgTz = endDateTime.atZone(ZoneId.of(organizationTimeZone));
		ZonedDateTime startUtc = startOrgTz.withZoneSameInstant(ZoneId.of("UTC"));
		ZonedDateTime endUtc = endOrgTz.withZoneSameInstant(ZoneId.of("UTC"));

		GraphServiceClient<?> graphClient = createClient(accessToken);

		Event event = new Event();
		event.subject = "Out of Office";
		event.showAs = FreeBusyStatus.OOF;
		event.sensitivity = Sensitivity.PRIVATE;
		event.isAllDay = false;
		event.responseRequested = false;
		ItemBody body = new ItemBody();
		body.contentType = BodyType.TEXT;
		body.content = declineMessage != null ? declineMessage : "Out of office";
		event.body = body;

		DateTimeTimeZone start = new DateTimeTimeZone();
		start.dateTime = startUtc.format(DateTimeFormatter.ISO_INSTANT);
		start.timeZone = "UTC";
		event.start = start;
		DateTimeTimeZone end = new DateTimeTimeZone();
		end.dateTime = endUtc.format(DateTimeFormatter.ISO_INSTANT);
		end.timeZone = "UTC";
		event.end = end;

		try {
			Event createdEvent = graphClient.me().events().buildRequest().post(event);
			log.info("MicrosoftCalendar: created Event: {} (start={}, end={}, sensitivity={}, showAs={})",
					createdEvent.id, start.dateTime, end.dateTime, event.sensitivity, event.showAs);

			if ("declineAllConflictingInvitations".equals(autoDeclineMode)) {
				declineConflictingEvents(startUtc, endUtc, accessToken, declineMessage, createdEvent.id);
			}
			if ("declineAllConflictingInvitations".equals(autoDeclineMode)
					|| "declineOnlyNewConflictingInvitations".equals(autoDeclineMode)) {
				setAutomaticReplies(startUtc, endUtc, accessToken, declineMessage);
			}
			return createdEvent.id;
		}
		catch (Exception ex) {
			log.error("Error creating out-of-office event: {}", ex.getMessage(), ex);
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_UNABLE_TO_CONNECT_MICROSOFT_CALENDAR);
		}
	}

	private void setAutomaticReplies(ZonedDateTime startUtc, ZonedDateTime endUtc, String accessToken,
			String declineMessage) {
		String reply = (declineMessage != null && !declineMessage.isBlank()) ? declineMessage : "I am out of office.";
		try {
			GraphServiceClient<?> graphClient = createClient(accessToken);

			AutomaticRepliesSetting repliesSetting = new AutomaticRepliesSetting();
			repliesSetting.status = AutomaticRepliesStatus.SCHEDULED;
			repliesSetting.scheduledStartDateTime = new DateTimeTimeZone();
			repliesSetting.scheduledStartDateTime.dateTime = startUtc.toLocalDateTime().toString();
			repliesSetting.scheduledStartDateTime.timeZone = "UTC";
			repliesSetting.scheduledEndDateTime = new DateTimeTimeZone();
			repliesSetting.scheduledEndDateTime.dateTime = endUtc.toLocalDateTime().toString();
			repliesSetting.scheduledEndDateTime.timeZone = "UTC";
			repliesSetting.internalReplyMessage = reply;
			repliesSetting.externalReplyMessage = reply;
			repliesSetting.externalAudience = ExternalAudienceScope.ALL;

			MailboxSettings mailboxSettings = new MailboxSettings();
			mailboxSettings.automaticRepliesSetting = repliesSetting;

			com.microsoft.graph.models.User graphUserPatch = new com.microsoft.graph.models.User();
			graphUserPatch.mailboxSettings = mailboxSettings;
			graphClient.me().buildRequest().patch(graphUserPatch);
			log.info("Automatic replies scheduled via SDK ({} -> {})", startUtc, endUtc);
		}
		catch (Exception sdkEx) {
			log.warn("SDK automatic replies patch failed ({}), attempting REST fallback: {}",
					sdkEx.getClass().getSimpleName(), sdkEx.getMessage());
		}
	}

	private void declineConflictingEvents(ZonedDateTime startUtc, ZonedDateTime endUtc, String accessToken,
			String declineMessage, String newEventId) {
		try {
			GraphServiceClient<?> graphClient = createClient(accessToken);
			String startFormatted = startUtc.format(DateTimeFormatter.ISO_INSTANT);
			String endFormatted = endUtc.format(DateTimeFormatter.ISO_INSTANT);
			List<Event> events = graphClient.me()
				.calendarView()
				.buildRequest(Arrays.asList(new QueryOption("startDateTime", startFormatted),
						new QueryOption("endDateTime", endFormatted)))
				.get()
				.getCurrentPage();
			events.stream()
				.filter(existing -> existing.id != null && !existing.id.equals(newEventId))
				.filter(existing -> existing.responseStatus == null
						|| existing.responseStatus.response != ResponseType.DECLINED)
				.filter(existing -> {
					ZonedDateTime existingStart = parseEventDateTime(existing.start);
					ZonedDateTime existingEnd = parseEventDateTime(existing.end);
					return existingStart != null && existingEnd != null && existingStart.isBefore(endUtc)
							&& existingEnd.isAfter(startUtc);
				})
				.forEach(existing -> {
					EventDeclineParameterSet declineParams = EventDeclineParameterSet.newBuilder()
						.withComment(declineMessage != null ? declineMessage : "Declined due to out-of-office.")
						.withSendResponse(true)
						.build();
					graphClient.me().events(existing.id).decline(declineParams).buildRequest().post();
					log.info("Declined conflicting event {}", existing.id);
				});

		}
		catch (Exception e) {
			log.error("Error declining conflicting events: {}", e.getMessage(), e);
		}
	}

	@Override
	public void deleteOutOfOfficeEvent(String eventId, String accessToken) {
		try {
			if (eventId == null || eventId.isBlank()) {
				log.warn("deleteOutOfOfficeEvent: blank eventId");
				return;
			}
			GraphServiceClient<?> graphClient = createClient(accessToken);
			Event oofEvent = graphClient.me().events(eventId).buildRequest().get();
			if (oofEvent == null || oofEvent.start == null || oofEvent.end == null) {
				log.warn("deleteOutOfOfficeEvent: OOF event not found or missing time info");
				return;
			}
			String startDateTime = oofEvent.start.dateTime;
			String endDateTime = oofEvent.end.dateTime;

			List<Event> events = graphClient.me()
				.calendarView()
				.buildRequest(Arrays.asList(new QueryOption("startDateTime", startDateTime),
						new QueryOption("endDateTime", endDateTime)))
				.get()
				.getCurrentPage();
			events.stream()
				.filter(event -> event.id != null && !event.id.equals(eventId))
				.filter(event -> event.responseStatus != null && event.responseStatus.response == ResponseType.DECLINED)
				.forEach(event -> {
					EventAcceptParameterSet acceptParams = EventAcceptParameterSet.newBuilder()
						.withSendResponse(true)
						.build();
					graphClient.me().events(event.id).accept(acceptParams).buildRequest().post();
					log.info("Restored response for previously declined event {}", event.id);
				});
			graphClient.me().events(eventId).buildRequest().delete();
			log.info("MicrosoftCalendar: deleted Event: {}", eventId);
			String encryptedEventId = encryptionDecryptionService.encrypt(eventId, encryptSecret);
			calendarEventDao.deleteByEventId(encryptedEventId);
		}
		catch (Exception ex) {
			log.error("MicrosoftCalendar: Error deleting Event {}: {}", eventId, ex.getMessage(), ex);
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_UNABLE_TO_DELETE_MICROSOFT_CALENDAR);
		}
	}

	private MicrosoftTokenResponse exchangeCodeForTokens(String authorizationCode) {
		RestTemplate restTemplate = new RestTemplate();
		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

		MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
		body.add("client_id", clientId);
		body.add("client_secret", clientSecret);
		body.add("code", authorizationCode);
		body.add("grant_type", "authorization_code");
		body.add("redirect_uri", backendRedirectURI);
		body.add("scope", EpCommonConstants.ENTERPRISE_MICROSOFT_CALENDAR_SCOPES);

		HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);
		ResponseEntity<Map> response = restTemplate.postForEntity(
				EpCommonConstants.ENTERPRISE_MICROSOFT_LOGIN_URL + tenantId + "/oauth2/v2.0/token", request, Map.class);

		if (response.getBody() != null && response.getBody().containsKey("refresh_token")
				&& response.getBody().containsKey("access_token")) {
			String refreshToken = (String) response.getBody().get("refresh_token");
			String accessToken = (String) response.getBody().get("access_token");
			return new MicrosoftTokenResponse(accessToken, refreshToken);
		}
		throw new ModuleException(EPCommonMessageConstant.EP_COMMON_UNABLE_TO_CONNECT_MICROSOFT_CALENDAR);
	}

	private String refreshAccessToken(String refreshToken) {
		try {
			RestTemplate restTemplate = new RestTemplate();
			HttpHeaders headers = new HttpHeaders();
			headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

			MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
			body.add("client_id", clientId);
			body.add("client_secret", clientSecret);
			body.add("refresh_token", refreshToken);
			body.add("grant_type", "refresh_token");
			body.add("scope", EpCommonConstants.ENTERPRISE_MICROSOFT_CALENDAR_SCOPES);

			HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);
			ResponseEntity<Map> response = restTemplate.postForEntity(
					EpCommonConstants.ENTERPRISE_MICROSOFT_LOGIN_URL + tenantId + "/oauth2/v2.0/token", request,
					Map.class);

			if (response.getBody() != null && response.getBody().containsKey("access_token")) {
				return (String) response.getBody().get("access_token");
			}
		}
		catch (Exception e) {
			log.error("Error refreshing access token: ", e);
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_UNABLE_TO_GENERATE_ACCESS_TOKEN_TO_CALENDAR);
		}
		return null;
	}

	private void verifyConnectedEmailWithUserEmail(String accessToken, User currentUser) {
		try {
			GraphServiceClient<?> graphClient = createClient(accessToken);
			com.microsoft.graph.models.User graphUser = graphClient.me().buildRequest().get();
			String userEmail = graphUser.mail;
			if (userEmail == null || !currentUser.getEmail().equals(userEmail)) {
				throw new ModuleException(
						EPCommonMessageConstant.EP_COMMON_ERROR_USER_EMAIL_MISMATCH_WITH_CURRENT_USER);
			}
		}
		catch (Exception e) {
			log.error("Error verifying user email via Graph SDK: ", e);
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_UNABLE_TO_CONNECT_MICROSOFT_CALENDAR);
		}
	}

	private void rollbackCalendarConnect(@NonNull User currentUser, @NonNull String generatedToken) {
		EmployeeCalendar employeeCalendar = employeeCalendarDao.findByUserAndCalendarTypeIn(currentUser,
				Set.of(EpCalendarType.OUTLOOK));

		if (employeeCalendar.getCalendarType() == EpCalendarType.OUTLOOK
				&& employeeCalendar.getCalendarToken() != null) {
			disconnectCalendarFromDatabase(currentUser);
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
				Set.of(EpCalendarType.OUTLOOK));
		employeeCalendar.setCalendarToken(null);
		employeeCalendar.setIsEnabled(false);
		employeeCalendarDao.save(employeeCalendar);
	}

	private void validateMicrosoftCalendarAuthRedirectDto(EpMicrosoftAuthRedirectDto epMicrosoftAuthRedirectDto) {
		if ((epMicrosoftAuthRedirectDto.getError() != null && !epMicrosoftAuthRedirectDto.getError().isEmpty())
				|| epMicrosoftAuthRedirectDto.getCode().isEmpty()) {
			log.error("saveMicrosoftCalendarConfig: Error: {}", epMicrosoftAuthRedirectDto.getError());
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_UNABLE_TO_CONNECT_MICROSOFT_CALENDAR);
		}
	}

	private ZonedDateTime parseEventDateTime(DateTimeTimeZone dateTimeTimeZone) {
		if (dateTimeTimeZone == null || dateTimeTimeZone.dateTime == null) {
			return null;
		}
		try {
			ZoneId zone = ZoneId.of(dateTimeTimeZone.timeZone != null ? dateTimeTimeZone.timeZone : "UTC");
			LocalDateTime local = LocalDateTime.parse(dateTimeTimeZone.dateTime.replace("Z", ""));
			return local.atZone(zone).withZoneSameInstant(ZoneId.of("UTC"));
		}
		catch (Exception ex) {
			log.warn("parseEventDateTime: unable to parse {}", dateTimeTimeZone.dateTime, ex);
			return null;
		}
	}

}
