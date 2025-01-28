package com.skapp.enterprise.common.constant;

import com.skapp.community.common.constant.MessageConstant;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum EPCommonMessageConstant implements MessageConstant {

	EP_COMMON_ERROR_INVALID_LOGIN_METHOD("ep.common.error.invalid-login-method"),
	EP_COMMON_ERROR_TENANT_NOT_PRESENT("ep.common.error.tenant-not-present"),
	EP_COMMON_ERROR_TENANT_CONTEXT_ERROR("ep.common.error.tenant-context-error"),
	EP_COMMON_ERROR_TENANT_NOT_FOUND("ep.common.error.tenant-not-found"),
	EP_COMMON_ERROR_TENANT_ALREADY_EXISTS("ep.common.error.tenant-already-exists"),
	EP_COMMON_ERROR_TENANT_CREATION_ERROR("ep.common.error.tenant-creation-error"),
	EP_COMMON_ERROR_TENANT_CREATION_UNEXPECTED_ERROR("ep.common.error.tenant-creation-unexpected-error"),
	EP_COMMON_ERROR_MIGRATION_FAILED_TO_TENANT("ep.common.error.migration-failed-to-tenant"),
	EP_COMMON_ERROR_SWITCH_TO_MASTER_FAILED("ep.common.error.switch-to-master-failed"),
	EP_COMMON_ERROR_COULD_NOT_ALTER_CONNECTION_TO_SPECIFIED_TENANT(
			"ep.common.error.could-not-alter-connection-to-specified-tenant"),
	EP_COMMON_ERROR_COMPANY_DOMAIN_REQUIRED("ep.common.error.company-domain-required"),
	EP_COMMON_ERROR_COMPANY_DOMAIN_LENGTH_EXCEEDED("ep.common.error.company-domain-length-exceeded"),
	EP_COMMON_ERROR_COMPANY_DOMAIN_INVALID("ep.common.error.company-domain-invalid"),
	EP_COMMON_ERROR_NO_HOSTED_ZONES_FOUND("ep.common.error.no-hosted-zones-found"),
	EP_COMMON_ERROR_FETCHING_HOSTED_ZONE_ID("ep.common.error.fetching-hosted-zone-id"),
	EP_COMMON_ERROR_HOSTED_ZONE_NOT_FOUND("ep.common.error.hosted-zone-not-found"),
	EP_COMMON_ERROR_CREATING_SUBDOMAIN("ep.common.error.creating-subdomain"),
	EP_COMMON_ERROR_SUBDOMAIN_ALREADY_EXISTS("ep.common.error.subdomain-already-exists"),
	EP_COMMON_ERROR_SUBDOMAIN_NOT_FOUND("ep.common.error.subdomain-not-found"),
	EP_COMMON_ERROR_DELETING_SUBDOMAIN("ep.common.error.deleting-subdomain"),
	EP_COMMON_ERROR_INVALID_SUBDOMAIN("ep.common.error.invalid-subdomain"),
	EP_COMMON_ERROR_RESTRICTED_SUBDOMAIN("ep.common.error.restricted-subdomain"),
	EP_COMMON_ERROR_CHECKING_SUBDOMAIN("ep.common.error.checking-subdomain"),
	EP_COMMON_ERROR_ROUTE53_CHANGE_FAILED("ep.common.error.route53-change-failed"),
	EP_COMMON_ERROR_ROUTE53_CHANGE_INTERRUPTED("ep.common.error.route53-change-interrupted"),
	EP_COMMON_ERROR_ORGANIZATION_CREATE("ep.common.error.organization-create-error"),
	EP_COMMON_ERROR_DELETING_TENANT("ep.common.error.delete-tenant-error"),
	EP_COMMON_ERROR_ORGANIZATION_CLEANUP_FAILED("ep.common.error.organization-cleanup-failed"),
	EP_COMMON_ERROR_EMAIL_TEMPLATE_NOT_FOUND("ep.common.error.email-template-not-found"),
	EP_COMMON_ERROR_SUPER_ADMIN_NOR_FOUND("ep.common.error.super-admin-not-found"),
	EP_COMMON_SUCCESS_OTP_GENERATED_AND_SEND("ep.common.success.otp-generated-and-send"),
	EP_COMMON_ERROR_OTP_GENERATION_OR_SEND("ep.common.error.otp-generation-or-send-failed"),
	EP_COMMON_ERROR_INVALID_OR_EXPIRED_OTP("ep.common.error.invalid-or-expired-otp"),
	EP_COMMON_SUCCESS_OTP_VERIFIED("ep.common.success.otp-verified"),
	EP_COMMON_ERROR_OTP_VERIFICATION("ep.common.error.otp-verification-failed"),
	EP_COMMON_ERROR_CHECKING_DOMAIN_AVAILABILITY("ep.common.error.checking-domain-availability"),
	EP_COMMON_ERROR_COMPANY_DOMAIN_NOT_AVAILABLE("ep.common.error.company-domain-not-available"),
	EP_COMMON_SUCCESS_RECAPTCHA_VALID("ep.common.success.recaptcha-valid"),
	EP_COMMON_ERROR_RECAPTCHA_INVALID("ep.common.error.recaptcha-invalid"),
	EP_COMMON_ERROR_VALIDATION_RECAPTCHA_INVALID("ep.common.error.validation-recaptcha-invalid"),
	EP_COMMON_ERROR_VALIDATE_GOOGLE_TOKEN("ep.common.error.validate-google-token"),
	EP_COMMON_ERROR_GOOGLE_CONNECTION("ep.common.error.google-connection-error"),
	EP_COMMON_ERROR_TENANT_CREATE_FAILED("ep.common.error.tenant-create-failed"),
	EP_COMMON_ERROR_TENANT_DELETE_FAILED("ep.common.error.tenant-delete-failed"),
	EP_COMMON_ERROR_INVALID_TENANT("ep.common.error.invalid-tenant-id"),
	EP_COMMON_ERROR_COULD_NOT_REMOVE_TENANT("ep.common.error.could-not-remove-tenant"),
	EP_COMMON_ERROR_OTP_NOT_FOUND("ep.common.error.otp-not-found"),
	EP_COMMON_ERROR_USER_NOT_FOUND("ep.common.error.user-not-found"),
	EP_COMMON_ERROR_OTP_ALREADY_VERIFIED("ep.common.error.otp-already-verified"),
	EP_COMMON_ERROR_FREE_USER_LIMIT_EXCEEDED("ep.common.error.free-user-limit-exceeded"),
	EP_COMMON_ERROR_TENANT_ID_NOT_FOUND("ep.common.error.tenant-id-not-found"),
	EP_COMMON_ERROR_TENANT_HEADER_MISSING("ep.common.error.tenant-header-missing"),
	EP_COMMON_ERROR_SELECTED_MODULES_CANNOT_BE_NULL("ep.common.error.selected-modules-cannot-be-null"),
	EP_COMMON_ERROR_INVALID_MODULE_TYPE("ep.common.error.invalid-module-type"),
	EP_COMMON_ERROR_MODULES_ALREADY_EXIST("ep.common.error.modules-already-exist"),
	EP_COMMON_ERROR_INVALID_MODULE_STATUS("ep.common.error.invalid-module-status"),
	EP_COMMON_ERROR_MODULE_ALREADY_SELECTED("ep.common.error.module-already-selected"),
	EP_COMMON_ERROR_MODULE_ALREADY_DESELECTED("ep.common.error.module-already-deselected"),
	EP_COMMON_ERROR_TENANT_NAME_REQUIRED("ep.common.error.tenant-name-required"),
	EP_COMMON_ERROR_CALENDAR_CONFIG_NOT_FOUND("ep.common.error.calendar-config-not-found"),
	EP_COMMON_ERROR_JSON_STRING_TO_OBJECT_CONVERSION_FAILED("ep.common.error.json-string-conversion-failed"),;

	private final String messageKey;

}
