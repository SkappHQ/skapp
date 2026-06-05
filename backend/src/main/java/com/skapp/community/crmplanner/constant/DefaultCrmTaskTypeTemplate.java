package com.skapp.community.crmplanner.constant;

import java.util.List;

import com.skapp.community.crmplanner.model.CrmTaskType;
import com.skapp.community.crmplanner.type.DefaultCrmTaskTypeValues;

import lombok.experimental.UtilityClass;

@UtilityClass
public class DefaultCrmTaskTypeTemplate {

	public static List<CrmTaskType> getDefaultTaskTypes() {
		return DefaultCrmTaskTypeValues.DEFAULT_TASK_TYPES.stream()
			.map(DefaultCrmTaskTypeTemplate::toCrmTaskTypeEntity)
			.toList();
	}

	private static CrmTaskType toCrmTaskTypeEntity(DefaultCrmTaskTypeValues value) {
		CrmTaskType taskType = new CrmTaskType();
		taskType.setName(value.getName().getDisplayName());
		taskType.setOrderIndex(value.getOrderIndex());
		return taskType;
	}

}
