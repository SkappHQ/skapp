package com.skapp.community.crmplanner.activity.util;

import com.skapp.community.crmplanner.activity.type.CrmActivityBucket;
import com.skapp.community.crmplanner.activity.type.CrmActivityFeedRecord;
import com.skapp.community.crmplanner.activity.type.CrmActivityType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.List;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

@DisplayName("CRM Activity Bucket Util Tests")
class CrmActivityBucketUtilTest {

	private static final Instant NOW = Instant.parse("2026-10-22T10:00:00Z");

	private static final Instant CREATED = Instant.parse("2026-09-01T08:00:00Z");

	private static final ZoneId UTC = ZoneOffset.UTC;

	private static final ZoneId COLOMBO = ZoneId.of("Asia/Colombo");

	private static final ZoneId LOS_ANGELES = ZoneId.of("America/Los_Angeles");

	private static CrmActivityFeedRecord task(long id, Instant dueAt, boolean completed, Instant completedAt) {
		return new CrmActivityFeedRecord(CrmActivityType.TASK, id, "Task " + id, 1L, null, null, null, null, null, null,
				null, null, null, null, null, null, null, null, completed, false, dueAt, completedAt, CREATED, CREATED);
	}

	private static CrmActivityFeedRecord meeting(long id, boolean scheduled, Instant startAt) {
		return new CrmActivityFeedRecord(CrmActivityType.MEETING, id, "Meeting " + id, 1L, null, null, null, null, null,
				null, null, null, null, null, null, null, null, null, false, scheduled, null, null, startAt, CREATED);
	}

	private static CrmActivityFeedRecord logged(CrmActivityType type, long id, Instant occurredAt) {
		return new CrmActivityFeedRecord(type, id, type + " " + id, 1L, null, null, null, null, null, null, null, null,
				null, null, null, null, null, null, false, false, null, null, occurredAt, CREATED);
	}

	@Test
	@DisplayName("Completed task due in the future goes to By month keyed by its completion date")
	void resolveBucket_CompletedTaskDueInFuture_ReturnsByMonthKeyedByCompletion() {
		Instant completedAt = Instant.parse("2026-10-20T09:00:00Z");
		CrmActivityFeedRecord completed = task(1L, NOW.plusSeconds(86_400 * 5L), true, completedAt);

		assertEquals(CrmActivityBucket.BY_MONTH, CrmActivityBucketUtil.resolveBucket(completed, NOW, UTC));
		assertEquals(completedAt, CrmActivityBucketUtil.resolveFeedAt(completed));
	}

	@Test
	@DisplayName("Completed task due today still goes to By month")
	void resolveBucket_CompletedTaskDueToday_ReturnsByMonth() {
		CrmActivityFeedRecord completed = task(1L, NOW, true, NOW.minusSeconds(60));

		assertEquals(CrmActivityBucket.BY_MONTH, CrmActivityBucketUtil.resolveBucket(completed, NOW, UTC));
	}

	@Test
	@DisplayName("Completed task without a completion date falls back to its created date")
	void resolveFeedAt_CompletedTaskWithoutCompletionDate_ReturnsCreatedDate() {
		assertEquals(CREATED, CrmActivityBucketUtil.resolveFeedAt(task(1L, NOW, true, null)));
	}

	@Test
	@DisplayName("Open task with no due date goes to By month keyed by its created date")
	void resolveBucket_OpenTaskWithoutDueDate_ReturnsByMonthKeyedByCreatedDate() {
		CrmActivityFeedRecord open = task(1L, null, false, null);

		assertEquals(CrmActivityBucket.BY_MONTH, CrmActivityBucketUtil.resolveBucket(open, NOW, UTC));
		assertEquals(CREATED, CrmActivityBucketUtil.resolveFeedAt(open));
	}

