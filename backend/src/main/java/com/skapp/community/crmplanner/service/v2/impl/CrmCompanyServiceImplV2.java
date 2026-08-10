package com.skapp.community.crmplanner.service.v2.impl;

import com.skapp.community.common.payload.response.PageDto;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.mapper.CrmMapper;
import com.skapp.community.crmplanner.model.CrmCompany;
import com.skapp.community.crmplanner.payload.response.CrmCompanyResponseDto;
import com.skapp.community.crmplanner.payload.response.v2.CrmCompanyMetricsResponseDtoV2;
import com.skapp.community.crmplanner.repository.CrmCompanyDao;
import com.skapp.community.crmplanner.service.v2.CrmCompanyServiceV2;
import com.skapp.community.crmplanner.type.CrmCompanyMetrics;
import com.skapp.community.crmplanner.type.CrmCompanyMetricsSummary;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class CrmCompanyServiceImplV2 implements CrmCompanyServiceV2 {

	private final CrmCompanyDao crmCompanyDao;

	private final CrmMapper crmMapper;

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getCompanyMetrics(String searchKeyword, Pageable pageable) {
		log.info("getCompanyMetrics: execution started");

		Page<CrmCompany> companyPage = crmCompanyDao.findCompaniesForMetrics(pageable, searchKeyword);

		List<Long> companyIds = companyPage.getContent().stream().map(CrmCompany::getId).toList();

		if (companyIds.isEmpty()) {
			log.info("getCompanyMetrics: execution ended");
			return new ResponseEntityDto(false, buildPageDto(List.of(), companyPage));
		}

		Map<Long, CrmCompanyMetricsSummary> summaryMap = crmCompanyDao.findCompanyMetricsSummaries(companyIds)
			.stream()
			.collect(Collectors.toMap(CrmCompanyMetricsSummary::getCompanyId, Function.identity()));

		List<CrmCompanyMetricsResponseDtoV2> items = companyPage.getContent()
			.stream()
			.map(company -> enrichWithMetrics(company, summaryMap))
			.toList();

		log.info("getCompanyMetrics: execution ended");
		return new ResponseEntityDto(false, buildPageDto(items, companyPage));
	}

	private CrmCompanyMetricsResponseDtoV2 enrichWithMetrics(CrmCompany company,
			Map<Long, CrmCompanyMetricsSummary> summaryMap) {
		CrmCompanyResponseDto companyDto = crmMapper.crmCompanyToCrmCompanyResponseDto(company);

		CrmCompanyMetricsSummary summary = summaryMap.get(company.getId());
		CrmCompanyMetrics metrics = new CrmCompanyMetrics(summary != null ? summary.getOpenTasksCount() : 0L,
				summary != null ? summary.getOverdue() : 0L, summary != null ? summary.getOpenValue() : null,
				summary != null ? summary.getAccountValue() : null, summary != null ? summary.getOpenDeals() : 0L,
				summary != null ? summary.getClosedDeals() : 0L);

		return new CrmCompanyMetricsResponseDtoV2(companyDto, metrics);
	}

	private PageDto buildPageDto(List<CrmCompanyMetricsResponseDtoV2> items, Page<CrmCompany> companyPage) {
		PageDto pageDto = new PageDto();
		pageDto.setItems(items);
		pageDto.setCurrentPage(companyPage.getNumber());
		pageDto.setTotalItems(companyPage.getTotalElements());
		pageDto.setTotalPages(companyPage.getTotalPages());
		return pageDto;
	}

}
