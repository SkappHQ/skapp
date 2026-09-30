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
import com.skapp.community.crmplanner.payload.response.CrmIndustryLookupResponseDto;
import com.skapp.community.crmplanner.repository.CrmIndustryRepository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import lombok.RequiredArgsConstructor;

@Repository
@RequiredArgsConstructor
public class CrmIndustryRepositoryImpl implements CrmIndustryRepository {

	private final EntityManager entityManager;

	@Override
	public Page<CrmIndustryLookupResponseDto> findIndustriesForLookup(CrmIndustryFilterDto filterDto,
			Pageable pageable) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<CrmIndustryLookupResponseDto> query = cb.createQuery(CrmIndustryLookupResponseDto.class);
		Root<CrmIndustry> industry = query.from(CrmIndustry.class);

		List<Predicate> predicates = buildPredicatesToFindIndustries(cb, industry, filterDto);

		query.select(cb.construct(CrmIndustryLookupResponseDto.class, industry.get(CrmIndustry_.id),
				industry.get(CrmIndustry_.name)));
		query.where(predicates.toArray(new Predicate[0]));
		query.orderBy(cb.asc(cb.lower(industry.get(CrmIndustry_.name))), cb.asc(industry.get(CrmIndustry_.id)));

		TypedQuery<CrmIndustryLookupResponseDto> typedQuery = entityManager.createQuery(query);
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
			predicates.add(cb.like(cb.lower(industry.get(CrmIndustry_.name)), "%" + escaped + "%", '\\'));
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
