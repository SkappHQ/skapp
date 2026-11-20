package com.skapp.community.leaveplanner.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.leaveplanner.payload.LeaveApprovalConfigDto;

public interface LeaveApprovalConfigService {

	ResponseEntityDto getLeaveApprovalConfig();

	ResponseEntityDto updateLeaveApprovalConfig(LeaveApprovalConfigDto leaveApprovalConfigDto);

	boolean isMultiLevelApprovalEnabled();

}
