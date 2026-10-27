package com.skapp.community.crmplanner.repository.impl;

import com.skapp.community.common.util.StringUtils;
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
import com.skapp.community.crmplanner.model.CrmDeal_;
import com.skapp.community.crmplanner.payload.response.CrmActivityFeedRowResponseDto;
import com.skapp.community.crmplanner.repository.CrmActivityFeedRepository;
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
import java.util.List;

@Repository
@RequiredArgsConstructor
public class CrmActivityFeedRepositoryImpl implements CrmActivityFeedRepository {

	private final EntityManager entityManager;

	@Override
	public Page<CrmActivityFeedRowResponseDto> findActivities(CrmActivityListParams params, Pageable pageable) {
		HibernateCriteriaBuilder cb = entityManager.unwrap(Session.class).getCriteriaBuilder();
		JpaCriteriaQuery<Tuple> query = cb.createTupleQuery();
		String searchPattern = StringUtils.isNullOrBlank(params.getSearchPattern()) ? null
				: "%" + StringUtils.escapeLikePattern(params.getSearchPattern().toLowerCase()) + "%";

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
			.multiselect(cb.literal(CrmActivityType.TASK.name()).alias(CrmConstants.ACTIVITY_FEED_TYPE_ALIAS),
					task.get(CrmActivityTask_.id).alias(CrmActivityTask_.ID),
					task.get(CrmActivityTask_.name).alias(CrmActivityTask_.NAME),
					taskDueAt.alias(CrmActivityTask_.DUE_AT), taskCompletedAt.alias(CrmActivityTask_.COMPLETED_AT),
					taskIsCompleted.alias(CrmActivityTask_.IS_COMPLETED),
					task.get(CrmActivityTask_.priority).cast(String.class).alias(CrmActivityTask_.PRIORITY),
					taskOwnerId.alias(CrmActivityTask_.OWNER), taskDeal.get(CrmDeal_.id).alias(CrmActivityTask_.DEAL),
					taskCompany.get(CrmCompany_.id).alias(CrmActivityTask_.COMPANY),
					taskContact.get(CrmContact_.id).cast(String.class).alias(CrmActivityTask_.CONTACT),
					cb.nullLiteral(Instant.class).alias(CrmActivityMeeting_.START_AT),
					cb.nullLiteral(Instant.class).alias(CrmActivityCall_.LOGGED_AT))
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
			.multiselect(cb.literal(CrmActivityType.CALL.name()).alias(CrmConstants.ACTIVITY_FEED_TYPE_ALIAS),
					call.get(CrmActivityCall_.id).alias(CrmActivityTask_.ID),
					call.get(CrmActivityCall_.subject).alias(CrmActivityTask_.NAME),
					cb.nullLiteral(Instant.class).alias(CrmActivityTask_.DUE_AT),
					cb.nullLiteral(Instant.class).alias(CrmActivityTask_.COMPLETED_AT),
					cb.nullLiteral(Boolean.class).alias(CrmActivityTask_.IS_COMPLETED),
					cb.nullLiteral(String.class).alias(CrmActivityTask_.PRIORITY),
					callOwnerId.alias(CrmActivityTask_.OWNER), callDeal.get(CrmDeal_.id).alias(CrmActivityTask_.DEAL),
					callCompany.get(CrmCompany_.id).alias(CrmActivityTask_.COMPANY),
					callContact.get(CrmContact_.id).cast(String.class).alias(CrmActivityTask_.CONTACT),
					cb.nullLiteral(Instant.class).alias(CrmActivityMeeting_.START_AT),
					callLoggedAt.alias(CrmActivityCall_.LOGGED_AT))
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
			.select(cb.listagg(cb.asc(meetingContactId), meetingContactId.cast(String.class),
					StringUtils.COMMA_DELIMITER))
			.where(cb.equal(meetingLink.get(CrmActivityMeetingContact_.id).get(CrmActivityMeetingContactId_.meetingId),
					meeting.get(CrmActivityMeeting_.id)), cb.isFalse(meetingContact.get(CrmContact_.isDeleted)));
		meetingRows.multiselect(cb.literal(CrmActivityType.MEETING.name()).alias(CrmConstants.ACTIVITY_FEED_TYPE_ALIAS),
				meeting.get(CrmActivityMeeting_.id).alias(CrmActivityTask_.ID),
				meeting.get(CrmActivityMeeting_.name).alias(CrmActivityTask_.NAME),
				cb.nullLiteral(Instant.class).alias(CrmActivityTask_.DUE_AT),
				cb.nullLiteral(Instant.class).alias(CrmActivityTask_.COMPLETED_AT),
				cb.nullLiteral(Boolean.class).alias(CrmActivityTask_.IS_COMPLETED),
				cb.nullLiteral(String.class).alias(CrmActivityTask_.PRIORITY),
				meetingOwnerId.alias(CrmActivityTask_.OWNER), meetingDeal.get(CrmDeal_.id).alias(CrmActivityTask_.DEAL),
				meetingCompany.get(CrmCompany_.id).alias(CrmActivityTask_.COMPANY),
				meetingContactIds.alias(CrmActivityTask_.CONTACT), meetingStartAt.alias(CrmActivityMeeting_.START_AT),
				cb.nullLiteral(Instant.class).alias(CrmActivityCall_.LOGGED_AT))
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
			.select(cb.listagg(cb.asc(emailContactId), emailContactId.cast(String.class), StringUtils.COMMA_DELIMITER))
			.where(cb.equal(emailLink.get(CrmActivityEmailContact_.id).get(CrmActivityEmailContactId_.emailId),
					email.get(CrmActivityEmail_.id)), cb.isFalse(emailContact.get(CrmContact_.isDeleted)));
		emailRows
			.multiselect(cb.literal(CrmActivityType.EMAIL.name()).alias(CrmConstants.ACTIVITY_FEED_TYPE_ALIAS),
					email.get(CrmActivityEmail_.id).alias(CrmActivityTask_.ID),
					email.get(CrmActivityEmail_.subject).alias(CrmActivityTask_.NAME),
					cb.nullLiteral(Instant.class).alias(CrmActivityTask_.DUE_AT),
					cb.nullLiteral(Instant.class).alias(CrmActivityTask_.COMPLETED_AT),
					cb.nullLiteral(Boolean.class).alias(CrmActivityTask_.IS_COMPLETED),
					cb.nullLiteral(String.class).alias(CrmActivityTask_.PRIORITY),
					emailOwnerId.alias(CrmActivityTask_.OWNER), emailDeal.get(CrmDeal_.id).alias(CrmActivityTask_.DEAL),
					emailCompany.get(CrmCompany_.id).alias(CrmActivityTask_.COMPANY),
					emailContactIds.alias(CrmActivityTask_.CONTACT),
					cb.nullLiteral(Instant.class).alias(CrmActivityMeeting_.START_AT),
					emailLoggedAt.alias(CrmActivityCall_.LOGGED_AT))
			.where(emailPredicates.toArray(new Predicate[0]));

		JpaDerivedRoot<Tuple> activity = query.from(cb.union(true, callRows, taskRows, meetingRows, emailRows));
		Expression<Instant> taskAt = cb.<Instant>selectCase()
			.when(cb.isTrue(activity.<Boolean>get(CrmActivityTask_.IS_COMPLETED)),
					cb.coalesce(activity.<Instant>get(CrmActivityTask_.COMPLETED_AT),
							activity.<Instant>get(CrmActivityTask_.DUE_AT)))
			.otherwise(activity.<Instant>get(CrmActivityTask_.DUE_AT));
		Expression<Instant> feedAt = cb.<Instant>coalesce()
			.value(activity.<Instant>get(CrmActivityCall_.LOGGED_AT))
			.value(activity.<Instant>get(CrmActivityMeeting_.START_AT))
			.value(taskAt);
		Path<Long> activityId = activity.get(CrmActivityTask_.ID);
		query
			.multiselect(activityId, activity.get(CrmActivityTask_.NAME), activity.get(CrmActivityTask_.DUE_AT),
					activity.get(CrmActivityTask_.COMPLETED_AT), activity.get(CrmActivityTask_.IS_COMPLETED),
					activity.get(CrmActivityTask_.PRIORITY), activity.get(CrmActivityTask_.OWNER),
					activity.get(CrmActivityTask_.DEAL), activity.get(CrmActivityTask_.COMPANY),
					activity.get(CrmActivityTask_.CONTACT), activity.get(CrmActivityMeeting_.START_AT),
					activity.get(CrmActivityCall_.LOGGED_AT), activity.get(CrmConstants.ACTIVITY_FEED_TYPE_ALIAS),
					cb.count(activityId, cb.createWindow()))
			.orderBy(params.getSortOrder().isAscending() ? List.<Order>of(cb.asc(feedAt, false), cb.asc(activityId))
					: List.<Order>of(cb.desc(feedAt, false), cb.desc(activityId)))
			.offset(pageable.getOffset())
			.fetch(pageable.getPageSize());

		List<Tuple> results = entityManager.createQuery(query).getResultList();
		List<CrmActivityFeedRowResponseDto> rows = results.stream().map(result -> {
			CrmActivityFeedRowResponseDto row = new CrmActivityFeedRowResponseDto();
			row.setId(result.get(0, Long.class));
			row.setTitle(result.get(1, String.class));
			row.setDueAt(result.get(2, Instant.class));
			row.setCompletedAt(result.get(3, Instant.class));
			row.setIsCompleted(result.get(4, Boolean.class));
			String priority = result.get(5, String.class);
			if (priority != null) {
				row.setPriority(CrmActivityTaskPriority.valueOf(priority));
			}
			row.setOwnerId(result.get(6, Long.class));
			row.setDealId(result.get(7, Long.class));
			row.setCompanyId(result.get(8, Long.class));
			StringUtils.convertToList(result.get(9, String.class))
				.stream()
				.map(Long::valueOf)
				.forEach(row.getContactIds()::add);
			row.setStartAt(result.get(10, Instant.class));
			row.setLoggedAt(result.get(11, Instant.class));
			row.setType(CrmActivityType.valueOf(result.get(12, String.class)));
			return row;
		}).toList();

		long total = results.isEmpty() ? 0 : results.getFirst().get(13, Long.class);
		return new PageImpl<>(rows, pageable, total);
	}

}
