package com.skapp.community.crmplanner.repository;

import com.skapp.community.crmplanner.model.CrmCompany;
import com.skapp.community.crmplanner.payload.request.CrmCompanyFilterDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.skapp.community.crmplanner.payload.response.CrmCompanyMetricsResponseDto;
import com.skapp.community.crmplanner.payload.response.v2.CrmCompanyListItemDtoV2;
import com.skapp.community.crmplanner.type.CrmCompanyMetrics;

import java.util.List;
import java.util.Optional;

public interface CrmCompanyRepository {

	Page<CrmCompany> findCompanies(CrmCompanyFilterDto filterDto, Pageable pageable);

	public Page<CrmCompanyMetricsResponseDto> getCompanyMetrics(Pageable pageable, String searchKeyword);

	Page<CrmCompanyListItemDtoV2> getCompanyMetricsV2(Pageable pageable, String searchKeyword);

	Optional<CrmCompanyMetrics> getCompanyMetricsById(Long companyId);

	List<CrmCompany> findCompaniesByWebsiteDomain(String domain, int limit);

}
