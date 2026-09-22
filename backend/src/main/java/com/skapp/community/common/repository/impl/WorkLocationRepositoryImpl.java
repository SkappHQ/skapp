package com.skapp.community.common.repository.impl;

import com.skapp.community.common.model.WorkLocation;
import com.skapp.community.common.model.WorkLocation_;
import com.skapp.community.common.payload.request.WorkLocationFilterDto;
import com.skapp.community.common.repository.WorkLocationRepository;
import com.skapp.community.common.util.StringUtils;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Expression;
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
import java.util.Locale;

@Repository
@RequiredArgsConstructor
public class WorkLocationRepositoryImpl implements WorkLocationRepository {

	private final EntityManager entityManager;

	@Override
	public Page<WorkLocation> findWorkLocations(WorkLocationFilterDto workLocationFilterDto, Pageable pageable) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();

		CriteriaQuery<WorkLocation> query = cb.createQuery(WorkLocation.class);
		Root<WorkLocation> workLocation = query.from(WorkLocation.class);

		String rawSearchKeyword = workLocationFilterDto.getSearchKeyword();
		String searchKeyword = rawSearchKeyword == null || rawSearchKeyword.isBlank() ? null
				: rawSearchKeyword.trim().toLowerCase(Locale.ROOT);

		List<Predicate> predicates = buildPredicates(cb, workLocation, searchKeyword);
		query.where(predicates.toArray(new Predicate[0]));

		query.orderBy(buildOrderBy(cb, workLocation, searchKeyword));

		TypedQuery<WorkLocation> typedQuery = entityManager.createQuery(query);
		if (pageable.isPaged()) {
			typedQuery.setFirstResult((int) pageable.getOffset());
			typedQuery.setMaxResults(pageable.getPageSize());
		}
		List<WorkLocation> results = typedQuery.getResultList();

		Long total = getTotalCount(cb, searchKeyword);
		return new PageImpl<>(results, pageable, total);
	}

	@Override
	public List<WorkLocation> findAllWorkLocationsOrderByNameAsc() {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();

		CriteriaQuery<WorkLocation> query = cb.createQuery(WorkLocation.class);
		Root<WorkLocation> workLocation = query.from(WorkLocation.class);

		query.where(cb.isFalse(workLocation.get(WorkLocation_.isDeleted)));
		query.orderBy(cb.asc(cb.lower(workLocation.get(WorkLocation_.name))));

		return entityManager.createQuery(query).getResultList();
	}

	private List<Predicate> buildPredicates(CriteriaBuilder cb, Root<WorkLocation> workLocation, String searchKeyword) {
		List<Predicate> predicates = new ArrayList<>();

		predicates.add(cb.isFalse(workLocation.get(WorkLocation_.isDeleted)));

		if (searchKeyword != null) {
			String escaped = StringUtils.escapeLikePattern(searchKeyword);
			predicates.add(cb.like(cb.lower(workLocation.get(WorkLocation_.name)), "%" + escaped + "%"));
		}

		return predicates;
	}

	private List<Order> buildOrderBy(CriteriaBuilder cb, Root<WorkLocation> workLocation, String searchKeyword) {
		List<Order> orders = new ArrayList<>();

		if (searchKeyword != null) {
			Expression<String> lowerName = cb.lower(workLocation.get(WorkLocation_.name));

			orders.add(cb.asc(cb.locate(lowerName, searchKeyword)));
			orders.add(cb.asc(cb.length(lowerName)));
		}

		orders.add(cb.asc(cb.lower(workLocation.get(WorkLocation_.name))));

		return orders;
	}

	private Long getTotalCount(CriteriaBuilder cb, String searchKeyword) {
		CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
		Root<WorkLocation> countRoot = countQuery.from(WorkLocation.class);
		countQuery.select(cb.count(countRoot));

		List<Predicate> predicates = buildPredicates(cb, countRoot, searchKeyword);
		countQuery.where(predicates.toArray(new Predicate[0]));

		return entityManager.createQuery(countQuery).getSingleResult();
	}

}
