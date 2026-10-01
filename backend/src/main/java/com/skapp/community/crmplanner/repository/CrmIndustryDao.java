package com.skapp.community.crmplanner.repository;

import java.util.Optional;

import com.skapp.community.crmplanner.model.CrmIndustry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CrmIndustryDao extends JpaRepository<CrmIndustry, Long>, CrmIndustryRepository {

	Optional<CrmIndustry> findByIdAndIsDeletedFalse(Long id);

	Optional<CrmIndustry> findByNameIgnoreCaseAndIsDeletedFalse(String name);

	List<CrmIndustry> findAllByIsDeletedFalseOrderByNameAsc();

}
