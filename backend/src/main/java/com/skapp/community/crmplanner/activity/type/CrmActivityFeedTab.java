package com.skapp.community.crmplanner.activity.type;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum CrmActivityFeedTab {

	ALL(null), TASK(CrmActivityType.TASK), CALL(CrmActivityType.CALL), MEETING(CrmActivityType.MEETING),
	EMAIL(CrmActivityType.EMAIL);

	private final CrmActivityType activityType;

}
