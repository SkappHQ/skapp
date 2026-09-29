package com.skapp.community.crmplanner.repository.impl;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import com.skapp.community.common.util.StringUtils;
import com.skapp.community.crmplanner.model.CrmIndustry;
import com.skapp.community.crmplanner.model.CrmIndustry_;
import com.skapp.community.crmplanner.payload.request.CrmIndustryFilterDto;
import com.skapp.community.crmplanner.repository.CrmIndustryRepository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import lombok.RequiredArgsConstructor;

@Repository
@RequiredArgsConstructor
public class CrmIndustryRepositoryImpl implements CrmIndustryRepository {

	private final EntityManager entityManager;

	@Override
	public Page<CrmIndustry> findIndustries(CrmIndustryFilterDto filterDto, Pageable pageable) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<CrmIndustry> query = cb.createQuery(CrmIndustry.class);
		Root<CrmIndustry> industry = query.from(CrmIndustry.class);

		List<Predicate> predicates = buildPredicatesToFindIndustries(cb, industry, filterDto);
		query.where(predicates.toArray(new Predicate[0]));
		query.orderBy(cb.asc(cb.lower(industry.get(CrmIndustry_.name))));

		TypedQuery<CrmIndustry> typedQuery = entityManager.createQuery(query);
		typedQuery.setFirstResult((int) pageable.getOffset());
		typedQuery.setMaxResults(pageable.getPageSize());

		return new PageImpl<>(typedQuery.getResultList(), pageable, getTotalIndustryCount(cb, filterDto));
	}

	private List<Predicate> buildPredicatesToFindIndustries(CriteriaBuilder cb, Root<CrmIndustry> industry,
			CrmIndustryFilterDto filterDto) {
		List<Predicate> predicates = new ArrayList<>();
		predicates.add(cb.isFalse(industry.get(CrmIndustry_.isDeleted)));

		String searchKeyword = filterDto.getSearchKeyword();
		if (searchKeyword != null && !searchKeyword.isBlank()) {
			String escaped = StringUtils.escapeLikePattern(searchKeyword.trim().toLowerCase(Locale.ROOT));
			// Built-in names are stored as keys like HOSPITALS_AND_HEALTH_CARE, so match
			// underscores as spaces to let "health care" find them.
			Expression<String> searchableName = cb.function("REPLACE", String.class,
					cb.lower(industry.get(CrmIndustry_.name)), cb.literal("_"), cb.literal(" "));
			predicates.add(cb.like(searchableName, "%" + escaped + "%", '\\'));
		}

		return predicates;
	}

	private Long getTotalIndustryCount(CriteriaBuilder cb, CrmIndustryFilterDto filterDto) {
		CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
		Root<CrmIndustry> industry = countQuery.from(CrmIndustry.class);
		countQuery.select(cb.count(industry));

		List<Predicate> predicates = buildPredicatesToFindIndustries(cb, industry, filterDto);
		countQuery.where(predicates.toArray(new Predicate[0]));

		return entityManager.createQuery(countQuery).getSingleResult();
	}

}
