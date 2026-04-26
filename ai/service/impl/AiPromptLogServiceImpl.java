package com.skapp.enterprise.ai.service.impl;

import com.skapp.community.common.constant.CommonMessageConstant;
import com.skapp.community.common.exception.EntityNotFoundException;
import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.repository.UserDao;
import com.skapp.enterprise.ai.constant.AIMessageConstant;
import com.skapp.enterprise.ai.model.AiPromptLog;
import com.skapp.enterprise.ai.model.AiPromptLogMessage;
import com.skapp.enterprise.ai.payload.request.AddPromptLogMessageRequestDto;
import com.skapp.enterprise.ai.payload.request.CreatePromptLogRequestDto;
import com.skapp.enterprise.ai.payload.response.AiPromptLogResponseDto;
import com.skapp.enterprise.ai.repository.AiPromptLogDao;
import com.skapp.enterprise.ai.repository.AiPromptLogMessageDao;
import com.skapp.enterprise.ai.service.AiPromptLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiPromptLogServiceImpl implements AiPromptLogService {

	private final AiPromptLogDao aiPromptLogDao;

	private final AiPromptLogMessageDao aiPromptLogMessageDao;

	private final UserDao userDao;

	@Override
	@Transactional
	public ResponseEntityDto createPromptLog(CreatePromptLogRequestDto createPromptLogRequestDto) {
		log.info("createPromptLog: Creating prompt log for userId: {}", createPromptLogRequestDto.getUserId());

		User user = userDao.findById(createPromptLogRequestDto.getUserId())
			.orElseThrow(() -> new EntityNotFoundException(CommonMessageConstant.COMMON_ERROR_USER_NOT_FOUND));

		Instant now = Instant.now();

		AiPromptLog promptLog = new AiPromptLog();
		promptLog.setUser(user);
		promptLog.setStartedAt(now);

		promptLog = aiPromptLogDao.save(promptLog);

		AiPromptLogResponseDto responseDto = new AiPromptLogResponseDto();
		responseDto.setId(promptLog.getId());

		log.info("createPromptLog: Successfully created prompt log with id: {}", promptLog.getId());
		return new ResponseEntityDto(false, responseDto);
	}

	@Override
	@Transactional
	public ResponseEntityDto addMessage(AddPromptLogMessageRequestDto addPromptLogMessageRequestDto) {
		log.info("addMessage: Adding message to prompt log id: {}", addPromptLogMessageRequestDto.getPromptLogId());

		AiPromptLog promptLog = aiPromptLogDao.findById(addPromptLogMessageRequestDto.getPromptLogId())
			.orElseThrow(() -> new EntityNotFoundException(AIMessageConstant.AI_ERROR_PROMPT_LOG_NOT_FOUND));

		AiPromptLogMessage message = new AiPromptLogMessage();
		message.setPromptLog(promptLog);
		message.setUserMessage(addPromptLogMessageRequestDto.getUserMessage());
		message.setAiMessage(addPromptLogMessageRequestDto.getAiMessage());
		message.setCreatedAt(Instant.now());

		aiPromptLogMessageDao.save(message);

		log.info("addMessage: Successfully added message to prompt log id: {}",
				addPromptLogMessageRequestDto.getPromptLogId());
		return new ResponseEntityDto();
	}

}
