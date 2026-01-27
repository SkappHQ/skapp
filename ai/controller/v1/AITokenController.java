package com.skapp.enterprise.ai.controller.v1;

import com.skapp.enterprise.ai.payload.request.DailyTokenUsageRequestDto;
import com.skapp.enterprise.ai.payload.response.DailyTokenUsageResponseDto;
import com.skapp.enterprise.ai.service.AITokenService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/ep/ai/chatbot-token")
public class AITokenController {

	private final AITokenService aiTokenService;

	@Operation(summary = "Update chatbot daily usage",
			description = "This endpoint allows to update the chatbot daily usage for AI.")
	@PreAuthorize("hasAnyRole('ROLE_PM_EMPLOYEE', 'ROLE_SUPER_ADMIN')")
	@PatchMapping(value = "/daily-usage")
	public ResponseEntity<DailyTokenUsageResponseDto> updateChatbotDailyUsage(
			@RequestBody DailyTokenUsageRequestDto dailyTokenUsageRequestDto) {
		DailyTokenUsageResponseDto response = aiTokenService.updateChatbotDailyUsage(dailyTokenUsageRequestDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Get chatbot daily usage by current user",
			description = "This endpoint allows to retrieve the chatbot daily usage for the current user.")
	@PreAuthorize("hasAnyRole('ROLE_PM_EMPLOYEE', 'ROLE_SUPER_ADMIN')")
	@GetMapping(value = "/daily-usage")
	public ResponseEntity<DailyTokenUsageResponseDto> getChatbotDailyUsageByCurrentUser() {
		DailyTokenUsageResponseDto response = aiTokenService.getChatbotDailyUsageByCurrentUser();
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
