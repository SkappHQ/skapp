package com.skapp.community.okrplanner.constant;

import com.skapp.community.common.constant.MessageConstant;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum OkrMessageConstant implements MessageConstant {

	// Success messages
	OKR_SUCCESS_OKR_CONFIG_UPDATED("api.success.okr.config.updated");

	// Error messages

	private final String messageKey;

}
