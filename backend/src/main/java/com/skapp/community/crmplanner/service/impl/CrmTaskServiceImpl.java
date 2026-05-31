package com.skapp.community.crmplanner.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.constant.CrmMessageConstant;
import com.skapp.community.crmplanner.mapper.CrmMapper;
import com.skapp.community.crmplanner.model.CrmTask;
import com.skapp.community.crmplanner.payload.request.CrmTaskStatusUpdateDto;
import com.skapp.community.crmplanner.payload.response.CrmTaskResponseDto;
import com.skapp.community.crmplanner.repository.CrmTaskDao;
import com.skapp.community.crmplanner.service.CrmTaskService;
import com.skapp.community.crmplanner.util.CrmValidations;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
public class CrmTaskServiceImpl implements CrmTaskService {

	private final CrmTaskDao crmTaskDao;

	private final CrmMapper crmMapper;

	@Override
	@Transactional
	public ResponseEntityDto updateTaskStatus(Long id, CrmTaskStatusUpdateDto taskStatusUpdateDto) {
		log.info("updateTaskStatus: execution started");

		CrmValidations.validateTaskId(id);
		CrmValidations.validateTaskStatus(taskStatusUpdateDto.getIsCompleted());

		CrmTask task = crmTaskDao.findByIdAndIsDeletedFalse(id)
			.orElseThrow(() -> new ModuleException(CrmMessageConstant.CRM_ERROR_TASK_NOT_FOUND));

		task.setIsCompleted(taskStatusUpdateDto.getIsCompleted());
		CrmTask updatedTask = crmTaskDao.save(task);

		CrmTaskResponseDto responseDto = crmMapper.crmTaskToCrmTaskResponseDto(updatedTask);

		log.info("updateTaskStatus: execution ended successfully");
		return new ResponseEntityDto(false, responseDto);
	}

}
