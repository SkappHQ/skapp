package com.skapp.community.crmplanner.repository.impl;

import com.skapp.community.common.model.User;
import com.skapp.community.common.model.User_;
import com.skapp.community.crmplanner.constant.CrmConstants;
import com.skapp.community.crmplanner.model.CrmActivityCall;
import com.skapp.community.crmplanner.model.CrmActivityCall_;
import com.skapp.community.crmplanner.model.CrmActivityEmail;
import com.skapp.community.crmplanner.model.CrmActivityEmailContact;
import com.skapp.community.crmplanner.model.CrmActivityEmailContactId_;
import com.skapp.community.crmplanner.model.CrmActivityEmailContact_;
import com.skapp.community.crmplanner.model.CrmActivityEmail_;
import com.skapp.community.crmplanner.model.CrmActivityFeedItem;
import com.skapp.community.crmplanner.model.CrmActivityFeedItemId_;
import com.skapp.community.crmplanner.model.CrmActivityFeedItem_;
import com.skapp.community.crmplanner.model.CrmActivityMeeting;
import com.skapp.community.crmplanner.model.CrmActivityMeetingContact;
import com.skapp.community.crmplanner.model.CrmActivityMeetingContactId_;
import com.skapp.community.crmplanner.model.CrmActivityMeetingContact_;
import com.skapp.community.crmplanner.model.CrmActivityMeeting_;
import com.skapp.community.crmplanner.model.CrmActivityTask;
import com.skapp.community.crmplanner.model.CrmActivityTask_;
import com.skapp.community.crmplanner.model.CrmCompany;
import com.skapp.community.crmplanner.model.CrmCompany_;
import com.skapp.community.crmplanner.model.CrmContact;
import com.skapp.community.crmplanner.model.CrmContact_;
import com.skapp.community.crmplanner.model.CrmDeal;
import com.skapp.community.crmplanner.payload.response.CrmActivityFeedByMonthResponseDto;
import com.skapp.community.crmplanner.payload.response.CrmActivityFeedLinkResponseDto;
import com.skapp.community.crmplanner.payload.response.CrmActivityFeedOwnerResponseDto;
import com.skapp.community.crmplanner.payload.response.CrmActivityFeedResponseDto;
import com.skapp.community.crmplanner.payload.response.CrmActivityFeedRowResponseDto;
import com.skapp.community.crmplanner.payload.response.CrmActivityTeamMemberResponseDto;
import com.skapp.community.crmplanner.repository.CrmActivityFeedRepository;
import com.skapp.community.crmplanner.type.CrmActivityFeedCriteria;
import com.skapp.community.crmplanner.type.CrmActivityType;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.EmployeeRole;
import com.skapp.community.peopleplanner.model.EmployeeRole_;
import com.skapp.community.peopleplanner.model.Employee_;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Repository
@RequiredArgsConstructor
public class CrmActivityFeedRepositoryImpl implements CrmActivityFeedRepository {

	private final EntityManager entityManager;

	@Override
	public CrmActivityFeedResponseDto findActivityFeed(CrmActivityFeedCriteria criteria) {
		if (criteria.ownerIds() != null && criteria.ownerIds().isEmpty()) {
			return new CrmActivityFeedResponseDto(List.of(), List.of(), List.of(),
					new CrmActivityFeedByMonthResponseDto(List.of(), criteria.page(), false));
		}

		List<CrmActivityFeedItem> fixedItems = criteria.page() == 0 ? findItems(criteria, true, 0, 0)
				: Collections.emptyList();
		List<CrmActivityFeedItem> monthItems = findItems(criteria, false, criteria.page() * criteria.pageSize(),
				criteria.pageSize() + 1);
		boolean hasMore = monthItems.size() > criteria.pageSize();
		if (hasMore) {
			monthItems = monthItems.subList(0, criteria.pageSize());
		}

		List<CrmActivityFeedItem> allItems = new ArrayList<>(fixedItems);
		allItems.addAll(monthItems);
		List<CrmActivityFeedRowResponseDto> rows = loadRows(allItems);

		List<CrmActivityFeedRowResponseDto> overdue = new ArrayList<>();
		List<CrmActivityFeedRowResponseDto> today = new ArrayList<>();
		List<CrmActivityFeedRowResponseDto> upcoming = new ArrayList<>();
		int fixedCount = Math.min(fixedItems.size(), rows.size());
		rows.subList(0, fixedCount).forEach(row -> {
			if (row.getDueAt().isBefore(criteria.todayStart())) {
				overdue.add(row);
			}
			else if (row.getDueAt().isBefore(criteria.tomorrowStart())) {
				today.add(row);
			}
			else {
				upcoming.add(row);
			}
		});
		// Fixed rows load soonest first; overdue lists the most recently due first.
		Collections.reverse(overdue);

		return new CrmActivityFeedResponseDto(overdue, today, upcoming, new CrmActivityFeedByMonthResponseDto(
				new ArrayList<>(rows.subList(fixedCount, rows.size())), criteria.page(), hasMore));
	}

