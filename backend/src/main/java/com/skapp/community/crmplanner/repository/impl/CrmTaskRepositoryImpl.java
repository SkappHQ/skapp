package com.skapp.community.crmplanner.repository.impl;

import com.skapp.community.crmplanner.model.CrmTask;
import com.skapp.community.crmplanner.repository.CrmTaskRepository;
import com.skapp.community.crmplanner.type.CrmTaskSummary;
import jakarta.persistence.EntityManager;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
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
	public List<CrmTaskSummary> findOpenTaskSummaryByContactIds(List<Long> contactIds) {
		if (contactIds == null || contactIds.isEmpty()) {
			return Collections.emptyList();
		}

		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<CrmTaskSummary> query = cb.createQuery(CrmTaskSummary.class);
		Root<CrmTask> task = query.from(CrmTask.class);

		query.multiselect(task.get("contact").get("id"), cb.count(task),
				cb.sum(cb.<Long>selectCase()
					.when(cb.lessThan(task.get("dueAt"), LocalDateTime.now()), 1L)
					.otherwise(0L)));

		query.where(task.get("contact").get("id").in(contactIds),
				cb.isFalse(task.<Boolean>get("isCompleted")),
				cb.isFalse(task.<Boolean>get("isDeleted")));

		query.groupBy(task.get("contact").get("id"));

		return entityManager.createQuery(query).getResultList();
	}

}
