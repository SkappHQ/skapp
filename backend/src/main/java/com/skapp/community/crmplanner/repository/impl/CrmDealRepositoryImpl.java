package com.skapp.community.crmplanner.repository.impl;

import com.skapp.community.crmplanner.model.CrmContact;
import com.skapp.community.crmplanner.model.CrmContact_;
import com.skapp.community.crmplanner.model.CrmDeal;
import com.skapp.community.crmplanner.model.CrmDeal_;
import com.skapp.community.crmplanner.model.CrmDealStage_;
import com.skapp.community.crmplanner.payload.request.CrmDealFilterDto;
import com.skapp.community.crmplanner.repository.CrmDealRepository;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.Employee_;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class CrmDealRepositoryImpl implements CrmDealRepository {

	private final EntityManager entityManager;

	@Override
	public Page<CrmDeal> findDeals(CrmDealFilterDto filterDto, Pageable pageable) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();

		CriteriaQuery<CrmDeal> query = cb.createQuery(CrmDeal.class);
		Root<CrmDeal> deal = query.from(CrmDeal.class);
		query.where(buildPredicates(cb, deal, filterDto).toArray(new Predicate[0]));

		// Always sort by stage.orderIndex ascending
		query.orderBy(cb.asc(deal.get(CrmDeal_.stage).get("orderIndex")));

		TypedQuery<CrmDeal> typedQuery = entityManager.createQuery(query);
		typedQuery.setFirstResult((int) pageable.getOffset());
		typedQuery.setMaxResults(pageable.getPageSize());

		CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
		Root<CrmDeal> countRoot = countQuery.from(CrmDeal.class);
		countQuery.select(cb.count(countRoot))
				.where(buildPredicates(cb, countRoot, filterDto).toArray(new Predicate[0]));
		Long total = entityManager.createQuery(countQuery).getSingleResult();

		return new PageImpl<>(typedQuery.getResultList(), pageable, total);
	}

	private List<Predicate> buildPredicates(CriteriaBuilder cb, Root<CrmDeal> deal, CrmDealFilterDto filterDto) {
		List<Predicate> predicates = new ArrayList<>();

		predicates.add(cb.equal(deal.get(CrmDeal_.isDeleted), false));

		if (filterDto.getSearchKeyword() != null && !filterDto.getSearchKeyword().isBlank()) {
			String keyword = "%" + filterDto.getSearchKeyword().toLowerCase() + "%";
			Join<CrmDeal, CrmContact> contactJoin = deal.join(CrmDeal_.contact, JoinType.LEFT);
			Join<CrmDeal, Employee> ownerJoin = deal.join(CrmDeal_.owner, JoinType.LEFT);
			predicates.add(cb.or(cb.like(cb.lower(deal.get(CrmDeal_.name)), keyword),
					cb.like(cb.lower(contactJoin.get(CrmContact_.name)), keyword),
					cb.like(cb.lower(ownerJoin.get(Employee_.firstName)), keyword),
					cb.like(cb.lower(ownerJoin.get(Employee_.lastName)), keyword),
					cb.like(cb.lower(cb.concat(cb.concat(ownerJoin.get(Employee_.firstName), " "),
							ownerJoin.get(Employee_.lastName))), keyword)));
		}

		if (filterDto.getStageId() != null) {
			predicates.add(cb.equal(deal.get(CrmDeal_.stage).get(CrmDealStage_.id), filterDto.getStageId()));
		}

		if (filterDto.getPriority() != null) {
			predicates.add(cb.equal(deal.get(CrmDeal_.priority), filterDto.getPriority()));
		}

		return predicates;
	}

}
