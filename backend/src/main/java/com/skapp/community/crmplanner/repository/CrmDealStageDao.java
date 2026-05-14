package com.skapp.community.crmplanner.repository;

import com.skapp.community.crmplanner.model.CrmDealStage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CrmDealStageDao extends JpaRepository<CrmDealStage, Long> {

	List<CrmDealStage> findAllByIsDeletedFalseOrderByOrderIndexAsc();

}
