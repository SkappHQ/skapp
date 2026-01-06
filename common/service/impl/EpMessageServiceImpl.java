package com.skapp.enterprise.common.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.enterprise.common.constant.EPCommonMessageConstant;
import com.skapp.enterprise.common.service.EpMessageService;
import com.skapp.enterprise.common.util.PhoneNumberMaskUtil;
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

		// No body when using ContentSid
		Message message = Message.creator(new PhoneNumber(target), messageServiceSid, (String) null)
			.setContentSid(contentSid)
			.setContentVariables("{\"1\":\"" + messageContent + "\"}")
			.create();

		if (message.getErrorCode() == null) {
			log.info("Message delivery to: {} triggered successfully.", PhoneNumberMaskUtil.mask(target));
		}
		else {
			log.info("Message delivery to: {} unsuccessful. errorCode: {}, errorMessage: {}",
					PhoneNumberMaskUtil.mask(target), message.getErrorCode(), message.getErrorMessage());
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_SEND_MESSAGE_ERROR);
		}

	}

}
