package com.skapp.community.crmplanner.service.v2.impl;

import com.skapp.community.common.payload.response.PageDto;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.payload.request.CrmCompanyMetricRequestDto;
import com.skapp.community.crmplanner.payload.response.v2.CrmCompanyListItemDtoV2;
import com.skapp.community.crmplanner.repository.CrmCompanyDao;
import com.skapp.community.crmplanner.service.v2.CrmCompanyServiceV2;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
public class CrmCompanyServiceImplV2 implements CrmCompanyServiceV2 {

	private final CrmCompanyDao crmCompanyDao;

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getCompanyMetrics(CrmCompanyMetricRequestDto requestDto) {
		log.info("getCompanyMetrics: execution started");

		Pageable pageable = PageRequest.of(requestDto.getPage(), requestDto.getSize());
		Page<CrmCompanyListItemDtoV2> companyPage = crmCompanyDao.getCompanyMetricsV2(pageable,
				requestDto.getSearchKeyword());

		PageDto pageDto = new PageDto();
		pageDto.setItems(companyPage.getContent());
		pageDto.setCurrentPage(companyPage.getNumber());
		pageDto.setTotalItems(companyPage.getTotalElements());
		pageDto.setTotalPages(companyPage.getTotalPages());

		log.info("getCompanyMetrics: execution ended");
		return new ResponseEntityDto(false, pageDto);
	}

}
