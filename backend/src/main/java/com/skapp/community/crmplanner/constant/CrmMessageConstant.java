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
	CRM_ERROR_DEAL_DESCRIPTION_TOO_LONG("api.error.crm.deal.description-too-long"),
	CRM_ERROR_DEAL_AMOUNT_INVALID("api.error.crm.deal.amount-invalid"),
	CRM_ERROR_DEAL_AMOUNT_TOO_LONG("api.error.crm.deal.amount-too-long"),
	CRM_ERROR_DEAL_STAGE_ID_REQUIRED("api.error.crm.deal.stage-id-required"),
	CRM_ERROR_DEAL_CONTACT_NOT_FOUND("api.error.crm.deal.contact-not-found"),
	CRM_ERROR_DEAL_OWNER_NOT_FOUND("api.error.crm.deal.owner-not-found"),
	CRM_ERROR_DEAL_OWNER_INVALID_ROLE("api.error.crm.deal.owner-invalid-role"),
	CRM_ERROR_CONTACT_NAME_REQUIRED("api.error.crm.contact-name-required"),
	CRM_ERROR_CONTACT_NAME_TOO_LONG("api.error.crm.contact-name-too-long"),
	CRM_ERROR_CONTACT_NAME_INVALID("api.error.crm.contact-name-invalid"),
	CRM_ERROR_CONTACT_EMAIL_REQUIRED("api.error.crm.contact-email-required"),
	CRM_ERROR_CONTACT_EMAIL_INVALID("api.error.crm.contact-email-invalid"),
	CRM_ERROR_CONTACT_EMAIL_ALREADY_EXISTS("api.error.crm.contact-email-already-exists"),
	CRM_ERROR_COMPANY_NOT_FOUND("api.error.crm.company-not-found"),
	CRM_ERROR_OWNER_NOT_FOUND("api.error.crm.owner-not-found"),
	CRM_ERROR_OWNER_INACTIVE("api.error.crm.owner-inactive"),
	CRM_ERROR_OWNER_INVALID_ROLE("api.error.crm.owner-invalid-role"),
	CRM_ERROR_OWNER_ASSIGNMENT_DENIED("api.error.crm.owner-assignment-denied"),
	CRM_ERROR_CONTACT_NOT_FOUND("api.error.crm.contact-not-found"),
	CRM_ERROR_CONTACT_EDIT_DENIED("api.error.crm.contact-edit-denied"),
	CRM_ERROR_TASK_TYPE_ID_REQUIRED("api.error.crm.task-type-id-required"),
	CRM_ERROR_TASK_NAME_REQUIRED("api.error.crm.task-name-required"),
	CRM_ERROR_TASK_NAME_TOO_LONG("api.error.crm.task-name-too-long"),
	CRM_ERROR_TASK_TARGET_REQUIRED("api.error.crm.task-target-required"),
	CRM_ERROR_TASK_DUE_DATE_REQUIRED("api.error.crm.task-due-date-required"),
	CRM_ERROR_TASK_DUE_DATE_IN_PAST("api.error.crm.task-due-date-in-past"),
	CRM_ERROR_TASK_NOTES_TOO_LONG("api.error.crm.task-notes-too-long"),
	CRM_ERROR_PRIORITY_NOT_FOUND("api.error.crm.priority-not-found"),
	CRM_ERROR_DEAL_STAGE_NOT_FOUND("api.error.crm.deal-stage-not-found"),
	CRM_ERROR_DEAL_NOT_FOUND("api.error.crm.deal-not-found"),
	CRM_ERROR_COMPANY_NAME_REQUIRED("api.error.crm.validation.name"),
	CRM_ERROR_COMPANY_NAME_TOO_LONG("api.error.crm.validation.company-name-length"),
	CRM_ERROR_CONTACT_NUMBER_INVALID("api.error.crm.validation.contact-number"),
	CRM_ERROR_WEBSITE_INVALID("api.error.crm.validation.website"),
	CRM_ERROR_ADDRESS_TOO_LONG("api.error.crm.validation.address-length"),
	CRM_ERROR_INDUSTRY_INVALID("api.error.crm.validation.industry-invalid"),
	CRM_ERROR_COMPANY_EXISTS("api.error.crm.company-name-exists"),
	CRM_ERROR_COMPANY_ALREADY_DELETED("api.error.crm.company-already-deleted"),
	CRM_ERROR_TASK_NOT_FOUND("api.error.crm.task-not-found"),
	CRM_ERROR_TASK_TYPE_NOT_FOUND("api.error.crm.task-type-not-found"),
	CRM_ERROR_TASK_STATUS_REQUIRED("api.error.crm.task-status-required"),
	CRM_ERROR_TASK_EDIT_DENIED("api.error.crm.task-edit-denied"),
	CRM_ERROR_TASK_CONTACT_COMPANY_MISMATCH("api.error.crm.task.contact-company-mismatch"),
	CRM_ERROR_TASK_DEAL_CONTACT_MISMATCH("api.error.crm.task.deal-contact-mismatch"),
	CRM_ERROR_TASK_DEAL_COMPANY_MISMATCH("api.error.crm.task.deal-company-mismatch"),
	CRM_SUCCESS_CONTACT_CREATED("api.success.crm.contact-created"),
	CRM_SUCCESS_CONTACT_DELETED("api.success.crm.contact-deleted"),
	CRM_SUCCESS_CONTACT_UPDATED("api.success.crm.contact-updated"),
	CRM_SUCCESS_TASK_CREATED("api.success.crm.task-created"), CRM_SUCCESS_DEAL_CREATED("api.success.crm.deal-created"),
	CRM_SUCCESS_COMPANY_DELETED("api.success.crm.company-deleted"),
	CRM_ERROR_DEAL_INVALID_NEIGHBOUR("api.error.crm.deal.invalid-neighbour"),
	CRM_ERROR_DEAL_NEIGHBOUR_STAGE_MISMATCH("api.error.crm.deal.neighbour-stage-mismatch"),
	CRM_ERROR_DEAL_ID_REQUIRED("api.error.crm.deal.id-required"),
	CRM_ERROR_DEAL_EDIT_DENIED("api.error.crm.deal.edit-denied"),
	CRM_ERROR_DEAL_ORDER_NEIGHBOURS_REQUIRED("api.error.crm.deal.order-neighbours-required"),
	CRM_SUCCESS_DEAL_DELETED("api.success.crm.deal-deleted");

	private final String messageKey;

}
