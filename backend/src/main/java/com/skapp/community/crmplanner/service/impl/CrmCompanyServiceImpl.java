package com.skapp.community.crmplanner.service.impl;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.skapp.community.common.payload.response.PageDto;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.crmplanner.model.CrmCompany;
import com.skapp.community.crmplanner.payload.request.CrmCompanyCreateDto;
import com.skapp.community.crmplanner.payload.request.CrmCompanyUpdateDto;
import com.skapp.community.crmplanner.payload.response.CrmCompanyTableViewDto;
import com.skapp.community.crmplanner.repository.CrmCompanyDao;
import com.skapp.community.crmplanner.repository.CrmCompanyRepository;
import com.skapp.community.crmplanner.service.CrmCompanyService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class CrmCompanyServiceImpl implements CrmCompanyService {

  private final CrmCompanyDao crmCompanyDao;

  private final CrmCompanyRepository crmCompanyRepository;

  @Override
  public PageDto getAllCompanies(String searchKeyword, Pageable pageable) {
    log.info("getAllCompanies: execution started");
    Page<CrmCompany> page;
    if (searchKeyword != null && !searchKeyword.trim().isEmpty()) {
      page = crmCompanyDao.findByIsDeletedFalseAndNameContainingIgnoreCase(searchKeyword.trim(), pageable);
    } else {
      page = crmCompanyDao.findByIsDeletedFalse(pageable);
    }
    PageDto response = new PageDto();
    response.setItems(page.getContent());
    response.setCurrentPage(page.getNumber());
    response.setTotalItems(page.getTotalElements());
    response.setTotalPages(page.getTotalPages());
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
    newCompany.setName(crmCompany.getName());
    newCompany.setIndustry(crmCompany.getIndustry());
    newCompany.setWebsite(crmCompany.getWebsite());
    newCompany.setAddress(crmCompany.getAddress());
    newCompany.setContactNumber(crmCompany.getContactNumber());
    crmCompanyDao.save(newCompany);
    log.info("createCompany: execution ended");

    return new ResponseEntityDto(false, "Company created successfully");
  }

  @Override
  @Transactional
  public ResponseEntityDto updateCompany(Long id, CrmCompanyUpdateDto crmCompany) {
    log.info("updateCompany: execution started for id: {}", id);
    CrmCompany existingCompany = crmCompanyDao.findById(id)
        .orElseThrow(() -> new RuntimeException("Company not found with id: " + id));
    existingCompany.setName(crmCompany.getName());
    existingCompany.setIndustry(crmCompany.getIndustry());
    existingCompany.setWebsite(crmCompany.getWebsite());
    existingCompany.setAddress(crmCompany.getAddress());
    existingCompany.setContactNumber(crmCompany.getContactNumber());
    crmCompanyDao.save(existingCompany);
    log.info("updateCompany: execution ended for id: {}", id);

    return new ResponseEntityDto(false, "Company updated successfully");
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

  @Override
  public PageDto getCompanyTableView(String searchKeyword, Pageable pageable) {
    log.info("getAllCompanies: execution started");
    Page<CrmCompanyTableViewDto> page = crmCompanyRepository.getCompanyTableViewDetails(pageable, searchKeyword);

    PageDto response = new PageDto();
    response.setItems(page.getContent());
    response.setCurrentPage(page.getNumber());
    response.setTotalItems(page.getTotalElements());
    response.setTotalPages(page.getTotalPages());
    log.info("getAllCompanies: execution ended");

    return response;
  }

}
