package com.skapp.community.crmplanner.type;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class CrmCompanyMetrics {

	private final Long openTasksCount;

	private final Long overdueTasksCount;

	private final String openValue;

	private final String accountValue;

	private final Long openDealsCount;

	private final Long closedDealsCount;

}
