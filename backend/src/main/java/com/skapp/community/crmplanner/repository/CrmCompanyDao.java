package com.skapp.community.crmplanner.repository;

import com.skapp.community.crmplanner.model.CrmCompany;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CrmCompanyDao extends JpaRepository<CrmCompany, Long>, CrmCompanyRepository {

	Optional<CrmCompany> findByIdAndIsDeletedFalse(Long id);

	boolean existsByNameIgnoreCaseAndIsDeletedFalse(String name);

}
