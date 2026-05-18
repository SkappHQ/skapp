package com.skapp.community.crmplanner.constant;

import com.skapp.community.common.constant.MessageConstant;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum CrmMessageConstant implements MessageConstant {

	// Deal error constants
	CRM_ERROR_DEAL_NAME_REQUIRED("crm.error.deal.name-required"),
	CRM_ERROR_DEAL_STAGE_ID_REQUIRED("crm.error.deal.stage-id-required"),
	CRM_ERROR_DEAL_STAGE_NOT_FOUND("crm.error.deal.stage-not-found"),
	CRM_ERROR_DEAL_PRIORITY_NOT_FOUND("crm.error.deal.priority-not-found"),
	CRM_ERROR_DEAL_COMPANY_NOT_FOUND("crm.error.deal.company-not-found"),
	CRM_ERROR_DEAL_CONTACT_NOT_FOUND("crm.error.deal.contact-not-found"),
	CRM_ERROR_DEAL_OWNER_NOT_FOUND("crm.error.deal.owner-not-found"),
	CRM_ERROR_DEAL_NOT_FOUND("crm.error.deal.not-found");

	private final String messageKey;

}
