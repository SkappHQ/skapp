package com.skapp.community.leaveplanner.service.impl;

import com.skapp.community.leaveplanner.constant.PolicyLeaveConstant;
import com.skapp.community.leaveplanner.model.EmployeeLeavePolicy;
import com.skapp.community.leaveplanner.model.LeavePolicy;
import com.skapp.community.leaveplanner.payload.PolicyLeaveBalanceDto;
import com.skapp.community.leaveplanner.payload.PolicyLeaveDateWindowDto;
import com.skapp.community.leaveplanner.repository.PolicyLeaveRequestDao;
import com.skapp.community.leaveplanner.service.PolicyLeaveBalanceService;
import com.skapp.community.leaveplanner.type.PolicyType;
import com.skapp.community.leaveplanner.util.PolicyLeaveAccrualUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class PolicyLeaveBalanceServiceImpl implements PolicyLeaveBalanceService {

	private final PolicyLeaveRequestDao policyLeaveRequestDao;

	@Override
	@Transactional(readOnly = true)
	public PolicyLeaveBalanceDto calculateBalanceForYear(EmployeeLeavePolicy assignment, int year) {
		return calculateBalance(assignment, PolicyLeaveAccrualUtil.resolveCycle(year));
	}

	@Override
	@Transactional(readOnly = true)
	public PolicyLeaveBalanceDto calculateBalanceForDate(EmployeeLeavePolicy assignment, LocalDate date) {
		return calculateBalance(assignment, PolicyLeaveAccrualUtil.resolveCycleContaining(date));
	}

	private PolicyLeaveBalanceDto calculateBalance(EmployeeLeavePolicy assignment, PolicyLeaveDateWindowDto cycle) {
		LeavePolicy policy = assignment.getPolicy();
		LocalDate effectiveFrom = assignment.getEffectiveFrom();

		if (policy.getPolicyType() == PolicyType.FLEXIBLE) {
			return unlimitedBalance(policy, effectiveFrom, cycle);
		}

		if (cycle.getEndDate().isBefore(effectiveFrom)) {
			return emptyBalance(policy, effectiveFrom, cycle);
		}

		LocalDate accrualStartDate = PolicyLeaveAccrualUtil.resolveAccrualStartDate(policy, effectiveFrom);
		float accruedDays = PolicyLeaveAccrualUtil.roundToHalfDay(
				PolicyLeaveAccrualUtil.accruedWithinCycle(policy, accrualStartDate, cycle, cycle.getEndDate()));
		float totalDaysAllocated = PolicyLeaveAccrualUtil.applyAccrualCap(policy, accruedDays);
		float totalDaysUsed = totalDaysUsedInCycle(assignment, cycle);

		PolicyLeaveBalanceDto balance = new PolicyLeaveBalanceDto();
		balance.setPolicy(policy);
		balance.setEffectiveFrom(effectiveFrom);
		balance.setCycleStart(cycle.getStartDate());
		balance.setCycleEnd(cycle.getEndDate());
		balance.setUsableFrom(resolveUsableFrom(effectiveFrom, cycle));
		balance.setAccruedDays(accruedDays);
		balance.setTotalDaysAllocated(totalDaysAllocated);
		balance.setTotalDaysUsed(totalDaysUsed);
		balance.setBalanceInDays(totalDaysAllocated - totalDaysUsed);
		balance.setUnlimited(false);
		balance.setDerived(true);
		return balance;
	}

	private float totalDaysUsedInCycle(EmployeeLeavePolicy assignment, PolicyLeaveDateWindowDto cycle) {
		Double totalDaysUsed = policyLeaveRequestDao.sumCommittedDaysForPolicyInCycle(
				assignment.getEmployee().getEmployeeId(), assignment.getPolicy().getId(),
				PolicyLeaveConstant.BALANCE_HOLDING_STATUSES, cycle.getStartDate(), cycle.getEndDate());
		return totalDaysUsed == null ? 0f : totalDaysUsed.floatValue();
	}

	private PolicyLeaveBalanceDto emptyBalance(LeavePolicy policy, LocalDate effectiveFrom,
			PolicyLeaveDateWindowDto cycle) {
		PolicyLeaveBalanceDto balance = zeroedBalance(policy, effectiveFrom, cycle);
		balance.setUnlimited(false);
		balance.setDerived(true);
		return balance;
	}

	private PolicyLeaveBalanceDto unlimitedBalance(LeavePolicy policy, LocalDate effectiveFrom,
			PolicyLeaveDateWindowDto cycle) {
		PolicyLeaveBalanceDto balance = zeroedBalance(policy, effectiveFrom, cycle);
		balance.setUnlimited(true);
		balance.setDerived(true);
		return balance;
	}

	private PolicyLeaveBalanceDto zeroedBalance(LeavePolicy policy, LocalDate effectiveFrom,
			PolicyLeaveDateWindowDto cycle) {
		PolicyLeaveBalanceDto balance = new PolicyLeaveBalanceDto();
		balance.setPolicy(policy);
		balance.setEffectiveFrom(effectiveFrom);
		balance.setCycleStart(cycle.getStartDate());
		balance.setCycleEnd(cycle.getEndDate());
		balance.setUsableFrom(resolveUsableFrom(effectiveFrom, cycle));
		balance.setAccruedDays(0f);
		balance.setTotalDaysAllocated(0f);
		balance.setTotalDaysUsed(0f);
		balance.setBalanceInDays(0f);
		return balance;
	}

	private LocalDate resolveUsableFrom(LocalDate effectiveFrom, PolicyLeaveDateWindowDto cycle) {
		return effectiveFrom.isAfter(cycle.getStartDate()) ? effectiveFrom : cycle.getStartDate();
	}

}
