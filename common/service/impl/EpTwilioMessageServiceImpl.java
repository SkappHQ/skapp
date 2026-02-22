package com.skapp.enterprise.common.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.enterprise.common.constant.EPCommonMessageConstant;
import com.skapp.enterprise.common.exception.TwilioApiException;
import com.skapp.enterprise.common.service.EpTwilioMessageService;
import com.skapp.enterprise.common.type.TwilioMessageSource;
import com.skapp.enterprise.common.util.FormatPhoneNumberUtil;
import com.skapp.enterprise.common.util.PhoneNumberMaskUtil;
import com.twilio.exception.ApiException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;

@Slf4j
@Service
@RequiredArgsConstructor
public class EpTwilioMessageServiceImpl implements EpTwilioMessageService {

	@Value("${twilio.message-service-sid}")
	private String messageServiceSid;

	@Value("${twilio.message-content-sid}")
	private String contentSid;

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
			Message message = Message.creator(new PhoneNumber(formattedTarget), messageServiceSid, (String) null)
				.setContentSid(contentSid)
				.setContentVariables("{\"1\":\"" + messageContent + "\"}")
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
		catch (ModuleException e) {
			throw e;

		}
		catch (ApiException e) {
			// Catch the ACTUAL Twilio SDK exception, wrap into your custom one
			// Covers: 401 bad credentials, 403 forbidden, 404 invalid SID,
			// 429 rate limit, 500/503 Twilio outage, network errors
			log.error("{} Twilio API error for identifierId: {}. httpStatus: {}, message: {}", source, identifierId,
					e.getStatusCode(), e.getMessage(), e);

			throw new TwilioApiException("Twilio API call failed for identifierId: " + identifierId, e.getStatusCode(),
					e.getMessage(), e);
		}

	}

}
