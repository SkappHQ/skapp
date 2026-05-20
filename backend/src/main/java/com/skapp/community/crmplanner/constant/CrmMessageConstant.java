package com.skapp.community.crmplanner.constant;

import com.skapp.community.common.constant.MessageConstant;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum CrmMessageConstant implements MessageConstant {

	// Deal error constants
	CRM_ERROR_DEAL_NAME_REQUIRED("api.error.crm.deal.name-required"),
	CRM_ERROR_DEAL_NAME_TOO_LONG("api.error.crm.deal.name-too-long"),
	CRM_ERROR_DEAL_NAME_INVALID_CHARS("api.error.crm.deal.name-invalid-chars"),
	CRM_ERROR_DEAL_STAGE_ID_REQUIRED("api.error.crm.deal.stage-id-required"),
	CRM_ERROR_DEAL_STAGE_NOT_FOUND("api.error.crm.deal.stage-not-found"),
	CRM_ERROR_DEAL_COMPANY_NOT_FOUND("api.error.crm.deal.company-not-found"),
	CRM_ERROR_DEAL_CONTACT_NOT_FOUND("api.error.crm.deal.contact-not-found"),
	CRM_ERROR_DEAL_CONTACT_COMPANY_MISMATCH("api.error.crm.deal.contact-company-mismatch"),
	CRM_ERROR_DEAL_OWNER_NOT_FOUND("api.error.crm.deal.owner-not-found"),
	CRM_ERROR_DEAL_OWNER_INVALID_ROLE("api.error.crm.deal.owner-invalid-role"),
	CRM_ERROR_DEAL_NOT_FOUND("api.error.crm.deal.not-found"),
	CRM_ERROR_COMPANY_NAME_REQUIRED("api.error.crm.validation.name"),
	CRM_ERROR_COMPANY_NAME_TOO_LONG("api.error.crm.validation.company-name-length"),
	CRM_ERROR_CONTACT_NUMBER_INVALID("api.error.crm.validation.contact-number"),
	CRM_ERROR_WEBSITE_INVALID("api.error.crm.validation.website"),
	CRM_ERROR_ADDRESS_TOO_LONG("api.error.crm.validation.address-length"),
	CRM_ERROR_INDUSTRY_TOO_LONG("api.error.crm.validation.industry-length"),
	CRM_ERROR_COMPANY_EXISTS("api.error.crm.company-name-exists");

	private final String messageKey;

}
