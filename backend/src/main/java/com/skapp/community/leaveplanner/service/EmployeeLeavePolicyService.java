package com.skapp.community.leaveplanner.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.leaveplanner.payload.request.AssignLeavePolicyRequestDto;
import com.skapp.community.leaveplanner.payload.request.UnassignLeavePolicyRequestDto;
import com.skapp.community.leaveplanner.payload.response.AssignLeavePolicyResultDto;

public interface EmployeeLeavePolicyService {

	AssignLeavePolicyResultDto assignLeavePolicy(AssignLeavePolicyRequestDto assignLeavePolicyRequestDto);

	ResponseEntityDto unassignLeavePolicy(UnassignLeavePolicyRequestDto unassignLeavePolicyRequestDto);

	ResponseEntityDto getEmployeeLeavePolicies(Long employeeId);

}
