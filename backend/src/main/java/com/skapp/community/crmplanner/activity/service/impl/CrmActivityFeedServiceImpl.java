package com.skapp.community.crmplanner.activity.service.impl;

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
import com.skapp.community.crmplanner.activity.type.CrmActivityLinkedContact;
import com.skapp.community.crmplanner.activity.type.CrmActivityScope;
import com.skapp.community.crmplanner.activity.type.CrmActivityType;
import com.skapp.community.crmplanner.activity.util.CrmActivityBucketUtil;
import com.skapp.community.crmplanner.activity.util.CrmActivityFeedUtil;
import com.skapp.community.crmplanner.activity.util.CrmActivityValidations;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Collections;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@Slf4j
@RequiredArgsConstructor
public class CrmActivityFeedServiceImpl implements CrmActivityFeedService {

	private final UserService userService;

	private final TimeZoneService timeZoneService;

	private final CrmActivityScopeService crmActivityScopeService;

	private final CrmActivityFeedRepository crmActivityFeedRepository;

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getActivityFeed(CrmActivityFeedFilterDto filterDto) {
		log.info("getActivityFeed: execution started");

		CrmActivityScope scope = crmActivityScopeService.resolveScope(userService.getCurrentUser());
		int page = filterDto.getPage();
		CrmActivityValidations.validatePage(page);
		LocalDate from = scope.canFilter() ? filterDto.getFrom() : null;
		LocalDate to = scope.canFilter() ? filterDto.getTo() : null;
		CrmActivityValidations.validateDateRange(from, to);

		Set<Long> ownerIds = resolveOwnerIds(scope, filterDto.getOwnerId());
		if (ownerIds != null && ownerIds.isEmpty()) {
			return new ResponseEntityDto(false, new CrmActivityFeedResponseDto(List.of(), List.of(), List.of(),
					new CrmActivityFeedPageResponseDto(List.of(), page, false)));
		}

		ZoneId zone = timeZoneService.requestTimezone();
		Instant now = Instant.now();
		CrmActivityFeedCriteria criteria = new CrmActivityFeedCriteria(
				filterDto.getType() == null ? null : filterDto.getType().getActivityType(), ownerIds,
				CrmActivityFeedUtil.toSearchPattern(filterDto.getSearch()),
				CrmActivityFeedUtil.toRangeStart(from, zone), CrmActivityFeedUtil.toRangeEndExclusive(to, zone), now);

		List<CrmActivityFeedRecord> dueRecords = page == 0 ? crmActivityFeedRepository.findDueActivities(criteria)
				: Collections.emptyList();
		List<CrmActivityFeedRecord> historyRecords = crmActivityFeedRepository.findHistoryActivities(criteria,
				page * CrmActivityConstants.BY_MONTH_PAGE_SIZE,
				CrmActivityConstants.BY_MONTH_PAGE_SIZE + CrmActivityConstants.BY_MONTH_LOOKAHEAD);
		boolean hasMore = historyRecords.size() > CrmActivityConstants.BY_MONTH_PAGE_SIZE;
		if (hasMore) {
			historyRecords = historyRecords.subList(0, CrmActivityConstants.BY_MONTH_PAGE_SIZE);
		}

		List<CrmActivityFeedRecord> allRecords = Stream.concat(dueRecords.stream(), historyRecords.stream()).toList();
		Map<CrmActivityType, Map<Long, List<CrmActivityLinkResponseDto>>> linkedContacts = new EnumMap<>(
				CrmActivityType.class);
		for (CrmActivityType type : List.of(CrmActivityType.MEETING, CrmActivityType.EMAIL)) {
			List<Long> ids = allRecords.stream()
				.filter(activity -> activity.getType() == type)
				.map(CrmActivityFeedRecord::getId)
				.distinct()
				.toList();
			linkedContacts.put(type, groupContacts(crmActivityFeedRepository.findLinkedContacts(type, ids)));
		}

		Function<CrmActivityFeedRecord, CrmActivityFeedRowResponseDto> toRow = activity -> CrmActivityFeedUtil.toRow(
				activity, scope,
				linkedContacts.getOrDefault(activity.getType(), Map.of()).getOrDefault(activity.getId(), List.of()));
		Map<CrmActivityBucket, List<CrmActivityFeedRowResponseDto>> dueRows = dueRecords.stream()
			.collect(Collectors.groupingBy(activity -> CrmActivityBucketUtil.resolveBucket(activity, now, zone),
					() -> new EnumMap<>(CrmActivityBucket.class), Collectors.mapping(toRow, Collectors.toList())));
		List<CrmActivityFeedRowResponseDto> overdue = dueRows.getOrDefault(CrmActivityBucket.OVERDUE, List.of())
			.reversed();

		return new ResponseEntityDto(false, new CrmActivityFeedResponseDto(overdue,
				dueRows.getOrDefault(CrmActivityBucket.TODAY, List.of()),
				dueRows.getOrDefault(CrmActivityBucket.UPCOMING, List.of()),
				new CrmActivityFeedPageResponseDto(historyRecords.stream().map(toRow).toList(), page, hasMore)));
	}

	private Set<Long> resolveOwnerIds(CrmActivityScope scope, Long requestedOwnerId) {
		if (!scope.canFilter()) {
			return Set.of(scope.getViewerId());
		}

		if (requestedOwnerId == null) {
			return scope.isOrgWide() ? null : scope.getOwnerIds();
		}

		return scope.includesOwner(requestedOwnerId) ? Set.of(requestedOwnerId) : Set.of();
	}

	private Map<Long, List<CrmActivityLinkResponseDto>> groupContacts(List<CrmActivityLinkedContact> links) {
		return links.stream()
			.collect(Collectors.groupingBy(CrmActivityLinkedContact::getActivityId,
					Collectors.mapping(link -> new CrmActivityLinkResponseDto(link.getContactId(),
							link.getContactName(), Boolean.TRUE.equals(link.getContactDeleted())),
							Collectors.toList())));
	}

}
