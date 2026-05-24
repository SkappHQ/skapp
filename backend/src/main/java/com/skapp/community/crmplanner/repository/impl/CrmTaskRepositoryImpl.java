package com.skapp.community.crmplanner.repository.impl;

import com.skapp.community.crmplanner.model.CrmContact_;
import com.skapp.community.crmplanner.model.CrmTask;
import com.skapp.community.crmplanner.model.CrmTask_;
import com.skapp.community.crmplanner.repository.CrmTaskRepository;
import com.skapp.community.crmplanner.type.CrmTaskSummary;
import jakarta.persistence.EntityManager;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Root;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.Collections;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class CrmTaskRepositoryImpl implements CrmTaskRepository {

	private final EntityManager entityManager;

	@Override
	public List<CrmTaskSummary> findOpenTaskSummaryByContactIds(List<Long> contactIds) {
		if (contactIds == null || contactIds.isEmpty()) {
			return Collections.emptyList();
		}

		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<CrmTaskSummary> query = cb.createQuery(CrmTaskSummary.class);
		Root<CrmTask> task = query.from(CrmTask.class);

		query.select(cb.construct(CrmTaskSummary.class, task.get(CrmTask_.contact).get(CrmContact_.id),
				cb.count(task.get(CrmTask_.id)),
				cb.sum(cb.<Long>selectCase()
					.when(cb.and(cb.isNotNull(task.get(CrmTask_.dueAt)),
							cb.lessThan(task.get(CrmTask_.dueAt), cb.localDateTime())), 1L)
					.otherwise(0L))));

		query.where(task.get(CrmTask_.contact).get(CrmContact_.id).in(contactIds),
				cb.isFalse(task.get(CrmTask_.isCompleted)), cb.isFalse(task.get(CrmTask_.isDeleted)));

		query.groupBy(task.get(CrmTask_.contact).get(CrmContact_.id));

		return entityManager.createQuery(query).getResultList();
	}

}
