package com.skapp.community.crmplanner.activity.repository.impl;

import com.skapp.community.crmplanner.activity.repository.CrmActivityTaskRepository;
import com.skapp.community.crmplanner.model.CrmActivityTask;
import com.skapp.community.crmplanner.model.CrmActivityTask_;
import com.skapp.community.crmplanner.model.CrmContact_;
import com.skapp.community.crmplanner.model.CrmDeal_;
import com.skapp.community.peopleplanner.model.Employee_;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Repository
@RequiredArgsConstructor
public class CrmActivityTaskRepositoryImpl implements CrmActivityTaskRepository {

	private final EntityManager entityManager;

	@Override
	public Page<CrmActivityTask> findRelatedTasks(CrmActivityTask sourceTask, Set<Long> ownerIds, Pageable pageable) {
		if (sourceTask.getContact() == null && sourceTask.getDeal() == null) {
			return Page.empty(pageable);
		}

		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<CrmActivityTask> query = cb.createQuery(CrmActivityTask.class);
		Root<CrmActivityTask> task = query.from(CrmActivityTask.class);

		query.select(task)
			.where(buildRelatedPredicates(cb, task, sourceTask, ownerIds).toArray(new Predicate[0]))
			.orderBy(cb.asc(cb.selectCase().when(cb.isNull(task.get(CrmActivityTask_.dueAt)), 1).otherwise(0)),
					cb.asc(task.get(CrmActivityTask_.dueAt)), cb.asc(task.get(CrmActivityTask_.id)));

		TypedQuery<CrmActivityTask> typedQuery = entityManager.createQuery(query);
		if (pageable.isPaged()) {
			typedQuery.setFirstResult((int) pageable.getOffset());
			typedQuery.setMaxResults(pageable.getPageSize());
		}
		List<CrmActivityTask> content = typedQuery.getResultList();

		CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
		Root<CrmActivityTask> countRoot = countQuery.from(CrmActivityTask.class);
		countQuery.select(cb.count(countRoot))
			.where(buildRelatedPredicates(cb, countRoot, sourceTask, ownerIds).toArray(new Predicate[0]));

		return new PageImpl<>(content, pageable, entityManager.createQuery(countQuery).getSingleResult());
	}

	private List<Predicate> buildRelatedPredicates(CriteriaBuilder cb, Root<CrmActivityTask> task,
			CrmActivityTask sourceTask, Set<Long> ownerIds) {
		List<Predicate> predicates = new ArrayList<>();
		predicates.add(cb.isFalse(task.get(CrmActivityTask_.isDeleted)));
		predicates.add(cb.notEqual(task.get(CrmActivityTask_.id), sourceTask.getId()));

		if (ownerIds != null) {
			predicates.add(task.get(CrmActivityTask_.owner).get(Employee_.employeeId).in(ownerIds));
		}

		if (sourceTask.getContact() != null) {
			predicates
				.add(cb.equal(task.get(CrmActivityTask_.contact).get(CrmContact_.id), sourceTask.getContact().getId()));
		}

		if (sourceTask.getDeal() != null) {
			predicates.add(cb.equal(task.get(CrmActivityTask_.deal).get(CrmDeal_.id), sourceTask.getDeal().getId()));
		}

		return predicates;
	}

}
