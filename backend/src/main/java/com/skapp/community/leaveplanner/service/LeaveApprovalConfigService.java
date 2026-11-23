package com.skapp.community.leaveplanner.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.leaveplanner.payload.request.LeaveApprovalConfigRequestDto;

public interface LeaveApprovalConfigService {

	ResponseEntityDto getLeaveApprovalConfig();

	ResponseEntityDto updateLeaveApprovalConfig(LeaveApprovalConfigRequestDto leaveApprovalConfigRequestDto);

	boolean isMultiLevelApprovalEnabled();

}
