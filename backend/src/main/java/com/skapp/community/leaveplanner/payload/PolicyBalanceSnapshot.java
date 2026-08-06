package com.skapp.community.leaveplanner.payload;

import com.skapp.community.leaveplanner.model.LeavePolicy;

import java.time.LocalDate;

public record PolicyBalanceSnapshot(LeavePolicy policy, LocalDate effectiveFrom, LocalDate cycleStart,
		LocalDate cycleEnd, float carriedForwardDays, float accruedDays, float totalDaysAllocated, float totalDaysUsed,
		float balanceInDays, boolean isUnlimited, boolean isDerived) {

	public LocalDate usableFrom() {
		return effectiveFrom.isAfter(cycleStart) ? effectiveFrom : cycleStart;
	}

	public boolean hasBalance() {
		return isUnlimited || balanceInDays > 0f;
	}

	public boolean canAccommodate(float requestedDays) {
		return isUnlimited || requestedDays <= balanceInDays;
	}

}
