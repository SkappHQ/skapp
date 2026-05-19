package com.skapp.community.crmplanner.constant;

import com.skapp.community.common.constant.MessageConstant;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum CrmMessageConstant implements MessageConstant {

	// Error message constants
	CRM_ERROR_COMPANY_NAME_REQUIRED("api.error.crm.validation.name"),
	CRM_ERROR_COMPANY_NAME_TOO_LONG("api.error.crm.validation.company-name-length"),
	CRM_ERROR_CONTACT_NUMBER_INVALID("api.error.crm.validation.contact-number"),
	CRM_ERROR_WEBSITE_INVALID("api.error.crm.validation.website"),
	CRM_ERROR_ADDRESS_TOO_LONG("api.error.crm.validation.address-length"),
	CRM_ERROR_INDUSTRY_TOO_LONG("api.error.crm.validation.industry-length"),
	CRM_ERROR_COMPANY_EXISTS("api.error.crm.company-name-exists");

	private final String messageKey;

}
