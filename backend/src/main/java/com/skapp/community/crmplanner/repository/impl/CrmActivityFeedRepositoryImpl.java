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
import java.util.List;
import java.util.Locale;

@Repository
@RequiredArgsConstructor
public class CrmActivityFeedRepositoryImpl implements CrmActivityFeedRepository {

	private final EntityManager entityManager;

	@Override
	public Page<CrmActivityFeedRowResponseDto> findActivities(CrmActivityListParams params, Pageable pageable) {
		HibernateCriteriaBuilder cb = entityManager.unwrap(Session.class).getCriteriaBuilder();
		JpaCriteriaQuery<Tuple> query = cb.createTupleQuery();
		String searchPattern = StringUtils.isNullOrBlank(params.getSearchPattern()) ? null
				: "%" + StringUtils.escapeLikePattern(params.getSearchPattern().toLowerCase(Locale.ROOT)) + "%";

		JpaDerivedRoot<Tuple> activity = query
			.from(cb.union(true, callRows(cb, query, params, searchPattern), taskRows(cb, query, params, searchPattern),
					meetingRows(cb, query, params, searchPattern), emailRows(cb, query, params, searchPattern)));
		Expression<Instant> feedAt = cb.<Instant>coalesce()
			.value(activity.<Instant>get(CrmActivityCall_.LOGGED_AT))
			.value(activity.<Instant>get(CrmActivityMeeting_.START_AT))
			.value(taskFeedAt(cb, activity.get(CrmActivityTask_.IS_COMPLETED),
					activity.get(CrmActivityTask_.COMPLETED_AT), activity.get(CrmActivityTask_.DUE_AT)));
		Path<Long> activityId = activity.get(CrmActivityTask_.ID);
		Path<String> activityType = activity.get(CrmConstants.ACTIVITY_FEED_TYPE_ALIAS);
		query.multiselect(activityId.alias(CrmActivityTask_.ID), feedColumn(activity, CrmActivityTask_.NAME),
				feedColumn(activity, CrmActivityTask_.DUE_AT), feedColumn(activity, CrmActivityTask_.COMPLETED_AT),
				feedColumn(activity, CrmActivityTask_.IS_COMPLETED), feedColumn(activity, CrmActivityTask_.PRIORITY),
				feedColumn(activity, CrmActivityTask_.OWNER), feedColumn(activity, CrmActivityTask_.DEAL),
				feedColumn(activity, CrmActivityTask_.COMPANY), feedColumn(activity, CrmActivityTask_.CONTACT),
				feedColumn(activity, CrmActivityMeeting_.START_AT), feedColumn(activity, CrmActivityCall_.LOGGED_AT),
				activityType.alias(CrmConstants.ACTIVITY_FEED_TYPE_ALIAS),
				cb.count(activityId, cb.createWindow()).alias(CrmConstants.ACTIVITY_FEED_TOTAL_ALIAS))
			.orderBy(params.getSortOrder().isAscending()
					? List.<Order>of(cb.asc(feedAt, false), cb.asc(activityId), cb.asc(activityType))
					: List.<Order>of(cb.desc(feedAt, false), cb.desc(activityId), cb.desc(activityType)))
			.offset(pageable.getOffset())
			.fetch(pageable.getPageSize());

		List<Tuple> results = entityManager.createQuery(query).getResultList();
		long total = results.isEmpty() ? 0 : results.getFirst().get(CrmConstants.ACTIVITY_FEED_TOTAL_ALIAS, Long.class);
		return new PageImpl<>(results.stream().map(this::toFeedRow).toList(), pageable, total);
	}

	private JpaSubQuery<Tuple> taskRows(HibernateCriteriaBuilder cb, JpaCriteriaQuery<Tuple> query,
			CrmActivityListParams params, String searchPattern) {
		JpaSubQuery<Tuple> rows = query.subquery(Tuple.class);
		Root<CrmActivityTask> task = rows.from(CrmActivityTask.class);
		Join<?, CrmContact> contact = liveContact(cb, task.join(CrmActivityTask_.contact, JoinType.LEFT));
		Path<Long> ownerId = task.get(CrmActivityTask_.owner).get(Employee_.employeeId);
		Path<String> name = task.get(CrmActivityTask_.name);
		Path<Instant> dueAt = task.get(CrmActivityTask_.dueAt);
		Path<Instant> completedAt = task.get(CrmActivityTask_.completedAt);
		Path<Boolean> isCompleted = task.get(CrmActivityTask_.isCompleted);
		List<Predicate> predicates = feedPredicates(cb, params, task.get(CrmActivityTask_.isDeleted), ownerId,
				taskFeedAt(cb, isCompleted, completedAt, dueAt));
		if (searchPattern != null) {
			predicates.add(cb.or(matches(cb, name, searchPattern), contactMatches(cb, contact, searchPattern)));
		}
		List<Selection<?>> columns = sharedColumns(cb, CrmActivityType.TASK, task.get(CrmActivityTask_.id), name,
				ownerId, liveDeal(cb, task.join(CrmActivityTask_.deal, JoinType.LEFT)),
				liveCompany(cb, task.join(CrmActivityTask_.company, JoinType.LEFT)),
				contact.get(CrmContact_.id).cast(String.class));
		columns.addAll(List.of(dueAt.alias(CrmActivityTask_.DUE_AT), completedAt.alias(CrmActivityTask_.COMPLETED_AT),
				isCompleted.alias(CrmActivityTask_.IS_COMPLETED),
				task.get(CrmActivityTask_.priority).cast(String.class).alias(CrmActivityTask_.PRIORITY),
				cb.nullLiteral(Instant.class).alias(CrmActivityMeeting_.START_AT),
				cb.nullLiteral(Instant.class).alias(CrmActivityCall_.LOGGED_AT)));
		return rows.multiselect(columns).where(predicates.toArray(new Predicate[0]));
	}

