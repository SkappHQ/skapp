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
import com.skapp.community.crmplanner.type.CrmActivityContactLink;
import com.skapp.community.crmplanner.type.CrmActivityEmailFilterParams;
import com.skapp.community.crmplanner.type.CrmActivityEmailSort;
import com.skapp.community.crmplanner.type.CrmActivityListParams;
import com.skapp.community.crmplanner.util.CrmActivityScopeUtil;
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
import java.util.Collection;
import java.util.Collections;
import java.util.List;

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

		List<Predicate> predicates = CrmActivityScopeUtil.buildScopePredicates(cb, ownerId,
				email.get(CrmActivityEmail_.loggedAt), params);
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

		query
			.multiselect(email.get(CrmActivityEmail_.id), email.get(CrmActivityEmail_.subject),
					email.get(CrmActivityEmail_.loggedAt), ownerId, email.get(CrmActivityEmail_.deal).get(CrmDeal_.id),
					company.get(CrmCompany_.id))
			.where(predicates.toArray(new Predicate[0]))
			.orderBy(buildOrders(cb, params.getSortKey() == CrmActivityEmailSort.OWNER, owner.get(Employee_.firstName),
					owner.get(Employee_.lastName), email.get(CrmActivityEmail_.loggedAt),
					email.get(CrmActivityEmail_.id), params));

		return entityManager.createQuery(query).getResultList().stream().map(this::toEmailResponse).toList();
	}

	@Override
	public List<CrmActivityContactLink> findContactLinks(Collection<Long> emailIds) {
		if (emailIds == null || emailIds.isEmpty()) {
			return Collections.emptyList();
		}

		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<CrmActivityContactLink> query = cb.createQuery(CrmActivityContactLink.class);
		Root<CrmActivityEmailContact> link = query.from(CrmActivityEmailContact.class);
		Path<Long> emailId = link.get(CrmActivityEmailContact_.id).get(CrmActivityEmailContactId_.emailId);
		Path<Long> contactId = link.get(CrmActivityEmailContact_.contact).get(CrmContact_.id);

		query.select(cb.construct(CrmActivityContactLink.class, emailId, contactId))
			.where(emailId.in(emailIds))
			.orderBy(cb.asc(emailId), cb.asc(contactId));

		return entityManager.createQuery(query).getResultList();
	}

	private CrmActivityEmailResponseDto toEmailResponse(Tuple row) {
		CrmActivityEmailResponseDto dto = new CrmActivityEmailResponseDto();
		dto.setId(row.get(0, Long.class));
		dto.setSubject(row.get(1, String.class));
		dto.setLoggedAt(row.get(2, Instant.class));
		dto.setOwnerId(row.get(3, Long.class));
		dto.setDealId(row.get(4, Long.class));
		dto.setCompanyId(row.get(5, Long.class));
		return dto;
	}

	private List<Order> buildOrders(CriteriaBuilder cb, boolean sortByOwner, Path<String> ownerFirstName,
			Path<String> ownerLastName, Path<Instant> dateField, Path<Long> id, CrmActivityListParams params) {
		boolean ascending = params.getSortOrder().isAscending();
		List<Order> orders = new ArrayList<>();

		if (sortByOwner) {
			orders.add(ascending ? cb.asc(ownerFirstName) : cb.desc(ownerFirstName));
			orders.add(ascending ? cb.asc(ownerLastName) : cb.desc(ownerLastName));
			orders.add(cb.desc(dateField));
			orders.add(cb.desc(id));
		}
		else {
			orders.add(ascending ? cb.asc(dateField) : cb.desc(dateField));
			orders.add(ascending ? cb.asc(id) : cb.desc(id));
		}

		return orders;
	}

}
