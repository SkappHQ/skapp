package com.skapp.community.crmplanner.service.impl;

import com.skapp.community.common.exception.ValidationException;
import com.skapp.community.crmplanner.constant.CrmConstants;
import com.skapp.community.crmplanner.constant.CrmMessageConstant;
import com.skapp.community.crmplanner.payload.request.CrmContactCreateRequestDto;
import com.skapp.community.crmplanner.repository.CrmContactDao;
import com.skapp.community.crmplanner.service.CrmContactValidationService;
import com.skapp.community.peopleplanner.util.Validations;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class CrmContactValidationServiceImpl implements CrmContactValidationService {

	private static final Pattern CONTACT_NAME_PATTERN = Pattern.compile(CrmConstants.CONTACT_NAME_REGEX);

	private final CrmContactDao crmContactDao;

	@Override
	public void validateCreateContactRequest(CrmContactCreateRequestDto requestDto) {
		validateName(requestDto.getName());
		validateEmail(requestDto.getEmail());
		validateContactNumber(requestDto.getContactNumber());
	}

	private void validateName(String name) {
		if (name == null || name.trim().isEmpty()) {
			throw new ValidationException(CrmMessageConstant.CRM_ERROR_CONTACT_NAME_REQUIRED);
		}

		String trimmedName = name.trim();
		if (trimmedName.length() > CrmConstants.CONTACT_NAME_MAX_LENGTH) {
			throw new ValidationException(CrmMessageConstant.CRM_ERROR_CONTACT_NAME_LENGTH_EXCEEDED,
					new Object[] { CrmConstants.CONTACT_NAME_MAX_LENGTH });
		}

		if (!CONTACT_NAME_PATTERN.matcher(trimmedName).matches()) {
			throw new ValidationException(CrmMessageConstant.CRM_ERROR_CONTACT_NAME_INVALID);
		}
	}

	private void validateEmail(String email) {
		if (email == null || email.trim().isEmpty()) {
			throw new ValidationException(CrmMessageConstant.CRM_ERROR_CONTACT_EMAIL_REQUIRED);
		}

		String normalizedEmail = email.trim().toLowerCase();
		Validations.validateEmail(normalizedEmail);

		if (crmContactDao.existsByEmailIgnoreCaseAndIsDeletedFalse(normalizedEmail)) {
			throw new ValidationException(CrmMessageConstant.CRM_ERROR_CONTACT_EMAIL_ALREADY_EXISTS);
		}
	}

	private void validateContactNumber(String contactNumber) {
		if (contactNumber == null || contactNumber.trim().isEmpty()) {
			return;
		}

		Validations.validateContactNo(contactNumber.trim());
	}

}
