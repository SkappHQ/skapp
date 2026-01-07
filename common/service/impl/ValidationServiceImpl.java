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

	private EmailValidationProperties getProperties() {
		String configPath = profileActivator.isEpPrdProfile() ? EpCommonConstants.PRD_CONFIG_PATH
				: EpCommonConstants.NON_PRD_CONFIG_PATH;
		return YamlReader.read(configPath, EmailValidationProperties.class);
	}

	private final ProfileActivator profileActivator;

	@Override
	public ResponseEntityDto validateBusinessEmail(String email) {
		EmailValidationResultDto emailValidationResultDto = new EmailValidationResultDto();
		emailValidationResultDto.setEmail(email);

		validateEmail(email);
		emailValidationResultDto.setIsValid(true);

		return new ResponseEntityDto(false, emailValidationResultDto);
	}

	@Override
	public void checkBusinessEmailValidity(String email) {
		validateEmail(email);
	}

	@Override
	public void validateEmail(String email) {
		if (email == null || email.trim().isEmpty()) {
			throw new ValidationException(EPCommonMessageConstant.EP_COMMON_ERROR_EMPTY_EMAIL);
		}

		if (!Pattern.compile(Validation.EMAIL_REGEX).matcher(email).matches()) {
			throw new ValidationException(EPCommonMessageConstant.EP_COMMON_ERROR_INVALID_EMAIL_FORMAT);
		}

		String domain = extractDomain(email);
		EmailValidationProperties properties = getProperties();

		if (isPersonalDomain(domain, properties)) {
			throw new ValidationException(EPCommonMessageConstant.EP_COMMON_ERROR_PERSONAL_EMAIL);
		}

		if (isTempEmailDomain(domain, properties)) {
			throw new ValidationException(EPCommonMessageConstant.EP_COMMON_ERROR_TEMP_EMAIL);
		}

		if (matchesTempEmailPattern(domain, properties)) {
			throw new ValidationException(EPCommonMessageConstant.EP_COMMON_ERROR_DISPOSABLE_EMAIL);
		}
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
