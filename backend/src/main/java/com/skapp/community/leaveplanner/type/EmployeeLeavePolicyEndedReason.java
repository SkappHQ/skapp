package com.skapp.community.leaveplanner.type;

/**
 * Why an {@link com.skapp.community.leaveplanner.model.EmployeeLeavePolicy} window was
 * closed. Stored in {@code ended_reason} when a window transitions to {@code ENDED}.
 */
public enum EmployeeLeavePolicyEndedReason {

	/** Admin explicitly unassigned the policy from the employee. */
	UNASSIGNED,

	/** Replaced by a newer policy of the same leave type. */
	SUPERSEDED,

	/** The governing policy was deactivated. */
	POLICY_DEACTIVATED

}
