package com.skapp.community.crmplanner.activity.type;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class CrmActivityLinkedContact {

	private final Long activityId;

	private final Long contactId;

	private final String contactName;

	private final Boolean contactDeleted;

}
