package com.skapp.community.crmplanner.repository.impl;

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
import com.skapp.community.crmplanner.model.CrmDeal_;
import com.skapp.community.crmplanner.payload.request.CrmActivityFeedFilterDto;
import com.skapp.community.crmplanner.payload.response.CrmActivityFeedRowResponseDto;
import com.skapp.community.crmplanner.repository.CrmActivityFeedRepository;
import com.skapp.community.crmplanner.type.CrmActivityTaskPriority;
import com.skapp.community.crmplanner.type.CrmActivityType;
import com.skapp.community.common.service.TimeZoneService;
import com.skapp.community.common.util.StringUtils;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.Employee_;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Tuple;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Nulls;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import lombok.RequiredArgsConstructor;

import org.hibernate.query.criteria.HibernateCriteriaBuilder;
import org.hibernate.query.criteria.JpaCriteriaQuery;
import org.hibernate.query.criteria.JpaDerivedRoot;
import org.hibernate.query.criteria.JpaSubQuery;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
public class CrmActivityFeedRepositoryImpl implements CrmActivityFeedRepository {

	private final EntityManager entityManager;

	private final TimeZoneService timeZoneService;

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

		HibernateCriteriaBuilder cb = (HibernateCriteriaBuilder) entityManager.getCriteriaBuilder();
		JpaCriteriaQuery<Tuple> query = cb.createTupleQuery();
		List<JpaSubQuery<Tuple>> branches = new ArrayList<>();

		JpaSubQuery<Tuple> taskQuery = query.subquery(Tuple.class);
		Root<CrmActivityTask> task = taskQuery.from(CrmActivityTask.class);
		Join<CrmActivityTask, Employee> taskOwner = task.join(CrmActivityTask_.owner, JoinType.LEFT);
		Path<Long> taskOwnerId = taskOwner.get(Employee_.employeeId);
		Join<CrmActivityTask, CrmCompany> taskCompany = task.join(CrmActivityTask_.company, JoinType.LEFT);
		taskCompany.on(cb.isFalse(taskCompany.get(CrmCompany_.isDeleted)));
		Join<CrmActivityTask, CrmDeal> taskDeal = task.join(CrmActivityTask_.deal, JoinType.LEFT);
		taskDeal.on(cb.isFalse(taskDeal.get(CrmDeal_.isDeleted)));
		Join<CrmActivityTask, CrmContact> taskContact = task.join(CrmActivityTask_.contact, JoinType.LEFT);
		taskContact.on(cb.isFalse(taskContact.get(CrmContact_.isDeleted)));
		Path<Instant> taskDueAt = task.get(CrmActivityTask_.dueAt);

		List<Predicate> taskPredicates = new ArrayList<>();
		taskPredicates.add(cb.isFalse(task.get(CrmActivityTask_.isDeleted)));
		if (isRestrictedToOwner) {
			taskPredicates.add(cb.equal(taskOwnerId, currentEmployeeId));
		}
		if (filterDto.getOwnerId() != null) {
			taskPredicates.add(cb.equal(taskOwnerId, filterDto.getOwnerId()));
		}
		if (rangeStart != null) {
			taskPredicates.add(cb.greaterThanOrEqualTo(taskDueAt, rangeStart));
		}
		if (rangeEnd != null) {
			taskPredicates.add(cb.lessThan(taskDueAt, rangeEnd));
		}
		if (searchPattern != null) {
			Join<CrmContact, CrmCompany> taskContactCompany = taskContact.join(CrmContact_.company, JoinType.LEFT);
			taskContactCompany.on(cb.isFalse(taskContactCompany.get(CrmCompany_.isDeleted)));
			taskPredicates.add(cb.or(cb.like(cb.lower(task.get(CrmActivityTask_.name)), searchPattern),
					cb.like(cb.lower(taskContact.get(CrmContact_.name)), searchPattern),
					cb.like(cb.lower(taskContactCompany.get(CrmCompany_.name)), searchPattern)));
		}

