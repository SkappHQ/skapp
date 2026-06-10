package com.skapp.community.crmplanner.repository;

import com.skapp.community.crmplanner.model.CrmDealStage;
import com.skapp.community.crmplanner.type.CrmDealStageType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CrmDealStageDao extends JpaRepository<CrmDealStage, Long> {

	List<CrmDealStage> findAllByIsDeletedFalseOrderByOrderIndexAsc();

	Optional<CrmDealStage> findByIdAndIsDeletedFalse(Long id);

	boolean existsByNameIgnoreCaseAndIsDeletedFalse(String name);

	long countByStageTypeAndIsDeletedFalse(CrmDealStageType stageType);

	int countByIsDeletedFalse();

}
