package com.skapp.community.leaveplanner.repository;

import com.skapp.community.leaveplanner.model.PolicyLeaveType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PolicyLeaveTypeDao extends JpaRepository<PolicyLeaveType, Long>, PolicyLeaveTypeRepository {

	Optional<PolicyLeaveType> findByIdAndIsActiveTrue(Long id);

	List<PolicyLeaveType> findAllByIsActive(boolean isActive);

	boolean existsByNameIgnoreCase(String name);

	boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);

}
