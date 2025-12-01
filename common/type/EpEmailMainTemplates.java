package com.skapp.enterprise.common.type;

import com.skapp.community.common.type.EmailTemplates;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum EpEmailMainTemplates implements EmailTemplates {

	MAIN_TEMPLATE_NO_BUTTON_V1("main-template-no-button-v1"), MAIN_TEMPLATE_PAYMENT_V1("main-template-payment-v1"),
	DASHBOARD_MAIN_TEMPLATE_V1("dashboard-main-template-v1"), ESIGN_SENDER_TEMPLATE_V1("esignature-sender-template-v1"),
	ESIGN_RECEIVER_TEMPLATE_V1("esignature-receiver-template-v1"),
	ESIGN_RECEIVER_TEMPLATE_NO_BUTTON_V1("esignature-receiver-template-no-button-v1"),
	INVOICE_MAIN_TEMPLATE_V1("invoice-main-template-v1"), MAIN_TEMPLATE_GUEST_V1("main-template-guest-v1");

	private final String templateId;

}
