package com.skapp.community.crmplanner.repository.impl;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;
import org.springframework.util.StringUtils;

import com.skapp.community.crmplanner.constant.CrmConstants;
import com.skapp.community.crmplanner.model.CrmCompany;
import com.skapp.community.crmplanner.model.CrmDeal;
import com.skapp.community.crmplanner.model.CrmTask;
import com.skapp.community.crmplanner.payload.response.CrmCompanyMetricsDto;
import com.skapp.community.crmplanner.repository.CrmCompanyRepository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import lombok.RequiredArgsConstructor;

@Repository
@RequiredArgsConstructor
public class CrmCompanyRepositoryImpl implements CrmCompanyRepository {

	private final EntityManager entityManager;

	@Override
	public Page<CrmCompanyMetricsDto> getCompanyMetrics(Pageable pageable, String searchKeyword) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();

		CriteriaQuery<CrmCompanyMetricsDto> query = cb.createQuery(CrmCompanyMetricsDto.class);

		Root<CrmCompany> company = query.from(CrmCompany.class);

		Join<CrmCompany, CrmTask> taskJoin = company.join(CrmConstants.TASKS, JoinType.LEFT);

		Join<CrmCompany, CrmDeal> dealJoin = company.join(CrmConstants.DEALS, JoinType.LEFT);

		Expression<Long> taskCount = cb.countDistinct(cb.<Long>selectCase()
			.when(cb.and(cb.isFalse(taskJoin.get(CrmConstants.IS_DELETED)),
					cb.isFalse(taskJoin.get(CrmConstants.IS_COMPLETED))),
					taskJoin.<Long>get(CrmConstants.ID))
			.otherwise(cb.nullLiteral(Long.class)));

		Expression<Long> overdueCount = cb.countDistinct(cb.<Long>selectCase()
				.when(cb.and(cb.isFalse(taskJoin.get(CrmConstants.IS_DELETED)),
						cb.isFalse(taskJoin.get(CrmConstants.IS_COMPLETED)),
						cb.isNotNull(taskJoin.get(CrmConstants.DUE_AT)),
						cb.lessThan(taskJoin.<java.time.LocalDateTime>get(CrmConstants.DUE_AT), cb.localDateTime())),
						taskJoin.<Long>get(CrmConstants.ID))
				.otherwise(cb.nullLiteral(Long.class)));

		Expression<BigDecimal> openDealCase = cb.<BigDecimal>selectCase()
			.when(cb.and(cb.isFalse(dealJoin.get(CrmConstants.IS_DELETED)),
					cb.notEqual(dealJoin.get(CrmConstants.STAGE).get(CrmConstants.STAGE_ID),
							CrmConstants.WON_STAGE_ID)), dealJoin.get(CrmConstants.AMOUNT))
			.otherwise(BigDecimal.ZERO);

		Expression<BigDecimal> closedDealCase = cb.<BigDecimal>selectCase()
			.when(cb.and(cb.isFalse(dealJoin.get(CrmConstants.IS_DELETED)),
					cb.equal(dealJoin.get(CrmConstants.STAGE).get(CrmConstants.STAGE_ID),
							CrmConstants.WON_STAGE_ID)), dealJoin.get(CrmConstants.AMOUNT))
			.otherwise(BigDecimal.ZERO);

		Expression<BigDecimal> openValue = cb.<BigDecimal>sum(openDealCase);

		Expression<BigDecimal> accountValue = cb.<BigDecimal>sum(closedDealCase);

		Expression<Long> closedDealsCount = cb.countDistinct(cb.<Long>selectCase()
			.when(cb.and(cb.isFalse(dealJoin.get(CrmConstants.IS_DELETED)),
					cb.equal(dealJoin.get(CrmConstants.STAGE).get(CrmConstants.STAGE_ID),
							CrmConstants.WON_STAGE_ID)), dealJoin.<Long>get(CrmConstants.ID))
			.otherwise(cb.nullLiteral(Long.class)));

		Expression<Long> openDealsCount = cb.countDistinct(cb.<Long>selectCase()
			.when(cb.and(cb.isFalse(dealJoin.get(CrmConstants.IS_DELETED)),
					cb.notEqual(dealJoin.get(CrmConstants.STAGE).get(CrmConstants.STAGE_ID),
							CrmConstants.WON_STAGE_ID)), dealJoin.<Long>get(CrmConstants.ID))
			.otherwise(cb.nullLiteral(Long.class)));

		query.select(cb.construct(CrmCompanyMetricsDto.class,

				company.get(CrmConstants.ID), company.get(CrmConstants.NAME),
				company.get(CrmConstants.CONTACT_NUMBER), company.get(CrmConstants.INDUSTRY),
				company.get(CrmConstants.WEBSITE), company.get(CrmConstants.ADDRESS),

				taskCount, overdueCount, openValue, accountValue, closedDealsCount, openDealsCount

		));

		List<Predicate> predicates = new ArrayList<>();

		predicates.add(cb.isFalse(company.get(CrmConstants.IS_DELETED)));

		if (StringUtils.hasText(searchKeyword)) {
			predicates
					.add(cb.like(cb.lower(company.get(CrmConstants.NAME)), "%" + searchKeyword.toLowerCase() + "%"));
		}
		query.where(predicates.toArray(new Predicate[0]));

		query.groupBy(company.get(CrmConstants.ID), company.get(CrmConstants.NAME),
				company.get(CrmConstants.CONTACT_NUMBER));

		query.orderBy(cb.asc(company.get(CrmConstants.NAME)));

		List<CrmCompanyMetricsDto> content = entityManager.createQuery(query)
				.setFirstResult((int) pageable.getOffset())
				.setMaxResults(pageable.getPageSize())
				.getResultList();

		CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
		Root<CrmCompany> countRoot = countQuery.from(CrmCompany.class);
		List<Predicate> countPredicates = new ArrayList<>();
		countPredicates.add(cb.isFalse(countRoot.get(CrmConstants.IS_DELETED)));
		if (StringUtils.hasText(searchKeyword)) {
			countPredicates
					.add(cb.like(cb.lower(countRoot.get(CrmConstants.NAME)), "%" + searchKeyword.toLowerCase() + "%"));
		}
		countQuery.select(cb.countDistinct(countRoot.get(CrmConstants.ID)))
				.where(countPredicates.toArray(new Predicate[0]));
		Long total = entityManager.createQuery(countQuery).getSingleResult();

		return new PageImpl<>(content, pageable, total);
	}

}
