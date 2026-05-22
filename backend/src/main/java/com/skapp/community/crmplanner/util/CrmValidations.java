package com.skapp.community.crmplanner.util;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.exception.ValidationException;
import com.skapp.community.crmplanner.constant.CrmConstants;
import com.skapp.community.crmplanner.constant.CrmMessageConstant;
import com.skapp.community.crmplanner.payload.request.CrmContactCreateRequestDto;
import com.skapp.community.peopleplanner.util.Validations;
import lombok.experimental.UtilityClass;

import java.net.MalformedURLException;
import java.net.URI;
import java.net.URISyntaxException;

@UtilityClass
public class CrmValidations {

	public static void validateOwnerId(Long ownerId) {
		if (ownerId == null) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_OWNER_NOT_FOUND);
		}
	}

	public static void validateCompanyId(Long companyId) {
		if (companyId == null) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_COMPANY_NOT_FOUND);
		}
	}

	public static void validateContactName(String name) {
		if (name == null || name.isBlank()) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_CONTACT_NAME_REQUIRED);
		}

		if (name.trim().length() > CrmConstants.CONTACT_NAME_MAX_LENGTH) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_CONTACT_NAME_TOO_LONG);
		}

		if (!name.trim().matches(CrmConstants.CONTACT_NAME_REGEX)) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_CONTACT_NAME_INVALID);
		}
	}

	public static void validateContactEmail(String email) {
		if (email == null || email.isBlank()) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_CONTACT_EMAIL_REQUIRED);
		}

		try {
			Validations.validateEmail(email.trim());
		}
		catch (ValidationException e) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_CONTACT_EMAIL_INVALID);
		}
	}

	public static void validateCompanyName(String name) {
		if (name == null || name.isBlank()) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_COMPANY_NAME_REQUIRED);
		}

		if (name.length() > CrmConstants.COMPANY_NAME_MAX_LENGTH) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_COMPANY_NAME_TOO_LONG);
		}
	}

	public static void validateContactNumber(String contactNumber) {
		if (contactNumber == null || contactNumber.isBlank()) {
			return;
		}

		if (contactNumber.length() > CrmConstants.PHONE_MAX_LENGTH) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_CONTACT_NUMBER_INVALID);
		}
	}

	public static void validateWebsite(String website) {
		if (website == null || website.isBlank()) {
			return;
		}

		if (website.length() > CrmConstants.CHARACTER_MAX_LENGTH) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_WEBSITE_INVALID);
		}

		try {
			URI uri = new URI(website);
			if (!uri.isAbsolute()) {
				throw new ModuleException(CrmMessageConstant.CRM_ERROR_WEBSITE_INVALID);
			}
			uri.toURL();
		}
		catch (MalformedURLException | URISyntaxException | IllegalArgumentException e) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_WEBSITE_INVALID);
		}
	}

	public static void validateAddress(String address) {
		if (address == null || address.isBlank()) {
			return;
		}

		if (address.length() > CrmConstants.ADDRESS_MAX_LENGTH) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_ADDRESS_TOO_LONG);
		}
	}

	public static void validateIndustry(String industry) {
		if (industry == null || industry.isBlank()) {
			return;
		}

		if (industry.length() > CrmConstants.CHARACTER_MAX_LENGTH) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_INDUSTRY_TOO_LONG);
		}
	}

}
