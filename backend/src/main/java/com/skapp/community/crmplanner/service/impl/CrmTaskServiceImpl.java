package com.skapp.community.crmplanner.service.impl;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.mapper.CrmMapper;
import com.skapp.community.crmplanner.payload.response.CrmTaskListResponseDto;
import com.skapp.community.crmplanner.payload.response.CrmTaskResponseDto;
import com.skapp.community.crmplanner.repository.CrmTaskDao;
import com.skapp.community.crmplanner.service.CrmTaskService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class CrmTaskServiceImpl implements CrmTaskService {

	private final CrmTaskDao crmTaskDao;

	private final CrmMapper crmMapper;

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getTasks() {
		log.info("getTasks: execution started");

		List<CrmTaskResponseDto> tasks = crmMapper.crmTasksToCrmTaskResponseDtos(crmTaskDao.findAllWithTypeAndOwner());

		CrmTaskListResponseDto response = new CrmTaskListResponseDto();
		response.setTasks(tasks);

		log.info("getTasks: execution ended");

		return new ResponseEntityDto(false, response);
	}

}