	private JpaSubQuery<Tuple> callRows(HibernateCriteriaBuilder cb, JpaCriteriaQuery<Tuple> query,
			CrmActivityListParams params, String searchPattern) {
		JpaSubQuery<Tuple> rows = query.subquery(Tuple.class);
		Root<CrmActivityCall> call = rows.from(CrmActivityCall.class);
		Join<?, CrmContact> contact = liveContact(cb, call.join(CrmActivityCall_.contact, JoinType.LEFT));
		Path<Long> ownerId = call.get(CrmActivityCall_.owner).get(Employee_.employeeId);
		Path<String> subject = call.get(CrmActivityCall_.subject);
		Path<Instant> loggedAt = call.get(CrmActivityCall_.loggedAt);
		List<Predicate> predicates = feedPredicates(cb, params, call.get(CrmActivityCall_.isDeleted), ownerId,
				loggedAt);
		if (searchPattern != null) {
			predicates.add(cb.or(matches(cb, subject, searchPattern), contactMatches(cb, contact, searchPattern)));
		}
		List<Selection<?>> columns = sharedColumns(cb, CrmActivityType.CALL, call.get(CrmActivityCall_.id), subject,
				ownerId, liveDeal(cb, call.join(CrmActivityCall_.deal, JoinType.LEFT)),
				liveCompany(cb, call.join(CrmActivityCall_.company, JoinType.LEFT)),
				contact.get(CrmContact_.id).cast(String.class));
		columns.addAll(nonTaskColumns(cb, cb.nullLiteral(Instant.class), loggedAt));
		return rows.multiselect(columns).where(predicates.toArray(new Predicate[0]));
	}

	private JpaSubQuery<Tuple> meetingRows(HibernateCriteriaBuilder cb, JpaCriteriaQuery<Tuple> query,
			CrmActivityListParams params, String searchPattern) {
		JpaSubQuery<Tuple> rows = query.subquery(Tuple.class);
		Root<CrmActivityMeeting> meeting = rows.from(CrmActivityMeeting.class);
		Path<Long> meetingId = meeting.get(CrmActivityMeeting_.id);
		Path<Long> ownerId = meeting.get(CrmActivityMeeting_.owner).get(Employee_.employeeId);
		Path<String> name = meeting.get(CrmActivityMeeting_.name);
		Path<Instant> startAt = meeting.get(CrmActivityMeeting_.startAt);
		List<Predicate> predicates = feedPredicates(cb, params, meeting.get(CrmActivityMeeting_.isDeleted), ownerId,
				startAt);
		if (searchPattern != null) {
			JpaSubQuery<Long> contactMatch = rows.subquery(Long.class);
			Root<CrmActivityMeetingContact> link = contactMatch.from(CrmActivityMeetingContact.class);
			predicates.add(cb.or(matches(cb, name, searchPattern),
					linkedContactMatches(cb, contactMatch, link.join(CrmActivityMeetingContact_.contact),
							link.get(CrmActivityMeetingContact_.id).get(CrmActivityMeetingContactId_.meetingId),
							meetingId, searchPattern)));
		}
		JpaSubQuery<String> contactIds = rows.subquery(String.class);
		Root<CrmActivityMeetingContact> link = contactIds.from(CrmActivityMeetingContact.class);
		List<Selection<?>> columns = sharedColumns(cb, CrmActivityType.MEETING, meetingId, name, ownerId,
				liveDeal(cb, meeting.join(CrmActivityMeeting_.deal, JoinType.LEFT)),
				liveCompany(cb, meeting.join(CrmActivityMeeting_.company, JoinType.LEFT)),
				linkedContactIds(cb, contactIds, link.join(CrmActivityMeetingContact_.contact),
						link.get(CrmActivityMeetingContact_.id).get(CrmActivityMeetingContactId_.meetingId),
						meetingId));
		columns.addAll(nonTaskColumns(cb, startAt, cb.nullLiteral(Instant.class)));
		return rows.multiselect(columns).where(predicates.toArray(new Predicate[0]));
	}

