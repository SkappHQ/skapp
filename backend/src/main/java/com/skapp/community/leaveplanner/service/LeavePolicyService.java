package com.skapp.community.leaveplanner.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.leaveplanner.payload.request.LeavePolicyFilterDto;
import com.skapp.community.leaveplanner.payload.request.LeavePolicyRequestDto;
import com.skapp.community.leaveplanner.payload.request.LeavePolicyUpdateRequestDto;

public interface LeavePolicyService {

	ResponseEntityDto addLeavePolicy(LeavePolicyRequestDto leavePolicyRequestDto);

	ResponseEntityDto updateLeavePolicy(Long policyId, LeavePolicyUpdateRequestDto leavePolicyUpdateRequestDto);

	ResponseEntityDto deactivateLeavePolicy(Long policyId);

	ResponseEntityDto getAllLeavePolicies(LeavePolicyFilterDto leavePolicyFilterDto);

}
