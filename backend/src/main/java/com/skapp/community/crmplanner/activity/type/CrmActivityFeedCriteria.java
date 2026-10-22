package com.skapp.community.crmplanner.activity.type;

import java.time.Instant;
import java.util.Set;

public record CrmActivityFeedCriteria(CrmActivityType type, Set<Long> ownerIds, String searchPattern,
		Instant rangeStart, Instant rangeEnd) {

}
