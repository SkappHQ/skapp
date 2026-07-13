package com.skapp.community.leaveplanner.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.leaveplanner.payload.request.LeavePolicyRequestDto;

public interface LeavePolicyService {

	ResponseEntityDto addLeavePolicy(LeavePolicyRequestDto leavePolicyRequestDto);

	ResponseEntityDto getPolicyLeaveTypes();

}
