package com.skapp.community.crmplanner.repository.impl;

import com.skapp.community.crmplanner.model.CrmDeal;
import com.skapp.community.crmplanner.payload.request.CrmDealFilterDto;
import com.skapp.community.crmplanner.repository.CrmDealRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Order;
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
	public Page<CrmDeal> findAllDeals(CrmDealFilterDto filterDto, Pageable pageable) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();

		CriteriaQuery<CrmDeal> query = cb.createQuery(CrmDeal.class);
		Root<CrmDeal> deal = query.from(CrmDeal.class);
		query.where(buildPredicates(cb, deal, filterDto).toArray(new Predicate[0]));

		if (pageable.getSort().isSorted()) {
			List<Order> orders = new ArrayList<>();
			pageable.getSort().forEach(order -> {
				Order sortOrder = order.isAscending() ? cb.asc(deal.get(order.getProperty()))
						: cb.desc(deal.get(order.getProperty()));
				orders.add(sortOrder);
			});
			query.orderBy(orders);
		}

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

		predicates.add(cb.equal(deal.get("isDeleted"), false));

		if (filterDto.getSearchKeyword() != null && !filterDto.getSearchKeyword().isBlank()) {
			predicates.add(cb.like(cb.lower(deal.get("name")),
					"%" + filterDto.getSearchKeyword().toLowerCase() + "%"));
		}

		if (filterDto.getStageId() != null) {
			predicates.add(cb.equal(deal.get("stage").get("id"), filterDto.getStageId()));
		}

		if (filterDto.getPriorityId() != null) {
			predicates.add(cb.equal(deal.get("priority").get("id"), filterDto.getPriorityId()));
		}

		return predicates;
	}

}
