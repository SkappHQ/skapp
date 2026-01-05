package com.skapp.enterprise.common.service.impl;

import com.skapp.community.common.constant.CommonMessageConstant;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.exception.TooManyRequestsException;
import com.skapp.enterprise.common.constant.EPCommonMessageConstant;
import com.skapp.enterprise.common.service.EpMessageService;
import com.twilio.exception.ApiException;
import com.twilio.exception.AuthenticationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;

@Slf4j
@Service
@RequiredArgsConstructor
public class EpMessageServiceImpl implements EpMessageService {

	@Value("${twilio.message-service-sid}")
	private String messageServiceSid;

	@Value("${twilio.message-content-sid}")
	private String contentSid;

	@Override
	public void sendMessage(String target, String messageContent) {
		try {

			Message message = Message.creator(new PhoneNumber(target), messageServiceSid, (String) null // No
																										// body
																										// when
																										// using
																										// ContentSid
			).setContentSid(contentSid).setContentVariables("{\"1\":\"" + messageContent + "\"}").create();

			log.info("Message sent to: {} successfully.", target);

		}
		catch (AuthenticationException e) {
			log.error("Twilio authentication failed: {}", e.getMessage(), e);
		}
		catch (ApiException e) {
			if (e.getStatusCode() == 429) {
				throw new TooManyRequestsException(CommonMessageConstant.COMMON_ERROR_TOO_MANY_REQUESTS_EXCEPTION);
			}
			else {
				log.error("Error sending message to {}: {}", target, e.getMessage());
			}
		}
		catch (Exception e) {
			log.error("Unexpected error while sending message: {}", e.getMessage(), e);
		}
	}

}
