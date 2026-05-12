package com.skapp.community.crmplanner.constant;

import com.skapp.community.common.constant.MessageConstant;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum CrmMessageConstant implements MessageConstant {

	CRM_SUCCESS_CONTACT_CREATED("api.success.crm.contact-created"),

	CRM_ERROR_CONTACT_NAME_REQUIRED("api.error.crm.contact-name-required"),
	CRM_ERROR_CONTACT_EMAIL_REQUIRED("api.error.crm.contact-email-required"),
	CRM_ERROR_CONTACT_NAME_LENGTH_EXCEEDED("api.error.crm.contact-name-length-exceeded"),
	CRM_ERROR_CONTACT_NAME_INVALID("api.error.crm.contact-name-invalid"),
	CRM_ERROR_CONTACT_EMAIL_ALREADY_EXISTS("api.error.crm.contact-email-already-exists"),
	CRM_ERROR_COMPANY_NOT_FOUND("api.error.crm.company-not-found"),
	CRM_ERROR_OWNER_NOT_FOUND("api.error.crm.owner-not-found"),
	CRM_ERROR_OWNER_INACTIVE("api.error.crm.owner-inactive"),
	CRM_ERROR_OWNER_INVALID_ROLE("api.error.crm.owner-invalid-role"),
	CRM_ERROR_OWNER_ASSIGNMENT_DENIED("api.error.crm.owner-assignment-denied");

	private final String messageKey;

}
