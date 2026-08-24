package com.skapp.community.crmplanner.repository;

import com.skapp.community.crmplanner.model.CrmDealOrderIndex;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CrmDealOrderIndexDao extends JpaRepository<CrmDealOrderIndex, Long> {

	Optional<CrmDealOrderIndex> findByDealId(Long dealId);

	/**
	 * Lexicographically greatest {@code list} key (utf8mb4_bin ordering), used to append
	 * a new deal to the end of the list view. Returns {@code null} when the table is
	 * empty.
	 */
	@Query("SELECT MAX(o.list) FROM CrmDealOrderIndex o")
	String findMaxListIndex();

}
