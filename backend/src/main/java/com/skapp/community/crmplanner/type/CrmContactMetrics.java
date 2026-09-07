package com.skapp.community.crmplanner.type;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class CrmContactMetrics {

	private final String closedDealValue;

	private final Long closedDealCount;

	private final Long openTasksCount;

	private final Long overdueTasksCount;

	private final String pipelineRevenue;

	private final Long activeDealsCount;

}
