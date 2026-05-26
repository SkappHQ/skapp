package com.skapp.community.crmplanner.repository;

import com.skapp.community.crmplanner.model.CrmTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CrmTaskDao extends JpaRepository<CrmTask, Long> {

	List<CrmTask> findByContactIdAndIsDeletedFalse(Long contactId);

}
