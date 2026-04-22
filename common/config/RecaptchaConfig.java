package com.skapp.enterprise.common.config;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Getter
@Configuration
public class RecaptchaConfig {

	@Value("${google.recaptcha.secret}")
	private String secret;

	@Value("${google.recaptcha.verify-url}")
	private String verifyUrl;

	@Value("${google.recaptcha.bypass-secret}")
	private String bypassSecret;

	@Bean
	public RestTemplate restTemplate() {
		return new RestTemplate();
	}

}
