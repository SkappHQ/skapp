package com.skapp.community.crmplanner.type;

import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
public class CrmActivityTaskFilterParams extends CrmActivityListParams {

	private CrmActivityTaskSort sortKey;

	private CrmActivityTaskStatus taskStatus;

	private CrmActivityTaskPriority priority;

	private Instant todayStart;

	private Instant todayEnd;

}
