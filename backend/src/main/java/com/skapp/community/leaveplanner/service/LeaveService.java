package com.skapp.community.leaveplanner.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.leaveplanner.payload.LeaveRequestFilterDto;
import com.skapp.community.leaveplanner.payload.LeaveRequestManagerUpdateDto;
import com.skapp.community.leaveplanner.payload.ResourceAvailabilityCalendarFilter;
import com.skapp.community.leaveplanner.payload.request.LeavePatchRequestDto;
import com.skapp.community.leaveplanner.payload.request.LeaveRequestAvailabilityFilterDto;
import com.skapp.community.leaveplanner.payload.request.LeaveRequestDto;
import com.skapp.community.leaveplanner.payload.request.PendingLeaveRequestFilterDto;
import com.skapp.community.leaveplanner.payload.response.LeaveNotificationNudgeResponseDto;
import jakarta.validation.Valid;

public interface LeaveService {

	ResponseEntityDto applyLeaveRequest(LeaveRequestDto leaveRequestDTO);

	ResponseEntityDto updateLeaveRequestByManager(Long id, LeaveRequestManagerUpdateDto leaveRequestManagerUpdateDto,
			boolean isInvokedByManager);

	ResponseEntityDto updateLeaveRequestByEmployee(LeavePatchRequestDto leavePatchRequestDto, Long id);

	ResponseEntityDto getCurrentUserLeaveRequests(LeaveRequestFilterDto leaveRequestFilterDto);

	ResponseEntityDto getLeaveRequestById(Long id);

	ResponseEntityDto getAssignedLeaveRequestById(Long id);

	ResponseEntityDto deleteLeaveRequestById(Long id);

	ResponseEntityDto getAssignedLeavesToManager(LeaveRequestFilterDto leaveRequestFilterDto);

	ResponseEntityDto getAssignedPendingLeavesToManager(PendingLeaveRequestFilterDto pendingLeaveRequestFilterDto);

	ResponseEntityDto getResourceAvailabilityCalendar(
			ResourceAvailabilityCalendarFilter resourceAvailabilityCalendarFilter);

	ResponseEntityDto nudgeManagers(@Valid Long leaveRequestId);

	ResponseEntityDto leaveRequestAvailability(@Valid LeaveRequestAvailabilityFilterDto requestAvailabilityDto);

	LeaveNotificationNudgeResponseDto getLeaveRequestIsNudge(@Valid Long leaveRequestId);

}
