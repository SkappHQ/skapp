package com.skapp.community.crmplanner.service.impl;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.mapper.CrmDealMapper;
import com.skapp.community.crmplanner.payload.response.CrmPriorityResponseDto;
import com.skapp.community.crmplanner.repository.CrmPriorityDao;
import com.skapp.community.crmplanner.service.CrmCommonService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class CrmCommonServiceImpl implements CrmCommonService {

	private final CrmPriorityDao crmPriorityDao;

	private final CrmDealMapper crmDealMapper;

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getPriorities() {
		log.info("getPriorities: execution started");

		List<CrmPriorityResponseDto> priorities = crmDealMapper
			.crmPrioritiesToCrmPriorityResponseDtos(crmPriorityDao.findAllByOrderByOrderIndexAsc());

		log.info("getPriorities: execution ended with {} result(s)", priorities.size());

		return new ResponseEntityDto(false, priorities);
	}

}
