package com.skapp.community.leaveplanner.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.leaveplanner.payload.request.PolicyLeaveAvailabilityRequestDto;
import com.skapp.community.leaveplanner.payload.request.PolicyLeaveRequestDto;
import com.skapp.community.leaveplanner.payload.request.PolicyLeaveRequestFilterDto;

/**
 * Applying for and viewing leave against leave policies. Entirely separate from
 * {@link LeaveService}, which continues to serve the legacy leave-type / entitlement
 * flow.
 */
public interface PolicyLeaveService {

	/**
	 * One balance card per policy assigned to the current user for the given year. Two
	 * policies of the same leave type produce two entries and are never combined.
	 */
	ResponseEntityDto getCurrentUserPolicyBalances(Integer year);

	/**
	 * Non-mutating balance check used by the apply-leave modal while the user edits dates.
	 */
	ResponseEntityDto checkPolicyLeaveAvailability(PolicyLeaveAvailabilityRequestDto availabilityRequestDto);

	/**
	 * Creates a leave request deducted against one specific policy.
	 */
	ResponseEntityDto applyPolicyLeaveRequest(PolicyLeaveRequestDto policyLeaveRequestDto);

	/**
	 * The current user's policy leave requests for the given year, newest first.
	 */
	ResponseEntityDto getCurrentUserPolicyLeaveRequests(Integer year);

	/**
	 * Paged and filtered view of the same requests, backing the My Requests table.
	 */
	ResponseEntityDto searchCurrentUserPolicyLeaveRequests(PolicyLeaveRequestFilterDto policyLeaveRequestFilterDto);

}
