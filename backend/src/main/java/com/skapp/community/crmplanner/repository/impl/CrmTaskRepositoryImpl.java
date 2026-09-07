package com.skapp.community.crmplanner.repository.impl;

import com.skapp.community.common.service.TimeZoneService;
import com.skapp.community.common.model.Auditable_;
import com.skapp.community.common.util.StringUtils;
import com.skapp.community.crmplanner.model.CrmCompany;
import com.skapp.community.crmplanner.model.CrmCompany_;
import com.skapp.community.crmplanner.model.CrmContact;
import com.skapp.community.crmplanner.model.CrmContact_;
import com.skapp.community.crmplanner.model.CrmDeal;
import com.skapp.community.crmplanner.model.CrmDeal_;
import com.skapp.community.crmplanner.model.CrmTask;
import com.skapp.community.crmplanner.model.CrmTaskType;
import com.skapp.community.crmplanner.model.CrmTaskType_;
import com.skapp.community.crmplanner.model.CrmTask_;
import com.skapp.community.crmplanner.payload.request.CrmTaskFilterDto;
import com.skapp.community.crmplanner.payload.response.CrmTaskResponseDto;
import com.skapp.community.crmplanner.repository.CrmTaskRepository;
import com.skapp.community.crmplanner.type.CrmContactTaskMetrics;
import com.skapp.community.crmplanner.type.CrmTaskFilterParams;
import com.skapp.community.crmplanner.type.CrmTaskLinkRefs;
import com.skapp.community.crmplanner.type.CrmTaskRelatedParams;
import com.skapp.community.crmplanner.type.CrmTaskSort;
import com.skapp.community.crmplanner.type.CrmTaskSummary;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.Employee_;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Tuple;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Fetch;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Order;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Selection;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class CrmTaskRepositoryImpl implements CrmTaskRepository {

	private final TimeZoneService timeZoneService;

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
							cb.lessThan(task.get(CrmTask_.dueAt),
									cb.literal(timeZoneService.currentBusinessDayStartUtc()))),
							1L)
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

		query.distinct(true);
		query.where(cb.and(buildContactMatchPredicate(cb, task, contactId), cb.isFalse(task.get(CrmTask_.isDeleted))));

		return entityManager.createQuery(query).getResultList();
	}

	@Override
	public Optional<CrmTask> findByIdWithAssociations(Long id) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<CrmTask> query = cb.createQuery(CrmTask.class);
		Root<CrmTask> task = query.from(CrmTask.class);

		task.fetch(CrmTask_.type, JoinType.INNER);
		task.fetch(CrmTask_.owner, JoinType.INNER);
		task.fetch(CrmTask_.contact, JoinType.LEFT);
		Fetch<CrmTask, CrmDeal> dealFetch = task.fetch(CrmTask_.deal, JoinType.LEFT);
		dealFetch.fetch(CrmDeal_.stage, JoinType.LEFT);
		dealFetch.fetch(CrmDeal_.owner, JoinType.LEFT);

		query.select(task).where(cb.equal(task.get(CrmTask_.id), id), cb.isFalse(task.get(CrmTask_.isDeleted)));

		return entityManager.createQuery(query).getResultList().stream().findFirst();
	}

	@Override
	public Optional<CrmTaskLinkRefs> findTaskLinkRefsById(Long id) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<CrmTaskLinkRefs> query = cb.createQuery(CrmTaskLinkRefs.class);
		Root<CrmTask> task = query.from(CrmTask.class);

		Join<CrmTask, CrmContact> contact = task.join(CrmTask_.contact, JoinType.LEFT);
		Join<CrmTask, CrmDeal> deal = task.join(CrmTask_.deal, JoinType.LEFT);

		query.select(cb.construct(CrmTaskLinkRefs.class, task.get(CrmTask_.owner).get(Employee_.employeeId),
				contact.get(CrmContact_.id), deal.get(CrmDeal_.id)));
		query.where(cb.equal(task.get(CrmTask_.id), id), cb.isFalse(task.get(CrmTask_.isDeleted)));

		return entityManager.createQuery(query).getResultList().stream().findFirst();
	}

	@Override
	public CrmContactTaskMetrics findTaskMetricsByContactId(Long contactId) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<CrmContactTaskMetrics> query = cb.createQuery(CrmContactTaskMetrics.class);
		Root<CrmTask> task = query.from(CrmTask.class);

		Expression<Long> openCount = cb.coalesce(
				cb.sum(cb.<Long>selectCase().when(cb.isFalse(task.get(CrmTask_.isCompleted)), 1L).otherwise(0L)), 0L);

		Expression<Long> overdueCount = cb.coalesce(cb.sum(cb.<Long>selectCase()
			.when(cb.and(cb.isFalse(task.get(CrmTask_.isCompleted)), cb.isNotNull(task.get(CrmTask_.dueAt)),
					cb.lessThan(task.get(CrmTask_.dueAt), cb.literal(timeZoneService.currentBusinessDayStartUtc()))),
					1L)
			.otherwise(0L)), 0L);

		query.select(cb.construct(CrmContactTaskMetrics.class, openCount, overdueCount));

		query.where(cb.and(buildContactMatchPredicate(cb, task, contactId), cb.isFalse(task.get(CrmTask_.isDeleted))));

		return entityManager.createQuery(query).getSingleResult();
	}

	@Override
	public Page<CrmTaskResponseDto> findTasks(Long ownerId, CrmTaskFilterDto filterDto, Pageable pageable) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<CrmTaskResponseDto> query = cb.createQuery(CrmTaskResponseDto.class);
		Root<CrmTask> task = query.from(CrmTask.class);

		query.select(buildTaskProjectionSelection(cb, task));

		CrmTaskFilterParams params = new CrmTaskFilterParams(ownerId, filterDto.getIsCompleted(),
				filterDto.getSearchKeyword(), filterDto.getContactId(), filterDto.getDealId(),
				filterDto.getCompanyId());
		query.where(buildTaskPredicates(cb, task, params).toArray(new Predicate[0]))
			.orderBy(buildTaskOrder(cb, task, filterDto.getSortKey(), filterDto.getSortOrder()));

		TypedQuery<CrmTaskResponseDto> typedQuery = entityManager.createQuery(query);
		if (pageable.isPaged()) {
			typedQuery.setFirstResult((int) pageable.getOffset());
			typedQuery.setMaxResults(pageable.getPageSize());
		}
		List<CrmTaskResponseDto> content = typedQuery.getResultList();

		CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
		Root<CrmTask> countRoot = countQuery.from(CrmTask.class);
		countQuery.select(cb.count(countRoot))
			.where(buildTaskPredicates(cb, countRoot, params).toArray(new Predicate[0]));
		Long total = entityManager.createQuery(countQuery).getSingleResult();

		return new PageImpl<>(content, pageable, total);
	}

	private List<Order> buildTaskOrder(CriteriaBuilder cb, Root<CrmTask> task, CrmTaskSort sortKey,
			Sort.Direction sortOrder) {
		List<Order> orders = new ArrayList<>();

		if (sortKey == CrmTaskSort.DUE_AT) {
			orders.add(cb.asc(cb.selectCase().when(cb.isNull(task.get(CrmTask_.dueAt)), 1).otherwise(0)));
		}

		Expression<?> sortExpression = task.get(sortKey.getSortField());
		orders.add(sortOrder.isAscending() ? cb.asc(sortExpression) : cb.desc(sortExpression));
		orders.add(sortOrder.isAscending() ? cb.asc(task.get(CrmTask_.id)) : cb.desc(task.get(CrmTask_.id)));

		return orders;
	}

	@Override
	public Page<CrmTaskResponseDto> findRelatedTasks(Long taskId, CrmTaskRelatedParams params, Pageable pageable) {
		if (params.getContactId() == null && params.getDealId() == null) {
			return Page.empty(pageable);
		}

		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<CrmTaskResponseDto> query = cb.createQuery(CrmTaskResponseDto.class);
		Root<CrmTask> task = query.from(CrmTask.class);

		query.select(buildTaskProjectionSelection(cb, task));
		query.where(buildRelatedTaskPredicates(cb, task, taskId, params).toArray(new Predicate[0]))
			.orderBy(cb.asc(cb.selectCase().when(cb.isNull(task.get(CrmTask_.dueAt)), 1).otherwise(0)),
					cb.asc(task.get(CrmTask_.dueAt)), cb.asc(task.get(CrmTask_.id)));

		TypedQuery<CrmTaskResponseDto> typedQuery = entityManager.createQuery(query);
		if (pageable.isPaged()) {
			typedQuery.setFirstResult((int) pageable.getOffset());
			typedQuery.setMaxResults(pageable.getPageSize());
		}
		List<CrmTaskResponseDto> content = typedQuery.getResultList();

		CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
		Root<CrmTask> countRoot = countQuery.from(CrmTask.class);
		countQuery.select(cb.count(countRoot))
			.where(buildRelatedTaskPredicates(cb, countRoot, taskId, params).toArray(new Predicate[0]));
		Long total = entityManager.createQuery(countQuery).getSingleResult();

		return new PageImpl<>(content, pageable, total);
	}

	private List<Predicate> buildRelatedTaskPredicates(CriteriaBuilder cb, Root<CrmTask> root, Long taskId,
			CrmTaskRelatedParams params) {
		List<Predicate> predicates = new ArrayList<>();
		predicates.add(cb.isFalse(root.get(CrmTask_.isDeleted)));
		predicates.add(cb.notEqual(root.get(CrmTask_.id), taskId));

		if (params.getOwnerId() != null) {
			predicates.add(cb.equal(root.get(CrmTask_.owner).get(Employee_.employeeId), params.getOwnerId()));
		}

		if (params.getContactId() != null) {
			predicates.add(cb.equal(root.get(CrmTask_.contact).get(CrmContact_.id), params.getContactId()));
		}

		if (params.getDealId() != null) {
			predicates.add(cb.equal(root.get(CrmTask_.deal).get(CrmDeal_.id), params.getDealId()));
		}

		return predicates;
	}

	private Selection<CrmTaskResponseDto> buildTaskProjectionSelection(CriteriaBuilder cb, Root<CrmTask> task) {
		Join<CrmTask, CrmTaskType> type = task.join(CrmTask_.type, JoinType.LEFT);
		Join<CrmTask, Employee> owner = task.join(CrmTask_.owner, JoinType.LEFT);
		Join<CrmTask, CrmCompany> company = task.join(CrmTask_.company, JoinType.LEFT);
		company.on(cb.isFalse(company.get(CrmCompany_.isDeleted)));
		Join<CrmTask, CrmContact> contact = task.join(CrmTask_.contact, JoinType.LEFT);

		return cb.construct(CrmTaskResponseDto.class, task.get(CrmTask_.id), task.get(CrmTask_.name),
				type.get(CrmTaskType_.id), task.get(CrmTask_.priority), task.get(CrmTask_.isCompleted),
				task.get(CrmTask_.dueAt), task.get(Auditable_.lastModifiedDate), task.get(CrmTask_.notes),
				owner.get(Employee_.employeeId), contact.get(CrmContact_.id), company.get(CrmCompany_.id),
				task.get(CrmTask_.deal).get(CrmDeal_.id));
	}

	private List<Predicate> buildTaskPredicates(CriteriaBuilder cb, Root<CrmTask> root, CrmTaskFilterParams params) {
		List<Predicate> predicates = new ArrayList<>();

		predicates.add(cb.isFalse(root.get(CrmTask_.isDeleted)));

		if (params.getCompleted() != null) {
			predicates.add(Boolean.TRUE.equals(params.getCompleted()) ? cb.isTrue(root.get(CrmTask_.isCompleted))
					: cb.isFalse(root.get(CrmTask_.isCompleted)));
		}

		if (params.getOwnerId() != null) {
			predicates.add(cb.equal(root.get(CrmTask_.owner).get(Employee_.employeeId), params.getOwnerId()));
		}

		if (params.getSearchKeyword() != null && !params.getSearchKeyword().isBlank()) {
			String escaped = StringUtils.escapeLikePattern(params.getSearchKeyword().trim().toLowerCase());

			Join<CrmTask, CrmContact> contactJoin = root.join(CrmTask_.contact, JoinType.LEFT);
			Join<CrmTask, CrmDeal> dealJoin = root.join(CrmTask_.deal, JoinType.LEFT);

			predicates.add(cb.or(cb.like(cb.lower(root.get(CrmTask_.name)), "%" + escaped + "%"),
					cb.like(cb.lower(contactJoin.get(CrmContact_.name)), "%" + escaped + "%"),
					cb.like(cb.lower(dealJoin.get(CrmDeal_.name)), "%" + escaped + "%")));
		}

		if (params.getContactId() != null) {
			predicates.add(buildContactMatchPredicate(cb, root, params.getContactId()));
		}

		if (params.getDealId() != null) {
			predicates.add(cb.equal(root.get(CrmTask_.deal).get(CrmDeal_.id), params.getDealId()));
		}

		if (params.getCompanyId() != null) {
			predicates.add(cb.equal(root.get(CrmTask_.company).get(CrmCompany_.id), params.getCompanyId()));
		}

		return predicates;
	}

	private Predicate buildContactMatchPredicate(CriteriaBuilder cb, Root<CrmTask> root, Long contactId) {
		Join<CrmTask, CrmDeal> dealJoin = root.join(CrmTask_.deal, JoinType.LEFT);

		return cb.or(cb.equal(root.get(CrmTask_.contact).get(CrmContact_.id), contactId),
				cb.equal(dealJoin.get(CrmDeal_.contact).get(CrmContact_.id), contactId));
	}

	@Override
	public Map<Long, Long> countTasksByDealIds(List<Long> dealIds, Long ownerId) {
		if (dealIds == null || dealIds.isEmpty()) {
			return Collections.emptyMap();
		}
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<Tuple> query = cb.createTupleQuery();
		Root<CrmTask> task = query.from(CrmTask.class);

		List<Predicate> predicates = new ArrayList<>();
		predicates.add(task.get(CrmTask_.deal).get(CrmDeal_.id).in(dealIds));
		predicates.add(cb.isFalse(task.get(CrmTask_.isDeleted)));
		predicates.add(cb.isFalse(task.get(CrmTask_.isCompleted)));

		if (ownerId != null) {
			predicates.add(cb.equal(task.get(CrmTask_.owner).get(Employee_.employeeId), ownerId));
		}

		query.select(cb.tuple(task.get(CrmTask_.deal).get(CrmDeal_.id), cb.count(task.get(CrmTask_.id))));
		query.where(predicates.toArray(new Predicate[0]));
		query.groupBy(task.get(CrmTask_.deal).get(CrmDeal_.id));

		Map<Long, Long> counts = new HashMap<>();
		entityManager.createQuery(query)
			.getResultList()
			.forEach(t -> counts.put(t.get(0, Long.class), t.get(1, Long.class)));
		return counts;
	}

}
