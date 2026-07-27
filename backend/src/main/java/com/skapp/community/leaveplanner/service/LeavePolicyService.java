package com.skapp.community.leaveplanner.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.leaveplanner.payload.request.LeavePolicyFilterDto;
import com.skapp.community.leaveplanner.payload.request.LeavePolicyRequestDto;
import com.skapp.community.leaveplanner.payload.request.LeavePolicyUpdateRequestDto;

public interface LeavePolicyService {

	ResponseEntityDto addLeavePolicy(LeavePolicyRequestDto leavePolicyRequestDto);

	ResponseEntityDto updateLeavePolicy(Long id, LeavePolicyUpdateRequestDto leavePolicyUpdateRequestDto);

	ResponseEntityDto deactivateLeavePolicy(Long id);

	ResponseEntityDto activateLeavePolicy(Long id);

	ResponseEntityDto getAllLeavePolicies(LeavePolicyFilterDto leavePolicyFilterDto);

	ResponseEntityDto enableLeavePolicies();

	ResponseEntityDto getLeavePolicyConfig();

}
