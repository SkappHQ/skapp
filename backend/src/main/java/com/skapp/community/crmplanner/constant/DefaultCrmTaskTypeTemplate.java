package com.skapp.community.crmplanner.constant;

import java.util.List;

import com.skapp.community.crmplanner.model.CrmTaskType;
import com.skapp.community.crmplanner.type.DefaultCrmTaskTypeValues;

public class DefaultCrmTaskTypeTemplate {

	public static List<CrmTaskType> getDefaultTaskTypes() {
		return List.of(taskType(DefaultCrmTaskTypeValues.CALL), taskType(DefaultCrmTaskTypeValues.EMAIL),
				taskType(DefaultCrmTaskTypeValues.MEETING), taskType(DefaultCrmTaskTypeValues.OTHER));
	}

	private static CrmTaskType taskType(DefaultCrmTaskTypeValues value) {
		CrmTaskType taskType = new CrmTaskType();
		taskType.setName(value.getName());
		taskType.setOrderIndex(value.getOrderIndex());
		return taskType;
	}

	private DefaultCrmTaskTypeTemplate() {
	}

}
