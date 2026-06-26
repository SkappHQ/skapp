package com.skapp.community.crmplanner.repository;

import com.skapp.community.crmplanner.model.CrmCompany;
import com.skapp.community.crmplanner.payload.request.CrmCompanyFilterDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.skapp.community.crmplanner.payload.response.CrmCompanyMetricsResponseDto;

import java.util.List;

public interface CrmCompanyRepository {

	Page<CrmCompany> findCompanies(CrmCompanyFilterDto filterDto, Pageable pageable);

	public Page<CrmCompanyMetricsResponseDto> getCompanyMetrics(Pageable pageable, String searchKeyword);

	List<CrmCompany> findCompaniesByWebsiteDomain(String domain, int limit);

}
