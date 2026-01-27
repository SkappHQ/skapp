package com.skapp.enterprise.ai.service;

import com.skapp.enterprise.ai.payload.request.DailyTokenUsageRequestDto;
import com.skapp.enterprise.ai.payload.response.DailyTokenUsageResponseDto;

public interface AITokenService {

	DailyTokenUsageResponseDto updateChatbotDailyUsage(DailyTokenUsageRequestDto dailyTokenUsageRequestDto);

	DailyTokenUsageResponseDto getChatbotDailyUsageByCurrentUser();

}
