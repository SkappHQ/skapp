package com.skapp.enterprise.common.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.enterprise.common.constant.EPCommonMessageConstant;
import com.skapp.enterprise.common.service.EpMessageService;
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

	@Value("${twilio.verify.phone-number}")
	private String phoneNumber;

	@Override
	public void sendMessage(String target, String messageContent) {
		try {
			Message message = Message.creator(new PhoneNumber(target), new PhoneNumber(phoneNumber), messageContent)
				.create();

		}
		catch (Exception e) {
			log.error("Unexpected error while sending message : {}", e.getMessage(), e);
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_SEND_MESSAGE_ERROR,
					new String[] { e.getMessage() });
		}
	}

}
