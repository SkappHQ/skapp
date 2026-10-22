package com.skapp.community.crmplanner.activity.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.TimeZoneService;
import com.skapp.community.common.service.UserService;
import com.skapp.community.crmplanner.activity.constant.CrmActivityConstants;
import com.skapp.community.crmplanner.activity.payload.request.CrmActivityFeedFilterDto;
import com.skapp.community.crmplanner.activity.payload.response.CrmActivityFeedPageResponseDto;
import com.skapp.community.crmplanner.activity.payload.response.CrmActivityFeedResponseDto;
import com.skapp.community.crmplanner.activity.payload.response.CrmActivityFeedRowResponseDto;
import com.skapp.community.crmplanner.activity.payload.response.CrmActivityLinkResponseDto;
import com.skapp.community.crmplanner.activity.repository.CrmActivityFeedRepository;
import com.skapp.community.crmplanner.activity.service.CrmActivityFeedService;
import com.skapp.community.crmplanner.activity.service.CrmActivityScopeService;
import com.skapp.community.crmplanner.activity.type.CrmActivityBucket;
import com.skapp.community.crmplanner.activity.type.CrmActivityFeedCriteria;
import com.skapp.community.crmplanner.activity.type.CrmActivityFeedRecord;
import com.skapp.community.crmplanner.activity.type.CrmActivityFeedTab;
import com.skapp.community.crmplanner.activity.type.CrmActivityLinkedContact;
import com.skapp.community.crmplanner.activity.type.CrmActivityScope;
import com.skapp.community.crmplanner.activity.type.CrmActivityType;
import com.skapp.community.crmplanner.activity.util.CrmActivityBucketUtil;
import com.skapp.community.crmplanner.activity.util.CrmActivityFeedUtil;
import com.skapp.community.crmplanner.activity.util.CrmActivityValidations;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Collections;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@Slf4j
@RequiredArgsConstructor
public class CrmActivityFeedServiceImpl implements CrmActivityFeedService {

	private static final String FEED_FAILURE_LOG = "getActivityFeed: load {} event=CRM_ACTIVITY_FEED_LOAD_FAILURE "
			+ "userId={} organizationId={} role={} view={} tab={} ownerId={} from={} to={} page={} hasSearch={} "
			+ "errorType={} timestamp={}";

	private final UserService userService;

	private final TimeZoneService timeZoneService;

	private final CrmActivityScopeService crmActivityScopeService;

	private final CrmActivityFeedRepository crmActivityFeedRepository;

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getActivityFeed(CrmActivityFeedFilterDto filterDto) {
		log.info("getActivityFeed: execution started");

		User currentUser = userService.getCurrentUser();
		CrmActivityScope scope = crmActivityScopeService.resolveScope(currentUser);

		try {
			CrmActivityFeedResponseDto response = loadFeed(filterDto, scope);
			log.info("getActivityFeed: execution ended");
			return new ResponseEntityDto(false, response);
		}
		catch (RuntimeException e) {
			logFeedFailure(scope, filterDto, e);
			throw e;
		}
	}

	private CrmActivityFeedResponseDto loadFeed(CrmActivityFeedFilterDto filterDto, CrmActivityScope scope) {
		int page = Math.max(filterDto.getPage(), 0);
		LocalDate from = scope.canFilter() ? filterDto.getFrom() : null;
		LocalDate to = scope.canFilter() ? filterDto.getTo() : null;
		CrmActivityValidations.validateDateRange(from, to);

		Set<Long> ownerIds = resolveOwnerIds(scope, filterDto.getOwnerId());
		if (ownerIds != null && ownerIds.isEmpty()) {
			return emptyFeed(page);
		}

		ZoneId zone = timeZoneService.requestTimezone();
		Instant now = Instant.now();
		CrmActivityFeedCriteria criteria = new CrmActivityFeedCriteria(toActivityType(filterDto.getType()), ownerIds,
				CrmActivityFeedUtil.toSearchPattern(filterDto.getSearch()),
				CrmActivityFeedUtil.toRangeStart(from, zone), CrmActivityFeedUtil.toRangeEndExclusive(to, zone));

		List<CrmActivityFeedRecord> dueRecords = page == 0 ? crmActivityFeedRepository.findDueActivities(criteria)
				: Collections.emptyList();
		List<CrmActivityFeedRecord> historyRecords = crmActivityFeedRepository.findHistoryActivities(criteria,
				page * CrmActivityConstants.BY_MONTH_PAGE_SIZE, CrmActivityConstants.BY_MONTH_PAGE_SIZE + 1);
		boolean hasMore = historyRecords.size() > CrmActivityConstants.BY_MONTH_PAGE_SIZE;
		if (hasMore) {
			historyRecords = historyRecords.subList(0, CrmActivityConstants.BY_MONTH_PAGE_SIZE);
		}

		List<CrmActivityFeedRecord> allRecords = Stream.concat(dueRecords.stream(), historyRecords.stream()).toList();
		Map<Long, List<CrmActivityLinkResponseDto>> meetingContacts = groupContacts(
				crmActivityFeedRepository.findMeetingContacts(idsOfType(allRecords, CrmActivityType.MEETING)));
		Map<Long, List<CrmActivityLinkResponseDto>> emailContacts = groupContacts(
				crmActivityFeedRepository.findEmailContacts(idsOfType(allRecords, CrmActivityType.EMAIL)));
		FeedContext context = new FeedContext(scope, meetingContacts, emailContacts);

		Map<CrmActivityBucket, List<CrmActivityFeedRecord>> dueBuckets = new EnumMap<>(CrmActivityBucket.class);
		for (CrmActivityFeedRecord dueRecord : dueRecords) {
			CrmActivityBucket bucket = CrmActivityBucketUtil.resolveBucket(dueRecord, now, zone);
			dueBuckets.computeIfAbsent(bucket, key -> new ArrayList<>()).add(dueRecord);
		}

		List<CrmActivityFeedRowResponseDto> byMonthRows = historyRecords.stream().map(context::toRow).toList();

		return new CrmActivityFeedResponseDto(toSortedRows(dueBuckets, CrmActivityBucket.OVERDUE, context),
				toSortedRows(dueBuckets, CrmActivityBucket.TODAY, context),
				toSortedRows(dueBuckets, CrmActivityBucket.UPCOMING, context),
				new CrmActivityFeedPageResponseDto(byMonthRows, page, hasMore));
	}

