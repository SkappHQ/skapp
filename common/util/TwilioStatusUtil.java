package com.skapp.enterprise.common.util;

import com.skapp.enterprise.common.constant.EPCommonMessageConstant;
import lombok.experimental.UtilityClass;
import org.springframework.http.HttpStatus;

@UtilityClass
public class TwilioStatusUtil {

	public static EPCommonMessageConstant resolveTwilioStatus(int twilioHttpStatus) {
		return switch (twilioHttpStatus) {
			case 400 -> EPCommonMessageConstant.EP_COMMON_TWILIO_MESSAGE_SEND_ERROR_BAD_REQUEST;
			case 401 -> EPCommonMessageConstant.EP_COMMON_TWILIO_MESSAGE_SEND_ERROR_UNAUTHORIZED; // Bad
																									// auth
																									// token
																									// /
																									// API
																									// key
			case 403 -> EPCommonMessageConstant.EP_COMMON_TWILIO_MESSAGE_SEND_ERROR_FORBIDDEN; // Valid
																								// credentials
																								// but
																								// no
																								// permission
			case 404 -> EPCommonMessageConstant.EP_COMMON_TWILIO_MESSAGE_SEND_ERROR_INVALID_SID; // Invalid
																									// SID
																									// or
																									// resource
																									// not
																									// found
			case 429 -> EPCommonMessageConstant.EP_COMMON_TWILIO_MESSAGE_SEND_ERROR_RATE_LIMIT; // Rate
																								// limited
																								// by
																								// Twilio
			case 503 -> EPCommonMessageConstant.EP_COMMON_TWILIO_MESSAGE_SEND_ERROR_SERVICE_UNAVAILABLE; // Twilio-side
																											// outage
																											// —
																											// not
																											// your
			// fault
			default -> EPCommonMessageConstant.EP_COMMON_TWILIO_MESSAGE_SEND_ERROR_INTERNAL_SERVER_ERROR;
		};
	}

}
