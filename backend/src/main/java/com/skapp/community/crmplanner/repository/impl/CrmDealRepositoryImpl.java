package com.skapp.community.crmplanner.repository.impl;

import com.skapp.community.crmplanner.model.CrmContact_;
import com.skapp.community.crmplanner.model.CrmDeal;
import com.skapp.community.crmplanner.model.CrmDeal_;
import com.skapp.community.crmplanner.model.CrmDealStage;
import com.skapp.community.crmplanner.model.CrmDealStage_;
import com.skapp.community.crmplanner.repository.CrmDealRepository;
import com.skapp.community.crmplanner.type.CrmDealStageType;
import com.skapp.community.crmplanner.type.CrmDealSummary;
import jakarta.persistence.EntityManager;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Root;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class CrmDealRepositoryImpl implements CrmDealRepository {

	private final EntityManager entityManager;

	@Override
	public List<CrmDealSummary> findClosedDealSummaryByContactIds(List<Long> contactIds) {
		if (contactIds == null || contactIds.isEmpty()) {
			return Collections.emptyList();
		}

		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<CrmDealSummary> query = cb.createQuery(CrmDealSummary.class);
		Root<CrmDeal> deal = query.from(CrmDeal.class);
		Join<CrmDeal, CrmDealStage> stage = deal.join(CrmDeal_.stage, JoinType.INNER);

		query.select(cb.construct(CrmDealSummary.class, deal.get(CrmDeal_.contact).get(CrmContact_.id),
				cb.coalesce(cb.sum(deal.get(CrmDeal_.amount).cast(BigDecimal.class)), BigDecimal.ZERO),
				cb.count(deal.get(CrmDeal_.id))));

		query.where(deal.get(CrmDeal_.contact).get(CrmContact_.id).in(contactIds),
				cb.equal(stage.get(CrmDealStage_.stageType), CrmDealStageType.WON),
				cb.isFalse(deal.get(CrmDeal_.isDeleted)));

		query.groupBy(deal.get(CrmDeal_.contact).get(CrmContact_.id));

		return entityManager.createQuery(query).getResultList();
	}

}
