package com.skapp.community.crmplanner.service.impl;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.mapper.CrmMapper;
import com.skapp.community.crmplanner.payload.response.CrmTaskTypeResponseDto;
import com.skapp.community.crmplanner.repository.CrmTaskTypeDao;
import com.skapp.community.crmplanner.service.CrmTaskTypeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class CrmTaskTypeServiceImpl implements CrmTaskTypeService {

	private final CrmTaskTypeDao crmTaskTypeDao;

	private final CrmMapper crmMapper;

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getTaskTypes() {
		log.info("getTaskTypes: execution started");

		List<CrmTaskTypeResponseDto> taskTypes = crmMapper
			.crmTaskTypesToCrmTaskTypeResponseDtos(crmTaskTypeDao.findAllByOrderByOrderIndexAsc());

		log.info("getTaskTypes: execution ended with {} result(s)", taskTypes.size());

		return new ResponseEntityDto(false, taskTypes);
	}

}
