package com.skapp.community.crmplanner.repository;

import com.skapp.community.crmplanner.model.CrmDeal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CrmDealDao extends JpaRepository<CrmDeal, Long>, CrmDealRepository {

	Optional<CrmDeal> findByIdAndIsDeletedFalse(Long id);

	boolean existsByNameIgnoreCaseAndIsDeletedFalse(String name);

	List<CrmDeal> findByContact_IdAndIsDeletedFalse(Long contactId);

	List<CrmDeal> findAllByCompanyIdAndIsDeletedFalse(Long companyId);

	boolean existsByStageIdAndIsDeletedFalse(Long stageId);

	long countByIsDeletedFalse();

}
