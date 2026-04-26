package com.skapp.enterprise.ai.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.ai.payload.request.AddPromptLogMessageRequestDto;
import com.skapp.enterprise.ai.payload.request.CreatePromptLogRequestDto;

public interface AiPromptLogService {

	ResponseEntityDto createPromptLog(CreatePromptLogRequestDto createPromptLogRequestDto);

	ResponseEntityDto addMessage(AddPromptLogMessageRequestDto addPromptLogMessageRequestDto);

}
