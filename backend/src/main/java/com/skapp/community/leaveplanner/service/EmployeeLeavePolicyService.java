package com.skapp.community.leaveplanner.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.leaveplanner.payload.request.AssignLeavePolicyRequestDto;
import com.skapp.community.leaveplanner.payload.request.UnassignLeavePolicyRequestDto;

public interface EmployeeLeavePolicyService {

	/**
	 * Assign a policy to an employee by opening a new effective-dated window. If the
	 * employee already has an open window for the same leave type, that window is closed
	 * (last-write-wins) in the same transaction.
	 */
	ResponseEntityDto assignLeavePolicy(AssignLeavePolicyRequestDto assignLeavePolicyRequestDto);

	/**
	 * Unassign a policy by closing the employee's open window for it. Throws
	 * {@code EntityNotFoundException} if the employee has no active assignment for the
	 * policy.
	 */
	ResponseEntityDto unassignLeavePolicy(UnassignLeavePolicyRequestDto unassignLeavePolicyRequestDto);

	/**
	 * List an employee's currently active (open) policy assignments for the profile
	 * section.
	 */
	ResponseEntityDto getEmployeeLeavePolicies(Long employeeId);

	/**
	 * Close every open window for a policy. Intended to be reused by the
	 * policy-deactivation flow so deactivating a policy also ends its active employee
	 * assignments.
	 * @return number of windows closed
	 */
	int endOpenWindowsForPolicy(Long policyId);

}
