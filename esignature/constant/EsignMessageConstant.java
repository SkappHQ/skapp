package com.skapp.enterprise.esignature.constant;

import com.skapp.community.common.constant.MessageConstant;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum EsignMessageConstant implements MessageConstant {

	ESIGN_ERROR_EXTERNAL_USER_EXITS("ep.esign.error.external-user-exists");

	private final String messageKey;

}
