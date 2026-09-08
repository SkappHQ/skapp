package com.skapp.community.crmplanner.repository;

import java.util.Optional;

import com.skapp.community.crmplanner.model.CrmDealOrderIndex;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CrmDealOrderIndexDao extends JpaRepository<CrmDealOrderIndex, Long> {

	Optional<CrmDealOrderIndex> findTopByOrderByListDesc();

}
