package com.skapp.community.crmplanner.repository.impl;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;
import org.springframework.util.StringUtils;

import com.skapp.community.crmplanner.constant.CrmModuleConstant;
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

		Join<CrmCompany, CrmTask> taskJoin = company.join(CrmModuleConstant.TASKS, JoinType.LEFT);

		Join<CrmCompany, CrmDeal> dealJoin = company.join(CrmModuleConstant.DEALS, JoinType.LEFT);

		Expression<Long> taskCount = cb.countDistinct((taskJoin.get(CrmModuleConstant.ID)));

		Expression<Long> overdueCount = cb.countDistinct(cb.<Long>selectCase()
			.when(cb.and(cb.isFalse(taskJoin.get(CrmModuleConstant.IS_DELETED)),
					cb.isFalse(taskJoin.get(CrmModuleConstant.IS_COMPLETED)),
					cb.isNotNull(taskJoin.get(CrmModuleConstant.DUE_AT)),
					cb.lessThan(taskJoin.<java.time.LocalDateTime>get(CrmModuleConstant.DUE_AT), cb.localDateTime())),
					taskJoin.<Long>get(CrmModuleConstant.ID))
			.otherwise(cb.nullLiteral(Long.class)));

		Expression<BigDecimal> amountAsDecimal = cb.function(
			"CAST", BigDecimal.class,
			dealJoin.get(CrmModuleConstant.AMOUNT),
			cb.literal("DECIMAL(15,2)"));

		Expression<BigDecimal> openDealCase = cb.<BigDecimal>selectCase()
			.when(cb.notEqual(dealJoin.get(CrmModuleConstant.STAGE).get(CrmModuleConstant.STAGE_ID),
					CrmModuleConstant.WON_STAGE_ID), amountAsDecimal)
			.otherwise(BigDecimal.ZERO);

		Expression<BigDecimal> closedDealCase = cb.<BigDecimal>selectCase()
			.when(cb.equal(dealJoin.get(CrmModuleConstant.STAGE).get(CrmModuleConstant.STAGE_ID),
					CrmModuleConstant.WON_STAGE_ID), amountAsDecimal)
			.otherwise(BigDecimal.ZERO);

		Expression<BigDecimal> openValue = cb.<BigDecimal>sum(openDealCase);

		Expression<BigDecimal> accountValue = cb.<BigDecimal>sum(closedDealCase);

		Expression<Long> closedDealsCount = cb.countDistinct(cb.<Long>selectCase()
			.when(cb.equal(dealJoin.get(CrmModuleConstant.STAGE).get(CrmModuleConstant.STAGE_ID),
					CrmModuleConstant.WON_STAGE_ID), dealJoin.<Long>get(CrmModuleConstant.ID))
			.otherwise(cb.nullLiteral(Long.class)));

		query.select(cb.construct(CrmCompanyMetricsDto.class,

				company.get(CrmModuleConstant.ID), company.get(CrmModuleConstant.NAME),
				company.get(CrmModuleConstant.CONTACT_NUMBER), company.get(CrmModuleConstant.INDUSTRY),
				company.get(CrmModuleConstant.WEBSITE), company.get(CrmModuleConstant.ADDRESS),

				taskCount, overdueCount, openValue, accountValue, closedDealsCount

		));

		List<Predicate> predicates = new ArrayList<>();

		predicates.add(cb.isFalse(company.get(CrmModuleConstant.IS_DELETED)));

		if (StringUtils.hasText(searchKeyword)) {
			predicates
				.add(cb.like(cb.lower(company.get(CrmModuleConstant.NAME)), "%" + searchKeyword.toLowerCase() + "%"));
		}
		query.where(predicates.toArray(new Predicate[0]));

		query.groupBy(company.get(CrmModuleConstant.ID), company.get(CrmModuleConstant.NAME),
				company.get(CrmModuleConstant.CONTACT_NUMBER));

		query.orderBy(cb.asc(company.get(CrmModuleConstant.NAME)));

		List<CrmCompanyMetricsDto> content = entityManager.createQuery(query)
			.setFirstResult((int) pageable.getOffset())
			.setMaxResults(pageable.getPageSize())
			.getResultList();

		CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
		Root<CrmCompany> countRoot = countQuery.from(CrmCompany.class);
		List<Predicate> countPredicates = new ArrayList<>();
		countPredicates.add(cb.isFalse(countRoot.get(CrmModuleConstant.IS_DELETED)));
		if (StringUtils.hasText(searchKeyword)) {
			countPredicates
				.add(cb.like(cb.lower(countRoot.get(CrmModuleConstant.NAME)), "%" + searchKeyword.toLowerCase() + "%"));
		}
		countQuery.select(cb.countDistinct(countRoot.get(CrmModuleConstant.ID)))
			.where(countPredicates.toArray(new Predicate[0]));
		Long total = entityManager.createQuery(countQuery).getSingleResult();

		return new PageImpl<>(content, pageable, total);
	}

}
