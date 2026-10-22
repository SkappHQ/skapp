package com.skapp.community.crmplanner.activity.util;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.crmplanner.activity.constant.CrmActivityConstants;
import com.skapp.community.crmplanner.constant.CrmMessageConstant;
import lombok.experimental.UtilityClass;

import java.time.LocalDate;

@UtilityClass
public class CrmActivityValidations {

	public void validateDateRange(LocalDate from, LocalDate to) {
		if (from != null && to != null && to.isBefore(from)) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_ACTIVITY_INVALID_DATE_RANGE);
		}
	}

	public void validatePage(int page) {
		if (page < 0 || page > CrmActivityConstants.MAX_PAGE) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_ACTIVITY_INVALID_PAGE);
		}
	}

}
