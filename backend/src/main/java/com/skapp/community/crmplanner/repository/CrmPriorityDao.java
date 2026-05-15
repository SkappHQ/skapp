package com.skapp.community.crmplanner.repository;

import com.skapp.community.crmplanner.model.CrmPriority;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CrmPriorityDao extends JpaRepository<CrmPriority, Long> {

List<CrmPriority> findAllByOrderByOrderIndexAsc();

}
