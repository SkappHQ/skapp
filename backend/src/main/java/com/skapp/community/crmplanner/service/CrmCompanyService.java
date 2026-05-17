package com.skapp.community.crmplanner.service;

import org.springframework.data.domain.Pageable;

import com.skapp.community.common.payload.response.PageDto;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.payload.request.CrmCompanyCreateDto;

public interface CrmCompanyService {

	ResponseEntityDto checkCompanyNameExists(String name);

	ResponseEntityDto createCompany(CrmCompanyCreateDto crmCompany);

	PageDto getCompanyMetrics(String searchKeyword, Pageable pageable);

}
