package com.skapp.community.crmplanner.repository.impl;

import com.skapp.community.crmplanner.model.CrmDeal;
import com.skapp.community.crmplanner.model.CrmDealStage;
import com.skapp.community.crmplanner.repository.CrmDealRepository;
import com.skapp.community.crmplanner.type.CrmActiveDealSummary;
import com.skapp.community.crmplanner.type.CrmDealStageType;
import com.skapp.community.crmplanner.type.CrmDealSummary;
import jakarta.persistence.EntityManager;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Root;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

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
		Join<CrmDeal, CrmDealStage> stage = deal.join("stage");

		Expression<Double> amountAsDouble = deal.get("amount").as(Double.class);

		query.multiselect(deal.get("contact").get("id"), cb.coalesce(cb.sum(amountAsDouble), 0.0),
				cb.count(deal));

		query.where(deal.get("contact").get("id").in(contactIds),
				cb.equal(stage.get("stageType"), CrmDealStageType.WON),
				cb.isFalse(deal.<Boolean>get("isDeleted")));

		query.groupBy(deal.get("contact").get("id"));

		return entityManager.createQuery(query).getResultList();
	}

	@Override
	public List<CrmActiveDealSummary> findActiveDealSummaryByContactIds(List<Long> contactIds) {
		if (contactIds == null || contactIds.isEmpty()) {
			return Collections.emptyList();
		}

		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<CrmActiveDealSummary> query = cb.createQuery(CrmActiveDealSummary.class);
		Root<CrmDeal> deal = query.from(CrmDeal.class);
		Join<CrmDeal, CrmDealStage> stage = deal.join("stage");

		Expression<Double> amountAsDouble = deal.get("amount").as(Double.class);

		query.multiselect(deal.get("contact").get("id"), cb.coalesce(cb.sum(amountAsDouble), 0.0),
				cb.count(deal));

		query.where(deal.get("contact").get("id").in(contactIds), cb.or(
				cb.equal(stage.get("stageType"), CrmDealStageType.INITIAL),
				cb.equal(stage.get("stageType"), CrmDealStageType.OPEN)),
				cb.isFalse(deal.<Boolean>get("isDeleted")));

		query.groupBy(deal.get("contact").get("id"));

		return entityManager.createQuery(query).getResultList();
	}

}
