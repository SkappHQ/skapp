package com.skapp.enterprise.common.config;

import com.twilio.Twilio;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;

@Slf4j
@Configuration
public class TwilioConfig {

	@Value("${twilio.account-sid}")
	private String accountSid;

	@Value("${twilio.auth-token-or-api-key}")
	private String authTokenOrApiKey;

	@PostConstruct
	private void initTwilio() {

		Twilio.init(accountSid, authTokenOrApiKey);

	}

}
