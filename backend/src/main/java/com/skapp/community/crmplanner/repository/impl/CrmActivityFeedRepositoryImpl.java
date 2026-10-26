package com.skapp.community.crmplanner.repository.impl;

import com.skapp.community.common.service.TimeZoneService;
import com.skapp.community.common.util.StringUtils;
import com.skapp.community.crmplanner.payload.request.CrmActivityFeedFilterDto;
import com.skapp.community.crmplanner.payload.response.CrmActivityFeedRowResponseDto;
import com.skapp.community.crmplanner.repository.CrmActivityCallDao;
import com.skapp.community.crmplanner.repository.CrmActivityEmailDao;
import com.skapp.community.crmplanner.repository.CrmActivityFeedRepository;
import com.skapp.community.crmplanner.repository.CrmActivityMeetingDao;
import com.skapp.community.crmplanner.repository.CrmActivityTaskDao;
import com.skapp.community.crmplanner.type.CrmActivityCallFilterParams;
import com.skapp.community.crmplanner.type.CrmActivityCallSort;
import com.skapp.community.crmplanner.type.CrmActivityEmailFilterParams;
import com.skapp.community.crmplanner.type.CrmActivityEmailSort;
import com.skapp.community.crmplanner.type.CrmActivityMeetingFilterParams;
import com.skapp.community.crmplanner.type.CrmActivityMeetingSort;
import com.skapp.community.crmplanner.type.CrmActivityTaskFilterParams;
import com.skapp.community.crmplanner.type.CrmActivityTaskSort;
import com.skapp.community.crmplanner.type.CrmActivityType;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.function.Function;

@Repository
@RequiredArgsConstructor
public class CrmActivityFeedRepositoryImpl implements CrmActivityFeedRepository {

	private final TimeZoneService timeZoneService;

	private final CrmActivityTaskDao crmActivityTaskDao;

	private final CrmActivityCallDao crmActivityCallDao;

	private final CrmActivityMeetingDao crmActivityMeetingDao;

	private final CrmActivityEmailDao crmActivityEmailDao;

