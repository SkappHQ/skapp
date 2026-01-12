package com.skapp.enterprise.common.service;

import com.skapp.enterprise.common.type.TwilioMessageSource;

public interface EpTwilioMessageService {

	void sendSmsMessage(String target, String messageContent, TwilioMessageSource source, Long identifierId);

}
