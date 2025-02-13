package com.skapp.enterprise.common.component;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.List;

@Data
@Component
@ConfigurationProperties(prefix = "email.validation")
public class EmailValidationProperties {

	private EmailConfig email;

	@Data
	public static class EmailConfig {

		private ValidationConfig validation;

	}

	@Data
	public static class ValidationConfig {

		private List<String> personalDomains;

		private List<String> tempEmailDomains;

		private List<String> tempEmailPatterns;

	}

}
