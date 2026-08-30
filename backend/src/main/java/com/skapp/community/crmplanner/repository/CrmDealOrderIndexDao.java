package com.skapp.community.crmplanner.repository;

import com.skapp.community.crmplanner.model.CrmDealOrderIndex;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CrmDealOrderIndexDao extends JpaRepository<CrmDealOrderIndex, Long> {

	Optional<CrmDealOrderIndex> findByDealId(Long dealId);

	@Query("SELECT MAX(o.list) FROM CrmDealOrderIndex o")
	String findMaxListIndex();

}
