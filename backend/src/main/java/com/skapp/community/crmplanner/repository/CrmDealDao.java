package com.skapp.community.crmplanner.repository;

import com.skapp.community.crmplanner.model.CrmDeal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CrmDealDao extends JpaRepository<CrmDeal, Long> {

	List<CrmDeal> findByContact_IdAndIsDeletedFalse(Long contactId);

}
