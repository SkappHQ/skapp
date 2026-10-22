package com.skapp.community.crmplanner.activity.repository.impl;

import com.skapp.community.crmplanner.activity.repository.CrmActivityFeedRepository;
import com.skapp.community.crmplanner.activity.type.CrmActivityFeedCriteria;
import com.skapp.community.crmplanner.activity.type.CrmActivityFeedRecord;
import com.skapp.community.crmplanner.activity.type.CrmActivityLinkedContact;
import com.skapp.community.crmplanner.activity.type.CrmActivityType;
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
import com.skapp.community.crmplanner.model.CrmDeal_;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.Employee_;
import jakarta.persistence.EntityManager;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Order;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class CrmActivityFeedRepositoryImpl implements CrmActivityFeedRepository {

	private static final char LIKE_ESCAPE = '\\';

	private final EntityManager entityManager;

	@Override
	public List<CrmActivityFeedRecord> findDueActivities(CrmActivityFeedCriteria criteria) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<CrmActivityFeedRecord> query = cb.createQuery(CrmActivityFeedRecord.class);
		Root<CrmActivityFeedItem> item = query.from(CrmActivityFeedItem.class);
		FeedJoins joins = selectFeedRecord(cb, query, item);

		List<Predicate> predicates = buildFeedPredicates(cb, query, item, joins, criteria);
		predicates.add(cb.isTrue(item.get(CrmActivityFeedItem_.isDueKind)));
		predicates.add(cb.not(passedScheduledMeetingPredicate(cb, item, criteria)));
		query.where(predicates.toArray(new Predicate[0])).orderBy(newestFirst(cb, item));

		return entityManager.createQuery(query).getResultList();
	}

	@Override
	public List<CrmActivityFeedRecord> findHistoryActivities(CrmActivityFeedCriteria criteria, int offset, int limit) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<CrmActivityFeedRecord> query = cb.createQuery(CrmActivityFeedRecord.class);
		Root<CrmActivityFeedItem> item = query.from(CrmActivityFeedItem.class);
		FeedJoins joins = selectFeedRecord(cb, query, item);

		List<Predicate> predicates = buildFeedPredicates(cb, query, item, joins, criteria);
		predicates.add(cb.or(cb.isFalse(item.get(CrmActivityFeedItem_.isDueKind)),
				passedScheduledMeetingPredicate(cb, item, criteria)));
		query.where(predicates.toArray(new Predicate[0])).orderBy(newestFirst(cb, item));

		return entityManager.createQuery(query).setFirstResult(offset).setMaxResults(limit).getResultList();
	}

	@Override
	public List<CrmActivityLinkedContact> findMeetingContacts(Collection<Long> meetingIds) {
		if (meetingIds == null || meetingIds.isEmpty()) {
			return Collections.emptyList();
		}

		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<CrmActivityLinkedContact> query = cb.createQuery(CrmActivityLinkedContact.class);
		Root<CrmActivityMeetingContact> link = query.from(CrmActivityMeetingContact.class);
		Join<CrmActivityMeetingContact, CrmContact> contact = link.join(CrmActivityMeetingContact_.contact);
		Path<Long> meetingId = link.get(CrmActivityMeetingContact_.id).get(CrmActivityMeetingContactId_.meetingId);

		query
			.select(cb.construct(CrmActivityLinkedContact.class, meetingId, contact.get(CrmContact_.id),
					contact.get(CrmContact_.name), contact.get(CrmContact_.isDeleted)))
			.where(meetingId.in(meetingIds))
			.orderBy(cb.asc(meetingId), cb.asc(cb.lower(contact.get(CrmContact_.name))),
					cb.asc(contact.get(CrmContact_.id)));

		return entityManager.createQuery(query).getResultList();
	}

	@Override
	public List<CrmActivityLinkedContact> findEmailContacts(Collection<Long> emailIds) {
		if (emailIds == null || emailIds.isEmpty()) {
			return Collections.emptyList();
		}

		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<CrmActivityLinkedContact> query = cb.createQuery(CrmActivityLinkedContact.class);
		Root<CrmActivityEmailContact> link = query.from(CrmActivityEmailContact.class);
		Join<CrmActivityEmailContact, CrmContact> contact = link.join(CrmActivityEmailContact_.contact);
		Path<Long> emailId = link.get(CrmActivityEmailContact_.id).get(CrmActivityEmailContactId_.emailId);

		query
			.select(cb.construct(CrmActivityLinkedContact.class, emailId, contact.get(CrmContact_.id),
					contact.get(CrmContact_.name), contact.get(CrmContact_.isDeleted)))
			.where(emailId.in(emailIds))
			.orderBy(cb.asc(emailId), cb.asc(cb.lower(contact.get(CrmContact_.name))),
					cb.asc(contact.get(CrmContact_.id)));

		return entityManager.createQuery(query).getResultList();
	}

	private FeedJoins selectFeedRecord(CriteriaBuilder cb, CriteriaQuery<CrmActivityFeedRecord> query,
			Root<CrmActivityFeedItem> item) {
		Join<CrmActivityFeedItem, CrmActivityTask> task = item.join(CrmActivityFeedItem_.task, JoinType.LEFT);
		Join<CrmActivityFeedItem, CrmActivityCall> call = item.join(CrmActivityFeedItem_.call, JoinType.LEFT);
		Join<CrmActivityFeedItem, CrmActivityMeeting> meeting = item.join(CrmActivityFeedItem_.meeting, JoinType.LEFT);
		Join<CrmActivityFeedItem, CrmActivityEmail> email = item.join(CrmActivityFeedItem_.email, JoinType.LEFT);
		Join<CrmActivityFeedItem, Employee> owner = item.join(CrmActivityFeedItem_.owner, JoinType.LEFT);
		Join<CrmActivityFeedItem, CrmContact> contact = item.join(CrmActivityFeedItem_.contact, JoinType.LEFT);
		Join<CrmActivityFeedItem, CrmDeal> deal = item.join(CrmActivityFeedItem_.deal, JoinType.LEFT);
		Join<CrmActivityFeedItem, CrmCompany> company = item.join(CrmActivityFeedItem_.company, JoinType.LEFT);

		Expression<String> subject = cb.<String>coalesce()
			.value(task.get(CrmActivityTask_.name))
			.value(call.get(CrmActivityCall_.subject))
			.value(meeting.get(CrmActivityMeeting_.name))
			.value(email.get(CrmActivityEmail_.subject));

		query.select(cb.construct(CrmActivityFeedRecord.class, activityType(item), activityId(item), subject,
				item.get(CrmActivityFeedItem_.ownerId), owner.get(Employee_.firstName), owner.get(Employee_.lastName),
				owner.get(Employee_.authPic), contact.get(CrmContact_.id), contact.get(CrmContact_.name),
				contact.get(CrmContact_.isDeleted), deal.get(CrmDeal_.id), deal.get(CrmDeal_.name),
				deal.get(CrmDeal_.isDeleted), deal.get(CrmDeal_.owner).get(Employee_.employeeId),
				company.get(CrmCompany_.id), company.get(CrmCompany_.name), company.get(CrmCompany_.isDeleted),
				task.get(CrmActivityTask_.priority), item.get(CrmActivityFeedItem_.isCompleted),
				item.get(CrmActivityFeedItem_.isScheduled), item.get(CrmActivityFeedItem_.dueAt),
				item.get(CrmActivityFeedItem_.completedAt), item.get(CrmActivityFeedItem_.occurredAt),
				item.get(CrmActivityFeedItem_.createdDate)));

		return new FeedJoins(contact, subject);
	}

	private List<Predicate> buildFeedPredicates(CriteriaBuilder cb, CriteriaQuery<?> query,
			Root<CrmActivityFeedItem> item, FeedJoins joins, CrmActivityFeedCriteria criteria) {
		List<Predicate> predicates = new ArrayList<>();
		predicates.add(cb.isFalse(item.get(CrmActivityFeedItem_.isDeleted)));

		if (criteria.type() != null) {
			predicates.add(cb.equal(activityType(item), criteria.type()));
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
			predicates.add(buildSearchPredicate(cb, query, item, joins, criteria));
		}

		return predicates;
	}

	private Predicate passedScheduledMeetingPredicate(CriteriaBuilder cb, Root<CrmActivityFeedItem> item,
			CrmActivityFeedCriteria criteria) {
		return cb.and(cb.equal(activityType(item), CrmActivityType.MEETING),
				cb.lessThan(item.get(CrmActivityFeedItem_.feedAt), criteria.now()));
	}

	private List<Order> newestFirst(CriteriaBuilder cb, Root<CrmActivityFeedItem> item) {
		return List.of(cb.desc(item.get(CrmActivityFeedItem_.feedAt)), cb.asc(activityType(item)),
				cb.desc(activityId(item)));
	}

	private Predicate buildSearchPredicate(CriteriaBuilder cb, CriteriaQuery<?> query, Root<CrmActivityFeedItem> item,
			FeedJoins joins, CrmActivityFeedCriteria criteria) {
		String pattern = criteria.searchPattern();
		Join<CrmContact, CrmCompany> contactCompany = joins.contact().join(CrmContact_.company, JoinType.LEFT);

		List<Predicate> matches = new ArrayList<>();
		matches.add(cb.like(cb.lower(joins.subject()), pattern, LIKE_ESCAPE));
		matches.add(buildContactMatch(cb, joins.contact(), contactCompany, pattern));

		if (criteria.type() == null || criteria.type() == CrmActivityType.MEETING) {
			matches.add(cb.and(cb.equal(activityType(item), CrmActivityType.MEETING),
					cb.exists(buildMeetingContactSubquery(cb, query, item, pattern))));
		}

		if (criteria.type() == null || criteria.type() == CrmActivityType.EMAIL) {
			matches.add(cb.and(cb.equal(activityType(item), CrmActivityType.EMAIL),
					cb.exists(buildEmailContactSubquery(cb, query, item, pattern))));
		}

		return cb.or(matches.toArray(new Predicate[0]));
	}

	private Subquery<Long> buildMeetingContactSubquery(CriteriaBuilder cb, CriteriaQuery<?> query,
			Root<CrmActivityFeedItem> item, String pattern) {
		Subquery<Long> subquery = query.subquery(Long.class);
		Root<CrmActivityMeetingContact> link = subquery.from(CrmActivityMeetingContact.class);
		Join<CrmActivityMeetingContact, CrmContact> contact = link.join(CrmActivityMeetingContact_.contact);
		Join<CrmContact, CrmCompany> company = contact.join(CrmContact_.company, JoinType.LEFT);
		Path<Long> meetingId = link.get(CrmActivityMeetingContact_.id).get(CrmActivityMeetingContactId_.meetingId);

		return subquery.select(meetingId)
			.where(cb.equal(meetingId, activityId(item)), buildContactMatch(cb, contact, company, pattern));
	}

	private Subquery<Long> buildEmailContactSubquery(CriteriaBuilder cb, CriteriaQuery<?> query,
			Root<CrmActivityFeedItem> item, String pattern) {
		Subquery<Long> subquery = query.subquery(Long.class);
		Root<CrmActivityEmailContact> link = subquery.from(CrmActivityEmailContact.class);
		Join<CrmActivityEmailContact, CrmContact> contact = link.join(CrmActivityEmailContact_.contact);
		Join<CrmContact, CrmCompany> company = contact.join(CrmContact_.company, JoinType.LEFT);
		Path<Long> emailId = link.get(CrmActivityEmailContact_.id).get(CrmActivityEmailContactId_.emailId);

		return subquery.select(emailId)
			.where(cb.equal(emailId, activityId(item)), buildContactMatch(cb, contact, company, pattern));
	}

	private Predicate buildContactMatch(CriteriaBuilder cb, Join<?, CrmContact> contact,
			Join<CrmContact, CrmCompany> company, String pattern) {
		Predicate contactActive = cb.isFalse(contact.get(CrmContact_.isDeleted));
		Predicate nameMatch = cb.like(cb.lower(contact.get(CrmContact_.name)), pattern, LIKE_ESCAPE);
		Predicate companyMatch = cb.and(cb.isFalse(company.get(CrmCompany_.isDeleted)),
				cb.like(cb.lower(company.get(CrmCompany_.name)), pattern, LIKE_ESCAPE));
		return cb.and(contactActive, cb.or(nameMatch, companyMatch));
	}

	private Path<CrmActivityType> activityType(Root<CrmActivityFeedItem> item) {
		return item.get(CrmActivityFeedItem_.id).get(CrmActivityFeedItemId_.activityType);
	}

	private Path<Long> activityId(Root<CrmActivityFeedItem> item) {
		return item.get(CrmActivityFeedItem_.id).get(CrmActivityFeedItemId_.activityId);
	}

	private record FeedJoins(Join<CrmActivityFeedItem, CrmContact> contact, Expression<String> subject) {
	}

}
