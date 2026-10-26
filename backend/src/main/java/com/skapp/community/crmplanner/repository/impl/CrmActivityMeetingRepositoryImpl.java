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
import com.skapp.community.crmplanner.model.CrmDeal;
import com.skapp.community.crmplanner.model.CrmDeal_;
import com.skapp.community.crmplanner.payload.response.CrmActivityMeetingResponseDto;
import com.skapp.community.crmplanner.repository.CrmActivityMeetingRepository;
import com.skapp.community.crmplanner.type.CrmActivityMeetingFilterParams;
import com.skapp.community.crmplanner.type.CrmActivityMeetingSort;
import com.skapp.community.crmplanner.type.CrmActivityMeetingVenue;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.Employee_;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.Tuple;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Order;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
public class CrmActivityMeetingRepositoryImpl implements CrmActivityMeetingRepository {

	private final EntityManager entityManager;

	@Override
	public List<CrmActivityMeetingResponseDto> findMeetings(CrmActivityMeetingFilterParams params) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<Tuple> query = cb.createTupleQuery();
		Root<CrmActivityMeeting> meeting = query.from(CrmActivityMeeting.class);
		Join<CrmActivityMeeting, Employee> owner = meeting.join(CrmActivityMeeting_.owner, JoinType.LEFT);
		Path<Long> ownerId = owner.get(Employee_.employeeId);

		Join<CrmActivityMeeting, CrmCompany> company = meeting.join(CrmActivityMeeting_.company, JoinType.LEFT);
		company.on(cb.isFalse(company.get(CrmCompany_.isDeleted)));

		Join<CrmActivityMeeting, CrmDeal> deal = meeting.join(CrmActivityMeeting_.deal, JoinType.LEFT);
		deal.on(cb.isFalse(deal.get(CrmDeal_.isDeleted)));

		List<Predicate> predicates = new ArrayList<>();
		predicates.add(cb.isFalse(meeting.get(CrmActivityMeeting_.isDeleted)));

		if (Boolean.TRUE.equals(params.getIsRestrictedToOwner())) {
			predicates.add(cb.equal(ownerId, params.getCurrentEmployeeId()));
		}
		if (params.getOwnerId() != null) {
			predicates.add(cb.equal(ownerId, params.getOwnerId()));
		}
		if (params.getRangeStart() != null) {
			predicates.add(cb.greaterThanOrEqualTo(meeting.get(CrmActivityMeeting_.startAt), params.getRangeStart()));
		}
		if (params.getRangeEnd() != null) {
			predicates.add(cb.lessThan(meeting.get(CrmActivityMeeting_.startAt), params.getRangeEnd()));
		}

		if (params.getSearchPattern() != null) {
			Subquery<Long> contactMatch = query.subquery(Long.class);
			Root<CrmActivityMeetingContact> link = contactMatch.from(CrmActivityMeetingContact.class);
			Join<CrmActivityMeetingContact, CrmContact> contact = link.join(CrmActivityMeetingContact_.contact);
			Join<CrmContact, CrmCompany> contactCompany = contact.join(CrmContact_.company, JoinType.LEFT);
			contactCompany.on(cb.isFalse(contactCompany.get(CrmCompany_.isDeleted)));
			contactMatch.select(link.get(CrmActivityMeetingContact_.id).get(CrmActivityMeetingContactId_.meetingId))
				.where(cb.equal(link.get(CrmActivityMeetingContact_.id).get(CrmActivityMeetingContactId_.meetingId),
						meeting.get(CrmActivityMeeting_.id)), cb.isFalse(contact.get(CrmContact_.isDeleted)),
						cb.or(cb.like(cb.lower(contact.get(CrmContact_.name)), params.getSearchPattern()),
								cb.like(cb.lower(contactCompany.get(CrmCompany_.name)), params.getSearchPattern())));

			predicates.add(cb.or(cb.like(cb.lower(meeting.get(CrmActivityMeeting_.name)), params.getSearchPattern()),
					cb.exists(contactMatch)));
		}

