package com.skapp.community.crmplanner.repository;

import com.skapp.community.crmplanner.model.CrmTaskType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CrmTaskTypeDao extends JpaRepository<CrmTaskType, Long> {

}
