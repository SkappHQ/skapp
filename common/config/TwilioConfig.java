package com.skapp.enterprise.common.config;

import com.twilio.Twilio;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;

@Slf4j
@Configuration
public class TwilioConfig {

	@Value("${environment.name}")
	private String environmentName;

	@Value("${twilio.account-sid}")
	private String accountSid;

	@Value("${twilio.auth-token-or-api-key-sid}")
	private String authTokenOrApiKeySid;

	@Value("${twilio.api-key-secret}")
	private String apiKeySecret;

	@PostConstruct
	private void initTwilio() {

		if (environmentName.equals("local")) {
			Twilio.init(accountSid, authTokenOrApiKeySid);
		}
		else {
			Twilio.init(authTokenOrApiKeySid, apiKeySecret, accountSid);
		}

	}

}
