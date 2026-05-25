package com.skapp.community.crmplanner.repository.impl;

import com.skapp.community.common.util.StringUtils;
import com.skapp.community.crmplanner.model.CrmCompany;
import com.skapp.community.crmplanner.model.CrmCompany_;
import com.skapp.community.crmplanner.model.CrmContact;
import com.skapp.community.crmplanner.model.CrmContact_;
import com.skapp.community.crmplanner.model.CrmDeal;
import com.skapp.community.crmplanner.model.CrmDeal_;
import com.skapp.community.crmplanner.model.CrmDealStage_;
import com.skapp.community.crmplanner.payload.request.CrmContactMetricRequestDto;
import com.skapp.community.crmplanner.repository.CrmContactRepository;
import com.skapp.community.crmplanner.type.CrmDealStageType;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.Employee_;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Fetch;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Order;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Repository
@RequiredArgsConstructor
public class CrmContactRepositoryImpl implements CrmContactRepository {

	private final EntityManager entityManager;

	@Override
	public Page<CrmContact> findContacts(CrmContactMetricRequestDto filterDto, Pageable pageable) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<CrmContact> query = cb.createQuery(CrmContact.class);
		Root<CrmContact> contact = query.from(CrmContact.class);
		Fetch<CrmContact, Employee> ownerFetch = contact.fetch(CrmContact_.owner, JoinType.INNER);
		ownerFetch.fetch(Employee_.user, JoinType.LEFT);
		Join<CrmContact, Employee> owner = (Join<CrmContact, Employee>) ownerFetch;
		Join<CrmContact, CrmCompany> company = (Join<CrmContact, CrmCompany>) contact.fetch(CrmContact_.company, JoinType.LEFT);

		query.where(buildPredicates(cb, contact, owner, company, filterDto));
		query.orderBy(buildOrderBy(cb, contact, query));

		TypedQuery<CrmContact> typedQuery = entityManager.createQuery(query);
		typedQuery.setFirstResult((int) pageable.getOffset());
		typedQuery.setMaxResults(pageable.getPageSize());

		return new PageImpl<>(typedQuery.getResultList(), pageable, getTotalCount(cb, filterDto));
	}

	private List<Order> buildOrderBy(CriteriaBuilder cb, Root<CrmContact> contact, CriteriaQuery<CrmContact> query) {
		Subquery<BigDecimal> dealValueSub = query.subquery(BigDecimal.class);
		Root<CrmDeal> deal = dealValueSub.from(CrmDeal.class);
		dealValueSub.select(cb.coalesce(cb.sum(deal.get(CrmDeal_.amount).cast(BigDecimal.class)), BigDecimal.ZERO))
			.where(cb.equal(deal.get(CrmDeal_.contact), contact),
					cb.equal(deal.get(CrmDeal_.stage).get(CrmDealStage_.stageType), CrmDealStageType.WON),
					cb.isFalse(deal.get(CrmDeal_.isDeleted)));

		return List.of(cb.desc(dealValueSub), cb.asc(contact.get(CrmContact_.id)));
	}

	private Predicate[] buildPredicates(CriteriaBuilder cb, Root<CrmContact> contact, Join<CrmContact, Employee> owner,
			Join<CrmContact, CrmCompany> company, CrmContactMetricRequestDto filterDto) {
		List<Predicate> predicates = new ArrayList<>();
		predicates.add(cb.isFalse(contact.get(CrmContact_.isDeleted)));

		String searchKeyword = filterDto.getSearchKeyword();
		if (searchKeyword != null && !searchKeyword.isBlank()) {
			String escaped = StringUtils.escapeLikePattern(searchKeyword.trim().toLowerCase(Locale.ROOT));
			String likePattern = "%" + escaped + "%";
			predicates.add(cb.or(cb.like(cb.lower(contact.get(CrmContact_.name)), likePattern, '\\'),
					cb.like(cb.lower(owner.get(Employee_.firstName)), likePattern, '\\'),
					cb.like(cb.lower(owner.get(Employee_.lastName)), likePattern, '\\')));
		}

		Long companyId = filterDto.getCompanyId();
		if (companyId != null) {
			predicates.add(cb.equal(company.get(CrmCompany_.id), companyId));
		}

		return predicates.toArray(new Predicate[0]);
	}

	private Long getTotalCount(CriteriaBuilder cb, CrmContactMetricRequestDto filterDto) {
		CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
		Root<CrmContact> contact = countQuery.from(CrmContact.class);
		Join<CrmContact, Employee> owner = contact.join(CrmContact_.owner, JoinType.INNER);
		Join<CrmContact, CrmCompany> company = contact.join(CrmContact_.company, JoinType.LEFT);

		countQuery.select(cb.count(contact)).where(buildPredicates(cb, contact, owner, company, filterDto));

		return entityManager.createQuery(countQuery).getSingleResult();
	}

}
