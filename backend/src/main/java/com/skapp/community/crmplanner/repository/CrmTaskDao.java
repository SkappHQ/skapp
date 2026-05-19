package com.skapp.community.crmplanner.repository;

import com.skapp.community.crmplanner.model.CrmTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CrmTaskDao extends JpaRepository<CrmTask, Long> {

	List<CrmTask> findByContactIdAndIsDeletedFalse(Long contactId);

	@Modifying
	@Query("UPDATE CrmTask t SET t.isDeleted = true WHERE t.contact.id = :contactId AND t.isDeleted = false")
	int softDeleteByContactId(@Param("contactId") Long contactId);

}
