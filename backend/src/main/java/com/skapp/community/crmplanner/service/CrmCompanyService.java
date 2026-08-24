package com.skapp.community.crmplanner.service;

import org.springframework.data.domain.Pageable;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.payload.request.CrmCompanyIdsRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmCompanyCreateDto;
import com.skapp.community.crmplanner.payload.request.CrmCompanyDomainSearchRequestDto;
import com.skapp.community.crmplanner.payload.request.CrmCompanyEditDto;
import com.skapp.community.crmplanner.payload.request.CrmCompanyFilterDto;

public interface CrmCompanyService {

	ResponseEntityDto getCompanies(CrmCompanyFilterDto filterDto);

	ResponseEntityDto checkCompanyNameExists(String name);

	ResponseEntityDto createCompany(CrmCompanyCreateDto crmCompany);

	ResponseEntityDto getCompanyMetrics(String searchKeyword, Pageable pageable);

	ResponseEntityDto getCompanyMetricsById(Long id);

	ResponseEntityDto getCompanyById(Long id);

	ResponseEntityDto getCompaniesByIds(CrmCompanyIdsRequestDto requestDto);

	ResponseEntityDto searchCompaniesByDomain(CrmCompanyDomainSearchRequestDto requestDto);

	ResponseEntityDto deleteCompany(Long id);

	ResponseEntityDto editCompany(Long id, CrmCompanyEditDto crmCompany);

}
