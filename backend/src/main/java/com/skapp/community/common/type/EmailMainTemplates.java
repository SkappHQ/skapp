package com.skapp.community.common.type;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum EmailMainTemplates implements EmailTemplates {

	MAIN_TEMPLATE_V1("main-template-v1");

	private final String templateId;

}
