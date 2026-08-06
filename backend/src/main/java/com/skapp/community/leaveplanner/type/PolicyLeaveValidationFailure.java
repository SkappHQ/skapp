package com.skapp.community.leaveplanner.type;

/**
 * Why a policy-scoped leave request cannot be accepted. Returned (rather than thrown) by
 * the availability pre-check so the modal can render an inline error while the user is
 * still editing.
 */
public enum PolicyLeaveValidationFailure {

	INVALID_DATE_RANGE, OUTSIDE_POLICY_PERIOD, NO_WORKING_DAYS, OVERLAPPING_REQUEST, INSUFFICIENT_BALANCE

}
