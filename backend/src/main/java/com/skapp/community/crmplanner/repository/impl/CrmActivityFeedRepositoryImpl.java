package com.skapp.community.crmplanner.repository.impl;

import com.skapp.community.common.model.Auditable_;
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
import jakarta.persistence.Tuple;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Repository
@RequiredArgsConstructor
public class CrmActivityFeedRepositoryImpl implements CrmActivityFeedRepository {

	private static final Comparator<FeedRef> OLDEST_FIRST = Comparator.comparing((FeedRef ref) -> ref.feedAt())
		.thenComparing(ref -> ref.type())
		.thenComparing(ref -> ref.id());

	private static final Comparator<FeedRef> NEWEST_FIRST = Comparator
		.comparing((FeedRef ref) -> ref.feedAt(), Comparator.reverseOrder())
		.thenComparing(ref -> ref.type())
		.thenComparing(ref -> ref.id(), Comparator.reverseOrder());

	private final EntityManager entityManager;

	@Override
	public CrmActivityFeedResponseDto findActivityFeed(CrmActivityFeedCriteria criteria) {
		if (criteria.ownerIds() != null && criteria.ownerIds().isEmpty()) {
			return new CrmActivityFeedResponseDto(List.of(), List.of(), List.of(),
					new CrmActivityFeedByMonthResponseDto(List.of(), criteria.page(), false));
		}

		int offset = criteria.page() * criteria.pageSize();
		List<FeedRef> fixedRefs = criteria.page() == 0
				? collectRefs(criteria, true, 0).stream().sorted(OLDEST_FIRST).toList() : List.of();
		List<FeedRef> monthRefs = collectRefs(criteria, false, offset + criteria.pageSize() + 1).stream()
			.sorted(NEWEST_FIRST)
			.skip(offset)
			.limit(criteria.pageSize() + 1L)
			.toList();
		boolean hasMore = monthRefs.size() > criteria.pageSize();
		if (hasMore) {
			monthRefs = monthRefs.subList(0, criteria.pageSize());
		}

		List<FeedRef> allRefs = new ArrayList<>(fixedRefs);
		allRefs.addAll(monthRefs);
		List<CrmActivityFeedRowResponseDto> rows = loadRows(allRefs);

		List<CrmActivityFeedRowResponseDto> overdue = new ArrayList<>();
		List<CrmActivityFeedRowResponseDto> today = new ArrayList<>();
		List<CrmActivityFeedRowResponseDto> upcoming = new ArrayList<>();
		int fixedCount = Math.min(fixedRefs.size(), rows.size());
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
		Collections.reverse(overdue);

		return new CrmActivityFeedResponseDto(overdue, today, upcoming, new CrmActivityFeedByMonthResponseDto(
				new ArrayList<>(rows.subList(fixedCount, rows.size())), criteria.page(), hasMore));
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

	private List<FeedRef> collectRefs(CrmActivityFeedCriteria criteria, boolean fixedBuckets, int limit) {
		List<FeedRef> refs = new ArrayList<>();
		for (CrmActivityType type : CrmActivityType.values()) {
			if (criteria.type() != null && criteria.type() != type) {
				continue;
			}
			refs.addAll(switch (type) {
				case TASK -> findTaskRefs(criteria, fixedBuckets, limit);
				case CALL -> findCallRefs(criteria, fixedBuckets, limit);
				case MEETING -> findMeetingRefs(criteria, fixedBuckets, limit);
				case EMAIL -> findEmailRefs(criteria, fixedBuckets, limit);
			});
		}
		return refs;
	}

	private List<FeedRef> findTaskRefs(CrmActivityFeedCriteria criteria, boolean fixedBuckets, int limit) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<Tuple> query = cb.createTupleQuery();
		Root<CrmActivityTask> task = query.from(CrmActivityTask.class);
		Join<CrmActivityTask, CrmContact> contact = task.join(CrmActivityTask_.contact, JoinType.LEFT);
		Join<CrmContact, CrmCompany> contactCompany = contact.join(CrmContact_.company, JoinType.LEFT);

		Expression<Instant> createdDate = task.get(Auditable_.createdDate);
		Expression<Boolean> completed = cb.coalesce(task.get(CrmActivityTask_.isCompleted), false);
		Expression<Instant> feedAt = cb.<Instant>selectCase()
			.when(cb.equal(completed, true), cb.coalesce(task.get(CrmActivityTask_.completedAt), createdDate))
			.when(cb.isNull(task.get(CrmActivityTask_.dueAt)), createdDate)
			.otherwise(task.get(CrmActivityTask_.dueAt));
		Predicate fixed = cb.and(cb.equal(completed, false), cb.isNotNull(task.get(CrmActivityTask_.dueAt)));

		List<Predicate> predicates = buildCommonPredicates(cb,
				task.get(CrmActivityTask_.owner).get(Employee_.employeeId), task.get(CrmActivityTask_.isDeleted),
				feedAt, criteria);
		predicates.add(fixedBuckets ? fixed : cb.not(fixed));
		if (criteria.searchPattern() != null) {
			predicates.add(cb.or(cb.like(cb.lower(task.get(CrmActivityTask_.name)), criteria.searchPattern()),
					matchesContactOrCompany(cb, contact, contactCompany, criteria.searchPattern())));
		}

		return fetchRefs(CrmActivityType.TASK, query, task.get(CrmActivityTask_.id), feedAt, predicates, fixedBuckets,
				limit);
	}

