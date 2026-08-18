package com.skapp.community.crmplanner.repository;

import com.skapp.community.crmplanner.model.CrmCompany;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CrmCompanyDao extends JpaRepository<CrmCompany, Long>, CrmCompanyRepository {

	Optional<CrmCompany> findByIdAndIsDeletedFalse(Long id);

	List<CrmCompany> findByIdInAndIsDeletedFalseOrderByIdAsc(List<Long> ids);

	boolean existsByNameIgnoreCaseAndIsDeletedFalse(String name);

	long countByIsDeletedFalse();

}