		CriteriaBuilder.Case<Instant> taskFeedAt = cb.selectCase();
		taskFeedAt.when(cb.isTrue(task.get(CrmActivityTask_.isCompleted)), task.get(CrmActivityTask_.completedAt))
			.otherwise(taskDueAt);

		taskQuery.multiselect(task.get(CrmActivityTask_.id).alias(CrmActivityTask_.ID),
				cb.literal("TASK").alias("type"), task.get(CrmActivityTask_.name).alias("title"),
				taskFeedAt.alias("feedAt"), taskDueAt.alias(CrmActivityTask_.DUE_AT),
				task.get(CrmActivityTask_.completedAt).alias(CrmActivityTask_.COMPLETED_AT),
				task.get(CrmActivityTask_.isCompleted).alias(CrmActivityTask_.IS_COMPLETED),
				task.get(CrmActivityTask_.priority).as(String.class).alias(CrmActivityTask_.PRIORITY),
				taskOwnerId.alias("ownerId"), taskDeal.get(CrmDeal_.id).alias("dealId"),
				taskCompany.get(CrmCompany_.id).alias("companyId"), taskContact.get(CrmContact_.id).alias("contactId"))
			.where(taskPredicates.toArray(new Predicate[0]));
		branches.add(taskQuery);

		JpaSubQuery<Tuple> callQuery = query.subquery(Tuple.class);
		Root<CrmActivityCall> call = callQuery.from(CrmActivityCall.class);
		Join<CrmActivityCall, Employee> callOwner = call.join(CrmActivityCall_.owner, JoinType.LEFT);
		Path<Long> callOwnerId = callOwner.get(Employee_.employeeId);
		Join<CrmActivityCall, CrmCompany> callCompany = call.join(CrmActivityCall_.company, JoinType.LEFT);
		callCompany.on(cb.isFalse(callCompany.get(CrmCompany_.isDeleted)));
		Join<CrmActivityCall, CrmDeal> callDeal = call.join(CrmActivityCall_.deal, JoinType.LEFT);
		callDeal.on(cb.isFalse(callDeal.get(CrmDeal_.isDeleted)));
		Join<CrmActivityCall, CrmContact> callContact = call.join(CrmActivityCall_.contact, JoinType.LEFT);
		callContact.on(cb.isFalse(callContact.get(CrmContact_.isDeleted)));
		Path<Instant> callLoggedAt = call.get(CrmActivityCall_.loggedAt);

		List<Predicate> callPredicates = new ArrayList<>();
		callPredicates.add(cb.isFalse(call.get(CrmActivityCall_.isDeleted)));
		if (isRestrictedToOwner) {
			callPredicates.add(cb.equal(callOwnerId, currentEmployeeId));
		}
		if (filterDto.getOwnerId() != null) {
			callPredicates.add(cb.equal(callOwnerId, filterDto.getOwnerId()));
		}
		if (rangeStart != null) {
			callPredicates.add(cb.greaterThanOrEqualTo(callLoggedAt, rangeStart));
		}
		if (rangeEnd != null) {
			callPredicates.add(cb.lessThan(callLoggedAt, rangeEnd));
		}
		if (searchPattern != null) {
			Join<CrmContact, CrmCompany> callContactCompany = callContact.join(CrmContact_.company, JoinType.LEFT);
			callContactCompany.on(cb.isFalse(callContactCompany.get(CrmCompany_.isDeleted)));
			callPredicates.add(cb.or(cb.like(cb.lower(call.get(CrmActivityCall_.subject)), searchPattern),
					cb.like(cb.lower(callContact.get(CrmContact_.name)), searchPattern),
					cb.like(cb.lower(callContactCompany.get(CrmCompany_.name)), searchPattern)));
		}