	private JpaSubQuery<Tuple> emailRows(HibernateCriteriaBuilder cb, JpaCriteriaQuery<Tuple> query,
			CrmActivityListParams params, String searchPattern) {
		JpaSubQuery<Tuple> rows = query.subquery(Tuple.class);
		Root<CrmActivityEmail> email = rows.from(CrmActivityEmail.class);
		Path<Long> emailId = email.get(CrmActivityEmail_.id);
		Path<Long> ownerId = email.get(CrmActivityEmail_.owner).get(Employee_.employeeId);
		Path<String> subject = email.get(CrmActivityEmail_.subject);
		Path<Instant> loggedAt = email.get(CrmActivityEmail_.loggedAt);
		List<Predicate> predicates = feedPredicates(cb, params, email.get(CrmActivityEmail_.isDeleted), ownerId,
				loggedAt);
		if (searchPattern != null) {
			JpaSubQuery<Long> contactMatch = rows.subquery(Long.class);
			Root<CrmActivityEmailContact> link = contactMatch.from(CrmActivityEmailContact.class);
			predicates.add(cb.or(matches(cb, subject, searchPattern),
					linkedContactMatches(cb, contactMatch, link.join(CrmActivityEmailContact_.contact),
							link.get(CrmActivityEmailContact_.id).get(CrmActivityEmailContactId_.emailId), emailId,
							searchPattern)));
		}
		JpaSubQuery<String> contactIds = rows.subquery(String.class);
		Root<CrmActivityEmailContact> link = contactIds.from(CrmActivityEmailContact.class);
		List<Selection<?>> columns = sharedColumns(cb, CrmActivityType.EMAIL, emailId, subject, ownerId,
				liveDeal(cb, email.join(CrmActivityEmail_.deal, JoinType.LEFT)),
				liveCompany(cb, email.join(CrmActivityEmail_.company, JoinType.LEFT)),
				linkedContactIds(cb, contactIds, link.join(CrmActivityEmailContact_.contact),
						link.get(CrmActivityEmailContact_.id).get(CrmActivityEmailContactId_.emailId), emailId));
		columns.addAll(nonTaskColumns(cb, cb.nullLiteral(Instant.class), loggedAt));
		return rows.multiselect(columns).where(predicates.toArray(new Predicate[0]));
	}

	private Join<?, CrmCompany> liveCompany(HibernateCriteriaBuilder cb, Join<?, CrmCompany> company) {
		return company.on(cb.isFalse(company.get(CrmCompany_.isDeleted)));
	}

	private Join<?, CrmDeal> liveDeal(HibernateCriteriaBuilder cb, Join<?, CrmDeal> deal) {
		return deal.on(cb.isFalse(deal.get(CrmDeal_.isDeleted)));
	}

	private Join<?, CrmContact> liveContact(HibernateCriteriaBuilder cb, Join<?, CrmContact> contact) {
		return contact.on(cb.isFalse(contact.get(CrmContact_.isDeleted)));
	}

	private Expression<Instant> taskFeedAt(HibernateCriteriaBuilder cb, Expression<Boolean> isCompleted,
			Expression<Instant> completedAt, Expression<Instant> dueAt) {
		return cb.<Instant>selectCase().when(cb.isTrue(isCompleted), cb.coalesce(completedAt, dueAt)).otherwise(dueAt);
	}

	private List<Predicate> feedPredicates(HibernateCriteriaBuilder cb, CrmActivityListParams params,
			Path<Boolean> isDeleted, Path<Long> ownerId, Expression<Instant> feedAt) {
		List<Predicate> predicates = new ArrayList<>();
		predicates.add(cb.isFalse(isDeleted));
		if (Boolean.TRUE.equals(params.getIsRestrictedToOwner())) {
			predicates.add(cb.equal(ownerId, params.getCurrentEmployeeId()));
		}
		if (params.getOwnerId() != null) {
			predicates.add(cb.equal(ownerId, params.getOwnerId()));
		}
		if (params.getRangeStart() != null) {
			predicates.add(cb.greaterThanOrEqualTo(feedAt, params.getRangeStart()));
		}
		if (params.getRangeEnd() != null) {
			predicates.add(cb.lessThan(feedAt, params.getRangeEnd()));
		}
		return predicates;
	}

	private Predicate matches(HibernateCriteriaBuilder cb, Expression<String> value, String searchPattern) {
		return cb.like(cb.lower(value), searchPattern);
	}

