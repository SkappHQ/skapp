package com.skapp.community.crmplanner.service.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.UserService;
import com.skapp.community.crmplanner.model.CrmCompany;
import com.skapp.community.crmplanner.payload.request.CompanyCreateDto;
import com.skapp.community.crmplanner.repository.CrmCompanyDao;

@ExtendWith(MockitoExtension.class)
class CompanyServiceTest {

  @Mock
  private CrmCompanyDao crmCompanyDao;

  @Mock
  private UserService userService;

  @InjectMocks
  private CompanyServiceImpl companyService;

  private CompanyCreateDto mockCompanyCreateDto;

  @BeforeEach
  void setUp() {
    mockCompanyCreateDto = new CompanyCreateDto();
    mockCompanyCreateDto.setName("Test Company");
    mockCompanyCreateDto.setAddress("Test Address");
  }

  @Test
  void getAllCompaniesSuccess() {
    when(crmCompanyDao.findByIsDeletedFalse()).thenReturn(List.of(mockCompanyCreateDto));

    ResponseEntityDto response = companyService.getAllCompanies();

    assertEquals("successful", response.getStatus());
  }

  @Test
  void createCompanySuccess() {
    CrmCompany mockCrmCompany = new CrmCompany();
    mockCrmCompany.setName(mockCompanyCreateDto.getName());
    mockCrmCompany.setAddress(mockCompanyCreateDto.getAddress());

    when(crmCompanyDao.save(any(CrmCompany.class))).thenReturn(mockCrmCompany);

    ResponseEntityDto response = companyService.createCompany(mockCompanyCreateDto);

    assertEquals("successful", response.getStatus());
  }
}
