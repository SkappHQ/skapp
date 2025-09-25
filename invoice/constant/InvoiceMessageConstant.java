package com.skapp.enterprise.invoice.constant;

import com.skapp.community.common.constant.MessageConstant;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum InvoiceMessageConstant implements MessageConstant {

	// Invoice config validation constants
	INVOICE_ERROR_CONFIG_NOT_FOUND("invoice.error.config.not.found"),
	INVOICE_ERROR_VALIDATION_LOGO_URL_INVALID("invoice.error.validation.logo.url.invalid"),
	INVOICE_ERROR_VALIDATION_REQUEST_NULL("invoice.error.validation.request.null"),
	INVOICE_ERROR_VALIDATION_PAYMENT_TERMS_INVALID("invoice.error.validation.payment.terms.invalid"),

	// Customer validation constants
	INVOICE_ERROR_VALIDATION_CUSTOMER_PROJECT_MAPPING_INVALID("validation.error.customer.project-already-exists"),
	INVOICE_ERROR_VALIDATION_CUSTOMER_EMAIL_ALREADY_EXISTS("validation.error.customer.email.already-exists"),
	INVOICE_ERROR_CUSTOMER_NAME_REQUIRED("validation.error.customer.customer-name-required"),
	INVOICE_ERROR_CUSTOMER_NAME_MAX_LENGTH_EXCEEDED("validation.error.customer.customer-name-max-length-exceeded"),
	INVOICE_ERROR_CUSTOMER_NOT_FOUND("ep.invoice.error.customer.not.found"),
	INVOICE_ERROR_CUSTOMER_CONTACT_NAME_REQUIRED("validation.error.customer.customer-contact-name-required"),
	INVOICE_ERROR_CUSTOMER_CONTACT_NAME_MAX_LENGTH_EXCEEDED(
			"validation.error.customer.customer-contact-name-max-length-exceeded"),
	INVOICE_ERROR_CUSTOMER_CONTACT_EMAIL_REQUIRED("validation.error.customer.customer-contact-email-required"),
	INVOICE_ERROR_VALIDATION_CUSTOMER_CONTACT_EMAIL_ALREADY_EXISTS(
			"validation.error.customer.customer-contact-email-already-exists"),
	INVOICE_ERROR_CUSTOMER_CONTACT_NOT_FOUND("ep.invoice.error.customer.contact.not.found"),
	INVOICE_SUCCESS_DELETE_CUSTOMER_CONTACT("api.success.invoice.delete-customer-contact"),

	// Main invoice validation constants
	INVOICE_ERROR_CUSTOMER_ID_REQUIRED("invoice.error.customer.id.required"),
	INVOICE_ERROR_INVOICE_DATE_REQUIRED("invoice.error.invoice.date.required"),
	INVOICE_ERROR_CURRENCY_REQUIRED("invoice.error.currency.required"),
	INVOICE_ERROR_STATUS_REQUIRED("invoice.error.status.required"),
	INVOICE_ERROR_NEGATIVE_DISCOUNT("invoice.error.negative.discount"),
	INVOICE_ERROR_DISCOUNT_PERCENTAGE_EXCEEDED("invoice.error.discount.percentage.exceeded"),
	INVOICE_ERROR_FUTURE_DATE_NOT_ALLOWED("invoice.error.future.date.not.allowed"),
	INVOICE_ERROR_DUE_DATE_BEFORE_INVOICE_DATE("invoice.error.due.date.before.invoice.date"),

	// Invoice items validation constants
	INVOICE_ERROR_ITEMS_REQUIRED("invoice.error.items.required"),
	INVOICE_ERROR_ITEM_NAME_REQUIRED("invoice.error.item.name.required"),
	INVOICE_ERROR_ITEM_QUANTITY_INVALID("invoice.error.item.quantity.invalid"),
	INVOICE_ERROR_ITEM_UNIT_PRICE_INVALID("invoice.error.item.unit.price.invalid"),
	INVOICE_ERROR_ITEM_DISCOUNT_PERCENTAGE_EXCEEDED("invoice.error.item.discount.percentage.exceeded"),
	INVOICE_ERROR_ITEM_DISCOUNT_EXCEEDS_TOTAL("invoice.error.item.discount.exceeds.total"),

	// Invoice expenses validation constants
	INVOICE_ERROR_EXPENSE_NAME_REQUIRED("invoice.error.expense.name.required"),
	INVOICE_ERROR_EXPENSE_CATEGORY_REQUIRED("invoice.error.expense.category.required"),
	INVOICE_ERROR_EXPENSE_DATE_REQUIRED("invoice.error.expense.date.required"),
	INVOICE_ERROR_EXPENSE_AMOUNT_INVALID("invoice.error.expense.amount.invalid"),
	INVOICE_ERROR_EXPENSE_FUTURE_DATE_NOT_ALLOWED("invoice.error.expense.future.date.not.allowed"),

	// Expense attachments validation constants
	INVOICE_ERROR_EXPENSE_ATTACHMENT_URL_REQUIRED("invoice.error.expense.attachment.url.required"),

	// Invoice taxes validation constants
	INVOICE_ERROR_TAX_TYPE_REQUIRED("invoice.error.tax.type.required"),
	INVOICE_ERROR_TAX_PERCENTAGE_INVALID("invoice.error.tax.percentage.invalid"),

	// Invoice filter validation constants
	INVOICE_ERROR_FILTER_SORT_BY_INVALID("invoice.error.filter.sort.by.invalid"),
	INVOICE_ERROR_FILTER_SORT_DIRECTION_INVALID("invoice.error.filter.sort.direction.invalid"),
	INVOICE_ERROR_FILTER_DATE_RANGE_INVALID("invoice.error.filter.date.range.invalid"),
	INVOICE_ERROR_FILTER_DUE_DATE_RANGE_INVALID("invoice.error.filter.due.date.range.invalid"),
	INVOICE_ERROR_FILTER_CUSTOMER_ID_INVALID("invoice.error.filter.customer.id.invalid"),
	INVOICE_ERROR_FILTER_PROJECT_ID_INVALID("invoice.error.filter.project.id.invalid"),

	// Customer document validation constants
	INVOICE_ERROR_CUSTOMER_DOCUMENT_NOT_FOUND("invoice.error.customer.document.not.found"),

	INVOICE_ERROR_FETCHING_INVOICE_TIER_LIMITATIONS("invoice.error.fetching.tier.limitations"),
	INVOICE_ERROR_INVOICE_LIMIT_REACHED("invoice.error.limit.reached"),
	INVOICE_ERROR_INVOICE_FETCHED_FAILED("invoice.error.required.fields.missing"),

	INVOICE_ERROR_INVOICE_NOT_FOUND("invoice.error.not.found"),

	INVOICE_SUCCESS_EMAIL_REMINDER_SENT("invoice.success.email.reminder.sent"),
	INVOICE_ERROR_SENDING_EMAIL_REMINDER("invoice.error.sending.email.reminder"),

	INVOICE_ERROR_INVOICE_ID_INVALID("invoice.error.id.invalid"),

	INVOICE_ERROR_CUSTOMER_DOCUMENT_NAME_REQUIRED("invoice.error.customer.document.name.required"),
	INVOICE_ERROR_CUSTOMER_DOCUMENT_URL_REQUIRED("invoice.error.customer.document.url.required"),
	INVOICE_ERROR_CUSTOMER_DOCUMENT_FILTER_INVALID("invoice.error.customer.document.filter.invalid"),

	INVOICE_ERROR_FETCHING_PROJECTS("ep.invoice.error.fetching.projects"),
	INVOICE_ERROR_FETCHING_PROJECTS_FROM_SOURCE("ep.invoice.error.fetching.projects.from.source"),

	INVOICE_ERROR_PDF_TEMPLATE_NOT_FOUND("ep.invoice.pdf.template.not.found"),

	INVOICE_ERROR_INVOICE_REMINDER_SUBJECT_REQUIRED("invoice.error.invoice.reminder.subject.required"),
	INVOICE_ERROR_INVOICE_REMINDER_BODY_REQUIRED("invoice.error.invoice.reminder.body.required"),
	INVOICE_ERROR_INVOICE_REMINDER_TO_REQUIRED("invoice.error.reminder.to.required");

	INVOICE_ERROR_PROJECT_ID_REQUIRED("invoice.error.project.id.required"),
	INVOICE_ERROR_CUSTOMER_PROJECT_NOT_FOUND("invoice.error.customer.project.not.found"),

	INVOICE_ERROR_BILLABLE_RATE_NOT_FOUND("invoice.error.project.member.billable.data.not.found");


	private final String messageKey;

}
