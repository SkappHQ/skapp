package com.skapp.community.leaveplanner.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.leaveplanner.payload.request.AssignLeavePolicyRequestDto;
import com.skapp.community.leaveplanner.payload.request.UnassignLeavePolicyRequestDto;

public interface EmployeeLeavePolicyService {

	ResponseEntityDto assignLeavePolicy(AssignLeavePolicyRequestDto assignLeavePolicyRequestDto);

	ResponseEntityDto unassignLeavePolicy(UnassignLeavePolicyRequestDto unassignLeavePolicyRequestDto);

	ResponseEntityDto getEmployeeLeavePolicies(Long employeeId);

}
