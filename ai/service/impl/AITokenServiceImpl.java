package com.skapp.enterprise.ai.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.model.User;
import com.skapp.community.common.service.CacheService;
import com.skapp.community.common.service.UserService;
import com.skapp.enterprise.ai.constant.AIMessageConstant;
import com.skapp.enterprise.ai.mapper.AITokenMapper;
import com.skapp.enterprise.ai.model.AIToken;
import com.skapp.enterprise.ai.payload.request.DailyTokenUsageRequestDto;
import com.skapp.enterprise.ai.payload.response.DailyTokenUsageResponseDto;
import com.skapp.enterprise.ai.repository.AITokenDao;
import com.skapp.enterprise.ai.service.AITokenService;
import com.skapp.enterprise.common.type.EpCacheKeys;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
@Slf4j
public class AITokenServiceImpl implements AITokenService {

	private final AITokenDao aiTokenDao;

	private final AITokenMapper aiTokenMapper;

	private final UserService userService;

	private final CacheService cacheService;

	private final ObjectMapper objectMapper;

	@Override
	@Transactional
	public DailyTokenUsageResponseDto updateChatbotDailyUsage(
			@NonNull DailyTokenUsageRequestDto dailyTokenUsageRequestDto) {
		log.info("updateChatbotDailyUsage: Updating chatbot daily usage to: {}",
				dailyTokenUsageRequestDto.getChatbotDailyUsage());

		if (dailyTokenUsageRequestDto.getChatbotDailyUsage() == null) {
			throw new ModuleException(AIMessageConstant.AI_ERROR_CHATBOT_DAILY_USAGE_REQUIRED);
		}

		User currentUser = userService.getCurrentUser();

		AIToken aiToken = aiTokenDao.findByUser(currentUser).orElseGet(() -> {
			AIToken newToken = new AIToken();
			newToken.setUser(currentUser);
			return newToken;
		});

		aiToken.setChatbotDailyUsage(dailyTokenUsageRequestDto.getChatbotDailyUsage());
		aiToken.setChatbotTokensLastUpdatedAt(Instant.now());

		aiTokenDao.save(aiToken);

		DailyTokenUsageResponseDto responseDto = aiTokenMapper.aiTokenToDailyTokenUsageResponseDto(aiToken);

		setCachedDailyTokenUsage(currentUser.getUserId(), responseDto);

		log.info("updateChatbotDailyUsage: Successfully updated chatbot daily usage for user: {}",
				currentUser.getUserId());
		return responseDto;
	}

	@Override
	@Transactional(readOnly = true)
	public DailyTokenUsageResponseDto getChatbotDailyUsageByCurrentUser() {
		log.info("getChatbotDailyUsageByCurrentUser: Retrieving chatbot daily usage for current user");

		User currentUser = userService.getCurrentUser();

		DailyTokenUsageResponseDto cachedResponse = getCachedDailyTokenUsage(currentUser.getUserId());
		if (cachedResponse != null) {
			return cachedResponse;
		}

		AIToken aiToken = aiTokenDao.findByUser(currentUser).orElse(null);

		if (aiToken == null) {
			log.info("getChatbotDailyUsageByCurrentUser: No record found for user: {}, returning default values",
					currentUser.getUserId());
			DailyTokenUsageResponseDto defaultResponse = new DailyTokenUsageResponseDto();
			defaultResponse.setChatbotDailyUsage(0L);
			defaultResponse.setChatbotTokensLastUpdatedAt(null);
			return defaultResponse;
		}

		DailyTokenUsageResponseDto responseDto = aiTokenMapper.aiTokenToDailyTokenUsageResponseDto(aiToken);

		setCachedDailyTokenUsage(currentUser.getUserId(), responseDto);

		return responseDto;
	}

	private DailyTokenUsageResponseDto getCachedDailyTokenUsage(Long userId) {
		EpCacheKeys cacheKey = EpCacheKeys.AI_TOKEN_USER_CACHE_KEY;
		String cachedData = cacheService.get(cacheKey.format(userId));

		if (cachedData != null) {
			try {
				DailyTokenUsageResponseDto cachedResponse = objectMapper.readValue(cachedData,
						DailyTokenUsageResponseDto.class);
				log.info("getCachedDailyTokenUsage: Returning cached data for user: {}", userId);
				return cachedResponse;
			}
			catch (JsonProcessingException e) {
				log.error("getCachedDailyTokenUsage: Failed to deserialize cached data: {}", e.getMessage());
			}
		}
		return null;
	}

	private void setCachedDailyTokenUsage(Long userId, DailyTokenUsageResponseDto responseDto) {
		EpCacheKeys cacheKey = EpCacheKeys.AI_TOKEN_USER_CACHE_KEY;
		try {
			String cacheValue = objectMapper.writeValueAsString(responseDto);
			cacheService.put(cacheKey.format(userId), cacheValue, cacheKey.getTtl(), cacheKey.getTimeUnit());
			log.info("setCachedDailyTokenUsage: Cache updated for user: {}", userId);
		}
		catch (JsonProcessingException e) {
			log.error("setCachedDailyTokenUsage: Failed to serialize response to cache: {}", e.getMessage());
		}
	}

}
