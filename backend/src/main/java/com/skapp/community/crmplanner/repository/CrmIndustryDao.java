package com.skapp.community.crmplanner.repository;

import java.util.List;
import java.util.Optional;

import com.skapp.community.crmplanner.model.CrmIndustry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CrmIndustryDao extends JpaRepository<CrmIndustry, Long> {

	Optional<CrmIndustry> findByName(String name);

	List<CrmIndustry> findAllByOrderByNameAsc();

}
