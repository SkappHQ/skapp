package com.skapp.community.crmplanner.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.skapp.community.crmplanner.model.CrmCompany;

@Repository
public interface CrmCompanyDao extends JpaRepository<CrmCompany, Long> {

	boolean existsByNameIgnoreCaseAndIsDeletedFalse(String name);

}
