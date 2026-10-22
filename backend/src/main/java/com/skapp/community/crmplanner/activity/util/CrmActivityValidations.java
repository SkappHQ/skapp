package com.skapp.community.crmplanner.activity.util;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.crmplanner.constant.CrmConstants;
import com.skapp.community.crmplanner.constant.CrmMessageConstant;
import com.skapp.community.crmplanner.model.CrmContact;
import com.skapp.community.crmplanner.model.CrmDeal;
import lombok.experimental.UtilityClass;

import java.time.LocalDate;

@UtilityClass
public class CrmActivityValidations {

	public void validateDateRange(LocalDate from, LocalDate to) {
		if (from != null && to != null && to.isBefore(from)) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_ACTIVITY_INVALID_DATE_RANGE);
		}
	}

	public void validateTaskCompletion(Boolean isCompleted) {
		if (isCompleted == null) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_ACTIVITY_TASK_STATUS_REQUIRED);
		}
	}

	public void validateTaskName(String name) {
		if (name == null || name.isBlank()) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_TASK_NAME_REQUIRED);
		}

		if (name.length() > CrmConstants.TASK_NAME_MAX_LENGTH) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_TASK_NAME_TOO_LONG);
		}
	}

	public void validateTaskNotes(String notes) {
		if (notes != null && notes.length() > CrmConstants.TASK_NOTES_MAX_LENGTH) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_TASK_NOTES_TOO_LONG);
		}
	}

	public void validateDealBelongsToContact(CrmDeal deal, CrmContact contact) {
		if (deal == null || contact == null) {
			return;
		}

		if (!deal.getContact().getId().equals(contact.getId())) {
			throw new ModuleException(CrmMessageConstant.CRM_ERROR_TASK_DEAL_CONTACT_MISMATCH);
		}
	}

}
