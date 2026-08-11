package com.skapp.community.leaveplanner.payload;

import com.skapp.community.leaveplanner.model.LeavePolicy;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PolicyLeaveBalanceDto {

	private LeavePolicy policy;

	private LocalDate effectiveFrom;

	private LocalDate cycleStart;

	private LocalDate cycleEnd;

	private float carriedForwardDays;

	private float accruedDays;

	private float totalDaysAllocated;

	private float totalDaysUsed;

	private float balanceInDays;

	private boolean isUnlimited;

	private boolean isDerived;

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
