package com.skapp.community.crmplanner.activity.util;

import com.skapp.community.crmplanner.activity.type.CrmActivityBucket;
import com.skapp.community.crmplanner.activity.type.CrmActivityFeedRecord;
import com.skapp.community.crmplanner.activity.type.CrmActivityType;
import lombok.experimental.UtilityClass;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Comparator;

@UtilityClass
public class CrmActivityBucketUtil {

	private static final Comparator<CrmActivityFeedRecord> NEWEST_FIRST = Comparator
		.comparing(CrmActivityBucketUtil::resolveFeedAt, Comparator.nullsLast(Comparator.reverseOrder()))
		.thenComparing(activity -> activity.type().name())
		.thenComparing(CrmActivityFeedRecord::id, Comparator.reverseOrder());

	public CrmActivityBucket resolveBucket(CrmActivityFeedRecord activity, Instant now, ZoneId zone) {
		if (isOpenTaskWithDueDate(activity)) {
			return resolveDueBucket(activity.dueAt(), now, zone);
		}

		if (isScheduledMeeting(activity)) {
			return resolveDueBucket(activity.occurredAt(), now, zone);
		}

		return CrmActivityBucket.BY_MONTH;
	}

	public Instant resolveFeedAt(CrmActivityFeedRecord activity) {
		if (activity.type() == CrmActivityType.TASK) {
			if (isCompleted(activity)) {
				return activity.completedAt() != null ? activity.completedAt() : activity.createdDate();
			}
			return activity.dueAt() != null ? activity.dueAt() : activity.createdDate();
		}
		return activity.occurredAt() != null ? activity.occurredAt() : activity.createdDate();
	}

	public Comparator<CrmActivityFeedRecord> newestFirst() {
		return NEWEST_FIRST;
	}

	private CrmActivityBucket resolveDueBucket(Instant dueAt, Instant now, ZoneId zone) {
		LocalDate dueDate = toLocalDate(dueAt, zone);
		LocalDate today = toLocalDate(now, zone);

		if (dueDate.isBefore(today)) {
			return CrmActivityBucket.OVERDUE;
		}

		return dueDate.isEqual(today) ? CrmActivityBucket.TODAY : CrmActivityBucket.UPCOMING;
	}

	private LocalDate toLocalDate(Instant instant, ZoneId zone) {
		return instant.atZone(zone).toLocalDate();
	}

	private boolean isOpenTaskWithDueDate(CrmActivityFeedRecord activity) {
		return activity.type() == CrmActivityType.TASK && !isCompleted(activity) && activity.dueAt() != null;
	}

	private boolean isCompleted(CrmActivityFeedRecord activity) {
		return Boolean.TRUE.equals(activity.isCompleted());
	}

	private boolean isScheduledMeeting(CrmActivityFeedRecord activity) {
		return activity.type() == CrmActivityType.MEETING && Boolean.TRUE.equals(activity.isScheduled())
				&& activity.occurredAt() != null;
	}

}
