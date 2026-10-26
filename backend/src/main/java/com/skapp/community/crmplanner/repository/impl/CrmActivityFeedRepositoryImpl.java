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
import com.skapp.community.crmplanner.model.CrmDeal_;
import com.skapp.community.crmplanner.payload.response.CrmActivityFeedAssociationResponseDto;
import com.skapp.community.crmplanner.payload.response.CrmActivityFeedRowResponseDto;
import com.skapp.community.crmplanner.repository.CrmActivityFeedRepository;
import com.skapp.community.crmplanner.type.CrmActivityFeedFilterParams;
import com.skapp.community.crmplanner.type.CrmActivityTaskPriority;
import com.skapp.community.crmplanner.type.CrmActivityType;
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
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
public class CrmActivityFeedRepositoryImpl implements CrmActivityFeedRepository {

	private final EntityManager entityManager;

	@Override
	public Page<CrmActivityFeedRowResponseDto> findActivities(CrmActivityFeedFilterParams params, Pageable pageable) {
		HibernateCriteriaBuilder cb = (HibernateCriteriaBuilder) entityManager.getCriteriaBuilder();
		JpaCriteriaQuery<Tuple> query = cb.createTupleQuery();
		List<JpaSubQuery<Tuple>> branches = new ArrayList<>();

		if (params.getTypes().contains(CrmActivityType.TASK)) {
			JpaSubQuery<Tuple> taskQuery = query.subquery(Tuple.class);
			Root<CrmActivityTask> task = taskQuery.from(CrmActivityTask.class);
			Join<CrmActivityTask, Employee> owner = task.join(CrmActivityTask_.owner, JoinType.LEFT);
			Path<Long> ownerId = owner.get(Employee_.employeeId);
			Join<CrmActivityTask, CrmCompany> company = task.join(CrmActivityTask_.company, JoinType.LEFT);
			company.on(cb.isFalse(company.get(CrmCompany_.isDeleted)));
			Path<Instant> dueAt = task.get(CrmActivityTask_.dueAt);

			List<Predicate> predicates = new ArrayList<>();
			predicates.add(cb.isFalse(task.get(CrmActivityTask_.isDeleted)));
			if (Boolean.TRUE.equals(params.getIsRestrictedToOwner())) {
				predicates.add(cb.equal(ownerId, params.getCurrentEmployeeId()));
			}
			if (params.getOwnerId() != null) {
				predicates.add(cb.equal(ownerId, params.getOwnerId()));
			}
			if (params.getRangeStart() != null) {
				predicates.add(cb.greaterThanOrEqualTo(dueAt, params.getRangeStart()));
			}
			if (params.getRangeEnd() != null) {
				predicates.add(cb.lessThan(dueAt, params.getRangeEnd()));
			}
			if (params.getSearchPattern() != null) {
				Join<CrmActivityTask, CrmContact> contact = task.join(CrmActivityTask_.contact, JoinType.LEFT);
				contact.on(cb.isFalse(contact.get(CrmContact_.isDeleted)));
				Join<CrmContact, CrmCompany> contactCompany = contact.join(CrmContact_.company, JoinType.LEFT);
				contactCompany.on(cb.isFalse(contactCompany.get(CrmCompany_.isDeleted)));
				predicates.add(cb.or(cb.like(cb.lower(task.get(CrmActivityTask_.name)), params.getSearchPattern()),
						cb.like(cb.lower(contact.get(CrmContact_.name)), params.getSearchPattern()),
						cb.like(cb.lower(contactCompany.get(CrmCompany_.name)), params.getSearchPattern())));
			}

			CriteriaBuilder.Case<Instant> feedAt = cb.selectCase();
			feedAt.when(cb.isTrue(task.get(CrmActivityTask_.isCompleted)), task.get(CrmActivityTask_.completedAt))
				.otherwise(dueAt);

			taskQuery
				.multiselect(task.get(CrmActivityTask_.id).alias("id"), cb.literal("TASK").alias("type"),
						task.get(CrmActivityTask_.name).alias("subject"), feedAt.alias("feedAt"), dueAt.alias("dueAt"),
						task.get(CrmActivityTask_.completedAt).alias("completedAt"),
						task.get(CrmActivityTask_.isCompleted).alias("isCompleted"),
						task.get(CrmActivityTask_.priority).as(String.class).alias("priority"),
						ownerId.alias("ownerId"), task.get(CrmActivityTask_.deal).get(CrmDeal_.id).alias("dealId"),
						company.get(CrmCompany_.id).alias("companyId"),
						task.get(CrmActivityTask_.contact).get(CrmContact_.id).alias("contactId"))
				.where(predicates.toArray(new Predicate[0]));
			branches.add(taskQuery);
		}

		if (params.getTypes().contains(CrmActivityType.CALL)) {
			JpaSubQuery<Tuple> callQuery = query.subquery(Tuple.class);
			Root<CrmActivityCall> call = callQuery.from(CrmActivityCall.class);
			Join<CrmActivityCall, Employee> owner = call.join(CrmActivityCall_.owner, JoinType.LEFT);
			Path<Long> ownerId = owner.get(Employee_.employeeId);
			Join<CrmActivityCall, CrmCompany> company = call.join(CrmActivityCall_.company, JoinType.LEFT);
			company.on(cb.isFalse(company.get(CrmCompany_.isDeleted)));
			Path<Instant> loggedAt = call.get(CrmActivityCall_.loggedAt);

			List<Predicate> predicates = new ArrayList<>();
			predicates.add(cb.isFalse(call.get(CrmActivityCall_.isDeleted)));
			if (Boolean.TRUE.equals(params.getIsRestrictedToOwner())) {
				predicates.add(cb.equal(ownerId, params.getCurrentEmployeeId()));
			}
			if (params.getOwnerId() != null) {
				predicates.add(cb.equal(ownerId, params.getOwnerId()));
			}
			if (params.getRangeStart() != null) {
				predicates.add(cb.greaterThanOrEqualTo(loggedAt, params.getRangeStart()));
			}
			if (params.getRangeEnd() != null) {
				predicates.add(cb.lessThan(loggedAt, params.getRangeEnd()));
			}
			if (params.getSearchPattern() != null) {
				Join<CrmActivityCall, CrmContact> contact = call.join(CrmActivityCall_.contact, JoinType.LEFT);
				contact.on(cb.isFalse(contact.get(CrmContact_.isDeleted)));
				Join<CrmContact, CrmCompany> contactCompany = contact.join(CrmContact_.company, JoinType.LEFT);
				contactCompany.on(cb.isFalse(contactCompany.get(CrmCompany_.isDeleted)));
				predicates.add(cb.or(cb.like(cb.lower(call.get(CrmActivityCall_.subject)), params.getSearchPattern()),
						cb.like(cb.lower(contact.get(CrmContact_.name)), params.getSearchPattern()),
						cb.like(cb.lower(contactCompany.get(CrmCompany_.name)), params.getSearchPattern())));
			}

			callQuery
				.multiselect(call.get(CrmActivityCall_.id).alias("id"), cb.literal("CALL").alias("type"),
						call.get(CrmActivityCall_.subject).alias("subject"), loggedAt.alias("feedAt"),
						cb.nullLiteral(Instant.class).cast(Instant.class).alias("dueAt"),
						cb.nullLiteral(Instant.class).cast(Instant.class).alias("completedAt"),
						cb.nullLiteral(Boolean.class).cast(Boolean.class).alias("isCompleted"),
						cb.nullLiteral(String.class).cast(String.class).alias("priority"), ownerId.alias("ownerId"),
						call.get(CrmActivityCall_.deal).get(CrmDeal_.id).alias("dealId"),
						company.get(CrmCompany_.id).alias("companyId"),
						call.get(CrmActivityCall_.contact).get(CrmContact_.id).alias("contactId"))
				.where(predicates.toArray(new Predicate[0]));
			branches.add(callQuery);
		}

		if (params.getTypes().contains(CrmActivityType.MEETING)) {
			JpaSubQuery<Tuple> meetingQuery = query.subquery(Tuple.class);
			Root<CrmActivityMeeting> meeting = meetingQuery.from(CrmActivityMeeting.class);
			Join<CrmActivityMeeting, Employee> owner = meeting.join(CrmActivityMeeting_.owner, JoinType.LEFT);
			Path<Long> ownerId = owner.get(Employee_.employeeId);
			Join<CrmActivityMeeting, CrmCompany> company = meeting.join(CrmActivityMeeting_.company, JoinType.LEFT);
			company.on(cb.isFalse(company.get(CrmCompany_.isDeleted)));
			Path<Instant> startAt = meeting.get(CrmActivityMeeting_.startAt);

			List<Predicate> predicates = new ArrayList<>();
			predicates.add(cb.isFalse(meeting.get(CrmActivityMeeting_.isDeleted)));
			if (Boolean.TRUE.equals(params.getIsRestrictedToOwner())) {
				predicates.add(cb.equal(ownerId, params.getCurrentEmployeeId()));
			}
			if (params.getOwnerId() != null) {
				predicates.add(cb.equal(ownerId, params.getOwnerId()));
			}
			if (params.getRangeStart() != null) {
				predicates.add(cb.greaterThanOrEqualTo(startAt, params.getRangeStart()));
			}
			if (params.getRangeEnd() != null) {
				predicates.add(cb.lessThan(startAt, params.getRangeEnd()));
			}
			if (params.getSearchPattern() != null) {
				Subquery<Long> contactMatch = meetingQuery.subquery(Long.class);
				Root<CrmActivityMeetingContact> link = contactMatch.from(CrmActivityMeetingContact.class);
				Join<CrmActivityMeetingContact, CrmContact> contact = link.join(CrmActivityMeetingContact_.contact);
				Join<CrmContact, CrmCompany> contactCompany = contact.join(CrmContact_.company, JoinType.LEFT);
				contactCompany.on(cb.isFalse(contactCompany.get(CrmCompany_.isDeleted)));
				contactMatch.select(link.get(CrmActivityMeetingContact_.id).get(CrmActivityMeetingContactId_.meetingId))
					.where(cb.equal(link.get(CrmActivityMeetingContact_.id).get(CrmActivityMeetingContactId_.meetingId),
							meeting.get(CrmActivityMeeting_.id)), cb.isFalse(contact.get(CrmContact_.isDeleted)),
							cb.or(cb.like(cb.lower(contact.get(CrmContact_.name)), params.getSearchPattern()), cb
								.like(cb.lower(contactCompany.get(CrmCompany_.name)), params.getSearchPattern())));
				predicates
					.add(cb.or(cb.like(cb.lower(meeting.get(CrmActivityMeeting_.name)), params.getSearchPattern()),
							cb.exists(contactMatch)));
			}

			CriteriaBuilder.Case<Instant> dueAt = cb.selectCase();
			dueAt.when(cb.isTrue(meeting.get(CrmActivityMeeting_.isScheduled)), startAt)
				.otherwise(cb.nullLiteral(Instant.class).cast(Instant.class));

			meetingQuery
				.multiselect(meeting.get(CrmActivityMeeting_.id).alias("id"), cb.literal("MEETING").alias("type"),
						meeting.get(CrmActivityMeeting_.name).alias("subject"), startAt.alias("feedAt"),
						dueAt.alias("dueAt"), cb.nullLiteral(Instant.class).cast(Instant.class).alias("completedAt"),
						cb.nullLiteral(Boolean.class).cast(Boolean.class).alias("isCompleted"),
						cb.nullLiteral(String.class).cast(String.class).alias("priority"), ownerId.alias("ownerId"),
						meeting.get(CrmActivityMeeting_.deal).get(CrmDeal_.id).alias("dealId"),
						company.get(CrmCompany_.id).alias("companyId"),
						cb.nullLiteral(Long.class).cast(Long.class).alias("contactId"))
				.where(predicates.toArray(new Predicate[0]));
			branches.add(meetingQuery);
		}

		if (params.getTypes().contains(CrmActivityType.EMAIL)) {
			JpaSubQuery<Tuple> emailQuery = query.subquery(Tuple.class);
			Root<CrmActivityEmail> email = emailQuery.from(CrmActivityEmail.class);
			Join<CrmActivityEmail, Employee> owner = email.join(CrmActivityEmail_.owner, JoinType.LEFT);
			Path<Long> ownerId = owner.get(Employee_.employeeId);
			Join<CrmActivityEmail, CrmCompany> company = email.join(CrmActivityEmail_.company, JoinType.LEFT);
			company.on(cb.isFalse(company.get(CrmCompany_.isDeleted)));
			Path<Instant> loggedAt = email.get(CrmActivityEmail_.loggedAt);

			List<Predicate> predicates = new ArrayList<>();
			predicates.add(cb.isFalse(email.get(CrmActivityEmail_.isDeleted)));
			if (Boolean.TRUE.equals(params.getIsRestrictedToOwner())) {
				predicates.add(cb.equal(ownerId, params.getCurrentEmployeeId()));
			}
			if (params.getOwnerId() != null) {
				predicates.add(cb.equal(ownerId, params.getOwnerId()));
			}
			if (params.getRangeStart() != null) {
				predicates.add(cb.greaterThanOrEqualTo(loggedAt, params.getRangeStart()));
			}
			if (params.getRangeEnd() != null) {
				predicates.add(cb.lessThan(loggedAt, params.getRangeEnd()));
			}
			if (params.getSearchPattern() != null) {
				Subquery<Long> contactMatch = emailQuery.subquery(Long.class);
				Root<CrmActivityEmailContact> link = contactMatch.from(CrmActivityEmailContact.class);
				Join<CrmActivityEmailContact, CrmContact> contact = link.join(CrmActivityEmailContact_.contact);
				Join<CrmContact, CrmCompany> contactCompany = contact.join(CrmContact_.company, JoinType.LEFT);
				contactCompany.on(cb.isFalse(contactCompany.get(CrmCompany_.isDeleted)));
				contactMatch.select(link.get(CrmActivityEmailContact_.id).get(CrmActivityEmailContactId_.emailId))
					.where(cb.equal(link.get(CrmActivityEmailContact_.id).get(CrmActivityEmailContactId_.emailId),
							email.get(CrmActivityEmail_.id)), cb.isFalse(contact.get(CrmContact_.isDeleted)),
							cb.or(cb.like(cb.lower(contact.get(CrmContact_.name)), params.getSearchPattern()), cb
								.like(cb.lower(contactCompany.get(CrmCompany_.name)), params.getSearchPattern())));
				predicates.add(cb.or(cb.like(cb.lower(email.get(CrmActivityEmail_.subject)), params.getSearchPattern()),
						cb.exists(contactMatch)));
			}

			emailQuery
				.multiselect(email.get(CrmActivityEmail_.id).alias("id"), cb.literal("EMAIL").alias("type"),
						email.get(CrmActivityEmail_.subject).alias("subject"), loggedAt.alias("feedAt"),
						cb.nullLiteral(Instant.class).cast(Instant.class).alias("dueAt"),
						cb.nullLiteral(Instant.class).cast(Instant.class).alias("completedAt"),
						cb.nullLiteral(Boolean.class).cast(Boolean.class).alias("isCompleted"),
						cb.nullLiteral(String.class).cast(String.class).alias("priority"), ownerId.alias("ownerId"),
						email.get(CrmActivityEmail_.deal).get(CrmDeal_.id).alias("dealId"),
						company.get(CrmCompany_.id).alias("companyId"),
						cb.nullLiteral(Long.class).cast(Long.class).alias("contactId"))
				.where(predicates.toArray(new Predicate[0]));
			branches.add(emailQuery);
		}

		JpaSubQuery<Tuple> union = branches.size() == 1 ? branches.get(0)
				: cb.union(true, branches.get(0), branches.subList(1, branches.size()).toArray(new Subquery<?>[0]));
		JpaDerivedRoot<Tuple> feed = query.from(union);

		query
			.multiselect(feed.get("id"), feed.get("type"), feed.get("subject"), feed.get("feedAt"), feed.get("dueAt"),
					feed.get("completedAt"), feed.get("isCompleted"), feed.get("priority"), feed.get("ownerId"),
					feed.get("dealId"), feed.get("companyId"), feed.get("contactId"))
			.orderBy(cb.desc(feed.get("feedAt")).nullPrecedence(Nulls.LAST), cb.asc(feed.get("type")),
					cb.desc(feed.get("id")));

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
			row.setSubject(tuple.get(2, String.class));
			row.setDueAt(tuple.get(4, Instant.class));
			row.setOccurredAt(row.getType() == CrmActivityType.TASK ? null : tuple.get(3, Instant.class));
			row.setCompletedAt(tuple.get(5, Instant.class));
			row.setIsCompleted(Boolean.TRUE.equals(tuple.get(6, Boolean.class)));
			Object priority = tuple.get(7);
			row.setPriority(priority == null ? null : CrmActivityTaskPriority.valueOf(String.valueOf(priority)));
			row.setOwnerId(tuple.get(8, Long.class));
			Long dealId = tuple.get(9, Long.class);
			if (dealId != null) {
				row.setDeal(new CrmActivityFeedAssociationResponseDto(dealId, null, false));
			}
			Long companyId = tuple.get(10, Long.class);
			if (companyId != null) {
				row.setCompany(new CrmActivityFeedAssociationResponseDto(companyId, null, false));
			}
			Long contactId = tuple.get(11, Long.class);
			if (contactId != null) {
				row.getContacts().add(new CrmActivityFeedAssociationResponseDto(contactId, null, false));
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
			Map<Long, List<Long>> contactIdsByMeeting = entityManager.createQuery(contactQuery)
				.getResultList()
				.stream()
				.collect(Collectors.groupingBy(tuple -> tuple.get(0, Long.class),
						Collectors.mapping(tuple -> tuple.get(1, Long.class), Collectors.toList())));
			rows.stream()
				.filter(row -> row.getType() == CrmActivityType.MEETING)
				.forEach(row -> contactIdsByMeeting.getOrDefault(row.getId(), List.of())
					.forEach(id -> row.getContacts().add(new CrmActivityFeedAssociationResponseDto(id, null, false))));
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
			Map<Long, List<Long>> contactIdsByEmail = entityManager.createQuery(contactQuery)
				.getResultList()
				.stream()
				.collect(Collectors.groupingBy(tuple -> tuple.get(0, Long.class),
						Collectors.mapping(tuple -> tuple.get(1, Long.class), Collectors.toList())));
			rows.stream()
				.filter(row -> row.getType() == CrmActivityType.EMAIL)
				.forEach(row -> contactIdsByEmail.getOrDefault(row.getId(), List.of())
					.forEach(id -> row.getContacts().add(new CrmActivityFeedAssociationResponseDto(id, null, false))));
		}

		long total = pageable.getOffset() + rows.size() + (hasNext ? 1 : 0);
		return new PageImpl<>(rows, pageable, total);
	}

}
