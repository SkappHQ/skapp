package com.skapp.enterprise.common.util;

import com.skapp.enterprise.common.constant.EPCommonMessageConstant;
import lombok.experimental.UtilityClass;
import org.springframework.http.HttpStatus;

@UtilityClass
public class TwilioStatusUtil {

	public static EPCommonMessageConstant resolveTwilioStatus(int twilioHttpStatus) {
		return switch (twilioHttpStatus) {
			case 400 -> EPCommonMessageConstant.EP_COMMON_TWILIO_MESSAGE_SEND_ERROR_BAD_REQUEST;
			// Bad auth token/API key
			case 401 -> EPCommonMessageConstant.EP_COMMON_TWILIO_MESSAGE_SEND_ERROR_UNAUTHORIZED;
			// Valid credentials but no permission
			case 403 -> EPCommonMessageConstant.EP_COMMON_TWILIO_MESSAGE_SEND_ERROR_FORBIDDEN;
			// Invalid SID or resource not found
			case 404 -> EPCommonMessageConstant.EP_COMMON_TWILIO_MESSAGE_SEND_ERROR_INVALID_SID;
			// Rate limited by Twilio
			case 429 -> EPCommonMessageConstant.EP_COMMON_TWILIO_MESSAGE_SEND_ERROR_RATE_LIMIT;
			case 503 -> EPCommonMessageConstant.EP_COMMON_TWILIO_MESSAGE_SEND_ERROR_SERVICE_UNAVAILABLE;
			// Twilio-side outage — not system fault
			default -> EPCommonMessageConstant.EP_COMMON_TWILIO_MESSAGE_SEND_ERROR_INTERNAL_SERVER_ERROR;
		};
	}

}
