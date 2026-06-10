package com.skapp.community.okrplanner.repository;

import com.skapp.community.okrplanner.model.CompanyObjective;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CompanyObjectiveDao
		extends JpaRepository<CompanyObjective, Long>, JpaSpecificationExecutor<CompanyObjective> {

	List<CompanyObjective> findAllByYear(Integer year);

}
