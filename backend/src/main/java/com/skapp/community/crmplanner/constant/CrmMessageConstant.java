package com.skapp.community.crmplanner.constant;

import com.skapp.community.common.constant.MessageConstant;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum CrmMessageConstant implements MessageConstant {

	CRM_ERROR_VALIDATION_NAME("api.error.crm.validation.name"),

	CRM_ERROR_COMPANY_EXISTS("api.error.crm.company-name-exists");

	private final String messageKey;

}
