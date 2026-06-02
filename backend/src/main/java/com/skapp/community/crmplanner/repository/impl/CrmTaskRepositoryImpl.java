package com.skapp.community.crmplanner.repository.impl;

import com.skapp.community.crmplanner.model.CrmContact;
import com.skapp.community.crmplanner.model.CrmContact_;
import com.skapp.community.crmplanner.model.CrmDeal;
import com.skapp.community.crmplanner.model.CrmDeal_;
import com.skapp.community.crmplanner.model.CrmTask;
import com.skapp.community.crmplanner.model.CrmTask_;
import com.skapp.community.crmplanner.repository.CrmTaskRepository;
import com.skapp.community.crmplanner.type.CrmTaskSummary;
import jakarta.persistence.EntityManager;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Root;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class CrmTaskRepositoryImpl implements CrmTaskRepository {

	private final EntityManager entityManager;

	@Override
	public List<CrmTaskSummary> findOpenTaskSummaryByContactIds(List<Long> contactIds, LocalDateTime now) {
		if (contactIds == null || contactIds.isEmpty()) {
			return Collections.emptyList();
		}

		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<CrmTaskSummary> query = cb.createQuery(CrmTaskSummary.class);
		Root<CrmTask> task = query.from(CrmTask.class);

		Join<CrmTask, CrmContact> directContact = task.join(CrmTask_.contact, JoinType.LEFT);
		Join<CrmTask, CrmDeal> deal = task.join(CrmTask_.deal, JoinType.LEFT);
		Join<CrmDeal, CrmContact> dealContact = deal.join(CrmDeal_.contact, JoinType.LEFT);

		Expression<Long> effectiveContactId = cb.coalesce(directContact.get(CrmContact_.id),
				dealContact.get(CrmContact_.id));

		query.select(cb.construct(CrmTaskSummary.class, effectiveContactId,
				cb.countDistinct(task.get(CrmTask_.id)),
				cb.sum(cb.<Long>selectCase()
					.when(cb.and(cb.isNotNull(task.get(CrmTask_.dueAt)),
							cb.lessThan(task.get(CrmTask_.dueAt), cb.literal(now))), 1L)
					.otherwise(0L))));

		query.where(cb.and(
				cb.or(directContact.get(CrmContact_.id).in(contactIds),
						dealContact.get(CrmContact_.id).in(contactIds)),
				cb.isFalse(task.get(CrmTask_.isCompleted)),
				cb.isFalse(task.get(CrmTask_.isDeleted))));

		query.groupBy(effectiveContactId);

		return entityManager.createQuery(query).getResultList();
	}

	@Override
	public List<CrmTask> findByContactIdWithAssociations(Long contactId) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<CrmTask> query = cb.createQuery(CrmTask.class);
		Root<CrmTask> task = query.from(CrmTask.class);
		task.fetch(CrmTask_.type, JoinType.INNER);
		task.fetch(CrmTask_.owner, JoinType.INNER);

		Join<CrmTask, CrmContact> directContact = task.join(CrmTask_.contact, JoinType.LEFT);
		Join<CrmTask, CrmDeal> deal = task.join(CrmTask_.deal, JoinType.LEFT);
		Join<CrmDeal, CrmContact> dealContact = deal.join(CrmDeal_.contact, JoinType.LEFT);

		query.distinct(true);
		query.where(cb.and(
				cb.or(cb.equal(directContact.get(CrmContact_.id), contactId),
						cb.equal(dealContact.get(CrmContact_.id), contactId)),
				cb.isFalse(task.get(CrmTask_.isDeleted))));

		return entityManager.createQuery(query).getResultList();
	}

}
