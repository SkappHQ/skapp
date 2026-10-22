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
import jakarta.persistence.metamodel.SingularAttribute;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.function.Function;

@Repository
@RequiredArgsConstructor
public class CrmActivityFeedRepositoryImpl implements CrmActivityFeedRepository {

	private static final char LIKE_ESCAPE = '\\';

	private final EntityManager entityManager;

	@Override
	public List<CrmActivityFeedRecord> findDueActivities(CrmActivityFeedCriteria criteria) {
		return findActivities(criteria, true, 0, 0);
	}

	@Override
	public List<CrmActivityFeedRecord> findHistoryActivities(CrmActivityFeedCriteria criteria, int offset, int limit) {
		return findActivities(criteria, false, offset, limit);
	}

	@Override
	public List<CrmActivityLinkedContact> findLinkedContacts(CrmActivityType type, Collection<Long> activityIds) {
		if (activityIds.isEmpty()) {
			return Collections.emptyList();
		}

		return type == CrmActivityType.MEETING
				? findLinkedContacts(CrmActivityMeetingContact.class, CrmActivityMeetingContact_.contact,
						link -> link.get(CrmActivityMeetingContact_.id).get(CrmActivityMeetingContactId_.meetingId),
						activityIds)
				: findLinkedContacts(CrmActivityEmailContact.class, CrmActivityEmailContact_.contact,
						link -> link.get(CrmActivityEmailContact_.id).get(CrmActivityEmailContactId_.emailId),
						activityIds);
	}

	private <L> List<CrmActivityLinkedContact> findLinkedContacts(Class<L> linkClass,
			SingularAttribute<L, CrmContact> contactAttribute, Function<Root<L>, Path<Long>> activityIdPath,
			Collection<Long> activityIds) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<CrmActivityLinkedContact> query = cb.createQuery(CrmActivityLinkedContact.class);
		Root<L> link = query.from(linkClass);
		Join<L, CrmContact> contact = link.join(contactAttribute);
		Path<Long> activityId = activityIdPath.apply(link);

		query
			.select(cb.construct(CrmActivityLinkedContact.class, activityId, contact.get(CrmContact_.id),
					contact.get(CrmContact_.name), contact.get(CrmContact_.isDeleted)))
			.where(activityId.in(activityIds))
			.orderBy(cb.asc(activityId), cb.asc(cb.lower(contact.get(CrmContact_.name))),
					cb.asc(contact.get(CrmContact_.id)));

		return entityManager.createQuery(query).getResultList();
	}

	private List<CrmActivityFeedRecord> findActivities(CrmActivityFeedCriteria criteria, boolean due, int offset,
			int limit) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<CrmActivityFeedRecord> query = cb.createQuery(CrmActivityFeedRecord.class);
		Root<CrmActivityFeedItem> item = query.from(CrmActivityFeedItem.class);

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
				item.get(CrmActivityFeedItem_.dueAt), item.get(CrmActivityFeedItem_.completedAt),
				item.get(CrmActivityFeedItem_.occurredAt), item.get(CrmActivityFeedItem_.createdDate)));

		List<Predicate> predicates = new ArrayList<>();
		predicates.add(cb.isFalse(item.get(CrmActivityFeedItem_.isDeleted)));

		Predicate passedScheduledMeeting = cb.and(cb.equal(activityType(item), CrmActivityType.MEETING),
				cb.lessThan(item.get(CrmActivityFeedItem_.feedAt), criteria.getNow()));
		Predicate dueKind = cb.isTrue(item.get(CrmActivityFeedItem_.isDueKind));
		predicates.add(
				due ? cb.and(dueKind, cb.not(passedScheduledMeeting)) : cb.or(cb.not(dueKind), passedScheduledMeeting));

		if (criteria.getType() != null) {
			predicates.add(cb.equal(activityType(item), criteria.getType()));
		}

		if (criteria.getOwnerIds() != null) {
			predicates.add(item.get(CrmActivityFeedItem_.ownerId).in(criteria.getOwnerIds()));
		}

		if (criteria.getRangeStart() != null) {
			predicates.add(cb.greaterThanOrEqualTo(item.get(CrmActivityFeedItem_.feedAt), criteria.getRangeStart()));
		}

		if (criteria.getRangeEnd() != null) {
			predicates.add(cb.lessThan(item.get(CrmActivityFeedItem_.feedAt), criteria.getRangeEnd()));
		}

		if (criteria.getSearchPattern() != null) {
			predicates.add(buildSearchPredicate(cb, query, item, contact, subject, criteria));
		}

		List<Order> orders = due
				? List.of(cb.asc(item.get(CrmActivityFeedItem_.feedAt)), cb.asc(activityType(item)),
						cb.asc(activityId(item)))
				: List.of(cb.desc(item.get(CrmActivityFeedItem_.feedAt)), cb.asc(activityType(item)),
						cb.desc(activityId(item)));
		query.where(predicates.toArray(new Predicate[0])).orderBy(orders);

		return due ? entityManager.createQuery(query).getResultList()
				: entityManager.createQuery(query).setFirstResult(offset).setMaxResults(limit).getResultList();
	}

	private Predicate buildSearchPredicate(CriteriaBuilder cb, CriteriaQuery<?> query, Root<CrmActivityFeedItem> item,
			Join<CrmActivityFeedItem, CrmContact> contact, Expression<String> subject,
			CrmActivityFeedCriteria criteria) {
		String pattern = criteria.getSearchPattern();
		Join<CrmContact, CrmCompany> contactCompany = contact.join(CrmContact_.company, JoinType.LEFT);

		List<Predicate> matches = new ArrayList<>();
		matches.add(cb.like(cb.lower(subject), pattern, LIKE_ESCAPE));
		matches.add(buildContactMatch(cb, contact, contactCompany, pattern));

		if (criteria.getType() == null || criteria.getType() == CrmActivityType.MEETING) {
			matches.add(cb
				.and(cb.equal(activityType(item), CrmActivityType.MEETING), cb.exists(buildLinkedContactSubquery(cb,
						query, item, pattern, CrmActivityMeetingContact.class, CrmActivityMeetingContact_.contact,
						link -> link.get(CrmActivityMeetingContact_.id).get(CrmActivityMeetingContactId_.meetingId)))));
		}

		if (criteria.getType() == null || criteria.getType() == CrmActivityType.EMAIL) {
			matches.add(cb.and(cb.equal(activityType(item), CrmActivityType.EMAIL),
					cb.exists(buildLinkedContactSubquery(cb, query, item, pattern, CrmActivityEmailContact.class,
							CrmActivityEmailContact_.contact,
							link -> link.get(CrmActivityEmailContact_.id).get(CrmActivityEmailContactId_.emailId)))));
		}

		return cb.or(matches.toArray(new Predicate[0]));
	}

	private <L> Subquery<Long> buildLinkedContactSubquery(CriteriaBuilder cb, CriteriaQuery<?> query,
			Root<CrmActivityFeedItem> item, String pattern, Class<L> linkClass,
			SingularAttribute<L, CrmContact> contactAttribute, Function<Root<L>, Path<Long>> activityIdPath) {
		Subquery<Long> subquery = query.subquery(Long.class);
		Root<L> link = subquery.from(linkClass);
		Join<L, CrmContact> contact = link.join(contactAttribute);
		Join<CrmContact, CrmCompany> company = contact.join(CrmContact_.company, JoinType.LEFT);
		Path<Long> linkedActivityId = activityIdPath.apply(link);

		return subquery.select(linkedActivityId)
			.where(cb.equal(linkedActivityId, activityId(item)), buildContactMatch(cb, contact, company, pattern));
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

}
