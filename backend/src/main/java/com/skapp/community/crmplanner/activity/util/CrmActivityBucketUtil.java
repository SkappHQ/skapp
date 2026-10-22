package com.skapp.community.crmplanner.activity.util;

import com.skapp.community.crmplanner.activity.type.CrmActivityBucket;
import com.skapp.community.crmplanner.activity.type.CrmActivityFeedRecord;
import com.skapp.community.crmplanner.activity.type.CrmActivityType;
import lombok.experimental.UtilityClass;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;

@UtilityClass
public class CrmActivityBucketUtil {

	public CrmActivityBucket resolveBucket(CrmActivityFeedRecord activity, Instant now, ZoneId zone) {
		Instant dueAt = activity.type() == CrmActivityType.TASK ? activity.dueAt() : activity.occurredAt();
		LocalDate dueDate = dueAt.atZone(zone).toLocalDate();
		LocalDate today = now.atZone(zone).toLocalDate();

		if (dueDate.isBefore(today)) {
			return CrmActivityBucket.OVERDUE;
		}

		return dueDate.isEqual(today) ? CrmActivityBucket.TODAY : CrmActivityBucket.UPCOMING;
	}

}
