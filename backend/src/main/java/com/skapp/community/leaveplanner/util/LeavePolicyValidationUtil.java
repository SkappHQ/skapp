package com.skapp.community.leaveplanner.util;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.leaveplanner.constant.LeaveMessageConstant;
import com.skapp.community.leaveplanner.constant.LeavePolicyConstant;
import com.skapp.community.leaveplanner.payload.request.LeavePolicyAccrualDetailDto;
import com.skapp.community.leaveplanner.payload.request.LeavePolicyRequestDto;
import com.skapp.community.leaveplanner.type.PolicyType;
import lombok.experimental.UtilityClass;

import java.time.MonthDay;
import java.time.format.DateTimeParseException;

@UtilityClass
public class LeavePolicyValidationUtil {

	public static void validateRequiredFields(LeavePolicyRequestDto dto) {
		if (dto.getLeaveTypeId() == null) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_LEAVE_POLICY_LEAVE_TYPE_REQUIRED);
		}
		if (dto.getPolicyType() == null) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_LEAVE_POLICY_POLICY_TYPE_REQUIRED);
		}
	}

	public static void validateName(String name) {
		if (name == null || name.isBlank()) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_LEAVE_POLICY_NAME_REQUIRED);
		}
		if (name.length() > LeavePolicyConstant.MAX_NAME_LENGTH) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_LEAVE_POLICY_NAME_MAX_LENGTH_EXCEEDED);
		}
	}

	public static void validateEntitlementSetup(LeavePolicyRequestDto dto) {
		if (dto.getPolicyType() == PolicyType.FLEXIBLE) {
			validateFlexibleSetup(dto);
		}
		else {
			validateAccrualSetup(dto.getAccrual());
		}
	}

	private static void validateFlexibleSetup(LeavePolicyRequestDto dto) {
		if (dto.getAccrual() != null) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_LEAVE_POLICY_ACCRUAL_CONFIG_NOT_ALLOWED);
		}
	}

	private static void validateAccrualSetup(LeavePolicyAccrualDetailDto accrual) {
		if (accrual == null) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_LEAVE_POLICY_ACCRUAL_CONFIG_REQUIRED);
		}
		if (accrual.getAccrualDays() == null || accrual.getAccrualDays() < LeavePolicyConstant.MIN_DAYS
				|| accrual.getAccrualDays() > LeavePolicyConstant.MAX_DAYS) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_LEAVE_POLICY_ACCRUAL_DAYS_INVALID);
		}
		if (accrual.getFrequency() == null) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_LEAVE_POLICY_ACCRUAL_FREQUENCY_REQUIRED);
		}
		if (accrual.getWaitingPeriodDays() != null && accrual.getWaitingPeriodDays() < 1) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_LEAVE_POLICY_WAITING_PERIOD_INVALID);
		}
		if (accrual.getAccrualCapDays() != null && accrual.getAccrualCapDays() < 1) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_LEAVE_POLICY_ACCRUAL_CAP_INVALID);
		}
		if (Boolean.TRUE.equals(accrual.getIsCarryoverEnabled())) {
			validateCarryoverSetup(accrual);
		}
	}

	private static void validateCarryoverSetup(LeavePolicyAccrualDetailDto accrual) {
		if (accrual.getCarryoverDate() == null || accrual.getCarryoverDate().isBlank()) {
			accrual.setCarryoverDate(LeavePolicyConstant.DEFAULT_CARRYOVER_DATE);
		}
		else {
			try {
				MonthDay.parse("--" + accrual.getCarryoverDate());
			}
			catch (DateTimeParseException e) {
				throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_LEAVE_POLICY_CARRYOVER_DATE_INVALID);
			}
		}
		if (accrual.getMaxCarryoverDays() != null && (accrual.getMaxCarryoverDays() < LeavePolicyConstant.MIN_DAYS
				|| accrual.getMaxCarryoverDays() > LeavePolicyConstant.MAX_DAYS)) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_LEAVE_POLICY_MAX_CARRYOVER_DAYS_INVALID);
		}
	}

}
