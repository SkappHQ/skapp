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
import com.skapp.community.crmplanner.type.CrmActivityFeedColumns;
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

		JpaSubQuery<Tuple> taskRows = buildTaskRows(cb, query, params, searchPattern);
		JpaSubQuery<Tuple> callRows = buildCallRows(cb, query, params, searchPattern);
		JpaSubQuery<Tuple> meetingRows = buildMeetingRows(cb, query, params, searchPattern);
		JpaSubQuery<Tuple> emailRows = buildEmailRows(cb, query, params, searchPattern);

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
			.orderBy(params.getSortOrder().isAscending()
					? List.<Order>of(cb.asc(feedAt, false), cb.asc(activityId),
							cb.asc(activity.get(CrmConstants.ACTIVITY_FEED_TYPE_ALIAS)))
					: List.<Order>of(cb.desc(feedAt, false), cb.desc(activityId),
							cb.desc(activity.get(CrmConstants.ACTIVITY_FEED_TYPE_ALIAS))))
			.offset(pageable.getOffset())
			.fetch(pageable.getPageSize());

		List<Tuple> results = entityManager.createQuery(query).getResultList();
		List<CrmActivityFeedRowResponseDto> rows = results.stream().map(this::toRow).toList();

		long total = results.isEmpty() ? 0 : results.getFirst().get(13, Long.class);
		return new PageImpl<>(rows, pageable, total);
	}

	private JpaSubQuery<Tuple> buildTaskRows(HibernateCriteriaBuilder cb, JpaCriteriaQuery<Tuple> query,
			CrmActivityListParams params, String searchPattern) {
		JpaSubQuery<Tuple> taskRows = query.subquery(Tuple.class);
		Root<CrmActivityTask> task = taskRows.from(CrmActivityTask.class);
		Join<CrmActivityTask, CrmCompany> company = task.join(CrmActivityTask_.company, JoinType.LEFT);
		company.on(cb.isFalse(company.get(CrmCompany_.isDeleted)));
		Join<CrmActivityTask, CrmDeal> deal = task.join(CrmActivityTask_.deal, JoinType.LEFT);
		deal.on(cb.isFalse(deal.get(CrmDeal_.isDeleted)));
		Join<CrmActivityTask, CrmContact> contact = task.join(CrmActivityTask_.contact, JoinType.LEFT);
		contact.on(cb.isFalse(contact.get(CrmContact_.isDeleted)));
		Path<Long> ownerId = task.get(CrmActivityTask_.owner).get(Employee_.employeeId);
		Path<Instant> dueAt = task.get(CrmActivityTask_.dueAt);
		Path<Instant> completedAt = task.get(CrmActivityTask_.completedAt);
		Path<Boolean> isCompleted = task.get(CrmActivityTask_.isCompleted);
		Expression<Instant> feedAt = cb.<Instant>selectCase()
			.when(cb.isTrue(isCompleted), cb.coalesce(completedAt, dueAt))
			.otherwise(dueAt);
		List<Predicate> predicates = new ArrayList<>();
		addCommonPredicates(predicates, cb, params, task.get(CrmActivityTask_.isDeleted), ownerId, feedAt);
		if (searchPattern != null) {
			predicates.add(buildContactSearchPredicate(cb, searchPattern, task.get(CrmActivityTask_.name), contact));
		}
		CrmActivityFeedColumns columns = new CrmActivityFeedColumns();
		columns.setType(CrmActivityType.TASK);
		columns.setId(task.get(CrmActivityTask_.id));
		columns.setName(task.get(CrmActivityTask_.name));
		columns.setDueAt(dueAt);
		columns.setCompletedAt(completedAt);
		columns.setIsCompleted(isCompleted);
		columns.setPriority(task.get(CrmActivityTask_.priority).cast(String.class));
		columns.setOwnerId(ownerId);
		columns.setDealId(deal.get(CrmDeal_.id));
		columns.setCompanyId(company.get(CrmCompany_.id));
		columns.setContactIds(contact.get(CrmContact_.id).cast(String.class));
		return taskRows.multiselect(toSelections(cb, columns)).where(predicates.toArray(new Predicate[0]));
	}

	private JpaSubQuery<Tuple> buildCallRows(HibernateCriteriaBuilder cb, JpaCriteriaQuery<Tuple> query,
			CrmActivityListParams params, String searchPattern) {
		JpaSubQuery<Tuple> callRows = query.subquery(Tuple.class);
		Root<CrmActivityCall> call = callRows.from(CrmActivityCall.class);
		Join<CrmActivityCall, CrmCompany> company = call.join(CrmActivityCall_.company, JoinType.LEFT);
		company.on(cb.isFalse(company.get(CrmCompany_.isDeleted)));
		Join<CrmActivityCall, CrmDeal> deal = call.join(CrmActivityCall_.deal, JoinType.LEFT);
		deal.on(cb.isFalse(deal.get(CrmDeal_.isDeleted)));
		Join<CrmActivityCall, CrmContact> contact = call.join(CrmActivityCall_.contact, JoinType.LEFT);
		contact.on(cb.isFalse(contact.get(CrmContact_.isDeleted)));
		Path<Long> ownerId = call.get(CrmActivityCall_.owner).get(Employee_.employeeId);
		Path<Instant> loggedAt = call.get(CrmActivityCall_.loggedAt);
		List<Predicate> predicates = new ArrayList<>();
		addCommonPredicates(predicates, cb, params, call.get(CrmActivityCall_.isDeleted), ownerId, loggedAt);
		if (searchPattern != null) {
			predicates.add(buildContactSearchPredicate(cb, searchPattern, call.get(CrmActivityCall_.subject), contact));
		}
		CrmActivityFeedColumns columns = new CrmActivityFeedColumns();
		columns.setType(CrmActivityType.CALL);
		columns.setId(call.get(CrmActivityCall_.id));
		columns.setName(call.get(CrmActivityCall_.subject));
		columns.setOwnerId(ownerId);
		columns.setDealId(deal.get(CrmDeal_.id));
		columns.setCompanyId(company.get(CrmCompany_.id));
		columns.setContactIds(contact.get(CrmContact_.id).cast(String.class));
		columns.setLoggedAt(loggedAt);
		return callRows.multiselect(toSelections(cb, columns)).where(predicates.toArray(new Predicate[0]));
	}

	private JpaSubQuery<Tuple> buildMeetingRows(HibernateCriteriaBuilder cb, JpaCriteriaQuery<Tuple> query,
			CrmActivityListParams params, String searchPattern) {
		JpaSubQuery<Tuple> meetingRows = query.subquery(Tuple.class);
		Root<CrmActivityMeeting> meeting = meetingRows.from(CrmActivityMeeting.class);
		Join<CrmActivityMeeting, CrmCompany> company = meeting.join(CrmActivityMeeting_.company, JoinType.LEFT);
		company.on(cb.isFalse(company.get(CrmCompany_.isDeleted)));
		Join<CrmActivityMeeting, CrmDeal> deal = meeting.join(CrmActivityMeeting_.deal, JoinType.LEFT);
		deal.on(cb.isFalse(deal.get(CrmDeal_.isDeleted)));
		Path<Long> ownerId = meeting.get(CrmActivityMeeting_.owner).get(Employee_.employeeId);
		Path<Instant> startAt = meeting.get(CrmActivityMeeting_.startAt);
		List<Predicate> predicates = new ArrayList<>();
		addCommonPredicates(predicates, cb, params, meeting.get(CrmActivityMeeting_.isDeleted), ownerId, startAt);
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
			predicates.add(cb.or(cb.like(cb.lower(meeting.get(CrmActivityMeeting_.name)), searchPattern),
					cb.exists(contactMatch)));
		}
		JpaSubQuery<String> contactIds = meetingRows.subquery(String.class);
		Root<CrmActivityMeetingContact> link = contactIds.from(CrmActivityMeetingContact.class);
		Join<CrmActivityMeetingContact, CrmContact> contact = link.join(CrmActivityMeetingContact_.contact);
		Path<Long> contactId = contact.get(CrmContact_.id);
		contactIds.select(cb.listagg(cb.asc(contactId), contactId.cast(String.class), StringUtils.COMMA_DELIMITER))
			.where(cb.equal(link.get(CrmActivityMeetingContact_.id).get(CrmActivityMeetingContactId_.meetingId),
					meeting.get(CrmActivityMeeting_.id)), cb.isFalse(contact.get(CrmContact_.isDeleted)));
		CrmActivityFeedColumns columns = new CrmActivityFeedColumns();
		columns.setType(CrmActivityType.MEETING);
		columns.setId(meeting.get(CrmActivityMeeting_.id));
		columns.setName(meeting.get(CrmActivityMeeting_.name));
		columns.setOwnerId(ownerId);
		columns.setDealId(deal.get(CrmDeal_.id));
		columns.setCompanyId(company.get(CrmCompany_.id));
		columns.setContactIds(contactIds);
		columns.setStartAt(startAt);
		return meetingRows.multiselect(toSelections(cb, columns)).where(predicates.toArray(new Predicate[0]));
	}

	private JpaSubQuery<Tuple> buildEmailRows(HibernateCriteriaBuilder cb, JpaCriteriaQuery<Tuple> query,
			CrmActivityListParams params, String searchPattern) {
		JpaSubQuery<Tuple> emailRows = query.subquery(Tuple.class);
		Root<CrmActivityEmail> email = emailRows.from(CrmActivityEmail.class);
		Join<CrmActivityEmail, CrmCompany> company = email.join(CrmActivityEmail_.company, JoinType.LEFT);
		company.on(cb.isFalse(company.get(CrmCompany_.isDeleted)));
		Join<CrmActivityEmail, CrmDeal> deal = email.join(CrmActivityEmail_.deal, JoinType.LEFT);
		deal.on(cb.isFalse(deal.get(CrmDeal_.isDeleted)));
		Path<Long> ownerId = email.get(CrmActivityEmail_.owner).get(Employee_.employeeId);
		Path<Instant> loggedAt = email.get(CrmActivityEmail_.loggedAt);
		List<Predicate> predicates = new ArrayList<>();
		addCommonPredicates(predicates, cb, params, email.get(CrmActivityEmail_.isDeleted), ownerId, loggedAt);
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
			predicates.add(cb.or(cb.like(cb.lower(email.get(CrmActivityEmail_.subject)), searchPattern),
					cb.exists(contactMatch)));
		}
		JpaSubQuery<String> contactIds = emailRows.subquery(String.class);
		Root<CrmActivityEmailContact> link = contactIds.from(CrmActivityEmailContact.class);
		Join<CrmActivityEmailContact, CrmContact> contact = link.join(CrmActivityEmailContact_.contact);
		Path<Long> contactId = contact.get(CrmContact_.id);
		contactIds.select(cb.listagg(cb.asc(contactId), contactId.cast(String.class), StringUtils.COMMA_DELIMITER))
			.where(cb.equal(link.get(CrmActivityEmailContact_.id).get(CrmActivityEmailContactId_.emailId),
					email.get(CrmActivityEmail_.id)), cb.isFalse(contact.get(CrmContact_.isDeleted)));
		CrmActivityFeedColumns columns = new CrmActivityFeedColumns();
		columns.setType(CrmActivityType.EMAIL);
		columns.setId(email.get(CrmActivityEmail_.id));
		columns.setName(email.get(CrmActivityEmail_.subject));
		columns.setOwnerId(ownerId);
		columns.setDealId(deal.get(CrmDeal_.id));
		columns.setCompanyId(company.get(CrmCompany_.id));
		columns.setContactIds(contactIds);
		columns.setLoggedAt(loggedAt);
		return emailRows.multiselect(toSelections(cb, columns)).where(predicates.toArray(new Predicate[0]));
	}

	private Predicate buildContactSearchPredicate(HibernateCriteriaBuilder cb, String searchPattern, Path<String> title,
			Join<?, CrmContact> contact) {
		Join<CrmContact, CrmCompany> contactCompany = contact.join(CrmContact_.company, JoinType.LEFT);
		contactCompany.on(cb.isFalse(contactCompany.get(CrmCompany_.isDeleted)));
		return cb.or(cb.like(cb.lower(title), searchPattern),
				cb.like(cb.lower(contact.get(CrmContact_.name)), searchPattern),
				cb.like(cb.lower(contactCompany.get(CrmCompany_.name)), searchPattern));
	}

	private CrmActivityFeedRowResponseDto toRow(Tuple result) {
		CrmActivityFeedRowResponseDto row = new CrmActivityFeedRowResponseDto();
		row.setId(result.get(0, Long.class));
		row.setTitle(result.get(1, String.class));
		row.setDueAt(result.get(2, Instant.class));
		row.setCompletedAt(result.get(3, Instant.class));
		row.setIsCompleted(Boolean.TRUE.equals(result.get(4, Boolean.class)));
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
		row.setCanComplete(row.getType() == CrmActivityType.TASK);
		return row;
	}

	private void addCommonPredicates(List<Predicate> predicates, HibernateCriteriaBuilder cb,
			CrmActivityListParams params, Path<Boolean> isDeleted, Path<Long> ownerId, Expression<Instant> feedAt) {
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
	}

	private Selection<?>[] toSelections(HibernateCriteriaBuilder cb, CrmActivityFeedColumns columns) {
		return new Selection<?>[] { cb.literal(columns.getType().name()).alias(CrmConstants.ACTIVITY_FEED_TYPE_ALIAS),
				columns.getId().alias(CrmActivityTask_.ID), columns.getName().alias(CrmActivityTask_.NAME),
				instantOrNull(cb, columns.getDueAt()).alias(CrmActivityTask_.DUE_AT),
				instantOrNull(cb, columns.getCompletedAt()).alias(CrmActivityTask_.COMPLETED_AT),
				booleanOrNull(cb, columns.getIsCompleted()).alias(CrmActivityTask_.IS_COMPLETED),
				stringOrNull(cb, columns.getPriority()).alias(CrmActivityTask_.PRIORITY),
				columns.getOwnerId().alias(CrmActivityTask_.OWNER), columns.getDealId().alias(CrmActivityTask_.DEAL),
				columns.getCompanyId().alias(CrmActivityTask_.COMPANY),
				columns.getContactIds().alias(CrmActivityTask_.CONTACT),
				instantOrNull(cb, columns.getStartAt()).alias(CrmActivityMeeting_.START_AT),
				instantOrNull(cb, columns.getLoggedAt()).alias(CrmActivityCall_.LOGGED_AT) };
	}

	private Expression<Instant> instantOrNull(HibernateCriteriaBuilder cb, Expression<Instant> expression) {
		return expression != null ? expression : cb.nullLiteral(Instant.class);
	}

	private Expression<Boolean> booleanOrNull(HibernateCriteriaBuilder cb, Expression<Boolean> expression) {
		return expression != null ? expression : cb.nullLiteral(Boolean.class);
	}

	private Expression<String> stringOrNull(HibernateCriteriaBuilder cb, Expression<String> expression) {
		return expression != null ? expression : cb.nullLiteral(String.class);
	}

}
