package com.skapp.community.leaveplanner.repository;

import com.skapp.community.leaveplanner.model.LeaveType;

import java.util.List;

public interface LeaveTypeRepository {

	List<LeaveType> getLeaveTypesByCarryForwardEnable(boolean carryForward, List<Long> leaveTypeIds);

	List<LeaveType> getUsedUserLeaveTypes(Long userId, boolean isCarryForward);

}
