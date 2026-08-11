package com.skapp.community.leaveplanner.service;

import com.skapp.community.leaveplanner.constant.PolicyLeaveConstant;
import com.skapp.community.leaveplanner.model.EmployeeLeavePolicy;
import com.skapp.community.leaveplanner.model.LeavePolicy;
import com.skapp.community.leaveplanner.payload.PolicyLeaveBalanceDto;
import com.skapp.community.leaveplanner.repository.PolicyLeaveRequestDao;
import com.skapp.community.leaveplanner.type.PolicyType;
import com.skapp.community.leaveplanner.util.PolicyLeaveAccrualUtil;
import com.skapp.community.leaveplanner.util.PolicyLeaveAccrualUtil.DateWindow;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

/**
 * Derives a policy leave balance for a single accrual cycle.
 *
 * Carryover is deliberately out of scope here: a cycle's balance is what its own accrual
 * schedule earned minus what was used inside it. Carried-over days, their expiry and the
 * carryover/accrual bucket split are owned by a separate story and must not leak into
 * this calculation or into the apply flow that consumes it.
 */
@Component
@RequiredArgsConstructor
public class PolicyLeaveBalanceCalculator {

	private final PolicyLeaveRequestDao policyLeaveRequestDao;

	public PolicyLeaveBalanceDto calculateForYear(EmployeeLeavePolicy assignment, int year) {
		return calculate(assignment, PolicyLeaveAccrualUtil.resolveCycle(year));
	}

	public PolicyLeaveBalanceDto calculateForDate(EmployeeLeavePolicy assignment, LocalDate date) {
		return calculate(assignment, PolicyLeaveAccrualUtil.resolveCycleContaining(date));
	}

	private PolicyLeaveBalanceDto calculate(EmployeeLeavePolicy assignment, DateWindow cycle) {
		LeavePolicy policy = assignment.getPolicy();
		LocalDate effectiveFrom = assignment.getEffectiveFrom();

		if (policy.getPolicyType() == PolicyType.FLEXIBLE) {
			return unlimitedBalance(policy, effectiveFrom, cycle);
		}

		if (cycle.end().isBefore(effectiveFrom)) {
			return emptyBalance(policy, effectiveFrom, cycle);
		}

		LocalDate accrualStartDate = PolicyLeaveAccrualUtil.resolveAccrualStartDate(policy, effectiveFrom);
		float accruedDays = PolicyLeaveAccrualUtil
			.roundToHalfDay(PolicyLeaveAccrualUtil.accruedWithinCycle(policy, accrualStartDate, cycle, cycle.end()));
		float totalDaysAllocated = PolicyLeaveAccrualUtil.applyAccrualCap(policy, accruedDays);
		float totalDaysUsed = totalDaysUsedInCycle(assignment, cycle);

		PolicyLeaveBalanceDto balance = new PolicyLeaveBalanceDto();
		balance.setPolicy(policy);
		balance.setEffectiveFrom(effectiveFrom);
		balance.setCycleStart(cycle.start());
		balance.setCycleEnd(cycle.end());
		balance.setAccruedDays(accruedDays);
		balance.setTotalDaysAllocated(totalDaysAllocated);
		balance.setTotalDaysUsed(totalDaysUsed);
		balance.setBalanceInDays(totalDaysAllocated - totalDaysUsed);
		balance.setUnlimited(false);
		balance.setDerived(true);
		return balance;
	}

	private float totalDaysUsedInCycle(EmployeeLeavePolicy assignment, DateWindow cycle) {
		Double totalDaysUsed = policyLeaveRequestDao.sumCommittedDaysForPolicyInCycle(
				assignment.getEmployee().getEmployeeId(), assignment.getPolicy().getId(),
				PolicyLeaveConstant.BALANCE_HOLDING_STATUSES, cycle.start(), cycle.end());
		return totalDaysUsed == null ? 0f : totalDaysUsed.floatValue();
	}

	private PolicyLeaveBalanceDto emptyBalance(LeavePolicy policy, LocalDate effectiveFrom, DateWindow cycle) {
		PolicyLeaveBalanceDto balance = zeroedBalance(policy, effectiveFrom, cycle);
		balance.setUnlimited(false);
		balance.setDerived(true);
		return balance;
	}

	private PolicyLeaveBalanceDto unlimitedBalance(LeavePolicy policy, LocalDate effectiveFrom, DateWindow cycle) {
		PolicyLeaveBalanceDto balance = zeroedBalance(policy, effectiveFrom, cycle);
		balance.setUnlimited(true);
		balance.setDerived(true);
		return balance;
	}

	private PolicyLeaveBalanceDto zeroedBalance(LeavePolicy policy, LocalDate effectiveFrom, DateWindow cycle) {
		PolicyLeaveBalanceDto balance = new PolicyLeaveBalanceDto();
		balance.setPolicy(policy);
		balance.setEffectiveFrom(effectiveFrom);
		balance.setCycleStart(cycle.start());
		balance.setCycleEnd(cycle.end());
		balance.setAccruedDays(0f);
		balance.setTotalDaysAllocated(0f);
		balance.setTotalDaysUsed(0f);
		balance.setBalanceInDays(0f);
		return balance;
	}

}
