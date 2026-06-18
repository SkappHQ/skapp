package com.skapp.community.crmplanner.type;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class CrmTaskSummary {

	private final Long contactId;

	private final Long openTaskCount;

	private final Long overdueTaskCount;

}
