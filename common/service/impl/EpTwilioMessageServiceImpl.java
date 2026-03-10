package com.skapp.enterprise.common.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.enterprise.common.constant.EPCommonMessageConstant;
import com.skapp.enterprise.common.service.EpTwilioMessageService;
import com.skapp.enterprise.common.type.TwilioMessageSource;
import com.skapp.enterprise.common.util.FormatPhoneNumberUtil;
import com.skapp.enterprise.common.util.TwilioStatusUtil;
import com.twilio.exception.ApiException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import org.springframework.util.StringUtils;
import tools.jackson.databind.json.JsonMapper;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class EpTwilioMessageServiceImpl implements EpTwilioMessageService {

	@Value("${twilio.message-service-sid}")
	private String messageServiceSid;

	@Value("${twilio.message-content-sid}")
	private String contentSid;

	@Value("${twilio.alpha-sender-id}")
	private String alphaSenderId;

	// Comma-separated list of country codes that require alphanumeric sender ID
	// registration with Twilio (e.g., "+94,+44").
	// For such countries the alpha sender ID is used instead of the message service SID.
	// Add a country code here when Twilio registration is required.
	@Value("${twilio.alpha-numeric-country-codes:}")
	private String alphaNumericCountryCodes;

	private final JsonMapper objectMapper;

	private List<String> allowedCountryCodes() {
		if (!StringUtils.hasText(alphaNumericCountryCodes)) {
			return List.of();
		}
		return Arrays.stream(alphaNumericCountryCodes.split(","))
			.map(String::trim)
			.filter(StringUtils::hasText)
			.toList();
	}

	@Override
	public void sendSmsMessage(String phoneNumber, String messageContent, TwilioMessageSource source,
			Long identifierId) {

		if (phoneNumber == null) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_SEND_MESSAGE_ERROR_PHONE_NUMBER_NOT_AVAILABLE);
		}

		if (messageContent == null) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_SEND_MESSAGE_ERROR_CONTENT_NOT_AVAILABLE);

		}

		String formattedTarget = FormatPhoneNumberUtil.formatPhoneNumberToE164(phoneNumber);

		boolean isAllowedCountry = allowedCountryCodes().stream().anyMatch(formattedTarget::startsWith);

		if (isAllowedCountry && !StringUtils.hasText(alphaSenderId)) {
			log.error("{} Alpha sender ID is not configured but destination for identifierId {} is an allowed country",
					source, identifierId);
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_SEND_MESSAGE_ERROR);
		}

		try {
			// No body when using ContentSid
			Map<String, String> contentVariables = Map.of("1", messageContent);
			String jsonVariables = objectMapper.writeValueAsString(contentVariables);

			Message message = isAllowedCountry ? createMessageFromAlphaSenderId(formattedTarget, jsonVariables)
					: createMessageFromMessageService(formattedTarget, jsonVariables);

			if (message.getErrorCode() == null) {
				log.info("{} Message delivery to: {} triggered successfully.", source, identifierId);
			}
			else {
				log.info("{} Message delivery to: {} unsuccessful. errorCode: {}, errorMessage: {}", source,
						identifierId, message.getErrorCode(), message.getErrorMessage());
				throw new ModuleException(EPCommonMessageConstant.EP_COMMON_SEND_MESSAGE_ERROR);
			}
		}
		catch (ApiException e) {
			// Catch the ACTUAL Twilio SDK exception, wrap into your custom one
			// Covers: 401 bad credentials, 403 forbidden, 404 invalid SID,
			// 429 rate limit, 500/503 Twilio outage, network errors
			log.error("{} Twilio API error. httpStatus: {}, message: {}", source, e.getStatusCode(), e.getMessage(), e);

			throw new ModuleException(TwilioStatusUtil.resolveTwilioStatus(e.getStatusCode()));
		}

	}

	private Message createMessageFromAlphaSenderId(String formattedTarget, String jsonVariables) {
		return Message.creator(new PhoneNumber(formattedTarget), new PhoneNumber(alphaSenderId), (String) null)
			.setContentSid(contentSid)
			.setContentVariables(jsonVariables)
			.create();
	}

	private Message createMessageFromMessageService(String formattedTarget, String jsonVariables) {
		return Message.creator(new PhoneNumber(formattedTarget), messageServiceSid, (String) null)
			.setContentSid(contentSid)
			.setContentVariables(jsonVariables)
			.create();
	}

}
