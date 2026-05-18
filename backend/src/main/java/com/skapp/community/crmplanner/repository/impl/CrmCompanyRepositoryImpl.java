package com.skapp.community.crmplanner.repository.impl;

import com.skapp.community.crmplanner.model.CrmCompany;
import com.skapp.community.crmplanner.payload.request.CrmCompanyFilterDto;
import com.skapp.community.crmplanner.repository.CrmCompanyRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
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
public class CrmCompanyRepositoryImpl implements CrmCompanyRepository {

	private final EntityManager entityManager;

	@Override
	public Page<CrmCompany> findCompanies(CrmCompanyFilterDto filterDto, Pageable pageable) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<CrmCompany> query = cb.createQuery(CrmCompany.class);
		Root<CrmCompany> company = query.from(CrmCompany.class);

		List<Predicate> predicates = buildPredicates(cb, company, filterDto);
		query.where(predicates.toArray(new Predicate[0]));
		query.orderBy(cb.asc(cb.lower(company.<String>get("name"))));

		TypedQuery<CrmCompany> typedQuery = entityManager.createQuery(query);
		typedQuery.setFirstResult((int) pageable.getOffset());
		typedQuery.setMaxResults(pageable.getPageSize());

		return new PageImpl<>(typedQuery.getResultList(), pageable, getTotalCount(cb, filterDto));
	}

	private List<Predicate> buildPredicates(CriteriaBuilder cb, Root<CrmCompany> company,
			CrmCompanyFilterDto filterDto) {
		List<Predicate> predicates = new ArrayList<>();
		predicates.add(cb.isFalse(company.<Boolean>get("isDeleted")));

		String searchKeyword = filterDto.getSearchKeyword();
		if (searchKeyword != null && !searchKeyword.isBlank()) {
			String escaped = escapeLikePattern(searchKeyword.trim().toLowerCase(Locale.ROOT));
			predicates.add(cb.like(cb.lower(company.<String>get("name")), "%" + escaped + "%", '\\'));
		}

		return predicates;
	}

	private String escapeLikePattern(String input) {
		return input.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
	}

	private Long getTotalCount(CriteriaBuilder cb, CrmCompanyFilterDto filterDto) {
		CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
		Root<CrmCompany> company = countQuery.from(CrmCompany.class);
		countQuery.select(cb.count(company));

		List<Predicate> predicates = buildPredicates(cb, company, filterDto);
		countQuery.where(predicates.toArray(new Predicate[0]));

		return entityManager.createQuery(countQuery).getSingleResult();
	}

}
