package com.skapp.community.crmplanner.constant;

import com.skapp.community.common.constant.MessageConstant;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum CrmMessageConstant implements MessageConstant {

	CRM_ERROR_CONTACT_NAME_REQUIRED("api.error.crm.contact-name-required"),
	CRM_ERROR_CONTACT_NAME_TOO_LONG("api.error.crm.contact-name-too-long"),
	CRM_ERROR_CONTACT_EMAIL_REQUIRED("api.error.crm.contact-email-required"),
	CRM_ERROR_CONTACT_EMAIL_ALREADY_EXISTS("api.error.crm.contact-email-already-exists"),
	CRM_ERROR_COMPANY_NOT_FOUND("api.error.crm.company-not-found"),
	CRM_ERROR_OWNER_NOT_FOUND("api.error.crm.owner-not-found"),
	CRM_ERROR_OWNER_INACTIVE("api.error.crm.owner-inactive"),
	CRM_ERROR_OWNER_INVALID_ROLE("api.error.crm.owner-invalid-role"),
	CRM_ERROR_OWNER_ASSIGNMENT_DENIED("api.error.crm.owner-assignment-denied"),
	CRM_ERROR_CONTACT_NOT_FOUND("api.error.crm.contact-not-found"),
	CRM_ERROR_CONTACT_ALREADY_DELETED("api.error.crm.contact-already-deleted"),
	CRM_ERROR_CONTACT_EDIT_DENIED("api.error.crm.contact-edit-denied"),
	CRM_ERROR_TASK_TYPE_NOT_FOUND("api.error.crm.task-type-not-found"),
	CRM_ERROR_PRIORITY_NOT_FOUND("api.error.crm.priority-not-found"),
	CRM_ERROR_DEAL_STAGE_NOT_FOUND("api.error.crm.deal-stage-not-found"),
	CRM_ERROR_DEAL_NOT_FOUND("api.error.crm.deal-not-found"),
	CRM_SUCCESS_CONTACT_CREATED("api.success.crm.contact-created"),
	CRM_SUCCESS_CONTACT_DELETED("api.success.crm.contact-deleted"),
	CRM_SUCCESS_CONTACT_UPDATED("api.success.crm.contact-updated"),
	CRM_SUCCESS_TASK_CREATED("api.success.crm.task-created"),
	CRM_SUCCESS_DEAL_CREATED("api.success.crm.deal-created");

	private final String messageKey;

}
