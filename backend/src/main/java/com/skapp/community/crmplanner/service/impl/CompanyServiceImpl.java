package com.skapp.community.crmplanner.service.impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.model.CrmCompany;
import com.skapp.community.crmplanner.repository.CrmCompanyDao;
import com.skapp.community.crmplanner.service.CompanyService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class CompanyServiceImpl implements CompanyService {

  private final CrmCompanyDao crmCompanyDao;

  @Override
  public ResponseEntityDto getAllCompanies() {
    return new ResponseEntityDto(false, crmCompanyDao.findAll());
  }

  @Override
  public ResponseEntityDto getCompany(Long id) {
    CrmCompany company = crmCompanyDao.findById(id)
        .orElseThrow(() -> new RuntimeException("Company not found with id: " + id));
    return new ResponseEntityDto(false, company);
  }

  @Override
  @Transactional
  public ResponseEntityDto createCompany(CrmCompany crmCompany) {
    crmCompanyDao.save(crmCompany);
    return new ResponseEntityDto(false, "Company created successfully");
  }

  @Override
  @Transactional
  public ResponseEntityDto updateCompany(Long id, CrmCompany crmCompany) {
    CrmCompany existingCompany = crmCompanyDao.findById(id)
        .orElseThrow(() -> new RuntimeException("Company not found with id: " + id));
    existingCompany.setName(crmCompany.getName());
    existingCompany.setIndustry(crmCompany.getIndustry());
    existingCompany.setWebsite(crmCompany.getWebsite());
    existingCompany.setAddress(crmCompany.getAddress());
    existingCompany.setContactNumber(crmCompany.getContactNumber());
    crmCompanyDao.save(existingCompany);
    return new ResponseEntityDto(false, "Company updated successfully");
  }

  @Override
  @Transactional
  public ResponseEntityDto deleteCompany(Long id) {
    CrmCompany existingCompany = crmCompanyDao.findById(id)
        .orElseThrow(() -> new RuntimeException("Company not found with id: " + id));
    existingCompany.setIsDeleted(true);
    crmCompanyDao.save(existingCompany);

    return new ResponseEntityDto(false, "Company deleted successfully");
  }

}
