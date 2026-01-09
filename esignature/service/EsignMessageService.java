package com.skapp.enterprise.esignature.service;

import com.skapp.enterprise.common.type.TwilioMessageSource;

public interface EsignMessageService {

	void sendOtpMessage(String target, String otp, TwilioMessageSource source, Long identifierId);

}
