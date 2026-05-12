package com.skapp.community.crmplanner.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.payload.request.CrmCompanyCreateDto;
import com.skapp.community.crmplanner.payload.request.CrmCompanyUpdateDto;

public interface CrmCompanyService {

  ResponseEntityDto checkCompanyNameExists(String name);

  ResponseEntityDto createCompany(CrmCompanyCreateDto crmCompany);

  ResponseEntityDto updateCompany(Long id, CrmCompanyUpdateDto crmCompany);

  ResponseEntityDto getCompany(Long id);

  ResponseEntityDto deleteCompany(Long id);

  ResponseEntityDto getAllCompanies();

  ResponseEntityDto getCompanies(CrmCompanyFilterDto filterDto);
}
