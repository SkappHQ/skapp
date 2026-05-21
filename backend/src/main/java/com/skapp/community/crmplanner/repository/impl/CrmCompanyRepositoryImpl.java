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
import com.skapp.community.crmplanner.model.CrmCompany_;
import com.skapp.community.crmplanner.model.CrmDeal;
import com.skapp.community.crmplanner.model.CrmDealStage;
import com.skapp.community.crmplanner.model.CrmDealStage_;
import com.skapp.community.crmplanner.model.CrmDeal_;
import com.skapp.community.crmplanner.model.CrmTask;
import com.skapp.community.crmplanner.model.CrmTask_;
import com.skapp.community.crmplanner.payload.response.CrmCompanyMetricsResponseDto;
import com.skapp.community.crmplanner.repository.CrmCompanyRepository;
import com.skapp.community.crmplanner.util.CrmValidations;

import jakarta.persistence.EntityManager;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.From;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import lombok.RequiredArgsConstructor;

@Repository
@RequiredArgsConstructor
public class CrmCompanyRepositoryImpl implements CrmCompanyRepository {

	private final EntityManager entityManager;

	@Override
	public Page<CrmCompanyMetricsResponseDto> getCompanyMetrics(Pageable pageable, String searchKeyword) {
		Long wonStageId = getWonStageId();

		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<CrmCompanyMetricsResponseDto> query = cb.createQuery(CrmCompanyMetricsResponseDto.class);
		Root<CrmCompany> company = query.from(CrmCompany.class);

		Subquery<Long> taskSubquery = query.subquery(Long.class);
		Root<CrmTask> subTask = taskSubquery.from(CrmTask.class);
		taskSubquery.select(cb.count(subTask.get(CrmTask_.id)))
			.where(cb.equal(subTask.get(CrmTask_.company), company), cb.isFalse(subTask.get(CrmTask_.isDeleted)),
					cb.isFalse(subTask.get(CrmTask_.isCompleted)));

		Subquery<Long> overdueSubquery = query.subquery(Long.class);
		Root<CrmTask> subOverdueTask = overdueSubquery.from(CrmTask.class);
		overdueSubquery.select(cb.count(subOverdueTask.get(CrmTask_.id)))
			.where(cb.equal(subOverdueTask.get(CrmTask_.company), company),
					cb.isFalse(subOverdueTask.get(CrmTask_.isDeleted)),
					cb.isFalse(subOverdueTask.get(CrmTask_.isCompleted)),
					cb.isNotNull(subOverdueTask.get(CrmTask_.dueAt)),
					cb.lessThan(subOverdueTask.get(CrmTask_.dueAt), cb.localDateTime()));

		Subquery<BigDecimal> openValueSubquery = query.subquery(BigDecimal.class);
		Root<CrmDeal> openDeal = openValueSubquery.from(CrmDeal.class);
		openValueSubquery.select(cb.coalesce(cb.sum(openDeal.get(CrmDeal_.amountNumeric)), BigDecimal.ZERO))
			.where(cb.equal(openDeal.get(CrmDeal_.company), company), cb.isFalse(openDeal.get(CrmDeal_.isDeleted)),
					cb.notEqual(openDeal.get(CrmDeal_.stage).get(CrmDealStage_.id), wonStageId));

		Subquery<BigDecimal> accountValueSubquery = query.subquery(BigDecimal.class);
		Root<CrmDeal> closedDeal = accountValueSubquery.from(CrmDeal.class);
		accountValueSubquery.select(cb.coalesce(cb.sum(closedDeal.get(CrmDeal_.amountNumeric)), BigDecimal.ZERO))
			.where(cb.equal(closedDeal.get(CrmDeal_.company), company), cb.isFalse(closedDeal.get(CrmDeal_.isDeleted)),
					cb.equal(closedDeal.get(CrmDeal_.stage).get(CrmDealStage_.id), wonStageId));

		Subquery<Long> closedCountSubquery = query.subquery(Long.class);
		Root<CrmDeal> closedCountDeal = closedCountSubquery.from(CrmDeal.class);
		closedCountSubquery.select(cb.count(closedCountDeal.get(CrmDeal_.id)))
			.where(cb.equal(closedCountDeal.get(CrmDeal_.company), company),
					cb.isFalse(closedCountDeal.get(CrmDeal_.isDeleted)),
					cb.equal(closedCountDeal.get(CrmDeal_.stage).get(CrmDealStage_.id), wonStageId));

		Subquery<Long> openCountSubquery = query.subquery(Long.class);
		Root<CrmDeal> openCountDeal = openCountSubquery.from(CrmDeal.class);
		openCountSubquery.select(cb.count(openCountDeal.get(CrmDeal_.id)))
			.where(cb.equal(openCountDeal.get(CrmDeal_.company), company),
					cb.isFalse(openCountDeal.get(CrmDeal_.isDeleted)),
					cb.notEqual(openCountDeal.get(CrmDeal_.stage).get(CrmDealStage_.id), wonStageId));

		query.select(cb.construct(CrmCompanyMetricsResponseDto.class, company.get(CrmCompany_.id),
				company.get(CrmCompany_.name), company.get(CrmCompany_.contactNumber),
				company.get(CrmCompany_.industry), company.get(CrmCompany_.website), company.get(CrmCompany_.address),
				taskSubquery, overdueSubquery, openValueSubquery, accountValueSubquery, closedCountSubquery,
				openCountSubquery));

		query.where(buildPredicates(cb, company, searchKeyword));
		query.orderBy(cb.asc(company.get(CrmCompany_.name)), cb.asc(company.get(CrmCompany_.id)));

		List<CrmCompanyMetricsResponseDto> content = entityManager.createQuery(query)
			.setFirstResult((int) pageable.getOffset())
			.setMaxResults(pageable.getPageSize())
			.getResultList();

		CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
		Root<CrmCompany> countRoot = countQuery.from(CrmCompany.class);

		countQuery.select(cb.countDistinct(countRoot.get(CrmCompany_.id)))
			.where(buildPredicates(cb, countRoot, searchKeyword));
		Long total = entityManager.createQuery(countQuery).getSingleResult();

		return new PageImpl<>(content, pageable, total);
	}

	private Predicate[] buildPredicates(CriteriaBuilder cb, From<?, CrmCompany> root, String searchKeyword) {
		List<Predicate> predicates = new ArrayList<>();

		predicates.add(cb.isFalse(root.get(CrmCompany_.isDeleted)));

		if (StringUtils.hasText(searchKeyword)) {
			String escapedKeyword = CrmValidations.escapeLikePattern(searchKeyword);

			String likePattern = "%" + escapedKeyword + "%";
			predicates.add(cb.like(cb.lower(root.get(CrmCompany_.name)), likePattern));
		}

		return predicates.toArray(new Predicate[0]);
	}

	private Long getWonStageId() {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<Long> query = cb.createQuery(Long.class);
		Root<CrmDealStage> stage = query.from(CrmDealStage.class);

		query.select(stage.get(CrmDealStage_.id))
			.where(cb.equal(stage.get(CrmDealStage_.stageType), CrmConstants.WON_STAGE_TYPE),
					cb.isFalse(stage.get(CrmDealStage_.isDeleted)));

		Long id = entityManager.createQuery(query).getSingleResult();

		return id != null ? id : CrmConstants.DEFAULT_WON_STAGE_ID;
	}

}