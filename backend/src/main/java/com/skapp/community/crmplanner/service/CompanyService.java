package com.skapp.community.crmplanner.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.model.CrmCompany;
import com.skapp.community.crmplanner.payload.request.CompanyCreateDto;

public interface CompanyService {

  ResponseEntityDto checkCompanyNameExists(String name);

  ResponseEntityDto createCompany(CompanyCreateDto crmCompany);

  ResponseEntityDto updateCompany(Long id, CrmCompany crmCompany);

  ResponseEntityDto getCompany(Long id);

  ResponseEntityDto deleteCompany(Long id);

  ResponseEntityDto getAllCompanies();

}
