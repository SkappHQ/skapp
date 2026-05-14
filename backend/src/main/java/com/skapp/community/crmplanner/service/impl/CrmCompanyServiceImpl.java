package com.skapp.community.crmplanner.service.impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.model.CrmCompany;
import com.skapp.community.crmplanner.payload.request.CrmCompanyCreateDto;
import com.skapp.community.crmplanner.repository.CrmCompanyDao;
import com.skapp.community.crmplanner.service.CrmCompanyService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class CrmCompanyServiceImpl implements CrmCompanyService {

  private final CrmCompanyDao crmCompanyDao;

  @Override
  @Transactional
  public ResponseEntityDto createCompany(CrmCompanyCreateDto crmCompany) {
    log.info("createCompany: execution started");
    CrmCompany newCompany = new CrmCompany();
    newCompany = createCompanyEntity(crmCompany, newCompany);
    crmCompanyDao.save(newCompany);
    log.info("createCompany: execution ended");

    return new ResponseEntityDto(false, "Company created successfully");
  }

  private CrmCompany createCompanyEntity(CrmCompanyCreateDto crmCompany, CrmCompany newCompany) {
    newCompany.setName(crmCompany.getName());
    newCompany.setIndustry(crmCompany.getIndustry());
    newCompany.setWebsite(crmCompany.getWebsite());
    newCompany.setAddress(crmCompany.getAddress());
    newCompany.setContactNumber(crmCompany.getContactNumber());

    return newCompany;
  }
}
