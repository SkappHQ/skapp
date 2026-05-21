package com.skapp.community.crmplanner.service;

import org.springframework.data.domain.Pageable;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.payload.request.CrmCompanyCreateDto;
import com.skapp.community.crmplanner.payload.request.CrmCompanyFilterDto;

public interface CrmCompanyService {

	ResponseEntityDto getCompanies(CrmCompanyFilterDto filterDto);

	ResponseEntityDto checkCompanyNameExists(String name);

	ResponseEntityDto createCompany(CrmCompanyCreateDto crmCompany);

	ResponseEntityDto getCompanyMetrics(String searchKeyword, Pageable pageable);

}
