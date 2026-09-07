package com.skapp.community.crmplanner.repository;

import com.skapp.community.crmplanner.model.CrmIndustry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CrmIndustryDao extends JpaRepository<CrmIndustry, Long> {

	List<CrmIndustry> findAllByOrderByNameAsc();

}