	private List<FeedRef> findCallRefs(CrmActivityFeedCriteria criteria, boolean fixedBuckets, int limit) {
		if (fixedBuckets) {
			return List.of();
		}

		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<Tuple> query = cb.createTupleQuery();
		Root<CrmActivityCall> call = query.from(CrmActivityCall.class);
		Join<CrmActivityCall, CrmContact> contact = call.join(CrmActivityCall_.contact, JoinType.LEFT);
		Join<CrmContact, CrmCompany> contactCompany = contact.join(CrmContact_.company, JoinType.LEFT);

		Expression<Instant> feedAt = cb.coalesce(call.get(CrmActivityCall_.loggedAt), call.get(Auditable_.createdDate));

		List<Predicate> predicates = buildCommonPredicates(cb,
				call.get(CrmActivityCall_.owner).get(Employee_.employeeId), call.get(CrmActivityCall_.isDeleted),
				feedAt, criteria);
		if (criteria.searchPattern() != null) {
			predicates.add(cb.or(cb.like(cb.lower(call.get(CrmActivityCall_.subject)), criteria.searchPattern()),
					matchesContactOrCompany(cb, contact, contactCompany, criteria.searchPattern())));
		}

		return fetchRefs(CrmActivityType.CALL, query, call.get(CrmActivityCall_.id), feedAt, predicates, false, limit);
	}

	private List<FeedRef> findMeetingRefs(CrmActivityFeedCriteria criteria, boolean fixedBuckets, int limit) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<Tuple> query = cb.createTupleQuery();
		Root<CrmActivityMeeting> meeting = query.from(CrmActivityMeeting.class);

		Expression<Instant> feedAt = cb.coalesce(meeting.get(CrmActivityMeeting_.startAt),
				meeting.get(Auditable_.createdDate));
		Predicate fixed = cb.and(cb.equal(cb.coalesce(meeting.get(CrmActivityMeeting_.isScheduled), false), true),
				cb.isNotNull(meeting.get(CrmActivityMeeting_.startAt)),
				cb.greaterThanOrEqualTo(meeting.get(CrmActivityMeeting_.startAt), criteria.now()));

		List<Predicate> predicates = buildCommonPredicates(cb,
				meeting.get(CrmActivityMeeting_.owner).get(Employee_.employeeId),
				meeting.get(CrmActivityMeeting_.isDeleted), feedAt, criteria);
		predicates.add(fixedBuckets ? fixed : cb.not(fixed));
		if (criteria.searchPattern() != null) {
			Subquery<Long> contactMatch = query.subquery(Long.class);
			Root<CrmActivityMeetingContact> link = contactMatch.from(CrmActivityMeetingContact.class);
			Join<CrmActivityMeetingContact, CrmContact> contact = link.join(CrmActivityMeetingContact_.contact);
			Join<CrmContact, CrmCompany> contactCompany = contact.join(CrmContact_.company, JoinType.LEFT);
			contactMatch.select(contact.get(CrmContact_.id))
				.where(cb.equal(link.get(CrmActivityMeetingContact_.id).get(CrmActivityMeetingContactId_.meetingId),
						meeting.get(CrmActivityMeeting_.id)),
						matchesContactOrCompany(cb, contact, contactCompany, criteria.searchPattern()));
			predicates.add(cb.or(cb.like(cb.lower(meeting.get(CrmActivityMeeting_.name)), criteria.searchPattern()),
					cb.exists(contactMatch)));
		}

