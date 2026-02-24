package com.skapp.enterprise.common.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
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

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class EpTwilioMessageServiceImpl implements EpTwilioMessageService {

	@Value("${twilio.message-service-sid}")
	private String messageServiceSid;

	@Value("${twilio.message-content-sid}")
	private String contentSid;

	private final ObjectMapper objectMapper;

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

		try {
			// No body when using ContentSid
			Map<String, String> contentVariables = Map.of("1", messageContent);
			String jsonVariables = objectMapper.writeValueAsString(contentVariables);

			Message message = Message.creator(new PhoneNumber(formattedTarget), messageServiceSid, (String) null)
				.setContentSid(contentSid)
				.setContentVariables(jsonVariables)
				.create();

			if (message.getErrorCode() == null) {
				log.info("{} Message delivery to: {} triggered successfully.", source, identifierId);
			}
			else {
				log.info("{} Message delivery to: {} unsuccessful. errorCode: {}, errorMessage: {}", source,
						identifierId, message.getErrorCode(), message.getErrorMessage());
				throw new ModuleException(EPCommonMessageConstant.EP_COMMON_SEND_MESSAGE_ERROR);
			}
		}
		catch (JsonProcessingException e) {
			throw new ModuleException(
					EPCommonMessageConstant.EP_COMMON_TWILIO_MESSAGE_SEND_ERROR_CONTENT_VARIABLES_PROCESSING);
		}

		catch (ApiException e) {
			// Catch the ACTUAL Twilio SDK exception, wrap into your custom one
			// Covers: 401 bad credentials, 403 forbidden, 404 invalid SID,
			// 429 rate limit, 500/503 Twilio outage, network errors
			log.error("{} Twilio API error. httpStatus: {}, message: {}", source, e.getStatusCode(), e.getMessage(), e);

			throw new ModuleException(TwilioStatusUtil.resolveTwilioStatus(e.getStatusCode()));
		}

	}

}
