package com.skapp.community.crmplanner.service.v2.impl;

import com.skapp.community.common.payload.response.PageDto;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.mapper.CrmMapper;
import com.skapp.community.crmplanner.payload.request.CrmCompanyBatchRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmCompanyMetricRequestDto;
import com.skapp.community.crmplanner.payload.response.CrmCompanyResponseDto;
import com.skapp.community.crmplanner.payload.response.v2.CrmCompanyMetricsResponseDtoV2;
import com.skapp.community.crmplanner.repository.CrmCompanyDao;
import com.skapp.community.crmplanner.service.v2.CrmCompanyServiceV2;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class CrmCompanyServiceImplV2 implements CrmCompanyServiceV2 {

	private final CrmCompanyDao crmCompanyDao;

	private final CrmMapper crmMapper;

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getCompanyMetrics(CrmCompanyMetricRequestDto requestDto) {
		log.info("getCompanyMetrics: execution started");

		Pageable pageable = PageRequest.of(requestDto.getPage(), requestDto.getSize());
		Page<CrmCompanyMetricsResponseDtoV2> companyPage = crmCompanyDao.getCompanyMetricsV2(pageable,
				requestDto.getSearchKeyword());

		PageDto pageDto = new PageDto();
		pageDto.setItems(companyPage.getContent());
		pageDto.setCurrentPage(companyPage.getNumber());
		pageDto.setTotalItems(companyPage.getTotalElements());
		pageDto.setTotalPages(companyPage.getTotalPages());

		log.info("getCompanyMetrics: execution ended");
		return new ResponseEntityDto(false, pageDto);
	}

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getCompaniesByIds(CrmCompanyBatchRequestDto requestDto) {
		log.info("getCompaniesByIds: execution started");

		if (requestDto.getIds() == null || requestDto.getIds().isEmpty()) {
			log.info("getCompaniesByIds: no ids provided, returning empty list");
			return new ResponseEntityDto(false, Collections.emptyList());
		}

		List<CrmCompanyResponseDto> companies = crmCompanyDao.findByIdInAndIsDeletedFalse(requestDto.getIds())
			.stream()
			.map(crmMapper::crmCompanyToCrmCompanyResponseDto)
			.toList();

		log.info("getCompaniesByIds: execution ended with {} result(s)", companies.size());
		return new ResponseEntityDto(false, companies);
	}

}
