package com.skapp.enterprise.common.type;

import com.skapp.community.common.type.EmailTemplates;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum EpEmailMainTemplates implements EmailTemplates {

	MAIN_TEMPLATE_NO_BUTTON_V1("main-template-no-button-v1"), MAIN_TEMPLATE_PAYMENT_V1("main-template-payment-v1");

	private final String templateId;

}
