package com.skapp.community.crmplanner.repository.impl;

import com.skapp.community.crmplanner.model.CrmDealStage;
import com.skapp.community.crmplanner.model.CrmDealStage_;
import com.skapp.community.crmplanner.repository.CrmDealStageRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Root;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class CrmDealStageRepositoryImpl implements CrmDealStageRepository {

	private final EntityManager entityManager;

	@Override
	public Integer findNextOrderIndex() {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<Integer> query = cb.createQuery(Integer.class);
		Root<CrmDealStage> stage = query.from(CrmDealStage.class);

		query.select(cb.sum(cb.coalesce(cb.max(stage.get(CrmDealStage_.orderIndex)), 0), 1));

		return entityManager.createQuery(query).getSingleResult();
	}

}
