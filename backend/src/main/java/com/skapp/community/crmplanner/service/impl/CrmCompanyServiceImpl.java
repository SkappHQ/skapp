package com.skapp.community.crmplanner.service.impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.model.CrmCompany;
import com.skapp.community.crmplanner.payload.request.CrmCompanyCreateDto;
import com.skapp.community.crmplanner.payload.request.CrmCompanyUpdateDto;
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
  public ResponseEntityDto getAllCompanies() {
    log.info("getAllCompanies: execution started");
    ResponseEntityDto response = new ResponseEntityDto(false, crmCompanyDao.findByIsDeletedFalse());
    log.info("getAllCompanies: execution ended");

    return response;
  }

  @Override
  public ResponseEntityDto getCompany(Long id) {
    log.info("getCompany: execution started for id: {}", id);
    CrmCompany company = crmCompanyDao.findById(id)
        .orElseThrow(() -> new RuntimeException("Company not found with id: " + id));
    log.info("getCompany: execution ended for id: {}", id);

    return new ResponseEntityDto(false, company);
  }

  @Override
  public ResponseEntityDto checkCompanyNameExists(String name) {
    log.info("checkCompanyNameExists: execution started for name: {}", name);
    boolean exists = crmCompanyDao.existsByNameIgnoreCaseAndIsDeletedFalse(name.trim());
    log.info("checkCompanyNameExists: execution ended, exists: {}", exists);

    return new ResponseEntityDto(false, exists);
  }

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

  @Override
  @Transactional
  public ResponseEntityDto updateCompany(Long id, CrmCompanyUpdateDto crmCompany) {
    log.info("updateCompany: execution started for id: {}", id);
    CrmCompany existingCompany = crmCompanyDao.findById(id)
        .orElseThrow(() -> new RuntimeException("Company not found with id: " + id));
    existingCompany = updateCompanyEntity(crmCompany, existingCompany);
    crmCompanyDao.save(existingCompany);
    log.info("updateCompany: execution ended for id: {}", id);

    return new ResponseEntityDto(false, "Company updated successfully");
  }

  private CrmCompany updateCompanyEntity(CrmCompanyUpdateDto crmCompany, CrmCompany existingCompany) {
    existingCompany.setName(crmCompany.getName());
    existingCompany.setIndustry(crmCompany.getIndustry());
    existingCompany.setWebsite(crmCompany.getWebsite());
    existingCompany.setAddress(crmCompany.getAddress());
    existingCompany.setContactNumber(crmCompany.getContactNumber());

    return existingCompany;
  }

  @Override
  @Transactional
  public ResponseEntityDto deleteCompany(Long id) {
    log.info("deleteCompany: execution started for id: {}", id);
    CrmCompany existingCompany = crmCompanyDao.findById(id)
        .orElseThrow(() -> new RuntimeException("Company not found with id: " + id));
    existingCompany.setIsDeleted(true);
    crmCompanyDao.save(existingCompany);
    log.info("deleteCompany: execution ended for id: {}", id);

    return new ResponseEntityDto(false, "Company deleted successfully");
  }

}
