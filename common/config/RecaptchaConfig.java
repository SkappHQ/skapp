package com.skapp.enterprise.common.config;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Getter
@Configuration
public class RecaptchaConfig {

	@Value("${recaptcha.secret}")
	private String secret;

	@Value("${recaptcha.verify-url}")
	private String verifyUrl;

	@Bean
	public RestTemplate restTemplate() {
		return new RestTemplate();
	}

}
