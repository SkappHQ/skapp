package com.skapp.enterprise.common.type;

import com.skapp.community.common.type.EmailTemplates;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum EpEmailBodyTemplates implements EmailTemplates {

	// Common Module Templates
	COMMON_MODULE_EMAIL_VERIFY("common-module-email-verify"),
	COMMON_MODULE_PASSWORD_RESET_OTP("common-module-password-reset-otp"),
	COMMON_MODULE_GOOGLE_SSO_CREATION_TENANT_URL("common-module-google-sso-creation-tenant-url"),
	COMMON_MODULE_MICROSOFT_SSO_CREATION_TENANT_URL("common-module-microsoft-sso-creation-tenant-url"),
	COMMON_MODULE_CREDENTIAL_BASED_CREATION_TENANT_URL("common-module-credential-based-creation-tenant-url"),

	// E-Signature Module Templates esignature-module-document-viewer-email
	ESIGNATURE_MODULE_ENVELOPE_CC_EMAIL("esignature-module-document-viewer-email"),
	ESIGNATURE_MODULE_ENVELOPE_SIGNER_EMAIL("esignature-module-document-signer-email"),
	ESIGNATURE_MODULE_ENVELOPE_VOIDED_RECIEVER_EMAIL("esignature-module-document-voided-reciever"),
	ESIGNATURE_MODULE_ENVELOPE_VOIDED_SENDER_EMAIL("esignature-module-document-voided-sender"),
	ESIGNATURE_MODULE_ENVELOPE_DECLINED_RECIEVER_EMAIL("esignature-module-document-declined-reciever"),
	ESIGNATURE_MODULE_ENVELOPE_DECLINED_SENDER_EMAIL("esignature-module-document-declined-sender"),
	ESIGNATURE_MODULE_ENVELOPE_EMAIL_REMINDER("esignature-module-document-signer-email-reminder"),
	ESIGNATURE_MODULE_ENVELOPE_COMPLETED_RECEIVER_EMAIL("esignature-module-document-completed-receiver"),
	ESIGNATURE_MODULE_ENVELOPE_COMPLETED_SENDER_EMAIL("esignature-module-document-completed-sender"),

	// Payment Templates for stripe
	PAYMENT_STRIPE_WELCOME_TO_SKAPP_CORE_FREE_TRIAL("payment-stripe-welcome-to-skapp-core-free-trial"),
	PAYMENT_STRIPE_CONGRATULATIONS_ON_UPGRADING_TO_SKAPP_CORE(
			"payment-stripe-congratulations-on-upgrading-to-skapp-core"),
	PAYMENT_STRIPE_CANCEL_SUBSCRIPTION("payment-stripe-cancel-subscription"),

	// Dashboard Templates
	DASHBOARD_MODULE_NEW_ORGANIZATION_CREATED("dashboard-module-new-organization-created"),
	DASHBOARD_MODULE_NEW_ORGANIZATION_STARTED_CORE_FREE_TRIAL(
			"dashboard-module-new-organization-started-core-free-trial"),
	DASHBOARD_MODULE_TRIAL_ORGANIZATION_CONVERTED_TO_CORE("dashboard-module-trial-organization-converted-to-core"),
	DASHBOARD_MODULE_ORGANIZATION_CANCELLED_CORE("dashboard-module-organization-cancelled-core"),
	DASHBOARD_MODULE_SUPPORT_REQUEST_APPLIED("dashboard-module-support-request-applied");

	private final String templateId;

}
