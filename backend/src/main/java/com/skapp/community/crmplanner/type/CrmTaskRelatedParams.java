package com.skapp.community.crmplanner.type;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class CrmTaskRelatedParams {

	private final Long contactId;

	private final Long dealId;

	private final Long excludeTaskId;

}
