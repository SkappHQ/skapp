package com.skapp.community.crmplanner.repository.impl;

import com.skapp.community.crmplanner.model.CrmContact;
import com.skapp.community.crmplanner.model.CrmContact_;
import com.skapp.community.crmplanner.model.CrmDeal;
import com.skapp.community.crmplanner.model.CrmDeal_;
import com.skapp.community.crmplanner.model.CrmTask;
import com.skapp.community.crmplanner.model.CrmTask_;
import com.skapp.community.crmplanner.repository.CrmTaskRepository;
import com.skapp.community.crmplanner.type.CrmContactTaskMetrics;
import com.skapp.community.crmplanner.type.CrmTaskSummary;
import com.skapp.community.peopleplanner.model.Employee_;
import jakarta.persistence.EntityManager;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class CrmTaskRepositoryImpl implements CrmTaskRepository {

	private final EntityManager entityManager;

	@Override
	public List<CrmTask> findAllWithTypeAndOwner() {
		return buildFindTaskQuery(null);
	}

	@Override
	public List<CrmTask> findAllWithTypeAndOwnerByOwnerId(Long ownerId) {
		return buildFindTaskQuery(ownerId);
	}

	private List<CrmTask> buildFindTaskQuery(Long ownerId) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<CrmTask> query = cb.createQuery(CrmTask.class);
		Root<CrmTask> task = query.from(CrmTask.class);

		task.fetch(CrmTask_.type);
		task.fetch(CrmTask_.owner);
		task.fetch(CrmTask_.contact, JoinType.LEFT);
		task.fetch(CrmTask_.deal, JoinType.LEFT);

		Predicate predicate = cb.isFalse(task.get(CrmTask_.isDeleted));
		if (ownerId != null) {
			predicate = cb.and(predicate, cb.equal(task.get(CrmTask_.owner).get(Employee_.employeeId), ownerId));
		}

		query.select(task)
			.distinct(true)
			.where(predicate)
			.orderBy(cb.asc(cb.selectCase().when(cb.isNull(task.get(CrmTask_.dueAt)), 1).otherwise(0)),
					cb.asc(task.get(CrmTask_.dueAt)), cb.asc(task.get(CrmTask_.id)));

		return entityManager.createQuery(query).getResultList();
	}

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
							cb.lessThan(task.get(CrmTask_.dueAt), cb.literal(LocalDate.now().atStartOfDay()))), 1L)
					.otherwise(0L))));

		query.where(task.get(CrmTask_.contact).get(CrmContact_.id).in(contactIds),
				cb.isFalse(task.get(CrmTask_.isCompleted)), cb.isFalse(task.get(CrmTask_.isDeleted)));

		query.groupBy(task.get(CrmTask_.contact).get(CrmContact_.id));

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

	@Override
	public CrmContactTaskMetrics findTaskMetricsByContactId(Long contactId) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<CrmContactTaskMetrics> query = cb.createQuery(CrmContactTaskMetrics.class);
		Root<CrmTask> task = query.from(CrmTask.class);

		Join<CrmTask, CrmContact> directContact = task.join(CrmTask_.contact, JoinType.LEFT);
		Join<CrmTask, CrmDeal> deal = task.join(CrmTask_.deal, JoinType.LEFT);
		Join<CrmDeal, CrmContact> dealContact = deal.join(CrmDeal_.contact, JoinType.LEFT);

		Expression<Long> openCount = cb.coalesce(
				cb.sum(cb.<Long>selectCase().when(cb.isFalse(task.get(CrmTask_.isCompleted)), 1L).otherwise(0L)), 0L);

		Expression<Long> overdueCount = cb.coalesce(cb.sum(cb.<Long>selectCase()
			.when(cb.and(cb.isFalse(task.get(CrmTask_.isCompleted)), cb.isNotNull(task.get(CrmTask_.dueAt)),
					cb.lessThan(task.get(CrmTask_.dueAt), cb.literal(LocalDate.now().atStartOfDay()))), 1L)
			.otherwise(0L)), 0L);

		query.select(cb.construct(CrmContactTaskMetrics.class, openCount, overdueCount));

		query.where(cb.and(
				cb.or(cb.equal(directContact.get(CrmContact_.id), contactId),
						cb.equal(dealContact.get(CrmContact_.id), contactId)),
				cb.isFalse(task.get(CrmTask_.isDeleted))));

		return entityManager.createQuery(query).getSingleResult();
	}

}
