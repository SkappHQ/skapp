package com.skapp.enterprise.common.service.impl;

import com.skapp.community.common.component.ProfileActivator;
import com.skapp.community.common.exception.ValidationException;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.community.common.util.Validation;
import com.skapp.enterprise.common.component.EmailValidationProperties;
import com.skapp.enterprise.common.constant.EPCommonMessageConstant;
import com.skapp.enterprise.common.constant.EpCommonConstants;
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

	private EmailValidationProperties getProperties() {
		String configPath = profileActivator.isEpPrdProfile() ? EpCommonConstants.PRD_CONFIG_PATH
				: EpCommonConstants.NON_PRD_CONFIG_PATH;
		return YamlReader.read(configPath, EmailValidationProperties.class);
	}

	private final ProfileActivator profileActivator;

	@Override
	public ResponseEntityDto validateBusinessEmail(String email) {
		ValidationResult validationResult = validateEmail(email);

		EmailValidationResultDto emailValidationResultDto = new EmailValidationResultDto();
		emailValidationResultDto.setEmail(email);
		emailValidationResultDto.setIsValid(validationResult.getIsValid());

		if (Boolean.FALSE.equals(validationResult.getIsValid())) {
			emailValidationResultDto.setReason(messageUtil.getMessage(validationResult.getMessageKey()));
		}

		return new ResponseEntityDto(false, emailValidationResultDto);
	}

	@Override
	public void checkBusinessEmailValidity(String email) {
		ValidationResult validationResult = validateEmail(email);

		if (Boolean.FALSE.equals(validationResult.getIsValid())) {
			throw new ValidationException(EPCommonMessageConstant.EP_COMMON_ERROR_PERSONAL_TEMP_OR_DISPOSABLE_EMAIL);
		}
	}

	@Override
	public ValidationResult validateEmail(String email) {
		if (email == null || email.trim().isEmpty()) {
			return new ValidationResult(false, EPCommonMessageConstant.EP_COMMON_ERROR_EMPTY_EMAIL.getMessageKey());
		}

		if (!Pattern.compile(Validation.EMAIL_REGEX).matcher(email).matches()) {
			return new ValidationResult(false,
					EPCommonMessageConstant.EP_COMMON_ERROR_INVALID_EMAIL_FORMAT.getMessageKey());
		}

		String domain = extractDomain(email);
		EmailValidationProperties properties = getProperties();

		if (isPersonalDomain(domain, properties)) {
			return new ValidationResult(false, EPCommonMessageConstant.EP_COMMON_ERROR_PERSONAL_EMAIL.getMessageKey());
		}

		if (isTempEmailDomain(domain, properties)) {
			return new ValidationResult(false, EPCommonMessageConstant.EP_COMMON_ERROR_TEMP_EMAIL.getMessageKey());
		}

		if (matchesTempEmailPattern(domain, properties)) {
			return new ValidationResult(false,
					EPCommonMessageConstant.EP_COMMON_ERROR_DISPOSABLE_EMAIL.getMessageKey());
		}

		return new ValidationResult(true, null);
	}

	private String extractDomain(String email) {
		return email.substring(email.indexOf("@") + 1).toLowerCase();
	}

	private boolean isPersonalDomain(String domain, EmailValidationProperties properties) {
		return properties.getEmail().getValidation().getPersonalDomains().contains(domain);
	}

	private boolean isTempEmailDomain(String domain, EmailValidationProperties properties) {
		return properties.getEmail().getValidation().getTempEmailDomains().contains(domain);
	}

	private boolean matchesTempEmailPattern(String domain, EmailValidationProperties properties) {
		return properties.getEmail().getValidation().getTempEmailPatterns().stream().anyMatch(domain::matches);
	}

}
