package com.skapp.enterprise.ai.constant;

import com.skapp.community.common.constant.MessageConstant;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum AIMessageConstant implements MessageConstant {

	AI_ERROR_CHATBOT_DAILY_USAGE_REQUIRED("ai.error.chatbot-daily-usage-required"),
	AI_ERROR_CHATBOT_DAILY_USAGE_MUST_BE_NON_NEGATIVE("ai.error.chatbot-daily-usage-must-be-non-negative");

	private final String messageKey;

}
