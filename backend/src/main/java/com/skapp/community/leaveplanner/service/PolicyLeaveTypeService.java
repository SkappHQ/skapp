package com.skapp.community.leaveplanner.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.leaveplanner.payload.request.PolicyLeaveTypeFilterDto;
import com.skapp.community.leaveplanner.payload.request.PolicyLeaveTypeRequestDto;
import com.skapp.community.leaveplanner.payload.request.PolicyLeaveTypeUpdateRequestDto;

public interface PolicyLeaveTypeService {

	ResponseEntityDto getPolicyLeaveTypes();

	ResponseEntityDto addPolicyLeaveType(PolicyLeaveTypeRequestDto policyLeaveTypeRequestDto);

	ResponseEntityDto searchPolicyLeaveTypes(PolicyLeaveTypeFilterDto policyLeaveTypeFilterDto);

	ResponseEntityDto getPolicyLeaveTypeById(Long id);

	ResponseEntityDto updatePolicyLeaveType(Long id, PolicyLeaveTypeUpdateRequestDto policyLeaveTypeUpdateRequestDto);

	ResponseEntityDto deactivatePolicyLeaveType(Long id);

	ResponseEntityDto activatePolicyLeaveType(Long id);

}