		callQuery
			.multiselect(call.get(CrmActivityCall_.id).alias(CrmActivityCall_.ID), cb.literal("CALL").alias("type"),
					call.get(CrmActivityCall_.subject).alias("title"), callLoggedAt.alias("feedAt"),
					cb.nullLiteral(Instant.class).cast(Instant.class).alias(CrmActivityTask_.DUE_AT),
					cb.nullLiteral(Instant.class).cast(Instant.class).alias(CrmActivityTask_.COMPLETED_AT),
					cb.nullLiteral(Boolean.class).cast(Boolean.class).alias(CrmActivityTask_.IS_COMPLETED),
					cb.nullLiteral(String.class).cast(String.class).alias(CrmActivityTask_.PRIORITY),
					callOwnerId.alias("ownerId"), callDeal.get(CrmDeal_.id).alias("dealId"),
					callCompany.get(CrmCompany_.id).alias("companyId"),
					callContact.get(CrmContact_.id).alias("contactId"))
			.where(callPredicates.toArray(new Predicate[0]));
		branches.add(callQuery);

		JpaSubQuery<Tuple> meetingQuery = query.subquery(Tuple.class);
		Root<CrmActivityMeeting> meeting = meetingQuery.from(CrmActivityMeeting.class);
		Join<CrmActivityMeeting, Employee> meetingOwner = meeting.join(CrmActivityMeeting_.owner, JoinType.LEFT);
		Path<Long> meetingOwnerId = meetingOwner.get(Employee_.employeeId);
		Join<CrmActivityMeeting, CrmCompany> meetingCompany = meeting.join(CrmActivityMeeting_.company, JoinType.LEFT);
		meetingCompany.on(cb.isFalse(meetingCompany.get(CrmCompany_.isDeleted)));
		Join<CrmActivityMeeting, CrmDeal> meetingDeal = meeting.join(CrmActivityMeeting_.deal, JoinType.LEFT);
		meetingDeal.on(cb.isFalse(meetingDeal.get(CrmDeal_.isDeleted)));
		Path<Instant> meetingStartAt = meeting.get(CrmActivityMeeting_.startAt);

		List<Predicate> meetingPredicates = new ArrayList<>();
		meetingPredicates.add(cb.isFalse(meeting.get(CrmActivityMeeting_.isDeleted)));
		if (isRestrictedToOwner) {
			meetingPredicates.add(cb.equal(meetingOwnerId, currentEmployeeId));
		}
		if (filterDto.getOwnerId() != null) {
			meetingPredicates.add(cb.equal(meetingOwnerId, filterDto.getOwnerId()));
		}
		if (rangeStart != null) {
			meetingPredicates.add(cb.greaterThanOrEqualTo(meetingStartAt, rangeStart));
		}
		if (rangeEnd != null) {
			meetingPredicates.add(cb.lessThan(meetingStartAt, rangeEnd));
		}
		if (searchPattern != null) {
			Subquery<Long> meetingContactMatch = meetingQuery.subquery(Long.class);
			Root<CrmActivityMeetingContact> meetingLink = meetingContactMatch.from(CrmActivityMeetingContact.class);
			Join<CrmActivityMeetingContact, CrmContact> meetingContact = meetingLink
				.join(CrmActivityMeetingContact_.contact);
			Join<CrmContact, CrmCompany> meetingContactCompany = meetingContact.join(CrmContact_.company,
					JoinType.LEFT);
			meetingContactCompany.on(cb.isFalse(meetingContactCompany.get(CrmCompany_.isDeleted)));
			meetingContactMatch
				.select(meetingLink.get(CrmActivityMeetingContact_.id).get(CrmActivityMeetingContactId_.meetingId))
				.where(cb.equal(
						meetingLink.get(CrmActivityMeetingContact_.id).get(CrmActivityMeetingContactId_.meetingId),
						meeting.get(CrmActivityMeeting_.id)), cb.isFalse(meetingContact.get(CrmContact_.isDeleted)),
						cb.or(cb.like(cb.lower(meetingContact.get(CrmContact_.name)), searchPattern),
								cb.like(cb.lower(meetingContactCompany.get(CrmCompany_.name)), searchPattern)));
			meetingPredicates.add(cb.or(cb.like(cb.lower(meeting.get(CrmActivityMeeting_.name)), searchPattern),
					cb.exists(meetingContactMatch)));
		}

