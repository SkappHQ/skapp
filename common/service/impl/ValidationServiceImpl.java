package com.skapp.enterprise.common.service.impl;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.enterprise.common.component.EmailValidationProperties;
import com.skapp.enterprise.common.constant.EPCommonMessageConstant;
import com.skapp.enterprise.common.payload.response.EmailValidationResultDto;
import com.skapp.enterprise.common.payload.response.ValidationResult;
import com.skapp.enterprise.common.service.ValidationService;
import com.skapp.enterprise.common.util.YamlReader;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.regex.Pattern;

@Service
@Slf4j
@RequiredArgsConstructor
public class ValidationServiceImpl implements ValidationService {

	private final MessageUtil messageUtil;

	private static final String CONFIG_PATH = "enterprise/validations/email-validation.yml";

	private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@(.+)$");

	private final EmailValidationProperties properties = YamlReader.read(CONFIG_PATH, EmailValidationProperties.class);

	@Override
	public ResponseEntityDto validateBusinessEmail(String email) {
		ValidationResult validationResult = validateEmail(email);

		EmailValidationResultDto emailValidationResultDto = new EmailValidationResultDto();
		emailValidationResultDto.setEmail(email);
		emailValidationResultDto.setIsValid(validationResult.getIsValid());

		if (Boolean.FALSE.equals(validationResult.getIsValid())) {
			emailValidationResultDto.setReason(messageUtil.getMessage(validationResult.getMessageKey()));
		}

		return new ResponseEntityDto(validationResult.getIsValid(), emailValidationResultDto);
	}

	private ValidationResult validateEmail(String email) {
		if (email == null || email.trim().isEmpty()) {
			return new ValidationResult(false, EPCommonMessageConstant.EP_COMMON_ERROR_EMPTY_EMAIL.getMessageKey());
		}

		if (!EMAIL_PATTERN.matcher(email).matches()) {
			return new ValidationResult(false,
					EPCommonMessageConstant.EP_COMMON_ERROR_INVALID_EMAIL_FORMAT.getMessageKey());
		}

		String domain = extractDomain(email);

		if (isPersonalDomain(domain)) {
			return new ValidationResult(false, EPCommonMessageConstant.EP_COMMON_ERROR_PERSONAL_EMAIL.getMessageKey());
		}

		if (isTempEmailDomain(domain)) {
			return new ValidationResult(false, EPCommonMessageConstant.EP_COMMON_ERROR_TEMP_EMAIL.getMessageKey());
		}

		if (matchesTempEmailPattern(domain)) {
			return new ValidationResult(false,
					EPCommonMessageConstant.EP_COMMON_ERROR_DISPOSABLE_EMAIL.getMessageKey());
		}

		return new ValidationResult(true, null);
	}

	private String extractDomain(String email) {
		return email.substring(email.indexOf("@") + 1).toLowerCase();
	}

	private boolean isPersonalDomain(String domain) {
		return properties.getEmail().getValidation().getPersonalDomains().contains(domain);
	}

	private boolean isTempEmailDomain(String domain) {
		return properties.getEmail().getValidation().getTempEmailDomains().contains(domain);
	}

	private boolean matchesTempEmailPattern(String domain) {
		return properties.getEmail().getValidation().getTempEmailPatterns().stream().anyMatch(domain::matches);
	}

}
