package com.skapp.community.crmplanner.type;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class CrmContactTaskMetrics {

	private final Long openTasksCount;

	private final Long overdueTasksCount;

}
