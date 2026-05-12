package com.skapp.community.crmplanner.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import com.skapp.community.crmplanner.payload.response.CrmCompanyTableViewDto;

@Repository
public interface CrmCompanyRepository {

  public Page<CrmCompanyTableViewDto> getCompanyTableViewDetails(Pageable pageable, String searchKeyword);

}