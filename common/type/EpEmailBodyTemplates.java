package com.skapp.enterprise.common.type;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum EpEmailBodyTemplates implements EmailTemplates {

	// Common Module Templates
	COMMON_MODULE_EMAIL_VERIFY("common-module-email-verify"),
	COMMON_MODULE_PASSWORD_RESET_OTP("common-module-password-reset-otp"),
	COMMON_MODULE_SSO_CREATION_TENANT_URL("common-module-sso-creation-tenant-url"),
	COMMON_MODULE_CREDENTIAL_BASED_CREATION_TENANT_URL("common-module-credential-based-creation-tenant-url"),

	// E-Signature Module Templates esignature-module-document-viewer-email
	ESIGNATURE_MODULE_ENVELOPE_CC_EMAIL("esignature-module-document-viewer-email"),
	ESIGNATURE_MODULE_ENVELOPE_SIGNER_EMAIL("esignature-module-document-signer-email"),

	// Payment Templates for stripe
	PAYMENT_STRIPE_PAYMENT_WAS_UNSUCCESSFUL_TRIAL_END_DATE("payment-stripe-payment-was-unsuccessful-trial-end-date"),
	PAYMENT_STRIPE_PAYMENT_WAS_UNSUCCESSFUL_AFTER_3DAYS_AND_5DAYS(
			"payment-stripe-payment-was-unsuccessful-after-3days-and-5days"),
	PAYMENT_STRIPE_PAYMENT_WAS_UNSUCCESSFUL_AFTER_7DAYS("payment-stripe-payment-was-unsuccessful-after-7days"),
	PAYMENT_STRIPE_WELCOME_TO_SKAPP_PRO_FREE_TRIAL("payment-stripe-welcome-to-skapp-pro-free-trial"),
	PAYMENT_STRIPE_FREE_TRIAL_EXPIRES_IN_3DAYS("payment-stripe-free-trial-expires-in-3days"),
	PAYMENT_STRIPE_CONGRATULATIONS_ON_UPGRADING_TO_SKAPP_PRO(
			"payment-stripe-congratulations-on-upgrading-to-skapp-pro");

	private final String templateId;

}