	@Override
	public Page<CrmActivityFeedRowResponseDto> findActivities(CrmActivityFeedFilterDto filterDto,
			Long currentEmployeeId, boolean isRestrictedToOwner, Pageable pageable) {
		ZoneId zone = timeZoneService.requestTimezone();
		String searchPattern = StringUtils.isNullOrBlank(filterDto.getSearch()) ? null
				: "%" + StringUtils.escapeLikePattern(filterDto.getSearch().trim().toLowerCase()) + "%";
		Instant rangeStart = filterDto.getFromDate() == null ? null
				: filterDto.getFromDate().atStartOfDay(zone).toInstant();
		Instant rangeEnd = filterDto.getToDate() == null ? null
				: filterDto.getToDate().plusDays(1).atStartOfDay(zone).toInstant();

		CrmActivityTaskFilterParams taskParams = new CrmActivityTaskFilterParams();
		taskParams.setCurrentEmployeeId(currentEmployeeId);
		taskParams.setIsRestrictedToOwner(isRestrictedToOwner);
		taskParams.setOwnerId(filterDto.getOwnerId());
		taskParams.setSearchPattern(searchPattern);
		taskParams.setRangeStart(rangeStart);
		taskParams.setRangeEnd(rangeEnd);
		taskParams.setSortKey(CrmActivityTaskSort.DUE_AT);
		taskParams.setSortOrder(Sort.Direction.DESC);

		CrmActivityCallFilterParams callParams = new CrmActivityCallFilterParams();
		callParams.setCurrentEmployeeId(currentEmployeeId);
		callParams.setIsRestrictedToOwner(isRestrictedToOwner);
		callParams.setOwnerId(filterDto.getOwnerId());
		callParams.setSearchPattern(searchPattern);
		callParams.setRangeStart(rangeStart);
		callParams.setRangeEnd(rangeEnd);
		callParams.setSortKey(CrmActivityCallSort.LOGGED_AT);
		callParams.setSortOrder(Sort.Direction.DESC);

		CrmActivityMeetingFilterParams meetingParams = new CrmActivityMeetingFilterParams();
		meetingParams.setCurrentEmployeeId(currentEmployeeId);
		meetingParams.setIsRestrictedToOwner(isRestrictedToOwner);
		meetingParams.setOwnerId(filterDto.getOwnerId());
		meetingParams.setSearchPattern(searchPattern);
		meetingParams.setRangeStart(rangeStart);
		meetingParams.setRangeEnd(rangeEnd);
		meetingParams.setSortKey(CrmActivityMeetingSort.START_AT);
		meetingParams.setSortOrder(Sort.Direction.DESC);

		CrmActivityEmailFilterParams emailParams = new CrmActivityEmailFilterParams();
		emailParams.setCurrentEmployeeId(currentEmployeeId);
		emailParams.setIsRestrictedToOwner(isRestrictedToOwner);
		emailParams.setOwnerId(filterDto.getOwnerId());
		emailParams.setSearchPattern(searchPattern);
		emailParams.setRangeStart(rangeStart);
		emailParams.setRangeEnd(rangeEnd);
		emailParams.setSortKey(CrmActivityEmailSort.LOGGED_AT);
		emailParams.setSortOrder(Sort.Direction.DESC);

		List<CrmActivityFeedRowResponseDto> rows = new ArrayList<>();
		crmActivityTaskDao.findTasks(taskParams).forEach(task -> {
			CrmActivityFeedRowResponseDto row = new CrmActivityFeedRowResponseDto();
			row.setId(task.getId());
			row.setType(CrmActivityType.TASK);
			row.setTitle(task.getName());
			row.setDueAt(task.getDueAt());
			row.setCompletedAt(task.getCompletedAt());
			row.setIsCompleted(Boolean.TRUE.equals(task.getIsCompleted()));
			row.setCanComplete(true);
			row.setPriority(task.getPriority());
			row.setOwnerId(task.getOwnerId());
			row.setDealId(task.getDealId());
			row.setCompanyId(task.getCompanyId());
			if (task.getContactId() != null) {
				row.getContactIds().add(task.getContactId());
			}
			rows.add(row);
		});
		crmActivityCallDao.findCalls(callParams).forEach(call -> {
			CrmActivityFeedRowResponseDto row = new CrmActivityFeedRowResponseDto();
			row.setId(call.getId());
			row.setType(CrmActivityType.CALL);
			row.setTitle(call.getSubject());
			row.setLoggedAt(call.getLoggedAt());
			row.setOwnerId(call.getOwnerId());
			row.setDealId(call.getDealId());
			row.setCompanyId(call.getCompanyId());
			if (call.getContactId() != null) {
				row.getContactIds().add(call.getContactId());
			}
			rows.add(row);
		});
		crmActivityMeetingDao.findMeetings(meetingParams).forEach(meeting -> {
			CrmActivityFeedRowResponseDto row = new CrmActivityFeedRowResponseDto();
			row.setId(meeting.getId());
			row.setType(CrmActivityType.MEETING);
			row.setTitle(meeting.getName());
			row.setStartAt(meeting.getStartAt());
			row.setOwnerId(meeting.getOwnerId());
			row.setDealId(meeting.getDealId());
			row.setCompanyId(meeting.getCompanyId());
			row.getContactIds().addAll(meeting.getContactIds());
			rows.add(row);
		});
		crmActivityEmailDao.findEmails(emailParams).forEach(email -> {
			CrmActivityFeedRowResponseDto row = new CrmActivityFeedRowResponseDto();
			row.setId(email.getId());
			row.setType(CrmActivityType.EMAIL);
			row.setTitle(email.getSubject());
			row.setLoggedAt(email.getLoggedAt());
			row.setOwnerId(email.getOwnerId());
			row.setDealId(email.getDealId());
			row.setCompanyId(email.getCompanyId());
			row.getContactIds().addAll(email.getContactIds());
			rows.add(row);
		});

		Function<CrmActivityFeedRowResponseDto, Instant> feedAt = row -> row.getType() == CrmActivityType.TASK
				? (row.getIsCompleted() ? row.getCompletedAt() : row.getDueAt())
				: (row.getType() == CrmActivityType.MEETING ? row.getStartAt() : row.getLoggedAt());
		rows.sort(Comparator.comparing(feedAt, Comparator.nullsLast(Comparator.reverseOrder()))
			.thenComparing(CrmActivityFeedRowResponseDto::getType)
			.thenComparing(CrmActivityFeedRowResponseDto::getId, Comparator.reverseOrder()));

		int fromIndex = Math.min((int) pageable.getOffset(), rows.size());
		int toIndex = Math.min(fromIndex + pageable.getPageSize(), rows.size());
		boolean hasNext = rows.size() > toIndex;
		List<CrmActivityFeedRowResponseDto> pageRows = new ArrayList<>(rows.subList(fromIndex, toIndex));

		long total = pageable.getOffset() + pageRows.size() + (hasNext ? 1 : 0);
		return new PageImpl<>(pageRows, pageable, total);
	}

}
