package com.skapp.community.crmplanner.repository.impl;

import com.skapp.community.common.util.StringUtils;
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
import com.skapp.community.crmplanner.payload.response.CrmActivityFeedRowResponseDto;
import com.skapp.community.crmplanner.repository.CrmActivityFeedRepository;
import com.skapp.community.crmplanner.type.CrmActivityFeedColumn;
import com.skapp.community.crmplanner.type.CrmActivityListParams;
import com.skapp.community.crmplanner.type.CrmActivityTaskPriority;
import com.skapp.community.crmplanner.type.CrmActivityType;
import com.skapp.community.peopleplanner.model.Employee_;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Tuple;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Order;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Selection;
import lombok.RequiredArgsConstructor;
import org.hibernate.Session;
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
import java.util.Arrays;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class CrmActivityFeedRepositoryImpl implements CrmActivityFeedRepository {

	private final EntityManager entityManager;

	@Override
	public Page<CrmActivityFeedRowResponseDto> findActivities(CrmActivityListParams params, Pageable pageable) {
		HibernateCriteriaBuilder cb = entityManager.unwrap(Session.class).getCriteriaBuilder();
		JpaCriteriaQuery<Tuple> query = cb.createTupleQuery();
		String searchPattern = params.getSearchPattern();

		JpaSubQuery<Tuple> taskRows = query.subquery(Tuple.class);
		Root<CrmActivityTask> task = taskRows.from(CrmActivityTask.class);
		Join<CrmActivityTask, CrmCompany> taskCompany = task.join(CrmActivityTask_.company, JoinType.LEFT);
		taskCompany.on(cb.isFalse(taskCompany.get(CrmCompany_.isDeleted)));
		Join<CrmActivityTask, CrmDeal> taskDeal = task.join(CrmActivityTask_.deal, JoinType.LEFT);
		taskDeal.on(cb.isFalse(taskDeal.get(CrmDeal_.isDeleted)));
		Join<CrmActivityTask, CrmContact> taskContact = task.join(CrmActivityTask_.contact, JoinType.LEFT);
		taskContact.on(cb.isFalse(taskContact.get(CrmContact_.isDeleted)));
		Path<Long> taskOwnerId = task.get(CrmActivityTask_.owner).get(Employee_.employeeId);
		Path<Instant> taskDueAt = task.get(CrmActivityTask_.dueAt);
		Path<Instant> taskCompletedAt = task.get(CrmActivityTask_.completedAt);
		Path<Boolean> taskIsCompleted = task.get(CrmActivityTask_.isCompleted);
		Expression<Instant> taskFeedAt = cb.<Instant>selectCase()
			.when(cb.isTrue(taskIsCompleted), cb.coalesce(taskCompletedAt, taskDueAt))
			.otherwise(taskDueAt);
		List<Predicate> taskPredicates = new ArrayList<>();
		taskPredicates.add(cb.isFalse(task.get(CrmActivityTask_.isDeleted)));
		if (Boolean.TRUE.equals(params.getIsRestrictedToOwner())) {
			taskPredicates.add(cb.equal(taskOwnerId, params.getCurrentEmployeeId()));
		}
		if (params.getOwnerId() != null) {
			taskPredicates.add(cb.equal(taskOwnerId, params.getOwnerId()));
		}
		if (params.getRangeStart() != null) {
			taskPredicates.add(cb.greaterThanOrEqualTo(taskFeedAt, params.getRangeStart()));
		}
		if (params.getRangeEnd() != null) {
			taskPredicates.add(cb.lessThan(taskFeedAt, params.getRangeEnd()));
		}
		if (searchPattern != null) {
			Join<CrmContact, CrmCompany> contactCompany = taskContact.join(CrmContact_.company, JoinType.LEFT);
			contactCompany.on(cb.isFalse(contactCompany.get(CrmCompany_.isDeleted)));
			taskPredicates.add(cb.or(cb.like(cb.lower(task.get(CrmActivityTask_.name)), searchPattern),
					cb.like(cb.lower(taskContact.get(CrmContact_.name)), searchPattern),
					cb.like(cb.lower(contactCompany.get(CrmCompany_.name)), searchPattern)));
		}
		taskRows
			.multiselect(cb.literal(CrmActivityType.TASK.name()).alias(CrmActivityFeedColumn.TYPE.name()),
					task.get(CrmActivityTask_.id).alias(CrmActivityFeedColumn.ID.name()),
					task.get(CrmActivityTask_.name).alias(CrmActivityFeedColumn.TITLE.name()),
					taskDueAt.alias(CrmActivityFeedColumn.DUE_AT.name()),
					cb.nullLiteral(Instant.class).alias(CrmActivityFeedColumn.LOGGED_AT.name()),
					cb.nullLiteral(Instant.class).alias(CrmActivityFeedColumn.START_AT.name()),
					taskCompletedAt.alias(CrmActivityFeedColumn.COMPLETED_AT.name()),
					taskIsCompleted.alias(CrmActivityFeedColumn.IS_COMPLETED.name()),
					task.get(CrmActivityTask_.priority).alias(CrmActivityFeedColumn.PRIORITY.name()),
					taskOwnerId.alias(CrmActivityFeedColumn.OWNER_ID.name()),
					taskDeal.get(CrmDeal_.id).alias(CrmActivityFeedColumn.DEAL_ID.name()),
					taskCompany.get(CrmCompany_.id).alias(CrmActivityFeedColumn.COMPANY_ID.name()),
					taskContact.get(CrmContact_.id).as(String.class).alias(CrmActivityFeedColumn.CONTACT_IDS.name()),
					taskFeedAt.alias(CrmActivityFeedColumn.FEED_AT.name()))
			.where(taskPredicates.toArray(new Predicate[0]));

		JpaSubQuery<Tuple> callRows = query.subquery(Tuple.class);
		Root<CrmActivityCall> call = callRows.from(CrmActivityCall.class);
		Join<CrmActivityCall, CrmCompany> callCompany = call.join(CrmActivityCall_.company, JoinType.LEFT);
		callCompany.on(cb.isFalse(callCompany.get(CrmCompany_.isDeleted)));
		Join<CrmActivityCall, CrmDeal> callDeal = call.join(CrmActivityCall_.deal, JoinType.LEFT);
		callDeal.on(cb.isFalse(callDeal.get(CrmDeal_.isDeleted)));
		Join<CrmActivityCall, CrmContact> callContact = call.join(CrmActivityCall_.contact, JoinType.LEFT);
		callContact.on(cb.isFalse(callContact.get(CrmContact_.isDeleted)));
		Path<Long> callOwnerId = call.get(CrmActivityCall_.owner).get(Employee_.employeeId);
		Path<Instant> callLoggedAt = call.get(CrmActivityCall_.loggedAt);
		List<Predicate> callPredicates = new ArrayList<>();
		callPredicates.add(cb.isFalse(call.get(CrmActivityCall_.isDeleted)));
		if (Boolean.TRUE.equals(params.getIsRestrictedToOwner())) {
			callPredicates.add(cb.equal(callOwnerId, params.getCurrentEmployeeId()));
		}
		if (params.getOwnerId() != null) {
			callPredicates.add(cb.equal(callOwnerId, params.getOwnerId()));
		}
		if (params.getRangeStart() != null) {
			callPredicates.add(cb.greaterThanOrEqualTo(callLoggedAt, params.getRangeStart()));
		}
		if (params.getRangeEnd() != null) {
			callPredicates.add(cb.lessThan(callLoggedAt, params.getRangeEnd()));
		}
		if (searchPattern != null) {
			Join<CrmContact, CrmCompany> contactCompany = callContact.join(CrmContact_.company, JoinType.LEFT);
			contactCompany.on(cb.isFalse(contactCompany.get(CrmCompany_.isDeleted)));
			callPredicates.add(cb.or(cb.like(cb.lower(call.get(CrmActivityCall_.subject)), searchPattern),
					cb.like(cb.lower(callContact.get(CrmContact_.name)), searchPattern),
					cb.like(cb.lower(contactCompany.get(CrmCompany_.name)), searchPattern)));
		}
		callRows
			.multiselect(cb.literal(CrmActivityType.CALL.name()).alias(CrmActivityFeedColumn.TYPE.name()),
					call.get(CrmActivityCall_.id).alias(CrmActivityFeedColumn.ID.name()),
					call.get(CrmActivityCall_.subject).alias(CrmActivityFeedColumn.TITLE.name()),
					cb.nullLiteral(Instant.class).alias(CrmActivityFeedColumn.DUE_AT.name()),
					callLoggedAt.alias(CrmActivityFeedColumn.LOGGED_AT.name()),
					cb.nullLiteral(Instant.class).alias(CrmActivityFeedColumn.START_AT.name()),
					cb.nullLiteral(Instant.class).alias(CrmActivityFeedColumn.COMPLETED_AT.name()),
					cb.nullLiteral(Boolean.class).alias(CrmActivityFeedColumn.IS_COMPLETED.name()),
					cb.nullLiteral(CrmActivityTaskPriority.class).alias(CrmActivityFeedColumn.PRIORITY.name()),
					callOwnerId.alias(CrmActivityFeedColumn.OWNER_ID.name()),
					callDeal.get(CrmDeal_.id).alias(CrmActivityFeedColumn.DEAL_ID.name()),
					callCompany.get(CrmCompany_.id).alias(CrmActivityFeedColumn.COMPANY_ID.name()),
					callContact.get(CrmContact_.id).as(String.class).alias(CrmActivityFeedColumn.CONTACT_IDS.name()),
					callLoggedAt.alias(CrmActivityFeedColumn.FEED_AT.name()))
			.where(callPredicates.toArray(new Predicate[0]));

		JpaSubQuery<Tuple> meetingRows = query.subquery(Tuple.class);
		Root<CrmActivityMeeting> meeting = meetingRows.from(CrmActivityMeeting.class);
		Join<CrmActivityMeeting, CrmCompany> meetingCompany = meeting.join(CrmActivityMeeting_.company, JoinType.LEFT);
		meetingCompany.on(cb.isFalse(meetingCompany.get(CrmCompany_.isDeleted)));
		Join<CrmActivityMeeting, CrmDeal> meetingDeal = meeting.join(CrmActivityMeeting_.deal, JoinType.LEFT);
		meetingDeal.on(cb.isFalse(meetingDeal.get(CrmDeal_.isDeleted)));
		Path<Long> meetingOwnerId = meeting.get(CrmActivityMeeting_.owner).get(Employee_.employeeId);
		Path<Instant> meetingStartAt = meeting.get(CrmActivityMeeting_.startAt);
		List<Predicate> meetingPredicates = new ArrayList<>();
		meetingPredicates.add(cb.isFalse(meeting.get(CrmActivityMeeting_.isDeleted)));
		if (Boolean.TRUE.equals(params.getIsRestrictedToOwner())) {
			meetingPredicates.add(cb.equal(meetingOwnerId, params.getCurrentEmployeeId()));
		}
		if (params.getOwnerId() != null) {
			meetingPredicates.add(cb.equal(meetingOwnerId, params.getOwnerId()));
		}
		if (params.getRangeStart() != null) {
			meetingPredicates.add(cb.greaterThanOrEqualTo(meetingStartAt, params.getRangeStart()));
		}
		if (params.getRangeEnd() != null) {
			meetingPredicates.add(cb.lessThan(meetingStartAt, params.getRangeEnd()));
		}
		if (searchPattern != null) {
			JpaSubQuery<Long> contactMatch = meetingRows.subquery(Long.class);
			Root<CrmActivityMeetingContact> link = contactMatch.from(CrmActivityMeetingContact.class);
			Join<CrmActivityMeetingContact, CrmContact> contact = link.join(CrmActivityMeetingContact_.contact);
			Join<CrmContact, CrmCompany> contactCompany = contact.join(CrmContact_.company, JoinType.LEFT);
			contactCompany.on(cb.isFalse(contactCompany.get(CrmCompany_.isDeleted)));
			Path<Long> meetingId = link.get(CrmActivityMeetingContact_.id).get(CrmActivityMeetingContactId_.meetingId);
			contactMatch.select(meetingId)
				.where(cb.equal(meetingId, meeting.get(CrmActivityMeeting_.id)),
						cb.isFalse(contact.get(CrmContact_.isDeleted)),
						cb.or(cb.like(cb.lower(contact.get(CrmContact_.name)), searchPattern),
								cb.like(cb.lower(contactCompany.get(CrmCompany_.name)), searchPattern)));
			meetingPredicates.add(cb.or(cb.like(cb.lower(meeting.get(CrmActivityMeeting_.name)), searchPattern),
					cb.exists(contactMatch)));
		}
		JpaSubQuery<String> meetingContactIds = meetingRows.subquery(String.class);
		Root<CrmActivityMeetingContact> meetingLink = meetingContactIds.from(CrmActivityMeetingContact.class);
		Join<CrmActivityMeetingContact, CrmContact> meetingContact = meetingLink
			.join(CrmActivityMeetingContact_.contact);
		Path<Long> meetingContactId = meetingContact.get(CrmContact_.id);
		meetingContactIds
			.select(cb.listagg(cb.asc(meetingContactId), meetingContactId.as(String.class),
					StringUtils.COMMA_DELIMITER))
			.where(cb.equal(meetingLink.get(CrmActivityMeetingContact_.id).get(CrmActivityMeetingContactId_.meetingId),
					meeting.get(CrmActivityMeeting_.id)), cb.isFalse(meetingContact.get(CrmContact_.isDeleted)));
		meetingRows
			.multiselect(cb.literal(CrmActivityType.MEETING.name()).alias(CrmActivityFeedColumn.TYPE.name()),
					meeting.get(CrmActivityMeeting_.id).alias(CrmActivityFeedColumn.ID.name()),
					meeting.get(CrmActivityMeeting_.name).alias(CrmActivityFeedColumn.TITLE.name()),
					cb.nullLiteral(Instant.class).alias(CrmActivityFeedColumn.DUE_AT.name()),
					cb.nullLiteral(Instant.class).alias(CrmActivityFeedColumn.LOGGED_AT.name()),
					meetingStartAt.alias(CrmActivityFeedColumn.START_AT.name()),
					cb.nullLiteral(Instant.class).alias(CrmActivityFeedColumn.COMPLETED_AT.name()),
					cb.nullLiteral(Boolean.class).alias(CrmActivityFeedColumn.IS_COMPLETED.name()),
					cb.nullLiteral(CrmActivityTaskPriority.class).alias(CrmActivityFeedColumn.PRIORITY.name()),
					meetingOwnerId.alias(CrmActivityFeedColumn.OWNER_ID.name()),
					meetingDeal.get(CrmDeal_.id).alias(CrmActivityFeedColumn.DEAL_ID.name()),
					meetingCompany.get(CrmCompany_.id).alias(CrmActivityFeedColumn.COMPANY_ID.name()),
					meetingContactIds.alias(CrmActivityFeedColumn.CONTACT_IDS.name()),
					meetingStartAt.alias(CrmActivityFeedColumn.FEED_AT.name()))
			.where(meetingPredicates.toArray(new Predicate[0]));

		JpaSubQuery<Tuple> emailRows = query.subquery(Tuple.class);
		Root<CrmActivityEmail> email = emailRows.from(CrmActivityEmail.class);
		Join<CrmActivityEmail, CrmCompany> emailCompany = email.join(CrmActivityEmail_.company, JoinType.LEFT);
		emailCompany.on(cb.isFalse(emailCompany.get(CrmCompany_.isDeleted)));
		Join<CrmActivityEmail, CrmDeal> emailDeal = email.join(CrmActivityEmail_.deal, JoinType.LEFT);
		emailDeal.on(cb.isFalse(emailDeal.get(CrmDeal_.isDeleted)));
		Path<Long> emailOwnerId = email.get(CrmActivityEmail_.owner).get(Employee_.employeeId);
		Path<Instant> emailLoggedAt = email.get(CrmActivityEmail_.loggedAt);
		List<Predicate> emailPredicates = new ArrayList<>();
		emailPredicates.add(cb.isFalse(email.get(CrmActivityEmail_.isDeleted)));
		if (Boolean.TRUE.equals(params.getIsRestrictedToOwner())) {
			emailPredicates.add(cb.equal(emailOwnerId, params.getCurrentEmployeeId()));
		}
		if (params.getOwnerId() != null) {
			emailPredicates.add(cb.equal(emailOwnerId, params.getOwnerId()));
		}
		if (params.getRangeStart() != null) {
			emailPredicates.add(cb.greaterThanOrEqualTo(emailLoggedAt, params.getRangeStart()));
		}
		if (params.getRangeEnd() != null) {
			emailPredicates.add(cb.lessThan(emailLoggedAt, params.getRangeEnd()));
		}
		if (searchPattern != null) {
			JpaSubQuery<Long> contactMatch = emailRows.subquery(Long.class);
			Root<CrmActivityEmailContact> link = contactMatch.from(CrmActivityEmailContact.class);
			Join<CrmActivityEmailContact, CrmContact> contact = link.join(CrmActivityEmailContact_.contact);
			Join<CrmContact, CrmCompany> contactCompany = contact.join(CrmContact_.company, JoinType.LEFT);
			contactCompany.on(cb.isFalse(contactCompany.get(CrmCompany_.isDeleted)));
			Path<Long> emailId = link.get(CrmActivityEmailContact_.id).get(CrmActivityEmailContactId_.emailId);
			contactMatch.select(emailId)
				.where(cb.equal(emailId, email.get(CrmActivityEmail_.id)),
						cb.isFalse(contact.get(CrmContact_.isDeleted)),
						cb.or(cb.like(cb.lower(contact.get(CrmContact_.name)), searchPattern),
								cb.like(cb.lower(contactCompany.get(CrmCompany_.name)), searchPattern)));
			emailPredicates.add(cb.or(cb.like(cb.lower(email.get(CrmActivityEmail_.subject)), searchPattern),
					cb.exists(contactMatch)));
		}
		JpaSubQuery<String> emailContactIds = emailRows.subquery(String.class);
		Root<CrmActivityEmailContact> emailLink = emailContactIds.from(CrmActivityEmailContact.class);
		Join<CrmActivityEmailContact, CrmContact> emailContact = emailLink.join(CrmActivityEmailContact_.contact);
		Path<Long> emailContactId = emailContact.get(CrmContact_.id);
		emailContactIds
			.select(cb.listagg(cb.asc(emailContactId), emailContactId.as(String.class), StringUtils.COMMA_DELIMITER))
			.where(cb.equal(emailLink.get(CrmActivityEmailContact_.id).get(CrmActivityEmailContactId_.emailId),
					email.get(CrmActivityEmail_.id)), cb.isFalse(emailContact.get(CrmContact_.isDeleted)));
		emailRows
			.multiselect(cb.literal(CrmActivityType.EMAIL.name()).alias(CrmActivityFeedColumn.TYPE.name()),
					email.get(CrmActivityEmail_.id).alias(CrmActivityFeedColumn.ID.name()),
					email.get(CrmActivityEmail_.subject).alias(CrmActivityFeedColumn.TITLE.name()),
					cb.nullLiteral(Instant.class).alias(CrmActivityFeedColumn.DUE_AT.name()),
					emailLoggedAt.alias(CrmActivityFeedColumn.LOGGED_AT.name()),
					cb.nullLiteral(Instant.class).alias(CrmActivityFeedColumn.START_AT.name()),
					cb.nullLiteral(Instant.class).alias(CrmActivityFeedColumn.COMPLETED_AT.name()),
					cb.nullLiteral(Boolean.class).alias(CrmActivityFeedColumn.IS_COMPLETED.name()),
					cb.nullLiteral(CrmActivityTaskPriority.class).alias(CrmActivityFeedColumn.PRIORITY.name()),
					emailOwnerId.alias(CrmActivityFeedColumn.OWNER_ID.name()),
					emailDeal.get(CrmDeal_.id).alias(CrmActivityFeedColumn.DEAL_ID.name()),
					emailCompany.get(CrmCompany_.id).alias(CrmActivityFeedColumn.COMPANY_ID.name()),
					emailContactIds.alias(CrmActivityFeedColumn.CONTACT_IDS.name()),
					emailLoggedAt.alias(CrmActivityFeedColumn.FEED_AT.name()))
			.where(emailPredicates.toArray(new Predicate[0]));

		JpaDerivedRoot<Tuple> activity = query.from(cb.union(true, taskRows, callRows, meetingRows, emailRows));
		List<Selection<?>> selections = new ArrayList<>(Arrays.stream(CrmActivityFeedColumn.values())
			.filter(column -> column != CrmActivityFeedColumn.TOTAL)
			.<Selection<?>>map(column -> activity.get(column.name()).alias(column.name()))
			.toList());
		selections.add(cb.count(activity.get(CrmActivityFeedColumn.ID.name()), cb.createWindow())
			.alias(CrmActivityFeedColumn.TOTAL.name()));
		query.multiselect(selections)
			.orderBy(params.getSortOrder().isAscending()
					? List.<Order>of(cb.asc(activity.get(CrmActivityFeedColumn.FEED_AT.name()), false),
							cb.asc(activity.get(CrmActivityFeedColumn.TYPE.name())),
							cb.asc(activity.get(CrmActivityFeedColumn.ID.name())))
					: List.<Order>of(cb.desc(activity.get(CrmActivityFeedColumn.FEED_AT.name()), false),
							cb.asc(activity.get(CrmActivityFeedColumn.TYPE.name())),
							cb.desc(activity.get(CrmActivityFeedColumn.ID.name()))))
			.offset(pageable.getOffset())
			.fetch(pageable.getPageSize());

		List<Tuple> results = entityManager.createQuery(query).getResultList();
		List<CrmActivityFeedRowResponseDto> rows = results.stream().map(result -> {
			CrmActivityType type = CrmActivityType.valueOf(result.get(CrmActivityFeedColumn.TYPE.name(), String.class));
			CrmActivityFeedRowResponseDto row = new CrmActivityFeedRowResponseDto();
			row.setId(result.get(CrmActivityFeedColumn.ID.name(), Long.class));
			row.setType(type);
			row.setTitle(result.get(CrmActivityFeedColumn.TITLE.name(), String.class));
			row.setDueAt(result.get(CrmActivityFeedColumn.DUE_AT.name(), Instant.class));
			row.setLoggedAt(result.get(CrmActivityFeedColumn.LOGGED_AT.name(), Instant.class));
			row.setStartAt(result.get(CrmActivityFeedColumn.START_AT.name(), Instant.class));
			row.setCompletedAt(result.get(CrmActivityFeedColumn.COMPLETED_AT.name(), Instant.class));
			row.setIsCompleted(result.get(CrmActivityFeedColumn.IS_COMPLETED.name(), Boolean.class));
			row.setPriority(result.get(CrmActivityFeedColumn.PRIORITY.name(), CrmActivityTaskPriority.class));
			row.setOwnerId(result.get(CrmActivityFeedColumn.OWNER_ID.name(), Long.class));
			row.setDealId(result.get(CrmActivityFeedColumn.DEAL_ID.name(), Long.class));
			row.setCompanyId(result.get(CrmActivityFeedColumn.COMPANY_ID.name(), Long.class));
			row.setCanComplete(type == CrmActivityType.TASK);
			StringUtils.convertToList(result.get(CrmActivityFeedColumn.CONTACT_IDS.name(), String.class))
				.stream()
				.map(Long::valueOf)
				.forEach(row.getContactIds()::add);
			return row;
		}).toList();

		long total = results.isEmpty() ? 0 : results.getFirst().get(CrmActivityFeedColumn.TOTAL.name(), Long.class);
		return new PageImpl<>(rows, pageable, total);
	}

}
