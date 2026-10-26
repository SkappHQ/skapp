package com.skapp.community.crmplanner.service.impl;

import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.TimeZoneService;
import com.skapp.community.common.service.UserService;
import com.skapp.community.common.util.StringUtils;
import com.skapp.community.crmplanner.model.CrmCompany;
import com.skapp.community.crmplanner.model.CrmContact;
import com.skapp.community.crmplanner.model.CrmDeal;
import com.skapp.community.crmplanner.payload.request.CrmActivityFeedFilterDto;
import com.skapp.community.crmplanner.payload.response.CrmActivityCallResponseDto;
import com.skapp.community.crmplanner.payload.response.CrmActivityEmailResponseDto;
import com.skapp.community.crmplanner.payload.response.CrmActivityFeedLinkResponseDto;
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
import com.skapp.community.crmplanner.type.CrmActivityMeetingFilterParams;
import com.skapp.community.crmplanner.type.CrmActivityMeetingSort;
import com.skapp.community.crmplanner.type.CrmActivityTaskFilterParams;
import com.skapp.community.crmplanner.type.CrmActivityTaskSort;
import com.skapp.community.crmplanner.type.CrmActivityType;
import com.skapp.community.crmplanner.util.CrmUtil;
import com.skapp.community.crmplanner.util.CrmValidations;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class CrmActivityFeedServiceImpl implements CrmActivityFeedService {

	private final UserService userService;

	private final TimeZoneService timeZoneService;

	private final CrmActivityTaskDao crmActivityTaskDao;

	private final CrmActivityCallDao crmActivityCallDao;

	private final CrmActivityMeetingDao crmActivityMeetingDao;

	private final CrmActivityEmailDao crmActivityEmailDao;

	private final CrmContactDao crmContactDao;

	private final CrmDealDao crmDealDao;

	private final CrmCompanyDao crmCompanyDao;

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getActivities(CrmActivityFeedFilterDto filterDto) {
		log.info("getActivities: execution started");

		User currentUser = userService.getCurrentUser();
		boolean isRepresentative = CrmUtil.isCrmSalesRepresentative(currentUser);
		if (isRepresentative) {
			filterDto.setOwnerId(null);
			filterDto.setFromDate(null);
			filterDto.setToDate(null);
		}
		CrmValidations.validateActivityDateRange(filterDto.getFromDate(), filterDto.getToDate());

		List<CrmActivityFeedRowResponseDto> rows = new ArrayList<>();
		if (isRequested(filterDto, CrmActivityType.TASK)) {
			CrmActivityTaskFilterParams params = buildParams(new CrmActivityTaskFilterParams(), currentUser,
					isRepresentative, filterDto);
			params.setSortKey(CrmActivityTaskSort.DUE_AT);
			crmActivityTaskDao.findTasks(params).stream().map(this::toTaskRow).forEach(rows::add);
		}
		if (isRequested(filterDto, CrmActivityType.CALL)) {
			CrmActivityCallFilterParams params = buildParams(new CrmActivityCallFilterParams(), currentUser,
					isRepresentative, filterDto);
			params.setSortKey(CrmActivityCallSort.LOGGED_AT);
			crmActivityCallDao.findCalls(params).stream().map(this::toCallRow).forEach(rows::add);
		}
		if (isRequested(filterDto, CrmActivityType.MEETING)) {
			CrmActivityMeetingFilterParams params = buildParams(new CrmActivityMeetingFilterParams(), currentUser,
					isRepresentative, filterDto);
			params.setSortKey(CrmActivityMeetingSort.START_AT);
			crmActivityMeetingDao.findMeetings(params).stream().map(this::toMeetingRow).forEach(rows::add);
		}
		if (isRequested(filterDto, CrmActivityType.EMAIL)) {
			CrmActivityEmailFilterParams params = buildParams(new CrmActivityEmailFilterParams(), currentUser,
					isRepresentative, filterDto);
			params.setSortKey(CrmActivityEmailSort.LOGGED_AT);
			crmActivityEmailDao.findEmails(params).stream().map(this::toEmailRow).forEach(rows::add);
		}

		rows.sort(Comparator.comparing(this::resolveFeedAt, Comparator.nullsLast(Comparator.reverseOrder()))
			.thenComparing(CrmActivityFeedRowResponseDto::getType)
			.thenComparing(CrmActivityFeedRowResponseDto::getId, Comparator.reverseOrder()));
		fillNames(rows);

		log.info("getActivities: execution ended");
		return new ResponseEntityDto(false, rows);
	}

	private <T extends CrmActivityListParams> T buildParams(T params, User currentUser, boolean isRepresentative,
			CrmActivityFeedFilterDto filterDto) {
		ZoneId zone = timeZoneService.requestTimezone();
		params.setCurrentEmployeeId(currentUser.getEmployee().getEmployeeId());
		params.setIsRestrictedToOwner(isRepresentative);
		params.setOwnerId(filterDto.getOwnerId());
		params.setSortOrder(Sort.Direction.DESC);
		if (!StringUtils.isNullOrBlank(filterDto.getSearch())) {
			params.setSearchPattern(
					"%" + StringUtils.escapeLikePattern(filterDto.getSearch().trim().toLowerCase()) + "%");
		}
		if (filterDto.getFromDate() != null) {
			params.setRangeStart(filterDto.getFromDate().atStartOfDay(zone).toInstant());
		}
		if (filterDto.getToDate() != null) {
			params.setRangeEnd(filterDto.getToDate().plusDays(1).atStartOfDay(zone).toInstant());
		}
		return params;
	}

	private boolean isRequested(CrmActivityFeedFilterDto filterDto, CrmActivityType type) {
		return filterDto.getType() == null || filterDto.getType() == type;
	}

	private Instant resolveFeedAt(CrmActivityFeedRowResponseDto row) {
		if (row.getType() == CrmActivityType.TASK) {
			return Boolean.TRUE.equals(row.getIsCompleted()) ? row.getCompletedAt() : row.getDueAt();
		}
		return row.getOccurredAt();
	}

	private CrmActivityFeedRowResponseDto toTaskRow(CrmActivityTaskResponseDto task) {
		CrmActivityFeedRowResponseDto row = newRow(CrmActivityType.TASK, task.getId(), task.getName(),
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
		CrmActivityFeedRowResponseDto row = newRow(CrmActivityType.CALL, call.getId(), call.getSubject(),
				call.getOwnerId(), call.getDealId(), call.getCompanyId());
		row.setOccurredAt(call.getLoggedAt());
		if (call.getContactId() != null) {
			row.getContacts().add(new CrmActivityFeedLinkResponseDto(call.getContactId(), null, false));
		}
		return row;
	}

	private CrmActivityFeedRowResponseDto toMeetingRow(CrmActivityMeetingResponseDto meeting) {
		CrmActivityFeedRowResponseDto row = newRow(CrmActivityType.MEETING, meeting.getId(), meeting.getName(),
				meeting.getOwnerId(), meeting.getDealId(), meeting.getCompanyId());
		row.setOccurredAt(meeting.getStartAt());
		if (Boolean.TRUE.equals(meeting.getIsScheduled())) {
			row.setDueAt(meeting.getStartAt());
		}
		addContacts(row, meeting.getContactIds());
		return row;
	}

	private CrmActivityFeedRowResponseDto toEmailRow(CrmActivityEmailResponseDto email) {
		CrmActivityFeedRowResponseDto row = newRow(CrmActivityType.EMAIL, email.getId(), email.getSubject(),
				email.getOwnerId(), email.getDealId(), email.getCompanyId());
		row.setOccurredAt(email.getLoggedAt());
		addContacts(row, email.getContactIds());
		return row;
	}

	private CrmActivityFeedRowResponseDto newRow(CrmActivityType type, Long id, String subject, Long ownerId,
			Long dealId, Long companyId) {
		CrmActivityFeedRowResponseDto row = new CrmActivityFeedRowResponseDto();
		row.setId(id);
		row.setType(type);
		row.setSubject(subject);
		row.setOwnerId(ownerId);
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
		Set<Long> contactIds = new HashSet<>();
		Set<Long> dealIds = new HashSet<>();
		Set<Long> companyIds = new HashSet<>();
		rows.forEach(row -> {
			row.getContacts().forEach(contact -> contactIds.add(contact.getId()));
			if (row.getDeal() != null) {
				dealIds.add(row.getDeal().getId());
			}
			if (row.getCompany() != null) {
				companyIds.add(row.getCompany().getId());
			}
		});

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
			row.getContacts().forEach(link -> {
				CrmContact contact = contacts.get(link.getId());
				if (contact != null) {
					link.setName(contact.getName());
					link.setIsDeleted(Boolean.TRUE.equals(contact.getIsDeleted()));
				}
			});
			CrmDeal deal = row.getDeal() == null ? null : deals.get(row.getDeal().getId());
			if (deal != null) {
				row.getDeal().setName(deal.getName());
				row.getDeal().setIsDeleted(Boolean.TRUE.equals(deal.getIsDeleted()));
			}
			CrmCompany company = row.getCompany() == null ? null : companies.get(row.getCompany().getId());
			if (company != null) {
				row.getCompany().setName(company.getName());
				row.getCompany().setIsDeleted(Boolean.TRUE.equals(company.getIsDeleted()));
			}
		});
	}

}
