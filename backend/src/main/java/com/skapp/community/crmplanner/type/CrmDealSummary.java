package com.skapp.community.crmplanner.type;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class CrmDealSummary {

	private final Long contactId;

	private final Double totalClosedValue;

	private final Long closedDealCount;

}