		CriteriaBuilder.Case<Instant> meetingDueAt = cb.selectCase();
		meetingDueAt.when(cb.isTrue(meeting.get(CrmActivityMeeting_.isScheduled)), meetingStartAt)
			.otherwise(cb.nullLiteral(Instant.class).cast(Instant.class));

		meetingQuery
			.multiselect(meeting.get(CrmActivityMeeting_.id).alias(CrmActivityMeeting_.ID),
					cb.literal("MEETING").alias("type"), meeting.get(CrmActivityMeeting_.name).alias("title"),
					meetingStartAt.alias("feedAt"), meetingDueAt.alias(CrmActivityTask_.DUE_AT),
					cb.nullLiteral(Instant.class).cast(Instant.class).alias(CrmActivityTask_.COMPLETED_AT),
					cb.nullLiteral(Boolean.class).cast(Boolean.class).alias(CrmActivityTask_.IS_COMPLETED),
					cb.nullLiteral(String.class).cast(String.class).alias(CrmActivityTask_.PRIORITY),
					meetingOwnerId.alias("ownerId"), meetingDeal.get(CrmDeal_.id).alias("dealId"),
					meetingCompany.get(CrmCompany_.id).alias("companyId"),
					cb.nullLiteral(Long.class).cast(Long.class).alias("contactId"))
			.where(meetingPredicates.toArray(new Predicate[0]));
		branches.add(meetingQuery);

		JpaSubQuery<Tuple> emailQuery = query.subquery(Tuple.class);
		Root<CrmActivityEmail> email = emailQuery.from(CrmActivityEmail.class);
		Join<CrmActivityEmail, Employee> emailOwner = email.join(CrmActivityEmail_.owner, JoinType.LEFT);
		Path<Long> emailOwnerId = emailOwner.get(Employee_.employeeId);
		Join<CrmActivityEmail, CrmCompany> emailCompany = email.join(CrmActivityEmail_.company, JoinType.LEFT);
		emailCompany.on(cb.isFalse(emailCompany.get(CrmCompany_.isDeleted)));
		Join<CrmActivityEmail, CrmDeal> emailDeal = email.join(CrmActivityEmail_.deal, JoinType.LEFT);
		emailDeal.on(cb.isFalse(emailDeal.get(CrmDeal_.isDeleted)));
		Path<Instant> emailLoggedAt = email.get(CrmActivityEmail_.loggedAt);

		List<Predicate> emailPredicates = new ArrayList<>();
		emailPredicates.add(cb.isFalse(email.get(CrmActivityEmail_.isDeleted)));
		if (isRestrictedToOwner) {
			emailPredicates.add(cb.equal(emailOwnerId, currentEmployeeId));
		}
		if (filterDto.getOwnerId() != null) {
			emailPredicates.add(cb.equal(emailOwnerId, filterDto.getOwnerId()));
		}
		if (rangeStart != null) {
			emailPredicates.add(cb.greaterThanOrEqualTo(emailLoggedAt, rangeStart));
		}
		if (rangeEnd != null) {
			emailPredicates.add(cb.lessThan(emailLoggedAt, rangeEnd));
		}
		if (searchPattern != null) {
			Subquery<Long> emailContactMatch = emailQuery.subquery(Long.class);
			Root<CrmActivityEmailContact> emailLink = emailContactMatch.from(CrmActivityEmailContact.class);
			Join<CrmActivityEmailContact, CrmContact> emailContact = emailLink.join(CrmActivityEmailContact_.contact);
			Join<CrmContact, CrmCompany> emailContactCompany = emailContact.join(CrmContact_.company, JoinType.LEFT);
			emailContactCompany.on(cb.isFalse(emailContactCompany.get(CrmCompany_.isDeleted)));
			emailContactMatch.select(emailLink.get(CrmActivityEmailContact_.id).get(CrmActivityEmailContactId_.emailId))
				.where(cb.equal(emailLink.get(CrmActivityEmailContact_.id).get(CrmActivityEmailContactId_.emailId),
						email.get(CrmActivityEmail_.id)), cb.isFalse(emailContact.get(CrmContact_.isDeleted)),
						cb.or(cb.like(cb.lower(emailContact.get(CrmContact_.name)), searchPattern),
								cb.like(cb.lower(emailContactCompany.get(CrmCompany_.name)), searchPattern)));
			emailPredicates.add(cb.or(cb.like(cb.lower(email.get(CrmActivityEmail_.subject)), searchPattern),
					cb.exists(emailContactMatch)));
		}

