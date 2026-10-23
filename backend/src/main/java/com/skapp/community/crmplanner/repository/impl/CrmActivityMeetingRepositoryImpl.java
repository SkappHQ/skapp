package com.skapp.community.crmplanner.repository.impl;

import com.skapp.community.crmplanner.model.CrmActivityMeeting;
import com.skapp.community.crmplanner.model.CrmActivityMeetingContact;
import com.skapp.community.crmplanner.model.CrmActivityMeetingContactId_;
import com.skapp.community.crmplanner.model.CrmActivityMeetingContact_;
import com.skapp.community.crmplanner.model.CrmActivityMeeting_;
import com.skapp.community.crmplanner.model.CrmCompany;
import com.skapp.community.crmplanner.model.CrmCompany_;
import com.skapp.community.crmplanner.model.CrmContact;
import com.skapp.community.crmplanner.model.CrmContact_;
import com.skapp.community.crmplanner.model.CrmDeal_;
import com.skapp.community.crmplanner.payload.response.CrmActivityMeetingResponseDto;
import com.skapp.community.crmplanner.repository.CrmActivityMeetingRepository;
import com.skapp.community.crmplanner.type.CrmActivityContactLink;
import com.skapp.community.crmplanner.type.CrmActivityMeetingFilterParams;
import com.skapp.community.crmplanner.type.CrmActivityMeetingSort;
import com.skapp.community.crmplanner.util.CrmActivityScopeUtil;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.Employee_;
import jakarta.persistence.EntityManager;
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

import java.util.Collection;
import java.util.Collections;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class CrmActivityMeetingRepositoryImpl implements CrmActivityMeetingRepository {

	private final EntityManager entityManager;

	@Override
	public List<CrmActivityMeetingResponseDto> findMeetings(CrmActivityMeetingFilterParams params) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<CrmActivityMeetingResponseDto> query = cb.createQuery(CrmActivityMeetingResponseDto.class);
		Root<CrmActivityMeeting> meeting = query.from(CrmActivityMeeting.class);
		Join<CrmActivityMeeting, Employee> owner = meeting.join(CrmActivityMeeting_.owner, JoinType.LEFT);
		Path<Long> ownerId = owner.get(Employee_.employeeId);

		Join<CrmActivityMeeting, CrmCompany> company = meeting.join(CrmActivityMeeting_.company, JoinType.LEFT);
		company.on(cb.isFalse(company.get(CrmCompany_.isDeleted)));

		List<Predicate> predicates = CrmActivityScopeUtil.buildScopePredicates(cb, query, ownerId,
				meeting.get(CrmActivityMeeting_.startAt), params);
		predicates.add(cb.isFalse(meeting.get(CrmActivityMeeting_.isDeleted)));

		if (params.getSearchPattern() != null) {
			Subquery<Long> contactMatch = query.subquery(Long.class);
			Root<CrmActivityMeetingContact> link = contactMatch.from(CrmActivityMeetingContact.class);
			Join<CrmActivityMeetingContact, CrmContact> contact = link.join(CrmActivityMeetingContact_.contact);
			Join<CrmContact, CrmCompany> contactCompany = contact.join(CrmContact_.company, JoinType.LEFT);
			contactCompany.on(cb.isFalse(contactCompany.get(CrmCompany_.isDeleted)));
			contactMatch.select(link.get(CrmActivityMeetingContact_.id).get(CrmActivityMeetingContactId_.meetingId))
				.where(cb.equal(link.get(CrmActivityMeetingContact_.id)
					.get(CrmActivityMeetingContactId_.meetingId), meeting.get(CrmActivityMeeting_.id)),
						cb.isFalse(contact.get(CrmContact_.isDeleted)),
						cb.or(cb.like(cb.lower(contact.get(CrmContact_.name)), params.getSearchPattern(),
								CrmActivityScopeUtil.LIKE_ESCAPE),
								cb.like(cb.lower(contactCompany.get(CrmCompany_.name)), params.getSearchPattern(),
										CrmActivityScopeUtil.LIKE_ESCAPE)));

			predicates.add(cb.or(cb.like(cb.lower(meeting.get(CrmActivityMeeting_.name)), params.getSearchPattern(),
					CrmActivityScopeUtil.LIKE_ESCAPE), cb.exists(contactMatch)));
		}

		query
			.select(cb.construct(CrmActivityMeetingResponseDto.class, meeting.get(CrmActivityMeeting_.id),
					meeting.get(CrmActivityMeeting_.name), meeting.get(CrmActivityMeeting_.isScheduled),
					meeting.get(CrmActivityMeeting_.meetingVenue), meeting.get(CrmActivityMeeting_.location),
					meeting.get(CrmActivityMeeting_.startAt), meeting.get(CrmActivityMeeting_.endAt), ownerId,
					meeting.get(CrmActivityMeeting_.deal).get(CrmDeal_.id), company.get(CrmCompany_.id)))
			.where(predicates.toArray(new Predicate[0]))
			.orderBy(CrmActivityScopeUtil.buildOrders(cb, params.getSortKey() == CrmActivityMeetingSort.OWNER,
					owner.get(Employee_.firstName), owner.get(Employee_.lastName),
					meeting.get(CrmActivityMeeting_.startAt), meeting.get(CrmActivityMeeting_.id), params));

		return entityManager.createQuery(query).getResultList();
	}

	@Override
	public List<CrmActivityContactLink> findContactLinks(Collection<Long> meetingIds) {
		if (meetingIds == null || meetingIds.isEmpty()) {
			return Collections.emptyList();
		}

		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<CrmActivityContactLink> query = cb.createQuery(CrmActivityContactLink.class);
		Root<CrmActivityMeetingContact> link = query.from(CrmActivityMeetingContact.class);
		Path<Long> meetingId = link.get(CrmActivityMeetingContact_.id).get(CrmActivityMeetingContactId_.meetingId);
		Path<Long> contactId = link.get(CrmActivityMeetingContact_.contact).get(CrmContact_.id);

		query.select(cb.construct(CrmActivityContactLink.class, meetingId, contactId))
			.where(meetingId.in(meetingIds))
			.orderBy(cb.asc(meetingId), cb.asc(contactId));

		return entityManager.createQuery(query).getResultList();
	}

}
