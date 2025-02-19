package com.skapp.enterprise.leaveplanner.util;

import com.skapp.community.common.constant.CommonMessageConstant;
import com.skapp.community.common.exception.ValidationException;
import lombok.experimental.UtilityClass;

import java.util.List;

@UtilityClass
public class Validation {

	private static final int MAX_DECLINE_MESSAGE_LENGTH = 100;

	public static void isValidDeclineMessage(String declineMessage) throws ValidationException {
		if (declineMessage.length() > MAX_DECLINE_MESSAGE_LENGTH) {
			throw new ValidationException(CommonMessageConstant.COMMON_ERROR_VALIDATION_LAST_NAME_LENGTH,
					List.of(String.valueOf(MAX_DECLINE_MESSAGE_LENGTH)));
		}
	}

}
