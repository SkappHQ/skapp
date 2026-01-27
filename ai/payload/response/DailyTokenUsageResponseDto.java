package com.skapp.enterprise.ai.payload.response;

import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
public class DailyTokenUsageResponseDto {

	private Long chatbotDailyUsage;

	private Instant chatbotTokensLastUpdatedAt;

}