	private List<CrmActivityFeedRowResponseDto> loadRows(List<CrmActivityFeedItem> items) {
		if (items.isEmpty()) {
			return Collections.emptyList();
		}

		Map<CrmActivityType, List<Long>> idsByType = new EnumMap<>(CrmActivityType.class);
		items.forEach(item -> idsByType.computeIfAbsent(item.getId().getActivityType(), type -> new ArrayList<>())
			.add(item.getId().getActivityId()));

		Map<String, CrmActivityFeedRowResponseDto> rowsByKey = new HashMap<>();
		idsByType.forEach((type, ids) -> {
			switch (type) {
				case TASK -> loadTaskRows(ids, rowsByKey);
				case CALL -> loadCallRows(ids, rowsByKey);
				case MEETING -> loadMeetingRows(ids, rowsByKey);
				case EMAIL -> loadEmailRows(ids, rowsByKey);
			}
		});

		return items.stream()
			.map(item -> rowsByKey.get(rowKey(item.getId().getActivityType(), item.getId().getActivityId())))
			.filter(Objects::nonNull)
			.toList();
	}

	@Override
	public List<CrmActivityTeamMemberResponseDto> findCrmMembers(Collection<Long> employeeIds) {
		if (employeeIds != null && employeeIds.isEmpty()) {
			return Collections.emptyList();
		}

		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<CrmActivityTeamMemberResponseDto> query = cb.createQuery(CrmActivityTeamMemberResponseDto.class);
		Root<Employee> employee = query.from(Employee.class);
		Join<Employee, User> user = employee.join(Employee_.user, JoinType.INNER);
		Join<Employee, EmployeeRole> employeeRole = employee.join(Employee_.employeeRole, JoinType.INNER);

		List<Predicate> predicates = new ArrayList<>();
		predicates.add(cb.isTrue(user.get(User_.isActive)));
		predicates.add(employeeRole.get(EmployeeRole_.crmRole).in(CrmConstants.ASSIGNABLE_CRM_ROLES));
		if (employeeIds != null) {
			predicates.add(employee.get(Employee_.employeeId).in(employeeIds));
		}

		query.select(cb.construct(CrmActivityTeamMemberResponseDto.class, employee.get(Employee_.employeeId),
				employee.get(Employee_.firstName), employee.get(Employee_.lastName), employee.get(Employee_.authPic)))
			.where(predicates.toArray(new Predicate[0]))
			.orderBy(cb.asc(cb.lower(employee.get(Employee_.firstName))),
					cb.asc(cb.lower(employee.get(Employee_.lastName))), cb.asc(employee.get(Employee_.employeeId)));

		return entityManager.createQuery(query).getResultList();
	}

	private List<CrmActivityFeedItem> findItems(CrmActivityFeedCriteria criteria, boolean fixedBuckets, int offset,
			int limit) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<CrmActivityFeedItem> query = cb.createQuery(CrmActivityFeedItem.class);
		Root<CrmActivityFeedItem> item = query.from(CrmActivityFeedItem.class);

		List<Predicate> predicates = buildPredicates(cb, query, item, criteria);
		Predicate fixed = buildFixedBucketPredicate(cb, item, criteria);
		predicates.add(fixedBuckets ? fixed : cb.not(fixed));

		Path<CrmActivityType> typePath = item.get(CrmActivityFeedItem_.id).get(CrmActivityFeedItemId_.activityType);
		Path<Long> idPath = item.get(CrmActivityFeedItem_.id).get(CrmActivityFeedItemId_.activityId);

		query.select(item).where(predicates.toArray(new Predicate[0]));
		if (fixedBuckets) {
			query.orderBy(cb.asc(item.get(CrmActivityFeedItem_.feedAt)), cb.asc(typePath), cb.asc(idPath));
		}
		else {
			query.orderBy(cb.desc(item.get(CrmActivityFeedItem_.feedAt)), cb.asc(typePath), cb.desc(idPath));
		}

