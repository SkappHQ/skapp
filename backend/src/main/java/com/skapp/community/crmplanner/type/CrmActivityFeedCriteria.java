package com.skapp.community.crmplanner.type;

import java.time.Instant;
import java.util.Set;

public record CrmActivityFeedCriteria(CrmActivityType type, Set<Long> ownerIds, String searchPattern,
		Instant rangeStart, Instant rangeEnd, Instant now, Instant todayStart, Instant tomorrowStart, int page,
		int pageSize) {
}
