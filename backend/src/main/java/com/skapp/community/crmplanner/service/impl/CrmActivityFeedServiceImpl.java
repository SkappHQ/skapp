package com.skapp.community.crmplanner.service.impl;

import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.TimeZoneService;
import com.skapp.community.common.service.UserService;
import com.skapp.community.common.util.StringUtils;
import com.skapp.community.crmplanner.constant.CrmConstants;
import com.skapp.community.crmplanner.model.CrmCompany;
import com.skapp.community.crmplanner.model.CrmContact;
import com.skapp.community.crmplanner.model.CrmDeal;
import com.skapp.community.crmplanner.payload.request.CrmActivityFeedFilterDto;
import com.skapp.community.crmplanner.payload.request.CrmActivityMeetingFilterDto;
import com.skapp.community.crmplanner.payload.response.CrmActivityCallResponseDto;
import com.skapp.community.crmplanner.payload.response.CrmActivityEmailResponseDto;
import com.skapp.community.crmplanner.payload.response.CrmActivityFeedByMonthResponseDto;
import com.skapp.community.crmplanner.payload.response.CrmActivityFeedLinkResponseDto;
import com.skapp.community.crmplanner.payload.response.CrmActivityFeedOwnerResponseDto;
import com.skapp.community.crmplanner.payload.response.CrmActivityFeedResponseDto;
import com.skapp.community.crmplanner.payload.response.CrmActivityFeedRowResponseDto;
import com.skapp.community.crmplanner.payload.response.CrmActivityMeetingResponseDto;
import com.skapp.community.crmplanner.payload.response.CrmActivityTaskResponseDto;
import com.skapp.community.crmplanner.repository.CrmActivityCallDao;
import com.skapp.community.crmplanner.repository.CrmActivityEmailDao;
import com.skapp.community.crmplanner.repository.CrmActivityMeetingDao;
import com.skapp.community.crmplanner.repository.CrmActivityTaskDao;
import com.skapp.community.crmplanner.repository.CrmCompanyDao;
import com.skapp.community.crmplanner.repository.CrmContactDao;
import com.skapp.community.crmplanner.repository.CrmDealDao;
import com.skapp.community.crmplanner.service.CrmActivityFeedService;
import com.skapp.community.crmplanner.type.CrmActivityCallFilterParams;
import com.skapp.community.crmplanner.type.CrmActivityCallSort;
import com.skapp.community.crmplanner.type.CrmActivityEmailFilterParams;
import com.skapp.community.crmplanner.type.CrmActivityEmailSort;
import com.skapp.community.crmplanner.type.CrmActivityListParams;
import com.skapp.community.crmplanner.type.CrmActivityMeetingSort;
import com.skapp.community.crmplanner.type.CrmActivityTaskFilterParams;
import com.skapp.community.crmplanner.type.CrmActivityTaskSort;
import com.skapp.community.crmplanner.util.CrmUtil;
import com.skapp.community.crmplanner.util.CrmValidations;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.repository.EmployeeDao;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class CrmActivityFeedServiceImpl implements CrmActivityFeedService {

	private static final int BY_MONTH_PAGE_SIZE = 25;

	private static final Comparator<CrmActivityFeedRowResponseDto> SOONEST_FIRST = Comparator
		.comparing(CrmActivityFeedRowResponseDto::getDueAt)
		.thenComparing(CrmActivityFeedRowResponseDto::getType)
		.thenComparing(CrmActivityFeedRowResponseDto::getId);

	private static final Comparator<CrmActivityFeedRowResponseDto> NEWEST_FIRST = Comparator
		.comparing(CrmActivityFeedServiceImpl::resolveFeedAt, Comparator.nullsLast(Comparator.reverseOrder()))
		.thenComparing(CrmActivityFeedRowResponseDto::getType)
		.thenComparing(CrmActivityFeedRowResponseDto::getId, Comparator.reverseOrder());

	private final UserService userService;

	private final TimeZoneService timeZoneService;

	private final CrmActivityTaskDao crmActivityTaskDao;

	private final CrmActivityCallDao crmActivityCallDao;

	private final CrmActivityMeetingDao crmActivityMeetingDao;

	private final CrmActivityEmailDao crmActivityEmailDao;

	private final EmployeeDao employeeDao;

	private final CrmContactDao crmContactDao;

	private final CrmDealDao crmDealDao;

	private final CrmCompanyDao crmCompanyDao;

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getActivities(CrmActivityFeedFilterDto filterDto) {
		log.info("getActivities: execution started");

		User currentUser = userService.getCurrentUser();
		if (CrmUtil.isCrmSalesRepresentative(currentUser)) {
			filterDto.setOwnerId(null);
			filterDto.setFrom(null);
			filterDto.setTo(null);
		}
		CrmValidations.validateActivityDateRange(filterDto.getFrom(), filterDto.getTo());

		int page = Math.max(filterDto.getPage(), 0);

		List<CrmActivityFeedRowResponseDto> rows = new ArrayList<>();
		if (isRequested(filterDto, CrmConstants.ACTIVITY_TYPE_TASK)) {
			CrmActivityTaskFilterParams params = applyParams(new CrmActivityTaskFilterParams(), currentUser, filterDto);
			params.setSortKey(CrmActivityTaskSort.DUE_AT);
			crmActivityTaskDao.findTasks(params).stream().map(this::toTaskRow).forEach(rows::add);
		}
		if (isRequested(filterDto, CrmConstants.ACTIVITY_TYPE_CALL)) {
			CrmActivityCallFilterParams params = applyParams(new CrmActivityCallFilterParams(), currentUser, filterDto);
			params.setSortKey(CrmActivityCallSort.LOGGED_AT);
			crmActivityCallDao.findCalls(params).stream().map(this::toCallRow).forEach(rows::add);
		}
		if (isRequested(filterDto, CrmConstants.ACTIVITY_TYPE_MEETING)) {
			CrmActivityMeetingFilterDto meetingFilter = new CrmActivityMeetingFilterDto();
			meetingFilter.setSearchKeyword(filterDto.getSearch() == null ? null : filterDto.getSearch().trim());
			meetingFilter.setOwnerId(filterDto.getOwnerId());
			meetingFilter.setStartDate(filterDto.getFrom());
			meetingFilter.setEndDate(filterDto.getTo());
			meetingFilter.setSortKey(CrmActivityMeetingSort.START_AT);
			meetingFilter.setSortOrder(Sort.Direction.DESC);
			crmActivityMeetingDao
				.findMeetings(meetingFilter, currentUser.getEmployee().getEmployeeId(),
						CrmUtil.isCrmSalesRepresentative(currentUser), timeZoneService.requestTimezone())
				.stream()
				.map(this::toMeetingRow)
				.forEach(rows::add);
		}
		if (isRequested(filterDto, CrmConstants.ACTIVITY_TYPE_EMAIL)) {
			CrmActivityEmailFilterParams params = applyParams(new CrmActivityEmailFilterParams(), currentUser,
					filterDto);
			params.setSortKey(CrmActivityEmailSort.LOGGED_AT);
			crmActivityEmailDao.findEmails(params).stream().map(this::toEmailRow).forEach(rows::add);
		}

		CrmActivityFeedResponseDto response = buildResponse(rows, page);

		log.info("getActivities: execution ended");
		return new ResponseEntityDto(false, response);
	}

	private CrmActivityFeedResponseDto buildResponse(List<CrmActivityFeedRowResponseDto> rows, int page) {
		ZoneId zone = timeZoneService.requestTimezone();
		Instant now = Instant.now();
		Instant todayStart = LocalDate.now(zone).atStartOfDay(zone).toInstant();
		Instant tomorrowStart = LocalDate.now(zone).plusDays(1).atStartOfDay(zone).toInstant();

		List<CrmActivityFeedRowResponseDto> fixedRows = page == 0
				? rows.stream().filter(row -> isFixedBucket(row, now)).sorted(SOONEST_FIRST).toList() : List.of();
		List<CrmActivityFeedRowResponseDto> monthRows = rows.stream()
			.filter(row -> !isFixedBucket(row, now))
			.sorted(NEWEST_FIRST)
			.toList();

		int fromIndex = Math.min(page * BY_MONTH_PAGE_SIZE, monthRows.size());
		int toIndex = Math.min(fromIndex + BY_MONTH_PAGE_SIZE, monthRows.size());
		List<CrmActivityFeedRowResponseDto> pageRows = new ArrayList<>(monthRows.subList(fromIndex, toIndex));

		List<CrmActivityFeedRowResponseDto> overdue = new ArrayList<>();
		List<CrmActivityFeedRowResponseDto> today = new ArrayList<>();
		List<CrmActivityFeedRowResponseDto> upcoming = new ArrayList<>();
		fixedRows.forEach(row -> {
			if (row.getDueAt().isBefore(todayStart)) {
				overdue.add(row);
			}
			else if (row.getDueAt().isBefore(tomorrowStart)) {
				today.add(row);
			}
			else {
				upcoming.add(row);
			}
		});
		Collections.reverse(overdue);

		List<CrmActivityFeedRowResponseDto> visibleRows = new ArrayList<>(fixedRows);
		visibleRows.addAll(pageRows);
		fillNames(visibleRows);

		return new CrmActivityFeedResponseDto(overdue, today, upcoming,
				new CrmActivityFeedByMonthResponseDto(pageRows, page, toIndex < monthRows.size()));
	}

	private <T extends CrmActivityListParams> T applyParams(T params, User currentUser,
			CrmActivityFeedFilterDto filterDto) {
		ZoneId zone = timeZoneService.requestTimezone();
		params.setCurrentEmployeeId(currentUser.getEmployee().getEmployeeId());
		params.setIsRestrictedToOwner(CrmUtil.isCrmSalesRepresentative(currentUser));
		params.setOwnerId(filterDto.getOwnerId());
		params.setSortOrder(Sort.Direction.DESC);
		if (!StringUtils.isNullOrBlank(filterDto.getSearch())) {
			params.setSearchPattern(
					"%" + StringUtils.escapeLikePattern(filterDto.getSearch().trim().toLowerCase()) + "%");
		}
		if (filterDto.getFrom() != null) {
			params.setRangeStart(filterDto.getFrom().atStartOfDay(zone).toInstant());
		}
		if (filterDto.getTo() != null) {
			params.setRangeEnd(filterDto.getTo().plusDays(1).atStartOfDay(zone).toInstant());
		}
		return params;
	}

	private boolean isRequested(CrmActivityFeedFilterDto filterDto, String type) {
		return filterDto.getType() == null || filterDto.getType().equals(type);
	}

	private boolean isFixedBucket(CrmActivityFeedRowResponseDto row, Instant now) {
		if (row.getDueAt() == null || Boolean.TRUE.equals(row.getIsCompleted())) {
			return false;
		}
		return CrmConstants.ACTIVITY_TYPE_TASK.equals(row.getType()) || !row.getDueAt().isBefore(now);
	}

	private static Instant resolveFeedAt(CrmActivityFeedRowResponseDto row) {
		if (CrmConstants.ACTIVITY_TYPE_TASK.equals(row.getType())) {
			return Boolean.TRUE.equals(row.getIsCompleted()) ? row.getCompletedAt() : row.getDueAt();
		}
		return row.getOccurredAt();
	}

	private CrmActivityFeedRowResponseDto toTaskRow(CrmActivityTaskResponseDto task) {
		CrmActivityFeedRowResponseDto row = newRow(CrmConstants.ACTIVITY_TYPE_TASK, task.getId(), task.getName(),
				task.getOwnerId(), task.getDealId(), task.getCompanyId());
		row.setDueAt(task.getDueAt());
		row.setCompletedAt(task.getCompletedAt());
		row.setIsCompleted(Boolean.TRUE.equals(task.getIsCompleted()));
		row.setPriority(task.getPriority());
		row.setCanComplete(true);
		if (task.getContactId() != null) {
			row.getContacts().add(new CrmActivityFeedLinkResponseDto(task.getContactId(), null, false));
		}
		return row;
	}

	private CrmActivityFeedRowResponseDto toCallRow(CrmActivityCallResponseDto call) {
		CrmActivityFeedRowResponseDto row = newRow(CrmConstants.ACTIVITY_TYPE_CALL, call.getId(), call.getSubject(),
				call.getOwnerId(), call.getDealId(), call.getCompanyId());
		row.setOccurredAt(call.getLoggedAt());
		if (call.getContactId() != null) {
			row.getContacts().add(new CrmActivityFeedLinkResponseDto(call.getContactId(), null, false));
		}
		return row;
	}

	private CrmActivityFeedRowResponseDto toMeetingRow(CrmActivityMeetingResponseDto meeting) {
		CrmActivityFeedRowResponseDto row = newRow(CrmConstants.ACTIVITY_TYPE_MEETING, meeting.getId(),
				meeting.getName(), meeting.getOwnerId(), meeting.getDealId(), meeting.getCompanyId());
		row.setOccurredAt(meeting.getStartAt());
		if (Boolean.TRUE.equals(meeting.getIsScheduled())) {
			row.setDueAt(meeting.getStartAt());
		}
		addContacts(row, meeting.getContactIds());
		return row;
	}

	private CrmActivityFeedRowResponseDto toEmailRow(CrmActivityEmailResponseDto email) {
		CrmActivityFeedRowResponseDto row = newRow(CrmConstants.ACTIVITY_TYPE_EMAIL, email.getId(), email.getSubject(),
				email.getOwnerId(), email.getDealId(), email.getCompanyId());
		row.setOccurredAt(email.getLoggedAt());
		addContacts(row, email.getContactIds());
		return row;
	}

	private CrmActivityFeedRowResponseDto newRow(String type, Long id, String subject, Long ownerId, Long dealId,
			Long companyId) {
		CrmActivityFeedRowResponseDto row = new CrmActivityFeedRowResponseDto();
		row.setId(id);
		row.setType(type);
		row.setSubject(subject);
		if (ownerId != null) {
			row.setOwner(new CrmActivityFeedOwnerResponseDto(ownerId, null, null));
		}
		if (dealId != null) {
			row.setDeal(new CrmActivityFeedLinkResponseDto(dealId, null, false));
		}
		if (companyId != null) {
			row.setCompany(new CrmActivityFeedLinkResponseDto(companyId, null, false));
		}
		return row;
	}

	private void addContacts(CrmActivityFeedRowResponseDto row, List<Long> contactIds) {
		if (contactIds != null) {
			contactIds.forEach(
					contactId -> row.getContacts().add(new CrmActivityFeedLinkResponseDto(contactId, null, false)));
		}
	}

	private void fillNames(List<CrmActivityFeedRowResponseDto> rows) {
		Set<Long> ownerIds = new HashSet<>();
		Set<Long> contactIds = new HashSet<>();
		Set<Long> dealIds = new HashSet<>();
		Set<Long> companyIds = new HashSet<>();
		rows.forEach(row -> {
			if (row.getOwner() != null) {
				ownerIds.add(row.getOwner().getId());
			}
			row.getContacts().forEach(contact -> contactIds.add(contact.getId()));
			if (row.getDeal() != null) {
				dealIds.add(row.getDeal().getId());
			}
			if (row.getCompany() != null) {
				companyIds.add(row.getCompany().getId());
			}
		});

		Map<Long, Employee> owners = employeeDao.findAllById(ownerIds)
			.stream()
			.collect(Collectors.toMap(Employee::getEmployeeId, Function.identity()));
		Map<Long, CrmContact> contacts = crmContactDao.findAllById(contactIds)
			.stream()
			.collect(Collectors.toMap(CrmContact::getId, Function.identity()));
		Map<Long, CrmDeal> deals = crmDealDao.findAllById(dealIds)
			.stream()
			.collect(Collectors.toMap(CrmDeal::getId, Function.identity()));
		Map<Long, CrmCompany> companies = crmCompanyDao.findAllById(companyIds)
			.stream()
			.collect(Collectors.toMap(CrmCompany::getId, Function.identity()));

		rows.forEach(row -> {
			Employee owner = row.getOwner() == null ? null : owners.get(row.getOwner().getId());
			if (owner != null) {
				row.getOwner().setName(toFullName(owner));
				row.getOwner().setAvatar(owner.getAuthPic());
			}
			row.getContacts().forEach(link -> {
				CrmContact contact = contacts.get(link.getId());
				if (contact != null) {
					link.setName(contact.getName());
					link.setDeleted(Boolean.TRUE.equals(contact.getIsDeleted()));
				}
			});
			CrmDeal deal = row.getDeal() == null ? null : deals.get(row.getDeal().getId());
			if (deal != null) {
				row.getDeal().setName(deal.getName());
				row.getDeal().setDeleted(Boolean.TRUE.equals(deal.getIsDeleted()));
			}
			CrmCompany company = row.getCompany() == null ? null : companies.get(row.getCompany().getId());
			if (company != null) {
				row.getCompany().setName(company.getName());
				row.getCompany().setDeleted(Boolean.TRUE.equals(company.getIsDeleted()));
			}
		});
	}

	private String toFullName(Employee employee) {
		return Objects.toString(employee.getFirstName(), "")
				+ (employee.getLastName() == null ? "" : " " + employee.getLastName());
	}

}
