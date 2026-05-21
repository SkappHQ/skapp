package com.skapp.community.crmplanner.service;

import org.springframework.data.domain.Pageable;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.payload.request.CrmCompanyCreateDto;

public interface CrmCompanyService {

	ResponseEntityDto checkCompanyNameExists(String name);

	ResponseEntityDto createCompany(CrmCompanyCreateDto crmCompany);

	ResponseEntityDto getCompanyMetrics(String searchKeyword, Pageable pageable);

	ResponseEntityDto deleteCompany(Long id);

}