		boolean ascending = params.getSortOrder().isAscending();
		List<Order> orders = new ArrayList<>();
		if (params.getSortKey() == CrmActivityMeetingSort.OWNER) {
			orders.add(ascending ? cb.asc(owner.get(Employee_.firstName)) : cb.desc(owner.get(Employee_.firstName)));
			orders.add(ascending ? cb.asc(owner.get(Employee_.lastName)) : cb.desc(owner.get(Employee_.lastName)));
			orders.add(cb.desc(meeting.get(CrmActivityMeeting_.startAt)));
			orders.add(cb.desc(meeting.get(CrmActivityMeeting_.id)));
		}
		else {
			orders.add(ascending ? cb.asc(meeting.get(CrmActivityMeeting_.startAt))
					: cb.desc(meeting.get(CrmActivityMeeting_.startAt)));
			orders.add(ascending ? cb.asc(meeting.get(CrmActivityMeeting_.id))
					: cb.desc(meeting.get(CrmActivityMeeting_.id)));
		}

		query
			.multiselect(meeting.get(CrmActivityMeeting_.id), meeting.get(CrmActivityMeeting_.name),
					meeting.get(CrmActivityMeeting_.isScheduled), meeting.get(CrmActivityMeeting_.meetingVenue),
					meeting.get(CrmActivityMeeting_.location), meeting.get(CrmActivityMeeting_.startAt),
					meeting.get(CrmActivityMeeting_.endAt), ownerId, deal.get(CrmDeal_.id), company.get(CrmCompany_.id))
			.where(predicates.toArray(new Predicate[0]))
			.orderBy(orders);

		TypedQuery<Tuple> typedQuery = entityManager.createQuery(query);
		if (params.getMaxResults() != null) {
			typedQuery.setMaxResults(params.getMaxResults());
		}
		List<CrmActivityMeetingResponseDto> meetings = typedQuery.getResultList().stream().map(row -> {
			CrmActivityMeetingResponseDto dto = new CrmActivityMeetingResponseDto();
			dto.setId(row.get(0, Long.class));
			dto.setName(row.get(1, String.class));
			dto.setIsScheduled(row.get(2, Boolean.class));
			dto.setMeetingVenue(row.get(3, CrmActivityMeetingVenue.class));
			dto.setLocation(row.get(4, String.class));
			dto.setStartAt(row.get(5, Instant.class));
			dto.setEndAt(row.get(6, Instant.class));
			dto.setOwnerId(row.get(7, Long.class));
			dto.setDealId(row.get(8, Long.class));
			dto.setCompanyId(row.get(9, Long.class));
			return dto;
		}).toList();

		CriteriaQuery<Tuple> contactQuery = cb.createTupleQuery();
		Root<CrmActivityMeetingContact> contactLink = contactQuery.from(CrmActivityMeetingContact.class);
		Path<Long> meetingId = contactLink.get(CrmActivityMeetingContact_.id)
			.get(CrmActivityMeetingContactId_.meetingId);
		Join<CrmActivityMeetingContact, CrmContact> linkedContact = contactLink
			.join(CrmActivityMeetingContact_.contact);
		Path<Long> contactId = linkedContact.get(CrmContact_.id);

		contactQuery.multiselect(meetingId, contactId)
			.where(meetingId.in(meetings.stream().map(CrmActivityMeetingResponseDto::getId).toList()),
					cb.isFalse(linkedContact.get(CrmContact_.isDeleted)))
			.orderBy(cb.asc(meetingId), cb.asc(contactId));

		Map<Long, List<Long>> contactIdsByMeeting = entityManager.createQuery(contactQuery)
			.getResultList()
			.stream()
			.collect(Collectors.groupingBy(row -> row.get(0, Long.class),
					Collectors.mapping(row -> row.get(1, Long.class), Collectors.toList())));
		meetings.forEach(m -> m.setContactIds(contactIdsByMeeting.getOrDefault(m.getId(), List.of())));

		return meetings;
	}

}