		TypedQuery<CrmActivityFeedItem> typedQuery = entityManager.createQuery(query);
		if (limit > 0) {
			typedQuery.setFirstResult(offset).setMaxResults(limit);
		}
		return typedQuery.getResultList();
	}

	private Predicate buildFixedBucketPredicate(CriteriaBuilder cb, Root<CrmActivityFeedItem> item,
			CrmActivityFeedCriteria criteria) {
		Path<CrmActivityType> type = item.get(CrmActivityFeedItem_.id).get(CrmActivityFeedItemId_.activityType);
		return cb.and(cb.isTrue(item.get(CrmActivityFeedItem_.isDueKind)), cb.or(cb.equal(type, CrmActivityType.TASK),
				cb.greaterThanOrEqualTo(item.get(CrmActivityFeedItem_.feedAt), criteria.now())));
	}

	private List<Predicate> buildPredicates(CriteriaBuilder cb, CriteriaQuery<?> query, Root<CrmActivityFeedItem> item,
			CrmActivityFeedCriteria criteria) {
		List<Predicate> predicates = new ArrayList<>();
		predicates.add(cb.isFalse(item.get(CrmActivityFeedItem_.isDeleted)));

		if (criteria.type() != null) {
			predicates.add(cb.equal(item.get(CrmActivityFeedItem_.id).get(CrmActivityFeedItemId_.activityType),
					criteria.type()));
		}
		if (criteria.ownerIds() != null) {
			predicates.add(item.get(CrmActivityFeedItem_.ownerId).in(criteria.ownerIds()));
		}
		if (criteria.rangeStart() != null) {
			predicates.add(cb.greaterThanOrEqualTo(item.get(CrmActivityFeedItem_.feedAt), criteria.rangeStart()));
		}
		if (criteria.rangeEnd() != null) {
			predicates.add(cb.lessThan(item.get(CrmActivityFeedItem_.feedAt), criteria.rangeEnd()));
		}
		if (criteria.searchPattern() != null) {
			predicates.add(buildSearchPredicate(cb, query, item, criteria.searchPattern()));
		}
		return predicates;
	}

	private Predicate buildSearchPredicate(CriteriaBuilder cb, CriteriaQuery<?> query, Root<CrmActivityFeedItem> item,
			String pattern) {
		Path<CrmActivityType> type = item.get(CrmActivityFeedItem_.id).get(CrmActivityFeedItemId_.activityType);
		Path<Long> activityId = item.get(CrmActivityFeedItem_.id).get(CrmActivityFeedItemId_.activityId);

		Subquery<Long> directContact = query.subquery(Long.class);
		Root<CrmContact> contact = directContact.from(CrmContact.class);
		Join<CrmContact, CrmCompany> contactCompany = contact.join(CrmContact_.company, JoinType.LEFT);
		directContact.select(contact.get(CrmContact_.id))
			.where(cb.equal(contact.get(CrmContact_.id), item.get(CrmActivityFeedItem_.contactId)),
					matchesContactOrCompany(cb, contact, contactCompany, pattern));

		Subquery<Long> meetingContact = query.subquery(Long.class);
		Root<CrmActivityMeetingContact> meetingLink = meetingContact.from(CrmActivityMeetingContact.class);
		Join<CrmActivityMeetingContact, CrmContact> meetingContactJoin = meetingLink
			.join(CrmActivityMeetingContact_.contact);
		Join<CrmContact, CrmCompany> meetingCompany = meetingContactJoin.join(CrmContact_.company, JoinType.LEFT);
		meetingContact.select(meetingContactJoin.get(CrmContact_.id))
			.where(cb.equal(meetingLink.get(CrmActivityMeetingContact_.id).get(CrmActivityMeetingContactId_.meetingId),
					activityId), matchesContactOrCompany(cb, meetingContactJoin, meetingCompany, pattern));

		Subquery<Long> emailContact = query.subquery(Long.class);
		Root<CrmActivityEmailContact> emailLink = emailContact.from(CrmActivityEmailContact.class);
		Join<CrmActivityEmailContact, CrmContact> emailContactJoin = emailLink.join(CrmActivityEmailContact_.contact);
		Join<CrmContact, CrmCompany> emailCompany = emailContactJoin.join(CrmContact_.company, JoinType.LEFT);
		emailContact.select(emailContactJoin.get(CrmContact_.id))
			.where(cb.equal(emailLink.get(CrmActivityEmailContact_.id).get(CrmActivityEmailContactId_.emailId),
					activityId), matchesContactOrCompany(cb, emailContactJoin, emailCompany, pattern));

		return cb.or(cb.like(cb.lower(item.get(CrmActivityFeedItem_.subject)), pattern), cb.exists(directContact),
				cb.and(cb.equal(type, CrmActivityType.MEETING), cb.exists(meetingContact)),
				cb.and(cb.equal(type, CrmActivityType.EMAIL), cb.exists(emailContact)));
	}

	private Predicate matchesContactOrCompany(CriteriaBuilder cb, Path<CrmContact> contact, Path<CrmCompany> company,
			String pattern) {
		return cb.or(cb.like(cb.lower(contact.get(CrmContact_.name)), pattern),
				cb.like(cb.lower(company.get(CrmCompany_.name)), pattern));
	}

	private void loadTaskRows(List<Long> ids, Map<String, CrmActivityFeedRowResponseDto> rowsByKey) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<CrmActivityTask> query = cb.createQuery(CrmActivityTask.class);
		Root<CrmActivityTask> task = query.from(CrmActivityTask.class);
		task.fetch(CrmActivityTask_.owner, JoinType.LEFT);
		task.fetch(CrmActivityTask_.contact, JoinType.LEFT);
		task.fetch(CrmActivityTask_.deal, JoinType.LEFT);
		task.fetch(CrmActivityTask_.company, JoinType.LEFT);
		query.select(task).where(task.get(CrmActivityTask_.id).in(ids));

		for (CrmActivityTask entity : entityManager.createQuery(query).getResultList()) {
			CrmActivityFeedRowResponseDto row = newRow(CrmActivityType.TASK, entity.getId(), entity.getName(),
					entity.getOwner(), entity.getDeal(), entity.getCompany());
			row.setDueAt(entity.getDueAt());
			row.setCompletedAt(entity.getCompletedAt());
			row.setIsCompleted(Boolean.TRUE.equals(entity.getIsCompleted()));
			row.setPriority(entity.getPriority());
			if (entity.getContact() != null) {
				row.getContacts().add(toLink(entity.getContact()));
			}
			rowsByKey.put(rowKey(CrmActivityType.TASK, entity.getId()), row);
		}
	}

	private void loadCallRows(List<Long> ids, Map<String, CrmActivityFeedRowResponseDto> rowsByKey) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<CrmActivityCall> query = cb.createQuery(CrmActivityCall.class);
		Root<CrmActivityCall> call = query.from(CrmActivityCall.class);
		call.fetch(CrmActivityCall_.owner, JoinType.LEFT);
		call.fetch(CrmActivityCall_.contact, JoinType.LEFT);
		call.fetch(CrmActivityCall_.deal, JoinType.LEFT);
		call.fetch(CrmActivityCall_.company, JoinType.LEFT);
		query.select(call).where(call.get(CrmActivityCall_.id).in(ids));

		for (CrmActivityCall entity : entityManager.createQuery(query).getResultList()) {
			CrmActivityFeedRowResponseDto row = newRow(CrmActivityType.CALL, entity.getId(), entity.getSubject(),
					entity.getOwner(), entity.getDeal(), entity.getCompany());
			row.setOccurredAt(entity.getLoggedAt());
			if (entity.getContact() != null) {
				row.getContacts().add(toLink(entity.getContact()));
			}
			rowsByKey.put(rowKey(CrmActivityType.CALL, entity.getId()), row);
		}
	}

	private void loadMeetingRows(List<Long> ids, Map<String, CrmActivityFeedRowResponseDto> rowsByKey) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<CrmActivityMeeting> query = cb.createQuery(CrmActivityMeeting.class);
		Root<CrmActivityMeeting> meeting = query.from(CrmActivityMeeting.class);
		meeting.fetch(CrmActivityMeeting_.owner, JoinType.LEFT);
		meeting.fetch(CrmActivityMeeting_.deal, JoinType.LEFT);
		meeting.fetch(CrmActivityMeeting_.company, JoinType.LEFT);
		query.select(meeting).where(meeting.get(CrmActivityMeeting_.id).in(ids));

		for (CrmActivityMeeting entity : entityManager.createQuery(query).getResultList()) {
			CrmActivityFeedRowResponseDto row = newRow(CrmActivityType.MEETING, entity.getId(), entity.getName(),
					entity.getOwner(), entity.getDeal(), entity.getCompany());
			row.setOccurredAt(entity.getStartAt());
			if (Boolean.TRUE.equals(entity.getIsScheduled())) {
				row.setDueAt(entity.getStartAt());
			}
			rowsByKey.put(rowKey(CrmActivityType.MEETING, entity.getId()), row);
		}

		CriteriaQuery<CrmActivityMeetingContact> linkQuery = cb.createQuery(CrmActivityMeetingContact.class);
		Root<CrmActivityMeetingContact> link = linkQuery.from(CrmActivityMeetingContact.class);
		link.fetch(CrmActivityMeetingContact_.contact, JoinType.INNER);
		linkQuery.select(link)
			.where(link.get(CrmActivityMeetingContact_.id).get(CrmActivityMeetingContactId_.meetingId).in(ids))
			.orderBy(cb.asc(link.get(CrmActivityMeetingContact_.id).get(CrmActivityMeetingContactId_.contactId)));

		for (CrmActivityMeetingContact entity : entityManager.createQuery(linkQuery).getResultList()) {
			CrmActivityFeedRowResponseDto row = rowsByKey
				.get(rowKey(CrmActivityType.MEETING, entity.getId().getMeetingId()));
			if (row != null) {
				row.getContacts().add(toLink(entity.getContact()));
			}
		}
	}

	private void loadEmailRows(List<Long> ids, Map<String, CrmActivityFeedRowResponseDto> rowsByKey) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<CrmActivityEmail> query = cb.createQuery(CrmActivityEmail.class);
		Root<CrmActivityEmail> email = query.from(CrmActivityEmail.class);
		email.fetch(CrmActivityEmail_.owner, JoinType.LEFT);
		email.fetch(CrmActivityEmail_.deal, JoinType.LEFT);
		email.fetch(CrmActivityEmail_.company, JoinType.LEFT);
		query.select(email).where(email.get(CrmActivityEmail_.id).in(ids));

		for (CrmActivityEmail entity : entityManager.createQuery(query).getResultList()) {
			CrmActivityFeedRowResponseDto row = newRow(CrmActivityType.EMAIL, entity.getId(), entity.getSubject(),
					entity.getOwner(), entity.getDeal(), entity.getCompany());
			row.setOccurredAt(entity.getLoggedAt());
			rowsByKey.put(rowKey(CrmActivityType.EMAIL, entity.getId()), row);
		}

		CriteriaQuery<CrmActivityEmailContact> linkQuery = cb.createQuery(CrmActivityEmailContact.class);
		Root<CrmActivityEmailContact> link = linkQuery.from(CrmActivityEmailContact.class);
		link.fetch(CrmActivityEmailContact_.contact, JoinType.INNER);
		linkQuery.select(link)
			.where(link.get(CrmActivityEmailContact_.id).get(CrmActivityEmailContactId_.emailId).in(ids))
			.orderBy(cb.asc(link.get(CrmActivityEmailContact_.id).get(CrmActivityEmailContactId_.contactId)));

		for (CrmActivityEmailContact entity : entityManager.createQuery(linkQuery).getResultList()) {
			CrmActivityFeedRowResponseDto row = rowsByKey
				.get(rowKey(CrmActivityType.EMAIL, entity.getId().getEmailId()));
			if (row != null) {
				row.getContacts().add(toLink(entity.getContact()));
			}
		}
	}

	private CrmActivityFeedRowResponseDto newRow(CrmActivityType type, Long id, String subject, Employee owner,
			CrmDeal deal, CrmCompany company) {
		CrmActivityFeedRowResponseDto row = new CrmActivityFeedRowResponseDto();
		row.setId(id);
		row.setType(type);
		row.setSubject(subject);
		// Every row returned is already inside the viewer's scope, so any task can be
		// completed.
		row.setCanComplete(type == CrmActivityType.TASK);
		if (owner != null) {
			row.setOwner(
					new CrmActivityFeedOwnerResponseDto(owner.getEmployeeId(),
							(owner.getFirstName() == null ? "" : owner.getFirstName())
									+ (owner.getLastName() == null ? "" : " " + owner.getLastName()),
							owner.getAuthPic()));
		}
		if (deal != null) {
			row.setDeal(new CrmActivityFeedLinkResponseDto(deal.getId(), deal.getName(),
					Boolean.TRUE.equals(deal.getIsDeleted())));
		}
		if (company != null) {
			row.setCompany(new CrmActivityFeedLinkResponseDto(company.getId(), company.getName(),
					Boolean.TRUE.equals(company.getIsDeleted())));
		}
		return row;
	}

	private CrmActivityFeedLinkResponseDto toLink(CrmContact contact) {
		return new CrmActivityFeedLinkResponseDto(contact.getId(), contact.getName(),
				Boolean.TRUE.equals(contact.getIsDeleted()));
	}

	private String rowKey(CrmActivityType type, Long id) {
		return type + ":" + id;
	}

}