	private Set<Long> resolveOwnerIds(CrmActivityScope scope, Long requestedOwnerId) {
		if (!scope.canFilter()) {
			return Set.of(scope.viewerId());
		}

		if (requestedOwnerId == null) {
			return scope.orgWide() ? null : scope.ownerIds();
		}

		return scope.includesOwner(requestedOwnerId) ? Set.of(requestedOwnerId) : Set.of();
	}

	private CrmActivityType toActivityType(CrmActivityFeedTab tab) {
		return tab == null || tab == CrmActivityFeedTab.ALL ? null : CrmActivityType.valueOf(tab.name());
	}

	private CrmActivityFeedResponseDto emptyFeed(int page) {
		return new CrmActivityFeedResponseDto(List.of(), List.of(), List.of(),
				new CrmActivityFeedPageResponseDto(List.of(), page, false));
	}

	private List<CrmActivityFeedRowResponseDto> toSortedRows(
			Map<CrmActivityBucket, List<CrmActivityFeedRecord>> dueBuckets, CrmActivityBucket bucket,
			FeedContext context) {
		return dueBuckets.getOrDefault(bucket, List.of())
			.stream()
			.sorted(CrmActivityBucketUtil.newestFirst())
			.map(context::toRow)
			.toList();
	}

	private List<Long> idsOfType(List<CrmActivityFeedRecord> records, CrmActivityType type) {
		return records.stream()
			.filter(feedRecord -> feedRecord.type() == type)
			.map(CrmActivityFeedRecord::id)
			.distinct()
			.toList();
	}

	private Map<Long, List<CrmActivityLinkResponseDto>> groupContacts(List<CrmActivityLinkedContact> links) {
		return links.stream()
			.collect(
					Collectors.groupingBy(CrmActivityLinkedContact::activityId,
							Collectors.mapping(link -> new CrmActivityLinkResponseDto(link.contactId(),
									link.contactName(), Boolean.TRUE.equals(link.contactDeleted())),
									Collectors.toList())));
	}

	private void logFeedFailure(CrmActivityScope scope, CrmActivityFeedFilterDto filterDto, RuntimeException e) {
		boolean rejected = e instanceof ModuleException;
		Object[] arguments = { rejected ? "rejected" : "failed", scope.viewerId(),
				MDC.get(CrmActivityConstants.TENANT_ID_MDC_KEY), scope.role(), CrmActivityConstants.FEED_VIEW,
				filterDto.getType(), filterDto.getOwnerId(), filterDto.getFrom(), filterDto.getTo(),
				filterDto.getPage(), CrmActivityFeedUtil.toSearchPattern(filterDto.getSearch()) != null,
				e.getClass().getSimpleName(), Instant.now() };

		if (rejected) {
			log.warn(FEED_FAILURE_LOG, arguments);
		}
		else {
			log.error(FEED_FAILURE_LOG, arguments);
		}
	}

	private record FeedContext(CrmActivityScope scope, Map<Long, List<CrmActivityLinkResponseDto>> meetingContacts,
			Map<Long, List<CrmActivityLinkResponseDto>> emailContacts) {

		CrmActivityFeedRowResponseDto toRow(CrmActivityFeedRecord activity) {
			Map<Long, List<CrmActivityLinkResponseDto>> linked = activity.type() == CrmActivityType.EMAIL
					? emailContacts : meetingContacts;
			return CrmActivityFeedUtil.toRow(activity, scope, linked.getOrDefault(activity.id(), List.of()));
		}

	}

}
