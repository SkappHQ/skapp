package com.skapp.community.okrplanner.repository;

import com.skapp.community.okrplanner.model.CompanyObjective;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CompanyObjectiveRepository extends JpaRepository<CompanyObjective, Long> {

}
