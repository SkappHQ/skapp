package com.skapp.community.crmplanner.constant;

import java.util.Arrays;
import java.util.List;

import com.skapp.community.crmplanner.model.CrmTaskType;
import com.skapp.community.crmplanner.type.DefaultCrmTaskTypeValues;

public class DefaultCrmTaskTypeTemplate {

	public static List<CrmTaskType> getDefaultTaskTypes() {
		return Arrays.stream(DefaultCrmTaskTypeValues.values()).map(value -> {
			CrmTaskType taskType = new CrmTaskType();
			taskType.setName(value.getName());
			taskType.setOrderIndex(value.getOrderIndex());
			return taskType;
		}).toList();
	}

	private DefaultCrmTaskTypeTemplate() {
	}

}
