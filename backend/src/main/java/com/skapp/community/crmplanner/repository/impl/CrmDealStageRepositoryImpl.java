package com.skapp.community.crmplanner.repository.impl;

import com.skapp.community.common.model.Auditable_;
import com.skapp.community.common.util.DateTimeUtils;
import com.skapp.community.crmplanner.model.CrmDealStage;
import com.skapp.community.crmplanner.model.CrmDealStage_;
import com.skapp.community.crmplanner.repository.CrmDealStageRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Root;
import lombok.RequiredArgsConstructor;
import org.hibernate.Session;
import org.hibernate.query.criteria.HibernateCriteriaBuilder;
import org.hibernate.query.criteria.JpaCriteriaInsertValues;
import org.hibernate.query.criteria.JpaRoot;
import org.hibernate.query.criteria.JpaValues;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class CrmDealStageRepositoryImpl implements CrmDealStageRepository {

	private final EntityManager entityManager;

	@Override
	public Integer findNextOrderIndex() {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<Integer> query = cb.createQuery(Integer.class);
		Root<CrmDealStage> stage = query.from(CrmDealStage.class);

		query.select(cb.sum(cb.coalesce(cb.max(stage.get(CrmDealStage_.orderIndex)), 0), 1))
			.where(cb.isFalse(stage.get(CrmDealStage_.isDeleted)));

		return entityManager.createQuery(query).getSingleResult();
	}

	@Override
	public void insertAll(List<CrmDealStage> dealStages) {
		LocalDateTime now = DateTimeUtils.getCurrentUtcDateTime();
		Session session = entityManager.unwrap(Session.class);
		HibernateCriteriaBuilder cb = session.getCriteriaBuilder();
		JpaCriteriaInsertValues<CrmDealStage> insert = cb.createCriteriaInsertValues(CrmDealStage.class);
		JpaRoot<CrmDealStage> stage = insert.getTarget();
		Path<LocalDateTime> createdDate = stage.get(Auditable_.createdDate);
		Path<LocalDateTime> lastModifiedDate = stage.get(Auditable_.lastModifiedDate);

		insert.setInsertionTargetPaths(stage.get(CrmDealStage_.name), stage.get(CrmDealStage_.description),
				stage.get(CrmDealStage_.color), stage.get(CrmDealStage_.orderIndex), stage.get(CrmDealStage_.stageType),
				stage.get(CrmDealStage_.isDeleted), createdDate, lastModifiedDate);
		insert.values(dealStages.stream().map(dealStage -> toInsertValues(cb, dealStage, now)).toList());

		session.createMutationQuery(insert).executeUpdate();
	}

	private JpaValues toInsertValues(HibernateCriteriaBuilder cb, CrmDealStage dealStage, LocalDateTime now) {
		return cb.values(cb.value(dealStage.getName()), cb.value(dealStage.getDescription()),
				cb.value(dealStage.getColor()), cb.value(dealStage.getOrderIndex()), cb.value(dealStage.getStageType()),
				cb.value(dealStage.getIsDeleted()), cb.value(now), cb.value(now));
	}

}
