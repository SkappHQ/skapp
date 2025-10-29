package com.skapp.enterprise.common.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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
import org.springframework.http.HttpStatus;
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
import java.util.HashMap;
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

		User currentUser = getUser(userId);

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

	public Boolean getIsMicrosoftCalendarConnected() {
		User currentUser = userService.getCurrentUser();
		boolean isConnected = false;

		try {
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
		}
		catch (ModuleException e) {
			log.error("Error checking Microsoft Calendar connection: ", e);
			return false;
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

		String startFormatted = startUtc.format(DateTimeFormatter.ISO_INSTANT);
		String endFormatted = endUtc.format(DateTimeFormatter.ISO_INSTANT);

		log.info("createOutOfOfficeEvent: startDateTime: {}, endDateTime: {}", startFormatted, endFormatted);

		Map<String, Object> event = new HashMap<>();
		event.put("subject", "Out of Office");
		event.put("isAllDay", false);
		event.put("showAs", "oof");
		event.put("sensitivity", "private");

		Map<String, Object> start = new HashMap<>();
		start.put("dateTime", startFormatted);
		start.put("timeZone", "UTC");
		event.put("start", start);

		Map<String, Object> end = new HashMap<>();
		end.put("dateTime", endFormatted);
		end.put("timeZone", "UTC");
		event.put("end", end);

		try {
			RestTemplate restTemplate = new RestTemplate();
			HttpHeaders headers = new HttpHeaders();
			headers.setContentType(MediaType.APPLICATION_JSON);
			headers.setBearerAuth(accessToken);

			HttpEntity<Map<String, Object>> request = new HttpEntity<>(event, headers);
			ResponseEntity<Map> response = restTemplate.postForEntity(
					EpCommonConstants.ENTERPRISE_MICROSOFT_GRAPH_BASE_URL + "/me/events", request, Map.class);

			if (response.getBody() != null && response.getBody().containsKey("id")) {
				String eventId = (String) response.getBody().get("id");
				log.info("MicrosoftCalendar: created Event: {}", eventId);

				if ("declineAllConflictingInvitations".equals(autoDeclineMode)) {
					declineConflictingEvents(startUtc, endUtc, accessToken, declineMessage, eventId);
				}

				if ("declineAllConflictingInvitations".equals(autoDeclineMode)
						|| "declineOnlyNewConflictingInvitations".equals(autoDeclineMode)) {
					setAutomaticReplies(startUtc, endUtc, accessToken, declineMessage);
				}

				return eventId;
			}
		}
		catch (Exception exception) {
			log.error("MicrosoftCalendar: create Event: {}", exception.getMessage(), exception);
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_UNABLE_TO_CONNECT_MICROSOFT_CALENDAR);
		}

		return null;
	}

	private void declineConflictingEvents(ZonedDateTime startUtc, ZonedDateTime endUtc, String accessToken,
			String declineMessage, String newEventId) {
		try {
			RestTemplate restTemplate = new RestTemplate();
			HttpHeaders headers = new HttpHeaders();
			headers.setBearerAuth(accessToken);

			String startFormatted = startUtc.format(DateTimeFormatter.ISO_INSTANT);
			String endFormatted = endUtc.format(DateTimeFormatter.ISO_INSTANT);

			String calendarViewUrl = EpCommonConstants.ENTERPRISE_MICROSOFT_GRAPH_BASE_URL
					+ "/me/calendar/calendarView?startDateTime=" + startFormatted + "&endDateTime=" + endFormatted;
			HttpEntity<Void> request = new HttpEntity<>(headers);
			ResponseEntity<Map> response = restTemplate.exchange(calendarViewUrl, HttpMethod.GET, request, Map.class);

			if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null
					&& response.getBody().containsKey("value")) {
				List<Map<String, Object>> events = (List<Map<String, Object>>) response.getBody().get("value");

				for (Map<String, Object> event : events) {
					String eventId = (String) event.get("id");
					if (eventId.equals(newEventId))
						continue;

					Map<String, Object> eventStart = (Map<String, Object>) event.get("start");
					Map<String, Object> eventEnd = (Map<String, Object>) event.get("end");
					ZonedDateTime eventStartTime = ZonedDateTime.parse((String) eventStart.get("dateTime"));
					ZonedDateTime eventEndTime = ZonedDateTime.parse((String) eventEnd.get("dateTime"));

					if (eventStartTime.isBefore(endUtc) && eventEndTime.isAfter(startUtc)) {
						String declineUrl = EpCommonConstants.ENTERPRISE_MICROSOFT_GRAPH_BASE_URL + "/me/events/"
								+ eventId + "/decline";
						Map<String, Object> declineBody = new HashMap<>();
						declineBody.put("comment",
								declineMessage != null ? declineMessage : "Declined due to out-of-office leave.");
						declineBody.put("sendResponse", true);
						HttpEntity<Map<String, Object>> declineRequest = new HttpEntity<>(declineBody, headers);
						ResponseEntity<Void> declineResponse = restTemplate.exchange(declineUrl, HttpMethod.POST,
								declineRequest, Void.class);

						if (declineResponse.getStatusCode() != HttpStatus.ACCEPTED) {
							log.warn("Failed to decline conflicting event {}: {}", eventId,
									declineResponse.getStatusCode());
						}
					}
				}
			}
		}
		catch (Exception e) {
			log.error("Error declining conflicting events", e);
			// Optionally throw or continue
		}
	}

	private void setAutomaticReplies(ZonedDateTime startUtc, ZonedDateTime endUtc, String accessToken,
			String declineMessage) {
		try {
			RestTemplate restTemplate = new RestTemplate();
			HttpHeaders headers = new HttpHeaders();
			headers.setContentType(MediaType.APPLICATION_JSON);
			headers.setBearerAuth(accessToken);

			String startFormatted = startUtc.format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss"));
			String endFormatted = endUtc.format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss"));

			Map<String, Object> body = new HashMap<>();
			Map<String, Object> automaticRepliesSetting = new HashMap<>();
			automaticRepliesSetting.put("status", "scheduled");
			Map<String, Object> scheduledStart = new HashMap<>();
			scheduledStart.put("dateTime", startFormatted);
			scheduledStart.put("timeZone", "UTC");
			automaticRepliesSetting.put("scheduledStartDateTime", scheduledStart);
			Map<String, Object> scheduledEnd = new HashMap<>();
			scheduledEnd.put("dateTime", endFormatted);
			scheduledEnd.put("timeZone", "UTC");
			automaticRepliesSetting.put("scheduledEndDateTime", scheduledEnd);
			automaticRepliesSetting.put("internalReplyMessage",
					declineMessage != null ? declineMessage : "I am out of office.");
			automaticRepliesSetting.put("externalReplyMessage",
					declineMessage != null ? declineMessage : "I am out of office.");
			automaticRepliesSetting.put("externalAudience", "all");
			body.put("automaticRepliesSetting", automaticRepliesSetting);

			HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
			ResponseEntity<Void> response = restTemplate.exchange(
					EpCommonConstants.ENTERPRISE_MICROSOFT_GRAPH_BASE_URL + "/me/mailboxSettings", HttpMethod.PATCH,
					request, Void.class);

			if (response.getStatusCode() != HttpStatus.OK) {
				log.warn("Failed to set automatic replies: {}", response.getStatusCode());
			}
		}
		catch (Exception e) {
			log.error("Error setting automatic replies", e);
		}
	}

	@Override
	public void deleteOutOfOfficeEvent(String eventId, String accessToken) {
		try {
			RestTemplate restTemplate = new RestTemplate();
			HttpHeaders headers = new HttpHeaders();
			headers.setBearerAuth(accessToken);

			HttpEntity<Void> request = new HttpEntity<>(headers);
			restTemplate.exchange(EpCommonConstants.ENTERPRISE_MICROSOFT_GRAPH_BASE_URL + "/me/events/" + eventId,
					HttpMethod.DELETE, request, Void.class);

			log.info("MicrosoftCalendar: deleted Event: {}", eventId);
			calendarEventDao.deleteByEventId(eventId);
		}
		catch (Exception exception) {
			log.error("MicrosoftCalendar: Error deleting Event {}: {}", eventId, exception.getMessage(), exception);
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
			RestTemplate restTemplate = new RestTemplate();
			HttpHeaders headers = new HttpHeaders();
			headers.setBearerAuth(accessToken);

			HttpEntity<Void> request = new HttpEntity<>(headers);
			ResponseEntity<Map> response = restTemplate.exchange(
					EpCommonConstants.ENTERPRISE_MICROSOFT_GRAPH_BASE_URL + "/me", HttpMethod.GET, request, Map.class);

			if (response.getBody() != null && response.getBody().containsKey("mail")) {
				String userEmail = (String) response.getBody().get("mail");
				if (!currentUser.getEmail().equals(userEmail)) {
					throw new ModuleException(
							EPCommonMessageConstant.EP_COMMON_ERROR_USER_EMAIL_MISMATCH_WITH_CURRENT_USER);
				}
			}
			else {
				throw new ModuleException(EPCommonMessageConstant.EP_COMMON_UNABLE_TO_CONNECT_MICROSOFT_CALENDAR);
			}
		}
		catch (Exception e) {
			log.error("Error verifying user email: ", e);
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_UNABLE_TO_CONNECT_MICROSOFT_CALENDAR);
		}
	}

	private User getUser(Long userId) {
		Optional<User> currentUser = userDao.findById(userId);
		if (currentUser.isEmpty()) {
			log.error("saveMicrosoftCalendarConfig: User not found");
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_MICROSOFT_STATE_MISMATCH);
		}
		return currentUser.get();
	}

	private void rollbackCalendarConnect(@NonNull User currentUser, @NonNull String generatedToken) {
		EmployeeCalendar employeeCalendar = employeeCalendarDao.findByUserAndCalendarTypeIn(currentUser,
				Set.of(EpCalendarType.OUTLOOK));

		if (employeeCalendar.getCalendarType() != EpCalendarType.NONE || employeeCalendar.getCalendarToken() != null) {
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
		if (epMicrosoftAuthRedirectDto.getError() != null && !epMicrosoftAuthRedirectDto.getError().isEmpty()
				|| epMicrosoftAuthRedirectDto.getCode().isEmpty()) {
			log.error("saveMicrosoftCalendarConfig: Error: {}", epMicrosoftAuthRedirectDto.getError());
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_UNABLE_TO_CONNECT_MICROSOFT_CALENDAR);
		}
	}

}
