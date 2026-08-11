package com.skapp.community.leaveplanner.util;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.leaveplanner.constant.LeaveMessageConstant;
import com.skapp.community.leaveplanner.payload.request.AssignLeavePolicyRequestDto;
import com.skapp.community.leaveplanner.type.EffectiveDateType;
import com.skapp.community.peopleplanner.model.Employee;
import lombok.experimental.UtilityClass;

import java.time.LocalDate;

@UtilityClass
public class EmployeeLeavePolicyUtil {

	public static LocalDate resolveEffectiveFrom(AssignLeavePolicyRequestDto dto, Employee employee) {
		if (dto.getEffectiveDateType() == EffectiveDateType.SPECIFIC) {
			if (dto.getSpecificDate() == null) {
				throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_LEAVE_POLICY_SPECIFIC_DATE_REQUIRED);
			}
			return dto.getSpecificDate();
		}

		if (employee.getJoinDate() == null) {
			throw new ModuleException(LeaveMessageConstant.LEAVE_ERROR_LEAVE_POLICY_JOIN_DATE_UNAVAILABLE);
		}
		return employee.getJoinDate();
	}

}
