package com.skapp.enterprise.ai.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.ai.payload.request.AddPromptLogMessageRequestDto;
import com.skapp.enterprise.ai.payload.request.CreatePromptLogRequestDto;
import com.skapp.enterprise.ai.service.AiPromptLogService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/internal/v1/ep/ai/prompt-logs")
@PreAuthorize("hasAnyRole('ROLE_INTERNAL_API')")
public class AiPromptLogController {

	private final AiPromptLogService aiPromptLogService;

	@Operation(summary = "Create a new AI prompt log session",
			description = "Creates a new prompt log session for the given user. Protected by API key authentication.")
	@PostMapping
	public ResponseEntity<ResponseEntityDto> createPromptLog(
			@Valid @RequestBody CreatePromptLogRequestDto createPromptLogRequestDto) {
		return new ResponseEntity<>(aiPromptLogService.createPromptLog(createPromptLogRequestDto), HttpStatus.CREATED);
	}

	@Operation(summary = "Add a message to an existing AI prompt log",
			description = "Adds a user/AI message exchange to an existing prompt log session. Protected by API key authentication.")
	@PostMapping(value = "/messages")
	public ResponseEntity<ResponseEntityDto> addMessage(
			@Valid @RequestBody AddPromptLogMessageRequestDto addPromptLogMessageRequestDto) {
		return new ResponseEntity<>(aiPromptLogService.addMessage(addPromptLogMessageRequestDto), HttpStatus.OK);
	}

}
