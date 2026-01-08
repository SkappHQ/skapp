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

	@Value("${twilio.auth-token-or-api-key-sid}")
	private String authTokenOrApiKeySid;

	@Value("${twilio.api-key-secret}")
	private String apiKeySecret;

	@PostConstruct
	private void initTwilio() {

		if (apiKeySecret != null && !apiKeySecret.trim().isEmpty()) {
			Twilio.init(authTokenOrApiKeySid, apiKeySecret, accountSid);
		}
		else {
			Twilio.init(accountSid, authTokenOrApiKeySid);
		}

	}

}