		return fetchRefs(CrmActivityType.MEETING, query, meeting.get(CrmActivityMeeting_.id), feedAt, predicates,
				fixedBuckets, limit);
	}

	private List<FeedRef> findEmailRefs(CrmActivityFeedCriteria criteria, boolean fixedBuckets, int limit) {
		if (fixedBuckets) {
			return List.of();
		}

		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<Tuple> query = cb.createTupleQuery();
		Root<CrmActivityEmail> email = query.from(CrmActivityEmail.class);

		Expression<Instant> feedAt = cb.coalesce(email.get(CrmActivityEmail_.loggedAt),
				email.get(Auditable_.createdDate));

		List<Predicate> predicates = buildCommonPredicates(cb,
				email.get(CrmActivityEmail_.owner).get(Employee_.employeeId), email.get(CrmActivityEmail_.isDeleted),
				feedAt, criteria);
		if (criteria.searchPattern() != null) {
			Subquery<Long> contactMatch = query.subquery(Long.class);
			Root<CrmActivityEmailContact> link = contactMatch.from(CrmActivityEmailContact.class);
			Join<CrmActivityEmailContact, CrmContact> contact = link.join(CrmActivityEmailContact_.contact);
			Join<CrmContact, CrmCompany> contactCompany = contact.join(CrmContact_.company, JoinType.LEFT);
			contactMatch.select(contact.get(CrmContact_.id))
				.where(cb.equal(link.get(CrmActivityEmailContact_.id).get(CrmActivityEmailContactId_.emailId),
						email.get(CrmActivityEmail_.id)),
						matchesContactOrCompany(cb, contact, contactCompany, criteria.searchPattern()));
			predicates.add(cb.or(cb.like(cb.lower(email.get(CrmActivityEmail_.subject)), criteria.searchPattern()),
					cb.exists(contactMatch)));
		}

		return fetchRefs(CrmActivityType.EMAIL, query, email.get(CrmActivityEmail_.id), feedAt, predicates, false,
				limit);
	}

	private List<Predicate> buildCommonPredicates(CriteriaBuilder cb, Path<Long> ownerId, Path<Boolean> isDeleted,
			Expression<Instant> feedAt, CrmActivityFeedCriteria criteria) {
		List<Predicate> predicates = new ArrayList<>();
		predicates.add(cb.isFalse(isDeleted));
		if (criteria.ownerIds() != null) {
			predicates.add(ownerId.in(criteria.ownerIds()));
		}
		if (criteria.rangeStart() != null) {
			predicates.add(cb.greaterThanOrEqualTo(feedAt, criteria.rangeStart()));
		}
		if (criteria.rangeEnd() != null) {
			predicates.add(cb.lessThan(feedAt, criteria.rangeEnd()));
		}
		return predicates;
	}

	private List<FeedRef> fetchRefs(CrmActivityType type, CriteriaQuery<Tuple> query, Path<Long> id,
			Expression<Instant> feedAt, List<Predicate> predicates, boolean oldestFirst, int limit) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		query.multiselect(id, feedAt).where(predicates.toArray(new Predicate[0]));
		if (oldestFirst) {
			query.orderBy(cb.asc(feedAt), cb.asc(id));
		}
		else {
			query.orderBy(cb.desc(feedAt), cb.desc(id));
		}

		TypedQuery<Tuple> typedQuery = entityManager.createQuery(query);
		if (limit > 0) {
			typedQuery.setMaxResults(limit);
		}
		return typedQuery.getResultList()
			.stream()
			.map(tuple -> new FeedRef(type, tuple.get(0, Long.class), tuple.get(1, Instant.class)))
			.toList();
	}

	private Predicate matchesContactOrCompany(CriteriaBuilder cb, Path<CrmContact> contact, Path<CrmCompany> company,
			String pattern) {
		return cb.or(cb.like(cb.lower(contact.get(CrmContact_.name)), pattern),
				cb.like(cb.lower(company.get(CrmCompany_.name)), pattern));
	}

	private List<CrmActivityFeedRowResponseDto> loadRows(List<FeedRef> refs) {
		if (refs.isEmpty()) {
			return Collections.emptyList();
		}

		Map<CrmActivityType, List<Long>> idsByType = new EnumMap<>(CrmActivityType.class);
		refs.forEach(ref -> idsByType.computeIfAbsent(ref.type(), type -> new ArrayList<>()).add(ref.id()));

		Map<String, CrmActivityFeedRowResponseDto> rowsByKey = new HashMap<>();
		idsByType.forEach((type, ids) -> {
			switch (type) {
				case TASK -> loadTaskRows(ids, rowsByKey);
				case CALL -> loadCallRows(ids, rowsByKey);
				case MEETING -> loadMeetingRows(ids, rowsByKey);
				case EMAIL -> loadEmailRows(ids, rowsByKey);
			}
		});

		return refs.stream().map(ref -> rowsByKey.get(rowKey(ref.type(), ref.id()))).filter(Objects::nonNull).toList();
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

	private record FeedRef(CrmActivityType type, Long id, Instant feedAt) {
	}

}
