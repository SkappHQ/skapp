package com.skapp.community.crmplanner.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.skapp.community.crmplanner.model.CrmTaskType;

public interface CrmTaskTypeDao extends JpaRepository<CrmTaskType, Long> {

}
