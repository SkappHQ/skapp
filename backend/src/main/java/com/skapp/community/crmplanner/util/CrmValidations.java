package com.skapp.community.crmplanner.util;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.crmplanner.constant.CrmConstants;
import com.skapp.community.crmplanner.constant.CrmMessageConstant;
import lombok.experimental.UtilityClass;

import java.net.MalformedURLException;
import java.net.URI;
import java.net.URISyntaxException;

@UtilityClass
public class CrmValidations {

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
