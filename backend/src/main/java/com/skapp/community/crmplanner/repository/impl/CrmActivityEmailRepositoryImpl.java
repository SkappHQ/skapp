package com.skapp.community.crmplanner.repository.impl;

import com.skapp.community.crmplanner.model.CrmActivityEmail;
import com.skapp.community.crmplanner.model.CrmActivityEmailContact;
import com.skapp.community.crmplanner.model.CrmActivityEmailContactId_;
import com.skapp.community.crmplanner.model.CrmActivityEmailContact_;
import com.skapp.community.crmplanner.model.CrmActivityEmail_;
import com.skapp.community.crmplanner.model.CrmCompany;
import com.skapp.community.crmplanner.model.CrmCompany_;
import com.skapp.community.crmplanner.model.CrmContact;
import com.skapp.community.crmplanner.model.CrmContact_;
import com.skapp.community.crmplanner.model.CrmDeal_;
import com.skapp.community.crmplanner.payload.response.CrmActivityEmailResponseDto;
import com.skapp.community.crmplanner.repository.CrmActivityEmailRepository;
import com.skapp.community.crmplanner.type.CrmActivityEmailFilterParams;
import com.skapp.community.crmplanner.type.CrmActivityEmailSort;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.Employee_;
import jakarta.persistence.EntityManager;
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
public class CrmActivityEmailRepositoryImpl implements CrmActivityEmailRepository {

	private final EntityManager entityManager;

	@Override
	public List<CrmActivityEmailResponseDto> findEmails(CrmActivityEmailFilterParams params) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<Tuple> query = cb.createTupleQuery();
		Root<CrmActivityEmail> email = query.from(CrmActivityEmail.class);
		Join<CrmActivityEmail, Employee> owner = email.join(CrmActivityEmail_.owner, JoinType.LEFT);
		Path<Long> ownerId = owner.get(Employee_.employeeId);

		Join<CrmActivityEmail, CrmCompany> company = email.join(CrmActivityEmail_.company, JoinType.LEFT);
		company.on(cb.isFalse(company.get(CrmCompany_.isDeleted)));

		Path<Instant> loggedAt = email.get(CrmActivityEmail_.loggedAt);
		List<Predicate> predicates = new ArrayList<>();
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
		predicates.add(cb.isFalse(email.get(CrmActivityEmail_.isDeleted)));

		if (params.getSearchPattern() != null) {
			Subquery<Long> contactMatch = query.subquery(Long.class);
			Root<CrmActivityEmailContact> link = contactMatch.from(CrmActivityEmailContact.class);
			Join<CrmActivityEmailContact, CrmContact> contact = link.join(CrmActivityEmailContact_.contact);
			Join<CrmContact, CrmCompany> contactCompany = contact.join(CrmContact_.company, JoinType.LEFT);
			contactCompany.on(cb.isFalse(contactCompany.get(CrmCompany_.isDeleted)));
			contactMatch.select(link.get(CrmActivityEmailContact_.id).get(CrmActivityEmailContactId_.emailId))
				.where(cb.equal(link.get(CrmActivityEmailContact_.id).get(CrmActivityEmailContactId_.emailId),
						email.get(CrmActivityEmail_.id)), cb.isFalse(contact.get(CrmContact_.isDeleted)),
						cb.or(cb.like(cb.lower(contact.get(CrmContact_.name)), params.getSearchPattern(), '\\'), cb
							.like(cb.lower(contactCompany.get(CrmCompany_.name)), params.getSearchPattern(), '\\')));

			predicates
				.add(cb.or(cb.like(cb.lower(email.get(CrmActivityEmail_.subject)), params.getSearchPattern(), '\\'),
						cb.exists(contactMatch)));
		}

		boolean ascending = params.getSortOrder().isAscending();
		List<Order> orders = new ArrayList<>();
		if (params.getSortKey() == CrmActivityEmailSort.OWNER) {
			orders.add(ascending ? cb.asc(owner.get(Employee_.firstName)) : cb.desc(owner.get(Employee_.firstName)));
			orders.add(ascending ? cb.asc(owner.get(Employee_.lastName)) : cb.desc(owner.get(Employee_.lastName)));
			orders.add(cb.desc(loggedAt));
			orders.add(cb.desc(email.get(CrmActivityEmail_.id)));
		}
		else {
			orders.add(ascending ? cb.asc(loggedAt) : cb.desc(loggedAt));
			orders.add(ascending ? cb.asc(email.get(CrmActivityEmail_.id)) : cb.desc(email.get(CrmActivityEmail_.id)));
		}

		query
			.multiselect(email.get(CrmActivityEmail_.id), email.get(CrmActivityEmail_.subject),
					email.get(CrmActivityEmail_.loggedAt), ownerId, email.get(CrmActivityEmail_.deal).get(CrmDeal_.id),
					company.get(CrmCompany_.id))
			.where(predicates.toArray(new Predicate[0]))
			.orderBy(orders);

		List<CrmActivityEmailResponseDto> emails = entityManager.createQuery(query)
			.getResultList()
			.stream()
			.map(row -> {
				CrmActivityEmailResponseDto dto = new CrmActivityEmailResponseDto();
				dto.setId(row.get(0, Long.class));
				dto.setSubject(row.get(1, String.class));
				dto.setLoggedAt(row.get(2, Instant.class));
				dto.setOwnerId(row.get(3, Long.class));
				dto.setDealId(row.get(4, Long.class));
				dto.setCompanyId(row.get(5, Long.class));
				return dto;
			})
			.toList();

		CriteriaQuery<Tuple> contactQuery = cb.createTupleQuery();
		Root<CrmActivityEmailContact> contactLink = contactQuery.from(CrmActivityEmailContact.class);
		Path<Long> emailId = contactLink.get(CrmActivityEmailContact_.id).get(CrmActivityEmailContactId_.emailId);
		Path<Long> contactId = contactLink.get(CrmActivityEmailContact_.contact).get(CrmContact_.id);

		contactQuery.multiselect(emailId, contactId)
			.where(emailId.in(emails.stream().map(CrmActivityEmailResponseDto::getId).toList()))
			.orderBy(cb.asc(emailId), cb.asc(contactId));

		Map<Long, List<Long>> contactIdsByEmail = entityManager.createQuery(contactQuery)
			.getResultList()
			.stream()
			.collect(Collectors.groupingBy(row -> row.get(0, Long.class),
					Collectors.mapping(row -> row.get(1, Long.class), Collectors.toList())));
		emails.forEach(e -> e.setContactIds(contactIdsByEmail.getOrDefault(e.getId(), List.of())));

		return emails;
	}

}
