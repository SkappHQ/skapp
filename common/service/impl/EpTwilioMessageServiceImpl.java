package com.skapp.enterprise.common.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.enterprise.common.constant.EPCommonMessageConstant;
import com.skapp.enterprise.common.service.EpTwilioMessageService;
import com.skapp.enterprise.common.type.TwilioMessageSource;
import com.skapp.enterprise.common.util.FormatPhoneNumberUtil;
import com.skapp.enterprise.common.util.TwilioStatusUtil;
import com.twilio.exception.ApiException;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import org.springframework.util.StringUtils;
import tools.jackson.databind.json.JsonMapper;

import java.util.ArrayList;
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

	@Value("${twilio.alpha-sender-id:}")
	private String alphaSenderId;

	// Comma-separated list of allowed country codes (e.g., "+1,+44,+94")
	// This is to be added for alphanumeric sender is since the alphanumeric id does not
	// automatically get set to the message service when the country registration is
	// required. So we need to maintain a list of allowed country codes to determine when
	// to use the alpha sender id vs the message service sid.
	// Therefore, for countries that require registration for alphanumeric Id, the country
	// code should be added to this env variable.
	@Value("${twilio.country-codes}")
	private String countryCodes;

	private final JsonMapper objectMapper;

	private List<String> allowedCountryCodeList = new ArrayList<>();

	@PostConstruct
	private void initializeCountryCodes() {
		if (StringUtils.hasText(countryCodes)) {
			allowedCountryCodeList = Arrays.stream(countryCodes.split(","))
				.map(String::trim)
				.filter(StringUtils::hasText)
				.toList();
		}
		log.info("Twilio alpha sender enabled for country codes: {}", allowedCountryCodeList);
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

		boolean isAllowedCountry = allowedCountryCodeList.stream().anyMatch(formattedTarget::startsWith);

		if (isAllowedCountry && !StringUtils.hasText(alphaSenderId)) {
			log.error("Alpha sender ID is not configured but destination {} is an allowed country", formattedTarget);
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_SEND_MESSAGE_ERROR);
		}

		try {
			// No body when using ContentSid
			Map<String, String> contentVariables = Map.of("1", messageContent);
			String jsonVariables = objectMapper.writeValueAsString(contentVariables);

			Message message = isAllowedCountry ? createMessageFromAlphaNumber(formattedTarget, jsonVariables)
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

	private Message createMessageFromAlphaNumber(String formattedTarget, String jsonVariables) {
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
