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
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Slf4j
@Component
@RequiredArgsConstructor
public class PolicyLeaveBalanceCalculator {

	private final PolicyLeaveRequestDao policyLeaveRequestDao;

	public PolicyLeaveBalanceDto calculateForYear(EmployeeLeavePolicy assignment, int year) {
		LeavePolicy policy = assignment.getPolicy();
		return calculate(assignment, PolicyLeaveAccrualUtil.resolveCycle(policy, year));
	}

	public PolicyLeaveBalanceDto calculateForDate(EmployeeLeavePolicy assignment, LocalDate date) {
		LeavePolicy policy = assignment.getPolicy();
		return calculate(assignment, PolicyLeaveAccrualUtil.resolveCycleContaining(policy, date));
	}

	private PolicyLeaveBalanceDto calculate(EmployeeLeavePolicy assignment, DateWindow targetCycle) {
		LeavePolicy policy = assignment.getPolicy();
		LocalDate effectiveFrom = assignment.getEffectiveFrom();

		if (policy.getPolicyType() == PolicyType.FLEXIBLE) {
			return unlimitedBalance(policy, effectiveFrom, targetCycle);
		}

		if (targetCycle.end().isBefore(effectiveFrom)) {
			return emptyBalance(policy, effectiveFrom, targetCycle, true);
		}

		LocalDate accrualStartDate = PolicyLeaveAccrualUtil.resolveAccrualStartDate(policy, effectiveFrom);
		DateWindow cycle = PolicyLeaveAccrualUtil.resolveCycleContaining(policy, effectiveFrom);
		float carriedForwardDays = 0f;

		while (true) {
			float accruedDays = PolicyLeaveAccrualUtil.roundToHalfDay(
					PolicyLeaveAccrualUtil.accruedWithinCycle(policy, accrualStartDate, cycle, cycle.end()));
			float totalDaysAllocated = PolicyLeaveAccrualUtil.applyAccrualCap(policy, carriedForwardDays + accruedDays);
			float totalDaysUsed = totalDaysUsedInCycle(assignment, cycle);

			if (cycle.start().equals(targetCycle.start())) {
				PolicyLeaveBalanceDto balance = new PolicyLeaveBalanceDto();
				balance.setPolicy(policy);
				balance.setEffectiveFrom(effectiveFrom);
				balance.setCycleStart(cycle.start());
				balance.setCycleEnd(cycle.end());
				balance.setCarriedForwardDays(carriedForwardDays);
				balance.setAccruedDays(accruedDays);
				balance.setTotalDaysAllocated(totalDaysAllocated);
				balance.setTotalDaysUsed(totalDaysUsed);
				balance.setBalanceInDays(totalDaysAllocated - totalDaysUsed);
				balance.setUnlimited(false);
				balance.setDerived(true);
				return balance;
			}

			if (cycle.start().isAfter(targetCycle.start())) {
				return emptyBalance(policy, effectiveFrom, targetCycle, true);
			}

			carriedForwardDays = PolicyLeaveAccrualUtil
				.roundToHalfDay(PolicyLeaveAccrualUtil.capCarryover(policy, totalDaysAllocated - totalDaysUsed));

			DateWindow nextCycle = PolicyLeaveAccrualUtil.resolveCycleContaining(policy, cycle.end().plusDays(1));
			if (!nextCycle.start().isAfter(cycle.start())) {
				log.warn("calculate: carryover cycle failed to advance, balance could not be derived");
				return emptyBalance(policy, effectiveFrom, targetCycle, false);
			}
			cycle = nextCycle;
		}
	}

	private float totalDaysUsedInCycle(EmployeeLeavePolicy assignment, DateWindow cycle) {
		Double totalDaysUsed = policyLeaveRequestDao.sumCommittedDaysForPolicyInCycle(
				assignment.getEmployee().getEmployeeId(), assignment.getPolicy().getId(),
				PolicyLeaveConstant.BALANCE_HOLDING_STATUSES, cycle.start(), cycle.end());
		return totalDaysUsed == null ? 0f : totalDaysUsed.floatValue();
	}

	private PolicyLeaveBalanceDto emptyBalance(LeavePolicy policy, LocalDate effectiveFrom, DateWindow cycle,
			boolean isDerived) {
		PolicyLeaveBalanceDto balance = zeroedBalance(policy, effectiveFrom, cycle);
		balance.setUnlimited(false);
		balance.setDerived(isDerived);
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
		balance.setCarriedForwardDays(0f);
		balance.setAccruedDays(0f);
		balance.setTotalDaysAllocated(0f);
		balance.setTotalDaysUsed(0f);
		balance.setBalanceInDays(0f);
		return balance;
	}

}
