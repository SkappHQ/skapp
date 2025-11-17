package com.skapp.enterprise.common.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.JsonParseException;
import com.microsoft.graph.users.item.events.item.decline.DeclinePostRequestBody;
import com.microsoft.graph.models.*;
import com.microsoft.graph.serviceclient.GraphServiceClient;
import com.microsoft.graph.users.item.events.item.tentativelyaccept.TentativelyAcceptPostRequestBody;
import com.microsoft.kiota.authentication.AuthenticationProvider;
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
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
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
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

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
	@SneakyThrows
	public String connectMicrosoftCalendar(EpMicrosoftAuthRedirectDto epMicrosoftAuthRedirectDto) {
		log.info("connectMicrosoftCalendar: execution started");

		RestTemplate restTemplate = new RestTemplate();
		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.APPLICATION_JSON);
		HttpEntity<EpMicrosoftAuthRedirectDto> request = new HttpEntity<>(epMicrosoftAuthRedirectDto, headers);
		ResponseEntity<String> response = restTemplate.postForEntity(backendRedirectURI, request, String.class);

		ObjectMapper objectMapper = new ObjectMapper();
		JsonNode jsonNode = objectMapper.readTree(response.getBody());

		if (jsonNode.has(EpCommonConstants.RESULTS) && jsonNode.get(EpCommonConstants.RESULTS).isArray()
				&& !jsonNode.get(EpCommonConstants.RESULTS).isEmpty()) {

			String redirectUrl = jsonNode.get(EpCommonConstants.RESULTS).get(0).asText();
			log.info("connectMicrosoftCalendar: execution end");
			return redirectUrl;
		}
		else {
			throw new JsonParseException(
					String.valueOf(EPCommonMessageConstant.EP_COMMON_ERROR_JSON_STRING_TO_OBJECT_CONVERSION_FAILED));
		}
	}

	@Override
	@Transactional(propagation = Propagation.REQUIRED)
	public ResponseEntityDto saveMicrosoftCalendarConfig(EpMicrosoftAuthRedirectDto epMicrosoftAuthRedirectDto) {
		log.info("saveMicrosoftCalendarConfig: execution started");

		String encodedState = epMicrosoftAuthRedirectDto.getState();
		String authorizationCode = epMicrosoftAuthRedirectDto.getCode();

		if (encodedState == null || encodedState.isEmpty()) {
			log.error("saveMicrosoftCalendarConfig: State is empty");
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_MICROSOFT_STATE_MISMATCH);
		}

		String decryptedState;
		byte[] decodedBytes = Base64.getUrlDecoder().decode(encodedState);
		String encryptedState = new String(decodedBytes, StandardCharsets.UTF_8);
		decryptedState = encryptionDecryptionService.decrypt(encryptedState, encryptSecret);

		String[] state = decryptedState.split(EpCommonConstants.ENTERPRISE_CALENDER_CONCAT_PATTERN_FOR_STATE);

		if (state.length != EpCommonConstants.ENTERPRISE_MICROSOFT_CALENDAR_STATE_PARTS_COUNT) {
			log.error("saveMicrosoftCalendarConfig: State is invalid");
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_MICROSOFT_STATE_MISMATCH);
		}

		Long userId = Long.parseLong(state[0]);
		String frontendRedirectUri = state[1];
		String currentTenant = state[2];
		tenantContext.setTenantAndSwitchSchema(currentTenant);

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

		validateMicrosoftCalendarAuthRedirectDto(epMicrosoftAuthRedirectDto);
		MicrosoftTokenResponse result = exchangeCodeForTokens(authorizationCode);

		if (result.getAccessToken() != null) {
			verifyConnectedEmailWithUserEmail(result.getAccessToken(), currentUser);
		}

		if (result.getRefreshToken() != null) {
			String encryptedRefreshToken = encryptionDecryptionService.encrypt(result.getRefreshToken(), encryptSecret);
			if (encryptedRefreshToken == null) {
				throw new ModuleException(CommonMessageConstant.COMMON_ERROR_ENCRYPTION_FAILED);
			}
			employeeCalendar.setCalendarToken(encryptedRefreshToken);
			if (employeeCalendar.getCalendarToken() == null) {
				throw new EntityNotFoundException(
						EPCommonMessageConstant.EP_COMMON_UNABLE_TO_CONNECT_MICROSOFT_CALENDAR);
			}
		}
		else {
			throw new EntityNotFoundException(EPCommonMessageConstant.EP_COMMON_UNABLE_TO_CONNECT_MICROSOFT_CALENDAR);
		}

		employeeCalendar.setIsEnabled(true);
		employeeCalendar.setCalendarType(EpCalendarType.OUTLOOK);
		employeeCalendarDao.save(employeeCalendar);
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
		return new ResponseEntityDto(true, responseDto);
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
				messageUtil.getMessage(EPCommonMessageConstant.EP_COMMON_SUCCESS_DISCONNECT_MICROSOFT_CALENDAR), true);
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

		String decryptedRefreshToken = encryptionDecryptionService.decrypt(refreshToken, encryptSecret);
		if (decryptedRefreshToken == null || decryptedRefreshToken.isEmpty()) {
			log.error("MicrosoftCalendar: generateAccessToken");
			employeeCalendar.setCalendarToken(null);
			employeeCalendar.setIsEnabled(false);
			employeeCalendar.setCalendarType(EpCalendarType.NONE);
			employeeCalendarDao.save(employeeCalendar);
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_UNABLE_TO_GENERATE_ACCESS_TOKEN_TO_CALENDAR);
		}
		return refreshAccessToken(decryptedRefreshToken);

	}

	private GraphServiceClient createClient(String accessToken) {
		AuthenticationProvider authProvider = (request, additionalData) -> request.headers.add("Authorization",
				"Bearer " + accessToken);
		return new GraphServiceClient(authProvider);
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

		GraphServiceClient graphClient = createClient(accessToken);

		Event event = new Event();
		event.setSubject("Out of Office");
		event.setShowAs(FreeBusyStatus.Oof);
		event.setSensitivity(Sensitivity.Private);
		event.setIsAllDay(false);
		event.setResponseRequested(false);
		ItemBody body = new ItemBody();
		body.setContentType(BodyType.Text);
		body.setContent(declineMessage != null ? declineMessage : "Out of office");
		event.setBody(body);

		DateTimeTimeZone start = new DateTimeTimeZone();
		start.setDateTime(startUtc.format(DateTimeFormatter.ISO_INSTANT));
		start.setTimeZone("UTC");
		event.setStart(start);
		DateTimeTimeZone end = new DateTimeTimeZone();
		end.setDateTime(endUtc.format(DateTimeFormatter.ISO_INSTANT));
		end.setTimeZone("UTC");
		event.setEnd(end);

		Event createdEvent = graphClient.me().events().post(event);
		if (createdEvent != null && createdEvent.getId() != null) {
			log.info("MicrosoftCalendar: created Event: {} (start={}, end={}, sensitivity={}, showAs={})",
					createdEvent.getId(), start.getDateTime(), end.getDateTime(), event.getSensitivity(),
					event.getShowAs());
		}

		switch (autoDeclineMode) {
			case "declineAllConflictingInvitations":
				if (createdEvent != null && createdEvent.getId() != null) {
					declineConflictingEvents(startUtc, endUtc, accessToken, createdEvent.getId(), declineMessage);
				}
				setAutomaticReplies(startUtc, endUtc, accessToken, declineMessage);
				break;

			case "declineOnlyNewConflictingInvitations":
				// Only set automatic replies for new events (cannot decline)
				setAutomaticReplies(startUtc, endUtc, accessToken, declineMessage);
				break;

			case "declineNone":
			default:
				break;
		}

		return createdEvent != null ? createdEvent.getId() : null;

	}

	private void setAutomaticReplies(ZonedDateTime startUtc, ZonedDateTime endUtc, String accessToken,
			String declineMessage) {
		String reply = (declineMessage != null && !declineMessage.isBlank()) ? declineMessage : "I am out of office.";
		try {
			GraphServiceClient graphClient = createClient(accessToken);

			AutomaticRepliesSetting repliesSetting = new AutomaticRepliesSetting();
			repliesSetting.setStatus(AutomaticRepliesStatus.Scheduled);
			DateTimeTimeZone startDttz = new DateTimeTimeZone();
			startDttz.setDateTime(startUtc.toLocalDateTime().toString());
			startDttz.setTimeZone("UTC");
			repliesSetting.setScheduledStartDateTime(startDttz);
			DateTimeTimeZone endDttz = new DateTimeTimeZone();
			endDttz.setDateTime(endUtc.toLocalDateTime().toString());
			endDttz.setTimeZone("UTC");
			repliesSetting.setScheduledEndDateTime(endDttz);
			repliesSetting.setInternalReplyMessage(reply);
			repliesSetting.setExternalReplyMessage(reply);
			repliesSetting.setExternalAudience(ExternalAudienceScope.All);

			MailboxSettings mailboxSettings = new MailboxSettings();
			mailboxSettings.setAutomaticRepliesSetting(repliesSetting);

			graphClient.me().mailboxSettings().patch(mailboxSettings);
			log.info("Automatic replies scheduled via SDK ({} -> {})", startUtc, endUtc);
		}
		catch (Exception sdkEx) {
			log.warn("SDK automatic replies patch failed ({}), attempting REST fallback: {}",
					sdkEx.getClass().getSimpleName(), sdkEx.getMessage());
		}
	}

	private void declineConflictingEvents(ZonedDateTime startUtc, ZonedDateTime endUtc, String accessToken,
			String newEventId, String declineMessage) {
		try {
			GraphServiceClient graphClient = createClient(accessToken);
			String startFormatted = startUtc.format(DateTimeFormatter.ISO_INSTANT);
			String endFormatted = endUtc.format(DateTimeFormatter.ISO_INSTANT);
			EventCollectionResponse response = graphClient.me().calendarView().get(config -> {
				if (config.queryParameters != null) {
					config.queryParameters.startDateTime = startFormatted;
					config.queryParameters.endDateTime = endFormatted;
				}
			});
			List<Event> events = response != null ? response.getValue() : null;
			if (events != null) {
				events.stream()
					.filter(existing -> existing.getId() != null && !existing.getId().equals(newEventId))
					.filter(existing -> existing.getResponseStatus() == null
							|| existing.getResponseStatus().getResponse() != ResponseType.Declined)
					.filter(existing -> {
						ZonedDateTime existingStart = parseEventDateTime(existing.getStart());
						ZonedDateTime existingEnd = parseEventDateTime(existing.getEnd());
						return existingStart != null && existingEnd != null && existingStart.isBefore(endUtc)
								&& existingEnd.isAfter(startUtc);
					})
					.forEach(existing -> {
						try {

							DeclinePostRequestBody declineRequest = new DeclinePostRequestBody();
							declineRequest.setComment(declineMessage);
							declineRequest.setSendResponse(true);

							graphClient.me().events().byEventId(existing.getId()).decline().post(declineRequest);
							log.info("Sent decline response for conflicting event {}", existing.getId());

							Event eventUpdate = new Event();
							ResponseStatus responseStatus = new ResponseStatus();
							responseStatus.setResponse(ResponseType.Declined);
							responseStatus.setTime(OffsetDateTime.now());
							eventUpdate.setResponseStatus(responseStatus);

							if (existing.getBody() != null) {
								ItemBody body = new ItemBody();
								body.setContentType(existing.getBody().getContentType());
								String existingContent = existing.getBody().getContent() != null
										? existing.getBody().getContent() : "";
								String updatedContent = existingContent + "\n\n[Auto-declined: " + declineMessage + "]";
								body.setContent(updatedContent);
								eventUpdate.setBody(body);
							}

							graphClient.me().events().byEventId(existing.getId()).patch(eventUpdate);
							log.info("Updated status and added comment for conflicting event {}", existing.getId());
						}
						catch (Exception e) {
							log.error("Failed to decline event {}: {}", existing.getId(), e.getMessage());
						}
					});
			}

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
			GraphServiceClient graphClient = createClient(accessToken);
			Event oofEvent = graphClient.me().events().byEventId(eventId).get();
			if (oofEvent == null || oofEvent.getStart() == null || oofEvent.getEnd() == null) {
				log.warn("deleteOutOfOfficeEvent: OOF event not found or missing time info");
				return;
			}
			String startDateTime = oofEvent.getStart().getDateTime();
			String endDateTime = oofEvent.getEnd().getDateTime();

			EventCollectionResponse response = graphClient.me().calendarView().get(config -> {
				if (config.queryParameters != null) {
					config.queryParameters.startDateTime = startDateTime;
					config.queryParameters.endDateTime = endDateTime;
				}
			});
			List<Event> events = response != null ? response.getValue() : null;
			if (events != null) {
				events.stream()
					.filter(event -> event.getId() != null && !event.getId().equals(eventId))
					.filter(event -> event.getResponseStatus() != null
							&& event.getResponseStatus().getResponse() == ResponseType.Declined)
					.forEach(event -> {
						try {

							TentativelyAcceptPostRequestBody tentativeRequest = new TentativelyAcceptPostRequestBody();
							tentativeRequest.setComment("Automatic Reply: Leave Request declined - marking as tentative");
							tentativeRequest.setSendResponse(true);

							graphClient.me()
								.events()
								.byEventId(event.getId())
								.tentativelyAccept()
								.post(tentativeRequest);
							log.info("Sent tentative response for previously declined event {}", event.getId());

							Event eventUpdate = new Event();
							ResponseStatus responseStatus = new ResponseStatus();
							responseStatus.setResponse(ResponseType.TentativelyAccepted);
							responseStatus.setTime(OffsetDateTime.now());
							eventUpdate.setResponseStatus(responseStatus);
							graphClient.me().events().byEventId(event.getId()).patch(eventUpdate);
							log.info("Restored response to tentative for previously declined event {}", event.getId());
						}
						catch (Exception e) {
							log.error("Failed to restore event {}: {}", event.getId(), e.getMessage());
						}
					});
			}
			graphClient.me().events().byEventId(eventId).delete();
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

		GraphServiceClient graphClient = createClient(accessToken);
		com.microsoft.graph.models.User graphUser = graphClient.me().get();
		String userEmail = graphUser != null ? graphUser.getMail() : null;
		if (userEmail == null || !userEmail.equals(currentUser.getEmail())) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_USER_EMAIL_MISMATCH_WITH_CURRENT_USER);
		}
	}

	private void rollbackCalendarConnect(@NonNull User currentUser) {
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
		if (dateTimeTimeZone == null || dateTimeTimeZone.getDateTime() == null) {
			return null;
		}
		try {
			ZoneId zone = ZoneId.of(dateTimeTimeZone.getTimeZone() != null ? dateTimeTimeZone.getTimeZone() : "UTC");
			LocalDateTime local = LocalDateTime.parse(dateTimeTimeZone.getDateTime().replace("Z", ""));
			return local.atZone(zone).withZoneSameInstant(ZoneId.of("UTC"));
		}
		catch (Exception ex) {
			log.warn("parseEventDateTime: unable to parse {}", dateTimeTimeZone.getDateTime(), ex);
			return null;
		}
	}

}
