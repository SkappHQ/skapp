package com.skapp.community.leaveplanner.repository;

import com.skapp.community.leaveplanner.model.LeaveType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LeaveTypeDao
		extends JpaRepository<LeaveType, Long>, JpaSpecificationExecutor<LeaveType>, LeaveTypeRepository {

	Optional<LeaveType> findByTypeIdAndIsActive(Long leaveTypeId, boolean isActive);

	List<LeaveType> findAllByIsActive(boolean isActive);

	LeaveType findLeaveTypeByName(String name);

	LeaveType findLeaveTypeByEmojiCode(String emoji);

	List<LeaveType> findByIsCarryForwardEnabledAndIsActive(boolean carryForwardEnabled, boolean isActive);

	List<LeaveType> findByTypeIdInAndIsActive(List<Long> leaveTypeIds, boolean isActive);

}
