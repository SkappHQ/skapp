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

	private LocalDate usableFrom;

	private float accruedDays;

	private float carriedOverDays;

	private float totalDaysAllocated;

	private float totalDaysUsed;

	private float balanceInDays;

	private boolean isUnlimited;

	private boolean isDerived;

}
