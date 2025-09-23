package com.skapp.enterprise.invoice.repository;

import com.skapp.enterprise.invoice.model.BillableRate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BillableRateDao extends JpaRepository<BillableRate, Long> {

	List<BillableRate> findByProject_IdAndIsActive(Long customerProjectId, boolean isActive);

}
