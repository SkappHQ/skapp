package com.skapp.community.crmplanner.constant;

import com.skapp.community.common.constant.MessageConstant;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum CrmMessageConstant implements MessageConstant {

	// Deal error constants
	CRM_ERROR_DEAL_NAME_REQUIRED("api.error.crm.deal.name-required"),
	CRM_ERROR_DEAL_STAGE_ID_REQUIRED("api.error.crm.deal.stage-id-required"),
	CRM_ERROR_DEAL_STAGE_NOT_FOUND("api.error.crm.deal.stage-not-found"),
	CRM_ERROR_DEAL_PRIORITY_NOT_FOUND("api.error.crm.deal.priority-not-found"),
	CRM_ERROR_DEAL_COMPANY_NOT_FOUND("api.error.crm.deal.company-not-found"),
	CRM_ERROR_DEAL_CONTACT_NOT_FOUND("api.error.crm.deal.contact-not-found"),
	CRM_ERROR_DEAL_CONTACT_COMPANY_MISMATCH("api.error.crm.deal.contact-company-mismatch"),
	CRM_ERROR_DEAL_OWNER_NOT_FOUND("api.error.crm.deal.owner-not-found"),
	CRM_ERROR_DEAL_OWNER_INVALID_ROLE("api.error.crm.deal.owner-invalid-role"),
	CRM_ERROR_DEAL_NOT_FOUND("api.error.crm.deal.not-found");

	private final String messageKey;

}
