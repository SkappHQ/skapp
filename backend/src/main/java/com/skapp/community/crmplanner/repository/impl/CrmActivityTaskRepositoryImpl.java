package com.skapp.community.crmplanner.repository.impl;

import com.skapp.community.crmplanner.model.CrmActivityTask;
import com.skapp.community.crmplanner.model.CrmActivityTask_;
import com.skapp.community.crmplanner.model.CrmCompany;
import com.skapp.community.crmplanner.model.CrmCompany_;
import com.skapp.community.crmplanner.model.CrmContact;
import com.skapp.community.crmplanner.model.CrmContact_;
import com.skapp.community.crmplanner.model.CrmDeal_;
import com.skapp.community.crmplanner.payload.response.CrmActivityTaskResponseDto;
import com.skapp.community.crmplanner.repository.CrmActivityTaskRepository;
import com.skapp.community.crmplanner.type.CrmActivityTaskFilterParams;
import com.skapp.community.crmplanner.type.CrmActivityTaskPriority;
import com.skapp.community.crmplanner.type.CrmActivityTaskSort;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.Employee_;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Tuple;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Order;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class CrmActivityTaskRepositoryImpl implements CrmActivityTaskRepository {

	private final EntityManager entityManager;

	@Override
	public List<CrmActivityTaskResponseDto> findTasks(CrmActivityTaskFilterParams params) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<Tuple> query = cb.createTupleQuery();
		Root<CrmActivityTask> task = query.from(CrmActivityTask.class);
		Join<CrmActivityTask, Employee> owner = task.join(CrmActivityTask_.owner, JoinType.LEFT);
		Path<Long> ownerId = owner.get(Employee_.employeeId);

		Join<CrmActivityTask, CrmCompany> company = task.join(CrmActivityTask_.company, JoinType.LEFT);
		company.on(cb.isFalse(company.get(CrmCompany_.isDeleted)));

		Path<Instant> dueAt = task.get(CrmActivityTask_.dueAt);
		List<Predicate> predicates = new ArrayList<>();
		if (Boolean.TRUE.equals(params.getIsRestrictedToOwner())) {
			predicates.add(cb.equal(ownerId, params.getCurrentEmployeeId()));
		}
		if (params.getOwnerId() != null) {
			predicates.add(cb.equal(ownerId, params.getOwnerId()));
		}
		if (params.getRangeStart() != null) {
			predicates.add(cb.greaterThanOrEqualTo(dueAt, params.getRangeStart()));
		}
		if (params.getRangeEnd() != null) {
			predicates.add(cb.lessThan(dueAt, params.getRangeEnd()));
		}
		predicates.add(cb.isFalse(task.get(CrmActivityTask_.isDeleted)));
		if (params.getRelatedContactIds() != null) {
			predicates.add(task.get(CrmActivityTask_.contact).get(CrmContact_.id).in(params.getRelatedContactIds()));
		}
		if (params.getRelatedDealId() != null) {
			predicates.add(cb.equal(task.get(CrmActivityTask_.deal).get(CrmDeal_.id), params.getRelatedDealId()));
		}
		if (params.getExcludedId() != null) {
			predicates.add(cb.notEqual(task.get(CrmActivityTask_.id), params.getExcludedId()));
		}

		if (params.getSearchPattern() != null) {
			Join<CrmActivityTask, CrmContact> contact = task.join(CrmActivityTask_.contact, JoinType.LEFT);
			contact.on(cb.isFalse(contact.get(CrmContact_.isDeleted)));
			Join<CrmContact, CrmCompany> contactCompany = contact.join(CrmContact_.company, JoinType.LEFT);
			contactCompany.on(cb.isFalse(contactCompany.get(CrmCompany_.isDeleted)));

			predicates.add(cb.or(cb.like(cb.lower(task.get(CrmActivityTask_.name)), params.getSearchPattern()),
					cb.like(cb.lower(contact.get(CrmContact_.name)), params.getSearchPattern()),
					cb.like(cb.lower(contactCompany.get(CrmCompany_.name)), params.getSearchPattern())));
		}

		boolean ascending = params.getSortOrder().isAscending();
		List<Order> orders = new ArrayList<>();
		if (params.getSortKey() == CrmActivityTaskSort.OWNER) {
			orders.add(ascending ? cb.asc(owner.get(Employee_.firstName)) : cb.desc(owner.get(Employee_.firstName)));
			orders.add(ascending ? cb.asc(owner.get(Employee_.lastName)) : cb.desc(owner.get(Employee_.lastName)));
			orders.add(cb.desc(dueAt));
			orders.add(cb.desc(task.get(CrmActivityTask_.id)));
		}
		else {
			orders.add(ascending ? cb.asc(dueAt) : cb.desc(dueAt));
			orders.add(ascending ? cb.asc(task.get(CrmActivityTask_.id)) : cb.desc(task.get(CrmActivityTask_.id)));
		}

		query
			.multiselect(task.get(CrmActivityTask_.id), task.get(CrmActivityTask_.name),
					task.get(CrmActivityTask_.dueAt), task.get(CrmActivityTask_.priority),
					task.get(CrmActivityTask_.isCompleted), task.get(CrmActivityTask_.completedAt),
					task.get(CrmActivityTask_.notes), ownerId, task.get(CrmActivityTask_.contact).get(CrmContact_.id),
					task.get(CrmActivityTask_.deal).get(CrmDeal_.id), company.get(CrmCompany_.id))
			.where(predicates.toArray(new Predicate[0]))
			.orderBy(orders);

		int maxResults = params.getMaxResults() != null ? params.getMaxResults() : Integer.MAX_VALUE;
		return entityManager.createQuery(query).setMaxResults(maxResults).getResultList().stream().map(row -> {
			CrmActivityTaskResponseDto dto = new CrmActivityTaskResponseDto();
			dto.setId(row.get(0, Long.class));
			dto.setName(row.get(1, String.class));
			dto.setDueAt(row.get(2, Instant.class));
			dto.setPriority(row.get(3, CrmActivityTaskPriority.class));
			dto.setIsCompleted(row.get(4, Boolean.class));
			dto.setCompletedAt(row.get(5, Instant.class));
			dto.setNotes(row.get(6, String.class));
			dto.setOwnerId(row.get(7, Long.class));
			dto.setContactId(row.get(8, Long.class));
			dto.setDealId(row.get(9, Long.class));
			dto.setCompanyId(row.get(10, Long.class));
			return dto;
		}).toList();
	}

	@Override
	public CrmActivityTask findTaskById(Long id) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<CrmActivityTask> query = cb.createQuery(CrmActivityTask.class);
		Root<CrmActivityTask> task = query.from(CrmActivityTask.class);

		task.fetch(CrmActivityTask_.contact, JoinType.LEFT);
		task.fetch(CrmActivityTask_.deal, JoinType.LEFT);
		task.fetch(CrmActivityTask_.company, JoinType.LEFT);

		query.select(task)
			.where(cb.equal(task.get(CrmActivityTask_.id), id), cb.isFalse(task.get(CrmActivityTask_.isDeleted)));

		return entityManager.createQuery(query).getResultStream().findFirst().orElse(null);
	}

}
