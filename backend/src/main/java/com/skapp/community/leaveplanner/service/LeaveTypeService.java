package com.skapp.community.leaveplanner.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.leaveplanner.payload.request.LeaveTypeFilterDto;
import com.skapp.community.leaveplanner.payload.request.LeaveTypePatchRequestDto;
import com.skapp.community.leaveplanner.payload.request.LeaveTypeRequestDto;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

public interface LeaveTypeService {

	@Transactional(propagation = Propagation.REQUIRED)
	ResponseEntityDto addLeaveType(LeaveTypeRequestDto leaveTypeRequestDto);

	ResponseEntityDto getLeaveTypes(LeaveTypeFilterDto leaveTypeFilterDto);

	ResponseEntityDto getLeaveTypeById(Long id);

	ResponseEntityDto updateLeaveType(Long id, LeaveTypePatchRequestDto leaveTypePatchRequestDto);

	void createDefaultLeaveType();

}
