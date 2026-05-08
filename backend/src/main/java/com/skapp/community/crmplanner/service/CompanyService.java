package com.skapp.community.crmplanner.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.model.CrmCompany;

public interface CompanyService {

  ResponseEntityDto createCompany(CrmCompany crmCompany);

  ResponseEntityDto updateCompany(Long id, CrmCompany crmCompany);

  ResponseEntityDto getCompany(Long id);

  ResponseEntityDto deleteCompany(Long id);

  ResponseEntityDto getAllCompanies();

}
