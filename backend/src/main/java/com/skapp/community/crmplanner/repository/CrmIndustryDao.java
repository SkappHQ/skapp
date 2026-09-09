package com.skapp.community.crmplanner.repository;

import com.skapp.community.crmplanner.model.CrmIndustry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CrmIndustryDao extends JpaRepository<CrmIndustry, Long> {

	/**
	 * Exact-name lookup used to resolve a company's legacy industry enum to its
	 * crm_industry row.
	 */
	Optional<CrmIndustry> findByName(String name);

	List<CrmIndustry> findAllByOrderByNameAsc();

	/**
	 * Case-insensitive lookup backing the create-time uniqueness re-check, so a name
	 * differing only in case or internal whitespace resolves to the existing row.
	 */
	Optional<CrmIndustry> findByNameIgnoreCaseAndIsDeletedFalse(String name);

}
