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

		if (target == null) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_SEND_MESSAGE_ERROR_TARGET_NOT_AVAILABLE);
		}

		if (messageContent == null) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_SEND_MESSAGE_ERROR_CONTENT_NOT_AVAILABLE);

		}

		String formattedTarget = formatToE164(target);

		// No body when using ContentSid
		Message message = Message.creator(new PhoneNumber(formattedTarget), messageServiceSid, (String) null)
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

	/**
	 * Formats a phone number to E.164 format.
	 * <p>
	 * E.164 format requires:
	 * <ul>
	 * <li>Starts with '+' prefix</li>
	 * <li>Contains only digits after the '+'</li>
	 * <li>Maximum length of 15 characters (including '+')</li>
	 * </ul>
	 * @param phoneNumber the phone number to format (e.g., "94 xxxxxxxx", "+1 xxx xxx
	 * xxx")
	 * @return the E.164 formatted phone number (e.g., "+94xxxxxxxx", "+1xxxxxxxxxx")
	 */
	private String formatToE164(String phoneNumber) {
		if (phoneNumber == null || phoneNumber.isEmpty()) {
			return phoneNumber;
		}

		// Remove all spaces and non-digit characters except +
		String cleanedPhoneNumber = phoneNumber.replaceAll("[^+\\d]", "");

		// Add + prefix if missing
		if (!cleanedPhoneNumber.startsWith("+")) {
			cleanedPhoneNumber = "+" + cleanedPhoneNumber;
		}

		return cleanedPhoneNumber;
	}

}
