package com.skapp.community.crmplanner.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.skapp.community.crmplanner.payload.response.CrmCompanyMetricsResponseDto;

public interface CrmCompanyRepository {

	public Page<CrmCompanyMetricsResponseDto> getCompanyMetrics(Pageable pageable, String searchKeyword);

}
