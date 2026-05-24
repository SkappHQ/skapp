package com.skapp.community.crmplanner.repository;

import com.skapp.community.crmplanner.model.CrmDeal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CrmDealDao extends JpaRepository<CrmDeal, Long> {

	@Modifying
	@Query("UPDATE CrmDeal d SET d.isDeleted = true WHERE d.contact.id = :contactId AND d.isDeleted = false")
	void softDeleteByContactId(@Param("contactId") Long contactId);

}