		emailQuery
			.multiselect(email.get(CrmActivityEmail_.id).alias(CrmActivityEmail_.ID), cb.literal("EMAIL").alias("type"),
					email.get(CrmActivityEmail_.subject).alias("title"), emailLoggedAt.alias("feedAt"),
					cb.nullLiteral(Instant.class).cast(Instant.class).alias(CrmActivityTask_.DUE_AT),
					cb.nullLiteral(Instant.class).cast(Instant.class).alias(CrmActivityTask_.COMPLETED_AT),
					cb.nullLiteral(Boolean.class).cast(Boolean.class).alias(CrmActivityTask_.IS_COMPLETED),
					cb.nullLiteral(String.class).cast(String.class).alias(CrmActivityTask_.PRIORITY),
					emailOwnerId.alias("ownerId"), emailDeal.get(CrmDeal_.id).alias("dealId"),
					emailCompany.get(CrmCompany_.id).alias("companyId"),
					cb.nullLiteral(Long.class).cast(Long.class).alias("contactId"))
			.where(emailPredicates.toArray(new Predicate[0]));
		branches.add(emailQuery);

		JpaSubQuery<Tuple> union = cb.union(true, branches.get(0),
				branches.subList(1, branches.size()).toArray(new Subquery<?>[0]));
		JpaDerivedRoot<Tuple> feed = query.from(union);

		query
			.multiselect(feed.get(CrmActivityTask_.ID), feed.get("type"), feed.get("title"), feed.get("feedAt"),
					feed.get(CrmActivityTask_.DUE_AT), feed.get(CrmActivityTask_.COMPLETED_AT),
					feed.get(CrmActivityTask_.IS_COMPLETED), feed.get(CrmActivityTask_.PRIORITY), feed.get("ownerId"),
					feed.get("dealId"), feed.get("companyId"), feed.get("contactId"))
			.orderBy(cb.desc(feed.get("feedAt")).nullPrecedence(Nulls.LAST), cb.asc(feed.get("type")),
					cb.desc(feed.get(CrmActivityTask_.ID)));

		List<Tuple> tuples = entityManager.createQuery(query)
			.setFirstResult((int) pageable.getOffset())
			.setMaxResults(pageable.getPageSize() + 1)
			.getResultList();
		boolean hasNext = tuples.size() > pageable.getPageSize();
		List<Tuple> pageTuples = hasNext ? tuples.subList(0, pageable.getPageSize()) : tuples;

		List<CrmActivityFeedRowResponseDto> rows = pageTuples.stream().map(tuple -> {
			CrmActivityFeedRowResponseDto row = new CrmActivityFeedRowResponseDto();
			row.setId(tuple.get(0, Long.class));
			row.setType(CrmActivityType.valueOf(tuple.get(1, String.class)));
			row.setTitle(tuple.get(2, String.class));
			row.setDueAt(tuple.get(4, Instant.class));
			row.setOccurredAt(row.getType() == CrmActivityType.TASK ? null : tuple.get(3, Instant.class));
			row.setCompletedAt(tuple.get(5, Instant.class));
			row.setIsCompleted(Boolean.TRUE.equals(tuple.get(6, Boolean.class)));
			row.setCanComplete(row.getType() == CrmActivityType.TASK);
			Object priority = tuple.get(7);
			row.setPriority(priority == null ? null : CrmActivityTaskPriority.valueOf(String.valueOf(priority)));
			row.setOwnerId(tuple.get(8, Long.class));
			Long dealId = tuple.get(9, Long.class);
			if (dealId != null) {
				row.setDealId(dealId);
			}
			Long companyId = tuple.get(10, Long.class);
			if (companyId != null) {
				row.setCompanyId(companyId);
			}
			Long contactId = tuple.get(11, Long.class);
			if (contactId != null) {
				row.getContactIds().add(contactId);
			}
			return row;
		}).toList();

