package com.skapp.community.leaveplanner.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.leaveplanner.payload.request.PolicyLeaveCancelRequestDto;
import com.skapp.community.leaveplanner.payload.request.PolicyLeaveReviewRequestDto;
import com.skapp.community.leaveplanner.payload.request.PolicyManagerLeaveRequestFilterDto;

public interface PolicyLeaveReviewService {

	ResponseEntityDto getPolicyLeaveRequestsAssignedToManager(PolicyManagerLeaveRequestFilterDto filterDto);

	ResponseEntityDto getPendingPolicyLeaveRequestsAssignedToManager(String searchKeyword);

	ResponseEntityDto getAssignedPolicyLeaveRequestById(Long id);

	ResponseEntityDto updatePolicyLeaveRequestByManager(Long id, PolicyLeaveReviewRequestDto reviewRequestDto);

	ResponseEntityDto getMyPolicyLeaveRequestById(Long id);

	ResponseEntityDto updatePolicyLeaveRequestByEmployee(Long id, PolicyLeaveCancelRequestDto cancelRequestDto);

	ResponseEntityDto nudgePolicyLeaveRequestManagers(Long id);

	ResponseEntityDto getPolicyLeaveRequestNudgeStatus(Long id);

}
