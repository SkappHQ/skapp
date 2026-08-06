package com.skapp.community.leaveplanner.service;

import com.skapp.community.leaveplanner.constant.PolicyLeaveConstant;
import com.skapp.community.leaveplanner.model.EmployeeLeavePolicy;
import com.skapp.community.leaveplanner.model.LeavePolicy;
import com.skapp.community.leaveplanner.payload.PolicyBalanceSnapshot;
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

	public PolicyBalanceSnapshot calculateForYear(EmployeeLeavePolicy assignment, int year) {
		LeavePolicy policy = assignment.getPolicy();
		return calculate(assignment, PolicyLeaveAccrualUtil.resolveCycle(policy, year));
	}

	public PolicyBalanceSnapshot calculateForDate(EmployeeLeavePolicy assignment, LocalDate date) {
		LeavePolicy policy = assignment.getPolicy();
		return calculate(assignment, PolicyLeaveAccrualUtil.resolveCycleContaining(policy, date));
	}

	private PolicyBalanceSnapshot calculate(EmployeeLeavePolicy assignment, DateWindow targetCycle) {
		LeavePolicy policy = assignment.getPolicy();
		LocalDate effectiveFrom = assignment.getEffectiveFrom();

		if (policy.getPolicyType() == PolicyType.FLEXIBLE) {
			return unlimitedSnapshot(policy, effectiveFrom, targetCycle);
		}

		if (targetCycle.end().isBefore(effectiveFrom)) {
			return emptySnapshot(policy, effectiveFrom, targetCycle, true);
		}

		LocalDate accrualStartDate = PolicyLeaveAccrualUtil.resolveAccrualStartDate(policy, effectiveFrom);
		DateWindow cycle = PolicyLeaveAccrualUtil.resolveCycleContaining(policy, effectiveFrom);
		float carriedForwardDays = 0f;

		for (int guard = 0; guard < PolicyLeaveConstant.MAX_CARRYOVER_CYCLES; guard++) {
			float accruedDays = PolicyLeaveAccrualUtil.roundToHalfDay(
					PolicyLeaveAccrualUtil.accruedWithinCycle(policy, accrualStartDate, cycle, cycle.end()));
			float totalDaysAllocated = PolicyLeaveAccrualUtil.applyAccrualCap(policy, carriedForwardDays + accruedDays);
			float totalDaysUsed = committedDays(assignment, cycle);

			if (cycle.start().equals(targetCycle.start())) {
				return new PolicyBalanceSnapshot(policy, effectiveFrom, cycle.start(), cycle.end(), carriedForwardDays,
						accruedDays, totalDaysAllocated, totalDaysUsed, totalDaysAllocated - totalDaysUsed, false,
						true);
			}

			if (cycle.start().isAfter(targetCycle.start())) {
				return emptySnapshot(policy, effectiveFrom, targetCycle, true);
			}

			carriedForwardDays = PolicyLeaveAccrualUtil
				.roundToHalfDay(PolicyLeaveAccrualUtil.capCarryover(policy, totalDaysAllocated - totalDaysUsed));
			cycle = PolicyLeaveAccrualUtil.resolveCycleContaining(policy, cycle.end().plusDays(1));
		}

		log.warn("calculate: carryover walk exceeded {} cycles for assignment {}, balance could not be derived",
				PolicyLeaveConstant.MAX_CARRYOVER_CYCLES, assignment.getId());
		return emptySnapshot(policy, effectiveFrom, targetCycle, false);
	}

	private float committedDays(EmployeeLeavePolicy assignment, DateWindow cycle) {
		Double committed = policyLeaveRequestDao.sumCommittedDaysForPolicyInCycle(
				assignment.getEmployee().getEmployeeId(), assignment.getPolicy().getId(),
				PolicyLeaveConstant.BALANCE_HOLDING_STATUSES, cycle.start(), cycle.end());
		return committed == null ? 0f : committed.floatValue();
	}

	private PolicyBalanceSnapshot emptySnapshot(LeavePolicy policy, LocalDate effectiveFrom, DateWindow cycle,
			boolean isDerived) {
		return new PolicyBalanceSnapshot(policy, effectiveFrom, cycle.start(), cycle.end(), 0f, 0f, 0f, 0f, 0f, false,
				isDerived);
	}

	private PolicyBalanceSnapshot unlimitedSnapshot(LeavePolicy policy, LocalDate effectiveFrom, DateWindow cycle) {
		return new PolicyBalanceSnapshot(policy, effectiveFrom, cycle.start(), cycle.end(), 0f, 0f, 0f, 0f, 0f, true,
				true);
	}

}
