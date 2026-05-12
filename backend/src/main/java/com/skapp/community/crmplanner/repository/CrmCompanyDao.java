package com.skapp.community.crmplanner.repository;

import java.util.List;
import java.util.Optional;

import com.skapp.community.crmplanner.payload.request.CrmCompanyFilterDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.skapp.community.crmplanner.model.CrmCompany;

@Repository
public interface CrmCompanyDao extends JpaRepository<CrmCompany, Long>, JpaSpecificationExecutor<CrmCompany> {

  List<Object> findByIsDeletedFalse();

  boolean existsByNameIgnoreCaseAndIsDeletedFalse(String name);

  Optional<CrmCompany> findByIdAndIsDeletedFalse(Long id);
}