	@Test
	@DisplayName("Open task is bucketed into Overdue, Today or Upcoming by its due day")
	void resolveBucket_OpenTask_ReturnsDueBucketByDay() {
		assertEquals(CrmActivityBucket.OVERDUE, CrmActivityBucketUtil
			.resolveBucket(task(1L, Instant.parse("2026-10-21T23:59:59Z"), false, null), NOW, UTC));
		assertEquals(CrmActivityBucket.TODAY, CrmActivityBucketUtil
			.resolveBucket(task(2L, Instant.parse("2026-10-22T00:00:00Z"), false, null), NOW, UTC));
		assertEquals(CrmActivityBucket.TODAY, CrmActivityBucketUtil
			.resolveBucket(task(3L, Instant.parse("2026-10-22T08:00:00Z"), false, null), NOW, UTC));
		assertEquals(CrmActivityBucket.UPCOMING, CrmActivityBucketUtil
			.resolveBucket(task(4L, Instant.parse("2026-10-23T00:00:00Z"), false, null), NOW, UTC));
	}

	@Test
	@DisplayName("Timezone midnight edge: a task due late yesterday in Colombo is Overdue while it is Today in UTC")
	void resolveBucket_ColomboMidnightEdge_UsesViewerTimezone() {
		Instant now = Instant.parse("2026-10-22T19:00:00Z");
		CrmActivityFeedRecord dueLateEvening = task(1L, Instant.parse("2026-10-22T18:00:00Z"), false, null);

		assertEquals(CrmActivityBucket.TODAY, CrmActivityBucketUtil.resolveBucket(dueLateEvening, now, UTC));
		assertEquals(CrmActivityBucket.OVERDUE, CrmActivityBucketUtil.resolveBucket(dueLateEvening, now, COLOMBO));
	}

	@Test
	@DisplayName("Timezone midnight edge: a task due after UTC midnight is Today in Los Angeles but Upcoming in UTC")
	void resolveBucket_LosAngelesMidnightEdge_UsesViewerTimezone() {
		Instant now = Instant.parse("2026-10-22T20:00:00Z");
		CrmActivityFeedRecord dueAfterUtcMidnight = task(1L, Instant.parse("2026-10-23T05:00:00Z"), false, null);

		assertEquals(CrmActivityBucket.UPCOMING, CrmActivityBucketUtil.resolveBucket(dueAfterUtcMidnight, now, UTC));
		assertEquals(CrmActivityBucket.TODAY,
				CrmActivityBucketUtil.resolveBucket(dueAfterUtcMidnight, now, LOS_ANGELES));
	}

	@Test
	@DisplayName("Scheduled meeting still ahead uses the day rule, a passed one goes to By month")
	void resolveBucket_ScheduledMeeting_ReturnsBucketByDayOrByMonthWhenPassed() {
		assertEquals(CrmActivityBucket.TODAY,
				CrmActivityBucketUtil.resolveBucket(meeting(1L, true, NOW.plusSeconds(3600)), NOW, UTC));
		assertEquals(CrmActivityBucket.UPCOMING,
				CrmActivityBucketUtil.resolveBucket(meeting(2L, true, NOW.plusSeconds(86_400 * 2L)), NOW, UTC));
		assertEquals(CrmActivityBucket.BY_MONTH,
				CrmActivityBucketUtil.resolveBucket(meeting(3L, true, NOW.minusSeconds(3600)), NOW, UTC));
		assertEquals(CrmActivityBucket.BY_MONTH,
				CrmActivityBucketUtil.resolveBucket(meeting(4L, true, NOW.minusSeconds(86_400 * 3L)), NOW, UTC));
	}

	@Test
	@DisplayName("Scheduled meeting midnight edge: after UTC midnight is Upcoming in UTC but Today in Los Angeles")
	void resolveBucket_ScheduledMeetingTimezoneEdge_UsesViewerTimezone() {
		Instant now = Instant.parse("2026-10-22T09:00:00Z");
		CrmActivityFeedRecord lateMeeting = meeting(1L, true, Instant.parse("2026-10-23T02:00:00Z"));

		assertEquals(CrmActivityBucket.UPCOMING, CrmActivityBucketUtil.resolveBucket(lateMeeting, now, UTC));
		assertEquals(CrmActivityBucket.TODAY, CrmActivityBucketUtil.resolveBucket(lateMeeting, now, LOS_ANGELES));
	}

