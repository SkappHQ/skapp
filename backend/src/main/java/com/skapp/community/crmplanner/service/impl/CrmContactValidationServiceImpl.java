package com.skapp.community.crmplanner.service.impl;

import com.skapp.community.common.exception.ValidationException;
import com.skapp.community.crmplanner.constant.CrmMessageConstant;
import com.skapp.community.crmplanner.payload.request.CrmContactCreateRequestDto;
import com.skapp.community.crmplanner.repository.CrmContactDao;
import com.skapp.community.crmplanner.service.CrmContactValidationService;
import com.skapp.community.peopleplanner.util.Validations;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Locale;

@Service
@RequiredArgsConstructor
public class CrmContactValidationServiceImpl implements CrmContactValidationService {

	private final CrmContactDao crmContactDao;

	@Override
	public void validateCreateContactRequest(CrmContactCreateRequestDto requestDto) {
		validateName(requestDto.getName());
		validateEmail(requestDto.getEmail());
		validateContactNumber(requestDto.getContactNumber());
	}

	private static final int MAX_NAME_LENGTH = 255;

	private void validateName(String name) {
		if (name == null || name.trim().isEmpty()) {
			throw new ValidationException(CrmMessageConstant.CRM_ERROR_CONTACT_NAME_REQUIRED);
		}
		if (name.trim().length() > MAX_NAME_LENGTH) {
			throw new ValidationException(CrmMessageConstant.CRM_ERROR_CONTACT_NAME_TOO_LONG);
		}
	}

	private void validateEmail(String email) {
		if (email == null || email.trim().isEmpty()) {
			throw new ValidationException(CrmMessageConstant.CRM_ERROR_CONTACT_EMAIL_REQUIRED);
		}

		String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);
		Validations.validateEmail(normalizedEmail);

		boolean emailExists = crmContactDao.existsByEmailIgnoreCaseAndIsDeletedFalse(normalizedEmail);

		if (emailExists) {
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
