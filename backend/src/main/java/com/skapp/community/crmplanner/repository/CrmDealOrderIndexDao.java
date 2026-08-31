package com.skapp.community.crmplanner.repository;

import com.skapp.community.crmplanner.model.CrmDealOrderIndex;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface CrmDealOrderIndexDao extends JpaRepository<CrmDealOrderIndex, Long> {

	@Query("SELECT MAX(o.list) FROM CrmDealOrderIndex o")
	String findMaxListIndex();

}
