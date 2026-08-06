package com.skapp.community.leaveplanner.payload;

import com.skapp.community.leaveplanner.model.LeavePolicy;

import java.time.LocalDate;

/**
 * A derived, point-in-time view of one employee's balance on one policy for one cycle.
 * Nothing here is persisted — see
 * {@link com.skapp.community.leaveplanner.util.PolicyLeaveAccrualUtil}. This is an
 * internal calculation result, never serialized to a client.
 *
 * @param policy the policy this balance belongs to
 * @param effectiveFrom the employee's assignment effective date for the policy
 * @param cycleStart start of the policy cycle this snapshot covers
 * @param cycleEnd end of the policy cycle; also the date the balance expires
 * @param carriedForwardDays days carried in from the previous cycle, already capped
 * @param accruedDays days earned inside this cycle
 * @param totalDaysAllocated carriedForwardDays + accruedDays, capped at the accrual cap
 * @param totalDaysUsed days held by PENDING or APPROVED requests starting in this cycle
 * @param balanceInDays totalDaysAllocated - totalDaysUsed
 * @param isUnlimited true for FLEXIBLE policies, which have no balance to deduct from
 * @param isDerived false when the balance could not be computed, so callers render the
 * "—" placeholder rather than a misleading zero
 */
public record PolicyBalanceSnapshot(LeavePolicy policy, LocalDate effectiveFrom, LocalDate cycleStart,
		LocalDate cycleEnd, float carriedForwardDays, float accruedDays, float totalDaysAllocated, float totalDaysUsed,
		float balanceInDays, boolean isUnlimited, boolean isDerived) {

	/**
	 * The date from which this policy is usable within the cycle — the later of the cycle
	 * start and the employee's assignment effective date.
	 */
	public LocalDate usableFrom() {
		return effectiveFrom.isAfter(cycleStart) ? effectiveFrom : cycleStart;
	}

	/**
	 * Whether leave can still be drawn against this policy. Unlimited policies always can.
	 */
	public boolean hasBalance() {
		return isUnlimited || balanceInDays > 0f;
	}

	/**
	 * Whether the requested days fit. Unlimited policies never fail this check.
	 */
	public boolean canAccommodate(float requestedDays) {
		return isUnlimited || requestedDays <= balanceInDays;
	}

}
