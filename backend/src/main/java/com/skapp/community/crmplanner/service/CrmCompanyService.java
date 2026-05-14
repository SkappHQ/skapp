package com.skapp.community.crmplanner.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.payload.request.CrmCompanyCreateDto;

public interface CrmCompanyService {

  ResponseEntityDto createCompany(CrmCompanyCreateDto crmCompany);

}
