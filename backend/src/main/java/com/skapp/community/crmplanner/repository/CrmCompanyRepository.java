package com.skapp.community.crmplanner.repository;

import com.skapp.community.crmplanner.model.CrmCompany;
import com.skapp.community.crmplanner.payload.request.CrmCompanyFilterDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.skapp.community.crmplanner.payload.response.CrmCompanyMetricsResponseDto;
import com.skapp.community.crmplanner.type.CrmCompanyMetrics;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface CrmCompanyRepository {

	Page<CrmCompany> findCompanies(CrmCompanyFilterDto filterDto, Pageable pageable);

	public Page<CrmCompanyMetricsResponseDto> getCompanies(Pageable pageable, String searchKeyword,
			Instant overdueBefore);

	Optional<CrmCompanyMetrics> getCompanyMetricsById(Long companyId, Instant overdueBefore);

	List<CrmCompany> findCompaniesByWebsiteDomain(String domain, int limit);

}
