package com.skapp.community.crmplanner.type;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class CrmActiveDealSummary {

	private final Long contactId;

	private final Double totalPipelineValue;

	private final Long activeDealsCount;

}