		List<Long> meetingIds = rows.stream()
			.filter(row -> row.getType() == CrmActivityType.MEETING)
			.map(CrmActivityFeedRowResponseDto::getId)
			.toList();
		if (!meetingIds.isEmpty()) {
			jakarta.persistence.criteria.CriteriaQuery<Tuple> contactQuery = cb.createTupleQuery();
			Root<CrmActivityMeetingContact> contactLink = contactQuery.from(CrmActivityMeetingContact.class);
			Path<Long> meetingId = contactLink.get(CrmActivityMeetingContact_.id)
				.get(CrmActivityMeetingContactId_.meetingId);
			Join<CrmActivityMeetingContact, CrmContact> linkedContact = contactLink
				.join(CrmActivityMeetingContact_.contact);
			Path<Long> contactId = linkedContact.get(CrmContact_.id);
			contactQuery.multiselect(meetingId, contactId)
				.where(meetingId.in(meetingIds), cb.isFalse(linkedContact.get(CrmContact_.isDeleted)))
				.orderBy(cb.asc(meetingId), cb.asc(contactId));
			Map<Long, List<Long>> contactsByMeeting = entityManager.createQuery(contactQuery)
				.getResultList()
				.stream()
				.collect(Collectors.groupingBy(tuple -> tuple.get(0, Long.class),
						Collectors.mapping(tuple -> tuple.get(1, Long.class), Collectors.toList())));
			rows.stream()
				.filter(row -> row.getType() == CrmActivityType.MEETING)
				.forEach(row -> row.getContactIds().addAll(contactsByMeeting.getOrDefault(row.getId(), List.of())));
		}

		List<Long> emailIds = rows.stream()
			.filter(row -> row.getType() == CrmActivityType.EMAIL)
			.map(CrmActivityFeedRowResponseDto::getId)
			.toList();
		if (!emailIds.isEmpty()) {
			jakarta.persistence.criteria.CriteriaQuery<Tuple> contactQuery = cb.createTupleQuery();
			Root<CrmActivityEmailContact> contactLink = contactQuery.from(CrmActivityEmailContact.class);
			Path<Long> emailId = contactLink.get(CrmActivityEmailContact_.id).get(CrmActivityEmailContactId_.emailId);
			Join<CrmActivityEmailContact, CrmContact> linkedContact = contactLink
				.join(CrmActivityEmailContact_.contact);
			Path<Long> contactId = linkedContact.get(CrmContact_.id);
			contactQuery.multiselect(emailId, contactId)
				.where(emailId.in(emailIds), cb.isFalse(linkedContact.get(CrmContact_.isDeleted)))
				.orderBy(cb.asc(emailId), cb.asc(contactId));
			Map<Long, List<Long>> contactsByEmail = entityManager.createQuery(contactQuery)
				.getResultList()
				.stream()
				.collect(Collectors.groupingBy(tuple -> tuple.get(0, Long.class),
						Collectors.mapping(tuple -> tuple.get(1, Long.class), Collectors.toList())));
			rows.stream()
				.filter(row -> row.getType() == CrmActivityType.EMAIL)
				.forEach(row -> row.getContactIds().addAll(contactsByEmail.getOrDefault(row.getId(), List.of())));
		}

		long total = pageable.getOffset() + rows.size() + (hasNext ? 1 : 0);
		return new PageImpl<>(rows, pageable, total);
	}

}
