package com.skapp.community.crmplanner.repository.impl;

import com.skapp.community.crmplanner.model.CrmActivityCall;
import com.skapp.community.crmplanner.model.CrmActivityCall_;
import com.skapp.community.crmplanner.model.CrmCompany;
import com.skapp.community.crmplanner.model.CrmCompany_;
import com.skapp.community.crmplanner.model.CrmContact;
import com.skapp.community.crmplanner.model.CrmContact_;
import com.skapp.community.crmplanner.model.CrmDeal_;
import com.skapp.community.crmplanner.payload.response.CrmActivityCallResponseDto;
import com.skapp.community.crmplanner.repository.CrmActivityCallRepository;
import com.skapp.community.crmplanner.type.CrmActivityCallFilterParams;
import com.skapp.community.crmplanner.type.CrmActivityCallSort;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.Employee_;
import jakarta.persistence.EntityManager;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Order;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class CrmActivityCallRepositoryImpl implements CrmActivityCallRepository {

	private final EntityManager entityManager;

	@Override
	public List<CrmActivityCallResponseDto> findCalls(CrmActivityCallFilterParams params) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<CrmActivityCallResponseDto> query = cb.createQuery(CrmActivityCallResponseDto.class);
		Root<CrmActivityCall> call = query.from(CrmActivityCall.class);
		Join<CrmActivityCall, Employee> owner = call.join(CrmActivityCall_.owner, JoinType.LEFT);
		Path<Long> ownerId = owner.get(Employee_.employeeId);

		Join<CrmActivityCall, CrmCompany> company = call.join(CrmActivityCall_.company, JoinType.LEFT);
		company.on(cb.isFalse(company.get(CrmCompany_.isDeleted)));

		Path<Instant> loggedAt = call.get(CrmActivityCall_.loggedAt);
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
		predicates.add(cb.isFalse(call.get(CrmActivityCall_.isDeleted)));

		if (params.getSearchPattern() != null) {
			Join<CrmActivityCall, CrmContact> contact = call.join(CrmActivityCall_.contact, JoinType.LEFT);
			contact.on(cb.isFalse(contact.get(CrmContact_.isDeleted)));
			Join<CrmContact, CrmCompany> contactCompany = contact.join(CrmContact_.company, JoinType.LEFT);
			contactCompany.on(cb.isFalse(contactCompany.get(CrmCompany_.isDeleted)));

			predicates.add(cb.or(cb.like(cb.lower(call.get(CrmActivityCall_.subject)), params.getSearchPattern()),
					cb.like(cb.lower(contact.get(CrmContact_.name)), params.getSearchPattern()),
					cb.like(cb.lower(contactCompany.get(CrmCompany_.name)), params.getSearchPattern())));
		}

		boolean ascending = params.getSortOrder().isAscending();
		List<Order> orders = new ArrayList<>();
		if (params.getSortKey() == CrmActivityCallSort.OWNER) {
			orders.add(ascending ? cb.asc(owner.get(Employee_.firstName)) : cb.desc(owner.get(Employee_.firstName)));
			orders.add(ascending ? cb.asc(owner.get(Employee_.lastName)) : cb.desc(owner.get(Employee_.lastName)));
			orders.add(cb.desc(loggedAt));
			orders.add(cb.desc(call.get(CrmActivityCall_.id)));
		}
		else {
			orders.add(ascending ? cb.asc(loggedAt) : cb.desc(loggedAt));
			orders.add(ascending ? cb.asc(call.get(CrmActivityCall_.id)) : cb.desc(call.get(CrmActivityCall_.id)));
		}

		query.select(cb.construct(CrmActivityCallResponseDto.class, call.get(CrmActivityCall_.id),
				call.get(CrmActivityCall_.subject), call.get(CrmActivityCall_.durationMinutes),
				call.get(CrmActivityCall_.loggedAt), ownerId, call.get(CrmActivityCall_.contact).get(CrmContact_.id),
				call.get(CrmActivityCall_.deal).get(CrmDeal_.id), company.get(CrmCompany_.id)))
			.where(predicates.toArray(new Predicate[0]))
			.orderBy(orders);

		return entityManager.createQuery(query).getResultList();
	}

	@Override
	public CrmActivityCall findCallById(Long id) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<CrmActivityCall> query = cb.createQuery(CrmActivityCall.class);
		Root<CrmActivityCall> call = query.from(CrmActivityCall.class);

		call.fetch(CrmActivityCall_.contact, JoinType.LEFT);
		call.fetch(CrmActivityCall_.deal, JoinType.LEFT);
		call.fetch(CrmActivityCall_.company, JoinType.LEFT);

		query.select(call)
			.where(cb.equal(call.get(CrmActivityCall_.id), id), cb.isFalse(call.get(CrmActivityCall_.isDeleted)));

		return entityManager.createQuery(query).getResultStream().findFirst().orElse(null);
	}

}
