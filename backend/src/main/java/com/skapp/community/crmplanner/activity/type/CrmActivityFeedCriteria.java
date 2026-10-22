package com.skapp.community.crmplanner.activity.type;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.Instant;
import java.util.Set;

@Getter
@AllArgsConstructor
public class CrmActivityFeedCriteria {

	private final CrmActivityType type;

	private final Set<Long> ownerIds;

	private final String searchPattern;

	private final Instant rangeStart;

	private final Instant rangeEnd;

	private final Instant now;

}
