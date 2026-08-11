package com.skapp.community.leaveplanner.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.leaveplanner.payload.request.PolicyLeaveAvailabilityRequestDto;
import com.skapp.community.leaveplanner.payload.request.PolicyLeaveRequestDto;
import com.skapp.community.leaveplanner.payload.request.PolicyLeaveRequestFilterDto;

public interface PolicyLeaveService {

	ResponseEntityDto getCurrentUserPolicyBalances(Integer year);

	ResponseEntityDto checkPolicyLeaveAvailability(PolicyLeaveAvailabilityRequestDto availabilityRequestDto);

	ResponseEntityDto applyPolicyLeaveRequest(PolicyLeaveRequestDto policyLeaveRequestDto);

	ResponseEntityDto getCurrentUserPolicyLeaveRequests(PolicyLeaveRequestFilterDto policyLeaveRequestFilterDto);

}