	@Test
	@DisplayName("Logged meeting, call and email go to By month keyed by when they happened")
	void resolveBucket_LoggedActivities_ReturnByMonth() {
		Instant future = NOW.plusSeconds(86_400);
		Instant past = NOW.minusSeconds(86_400);

		assertEquals(CrmActivityBucket.BY_MONTH,
				CrmActivityBucketUtil.resolveBucket(meeting(1L, false, future), NOW, UTC));
		assertEquals(CrmActivityBucket.BY_MONTH,
				CrmActivityBucketUtil.resolveBucket(logged(CrmActivityType.CALL, 2L, past), NOW, UTC));
		assertEquals(CrmActivityBucket.BY_MONTH,
				CrmActivityBucketUtil.resolveBucket(logged(CrmActivityType.EMAIL, 3L, past), NOW, UTC));
		assertEquals(past, CrmActivityBucketUtil.resolveFeedAt(logged(CrmActivityType.CALL, 2L, past)));
		assertEquals(CREATED, CrmActivityBucketUtil.resolveFeedAt(logged(CrmActivityType.EMAIL, 4L, null)));
	}

	@Test
	@DisplayName("Overdue and By month are newest first, Today and Upcoming are soonest first, with stable tie-breakers")
	void comparatorFor_OrdersEachBucketAsSpecified() {
		CrmActivityFeedRecord fiveDaysAgo = task(1L, NOW.minusSeconds(86_400 * 5L), false, null);
		CrmActivityFeedRecord oneDayAgo = task(2L, NOW.minusSeconds(86_400), false, null);
		CrmActivityFeedRecord later = task(3L, NOW.plusSeconds(7200), false, null);
		CrmActivityFeedRecord sooner = meeting(4L, true, NOW.plusSeconds(3600));
		CrmActivityFeedRecord completedRecently = task(5L, NOW.plusSeconds(86_400 * 9L), true, NOW.minusSeconds(60));
		CrmActivityFeedRecord tiedCall = logged(CrmActivityType.CALL, 6L, NOW);
		CrmActivityFeedRecord tiedEmailLow = logged(CrmActivityType.EMAIL, 7L, NOW);
		CrmActivityFeedRecord tiedEmailHigh = logged(CrmActivityType.EMAIL, 8L, NOW);

		assertEquals(List.of(2L, 1L), sortedIds(CrmActivityBucket.OVERDUE, fiveDaysAgo, oneDayAgo));
		assertEquals(List.of(4L, 3L), sortedIds(CrmActivityBucket.TODAY, later, sooner));
		assertEquals(List.of(4L, 3L), sortedIds(CrmActivityBucket.UPCOMING, later, sooner));
		assertEquals(List.of(6L, 8L, 7L, 5L),
				sortedIds(CrmActivityBucket.BY_MONTH, completedRecently, tiedEmailLow, tiedEmailHigh, tiedCall));
		assertEquals(List.of(1L, 2L),
				sortedIds(CrmActivityBucket.TODAY, task(2L, NOW, false, null), task(1L, NOW, false, null)));
	}

	private static List<Long> sortedIds(CrmActivityBucket bucket, CrmActivityFeedRecord... records) {
		return Stream.of(records)
			.sorted(CrmActivityBucketUtil.comparatorFor(bucket))
			.map(CrmActivityFeedRecord::id)
			.toList();
	}

	@Test
	@DisplayName("Date range end is inclusive of the whole last day in the viewer timezone")
	void toRangeEndExclusive_ReturnsStartOfNextDayInViewerTimezone() {
		LocalDate day = LocalDate.of(2026, 10, 22);

		assertEquals(Instant.parse("2026-10-21T18:30:00Z"), CrmActivityFeedUtil.toRangeStart(day, COLOMBO));
		assertEquals(Instant.parse("2026-10-22T18:30:00Z"), CrmActivityFeedUtil.toRangeEndExclusive(day, COLOMBO));
	}

	@Test
	@DisplayName("Search pattern is trimmed, lower-cased and escaped, and blank search is ignored")
	void toSearchPattern_EscapesWildcards() {
		assertEquals("%50\\% off\\_now%", CrmActivityFeedUtil.toSearchPattern("  50% OFF_now "));
		assertNull(CrmActivityFeedUtil.toSearchPattern("   "));
	}

}
