package com.skapp.community.crmplanner.type;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class CrmCompanyMetricsSummary {

	private final Long companyId;

	private final Long openTasksCount;

	private final Long overdue;

	private final String openValue;

	private final String accountValue;

	private final Long openDeals;

	private final Long closedDeals;

}
