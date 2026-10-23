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
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

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

		List<Predicate> predicates = CrmActivityScopeUtil.buildScopePredicates(cb, query, ownerId,
				call.get(CrmActivityCall_.loggedAt), params);
		predicates.add(cb.isFalse(call.get(CrmActivityCall_.isDeleted)));

		if (params.getSearchPattern() != null) {
			Join<CrmActivityCall, CrmContact> contact = call.join(CrmActivityCall_.contact, JoinType.LEFT);
			contact.on(cb.isFalse(contact.get(CrmContact_.isDeleted)));
			Join<CrmContact, CrmCompany> contactCompany = contact.join(CrmContact_.company, JoinType.LEFT);
			contactCompany.on(cb.isFalse(contactCompany.get(CrmCompany_.isDeleted)));

			predicates.add(cb.or(
					cb.like(cb.lower(call.get(CrmActivityCall_.subject)), params.getSearchPattern(),
							CrmActivityScopeUtil.LIKE_ESCAPE),
					cb.like(cb.lower(contact.get(CrmContact_.name)), params.getSearchPattern(),
							CrmActivityScopeUtil.LIKE_ESCAPE),
					cb.like(cb.lower(contactCompany.get(CrmCompany_.name)), params.getSearchPattern(),
							CrmActivityScopeUtil.LIKE_ESCAPE)));
		}

		query.select(cb.construct(CrmActivityCallResponseDto.class, call.get(CrmActivityCall_.id),
				call.get(CrmActivityCall_.subject), call.get(CrmActivityCall_.durationMinutes),
				call.get(CrmActivityCall_.loggedAt), ownerId, call.get(CrmActivityCall_.contact).get(CrmContact_.id),
				call.get(CrmActivityCall_.deal).get(CrmDeal_.id), company.get(CrmCompany_.id)))
			.where(predicates.toArray(new Predicate[0]))
			.orderBy(CrmActivityScopeUtil.buildOrders(cb, params.getSortKey() == CrmActivityCallSort.OWNER,
					owner.get(Employee_.firstName), owner.get(Employee_.lastName), call.get(CrmActivityCall_.loggedAt),
					call.get(CrmActivityCall_.id), params));

		return entityManager.createQuery(query).getResultList();
	}

}
