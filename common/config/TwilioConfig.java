package com.skapp.enterprise.common.config;

import com.twilio.Twilio;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import javax.annotation.PostConstruct;

@Slf4j
@Configuration
public class TwilioConfig {

	@Value("${twilio.account-sid}")
	private String accountSid;

	@Value("${twilio.auth-token}")
	private String authToken;

	@PostConstruct
	private void initTwilio() {
		try {
			Twilio.init(accountSid, authToken);
		}
		catch (Exception e) {
			log.error("Failed to initialize Twilio client.", e);
			throw new IllegalStateException("Failed to initialize Twilio client", e);
		}
	}

}