	private Predicate contactMatches(HibernateCriteriaBuilder cb, Join<?, CrmContact> contact, String searchPattern) {
		Join<?, CrmCompany> company = liveCompany(cb, contact.join(CrmContact_.company, JoinType.LEFT));
		return cb.or(matches(cb, contact.get(CrmContact_.name), searchPattern),
				matches(cb, company.get(CrmCompany_.name), searchPattern));
	}

	private Predicate linkedContactMatches(HibernateCriteriaBuilder cb, JpaSubQuery<Long> contactMatch,
			Join<?, CrmContact> contact, Path<Long> linkedActivityId, Path<Long> activityId, String searchPattern) {
		contactMatch.select(linkedActivityId)
			.where(cb.equal(linkedActivityId, activityId), cb.isFalse(contact.get(CrmContact_.isDeleted)),
					contactMatches(cb, contact, searchPattern));
		return cb.exists(contactMatch);
	}

	private JpaSubQuery<String> linkedContactIds(HibernateCriteriaBuilder cb, JpaSubQuery<String> contactIds,
			Join<?, CrmContact> contact, Path<Long> linkedActivityId, Path<Long> activityId) {
		Path<Long> contactId = contact.get(CrmContact_.id);
		return contactIds
			.select(cb.listagg(cb.asc(contactId), contactId.cast(String.class), StringUtils.COMMA_DELIMITER))
			.where(cb.equal(linkedActivityId, activityId), cb.isFalse(contact.get(CrmContact_.isDeleted)));
	}

	private List<Selection<?>> sharedColumns(HibernateCriteriaBuilder cb, CrmActivityType type, Path<Long> id,
			Path<String> title, Path<Long> ownerId, Join<?, CrmDeal> deal, Join<?, CrmCompany> company,
			Expression<String> contactIds) {
		return new ArrayList<>(
				List.<Selection<?>>of(cb.literal(type.name()).alias(CrmConstants.ACTIVITY_FEED_TYPE_ALIAS),
						id.alias(CrmActivityTask_.ID), title.alias(CrmActivityTask_.NAME),
						ownerId.alias(CrmActivityTask_.OWNER), deal.get(CrmDeal_.id).alias(CrmActivityTask_.DEAL),
						company.get(CrmCompany_.id).alias(CrmActivityTask_.COMPANY),
						contactIds.alias(CrmActivityTask_.CONTACT)));
	}

	private List<Selection<?>> nonTaskColumns(HibernateCriteriaBuilder cb, Expression<Instant> startAt,
			Expression<Instant> loggedAt) {
		return List.of(cb.nullLiteral(Instant.class).alias(CrmActivityTask_.DUE_AT),
				cb.nullLiteral(Instant.class).alias(CrmActivityTask_.COMPLETED_AT),
				cb.nullLiteral(Boolean.class).alias(CrmActivityTask_.IS_COMPLETED),
				cb.nullLiteral(String.class).alias(CrmActivityTask_.PRIORITY),
				startAt.alias(CrmActivityMeeting_.START_AT), loggedAt.alias(CrmActivityCall_.LOGGED_AT));
	}

	private Selection<?> feedColumn(JpaDerivedRoot<Tuple> activity, String alias) {
		return activity.get(alias).alias(alias);
	}

	private CrmActivityFeedRowResponseDto toFeedRow(Tuple result) {
		CrmActivityFeedRowResponseDto row = new CrmActivityFeedRowResponseDto();
		row.setId(result.get(CrmActivityTask_.ID, Long.class));
		row.setTitle(result.get(CrmActivityTask_.NAME, String.class));
		row.setDueAt(result.get(CrmActivityTask_.DUE_AT, Instant.class));
		row.setCompletedAt(result.get(CrmActivityTask_.COMPLETED_AT, Instant.class));
		row.setIsCompleted(result.get(CrmActivityTask_.IS_COMPLETED, Boolean.class));
		String priority = result.get(CrmActivityTask_.PRIORITY, String.class);
		if (priority != null) {
			row.setPriority(CrmActivityTaskPriority.valueOf(priority));
		}
		row.setOwnerId(result.get(CrmActivityTask_.OWNER, Long.class));
		row.setDealId(result.get(CrmActivityTask_.DEAL, Long.class));
		row.setCompanyId(result.get(CrmActivityTask_.COMPANY, Long.class));
		StringUtils.convertToList(result.get(CrmActivityTask_.CONTACT, String.class))
			.stream()
			.map(Long::valueOf)
			.forEach(row.getContactIds()::add);
		row.setStartAt(result.get(CrmActivityMeeting_.START_AT, Instant.class));
		row.setLoggedAt(result.get(CrmActivityCall_.LOGGED_AT, Instant.class));
		row.setType(CrmActivityType.valueOf(result.get(CrmConstants.ACTIVITY_FEED_TYPE_ALIAS, String.class)));
		return row;
	}

}
