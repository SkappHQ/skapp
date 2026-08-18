package com.skapp.community.leaveplanner.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.leaveplanner.model.EmployeeLeavePolicy;
import com.skapp.community.leaveplanner.payload.PolicyLeaveBalanceDto;
import com.skapp.community.leaveplanner.payload.request.PolicyLeaveAvailabilityRequestDto;
import com.skapp.community.leaveplanner.payload.request.PolicyLeaveRequestDto;
import com.skapp.community.leaveplanner.payload.request.PolicyLeaveRequestFilterDto;
import com.skapp.community.leaveplanner.payload.request.PolicyLeaveRequestUpdateDto;

import java.util.List;
import java.util.Map;

public interface PolicyLeaveService {

	ResponseEntityDto getCurrentUserPolicyBalances(Integer year);

	ResponseEntityDto checkPolicyLeaveAvailability(PolicyLeaveAvailabilityRequestDto availabilityRequestDto);

	ResponseEntityDto applyPolicyLeaveRequest(PolicyLeaveRequestDto policyLeaveRequestDto);

	ResponseEntityDto getCurrentUserPolicyLeaveRequests(PolicyLeaveRequestFilterDto policyLeaveRequestFilterDto);

	ResponseEntityDto getSupervisedPolicyLeaveRequests(PolicyLeaveRequestFilterDto policyLeaveRequestFilterDto);

	ResponseEntityDto getPolicyLeaveRequestById(Long id);

	ResponseEntityDto updatePolicyLeaveRequest(Long id, PolicyLeaveRequestUpdateDto policyLeaveRequestUpdateDto);

	ResponseEntityDto nudgePolicyLeaveRequestManagers(Long id);

	ResponseEntityDto getPolicyLeaveRequestNudgeStatus(Long id);

	PolicyLeaveBalanceDto calculateBalanceForYear(EmployeeLeavePolicy assignment, int year);

	Map<Long, PolicyLeaveBalanceDto> calculateBalancesForYear(Long employeeId, List<EmployeeLeavePolicy> assignments,
			int year);

}
