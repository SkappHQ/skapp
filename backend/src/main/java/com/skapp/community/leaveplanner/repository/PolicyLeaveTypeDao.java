package com.skapp.community.leaveplanner.repository;

import com.skapp.community.leaveplanner.model.PolicyLeaveType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PolicyLeaveTypeDao extends JpaRepository<PolicyLeaveType, Long> {

	Optional<PolicyLeaveType> findByIdAndIsActiveTrue(Long id);

	Page<PolicyLeaveType> findAllByIsActive(boolean isActive, Pageable pageable);

	boolean existsByNameIgnoreCase(String name);

	boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);

}
