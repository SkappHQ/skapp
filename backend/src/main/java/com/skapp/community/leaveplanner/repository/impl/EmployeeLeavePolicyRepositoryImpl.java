package com.skapp.community.leaveplanner.repository.impl;

import com.skapp.community.leaveplanner.model.EmployeeLeavePolicy;
import com.skapp.community.leaveplanner.model.EmployeeLeavePolicy_;
import com.skapp.community.leaveplanner.model.LeavePolicy;
import com.skapp.community.leaveplanner.model.LeavePolicy_;
import com.skapp.community.leaveplanner.repository.EmployeeLeavePolicyRepository;
import com.skapp.community.leaveplanner.type.EmployeeLeavePolicyStatus;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.Employee_;
import com.skapp.community.peopleplanner.type.AccountStatus;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Tuple;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Fetch;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class EmployeeLeavePolicyRepositoryImpl implements EmployeeLeavePolicyRepository {

	private final EntityManager entityManager;

	@Override
	public List<EmployeeLeavePolicy> findByEmployeeIdsAndStatus(List<Long> employeeIds,
			EmployeeLeavePolicyStatus status) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<EmployeeLeavePolicy> query = cb.createQuery(EmployeeLeavePolicy.class);
		Root<EmployeeLeavePolicy> root = query.from(EmployeeLeavePolicy.class);
		root.fetch(EmployeeLeavePolicy_.employee, JoinType.INNER);
		Fetch<EmployeeLeavePolicy, LeavePolicy> policyFetch = root.fetch(EmployeeLeavePolicy_.policy, JoinType.INNER);
		policyFetch.fetch(LeavePolicy_.leaveType, JoinType.LEFT);

		Predicate employeePredicate = root.get(EmployeeLeavePolicy_.employee).get(Employee_.employeeId).in(employeeIds);
		Predicate statusPredicate = cb.equal(root.get(EmployeeLeavePolicy_.status), status);

		query.select(root).where(cb.and(employeePredicate, statusPredicate)).distinct(true);
		return entityManager.createQuery(query).getResultList();
	}

	@Override
	public Page<EmployeeLeavePolicy> findByEmployeeIdAndStatusOrderByEffectiveFromDescIdDesc(Long employeeId,
			EmployeeLeavePolicyStatus status, Pageable pageable) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<EmployeeLeavePolicy> query = cb.createQuery(EmployeeLeavePolicy.class);
		Root<EmployeeLeavePolicy> root = query.from(EmployeeLeavePolicy.class);
		Fetch<EmployeeLeavePolicy, LeavePolicy> policyFetch = root.fetch(EmployeeLeavePolicy_.policy, JoinType.INNER);
		policyFetch.fetch(LeavePolicy_.leaveType, JoinType.LEFT);

		query.select(root).where(buildEmployeeStatusPredicates(cb, root, employeeId, status));
		query.orderBy(cb.desc(root.get(EmployeeLeavePolicy_.effectiveFrom)),
				cb.desc(root.get(EmployeeLeavePolicy_.id)));

		TypedQuery<EmployeeLeavePolicy> typedQuery = entityManager.createQuery(query);
		if (pageable.isUnpaged()) {
			List<EmployeeLeavePolicy> assignments = typedQuery.getResultList();
			return new PageImpl<>(assignments, pageable, assignments.size());
		}

		typedQuery.setFirstResult((int) pageable.getOffset());
		typedQuery.setMaxResults(pageable.getPageSize());

		CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
		Root<EmployeeLeavePolicy> countRoot = countQuery.from(EmployeeLeavePolicy.class);
		countQuery.select(cb.count(countRoot)).where(buildEmployeeStatusPredicates(cb, countRoot, employeeId, status));
		long totalRows = entityManager.createQuery(countQuery).getSingleResult();

		return new PageImpl<>(typedQuery.getResultList(), pageable, totalRows);
	}

	@Override
	public Map<Long, Long> countByPolicyIdsAndStatus(List<Long> policyIds, EmployeeLeavePolicyStatus status) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<Tuple> query = cb.createTupleQuery();
		Root<EmployeeLeavePolicy> root = query.from(EmployeeLeavePolicy.class);
		Join<EmployeeLeavePolicy, Employee> employee = root.join(EmployeeLeavePolicy_.employee);
		Path<Long> policyId = root.get(EmployeeLeavePolicy_.policy).get(LeavePolicy_.id);

		query.multiselect(policyId, cb.countDistinct(employee))
			.where(policyId.in(policyIds), cb.equal(root.get(EmployeeLeavePolicy_.status), status),
					cb.not(employee.get(Employee_.ACCOUNT_STATUS).in(AccountStatus.TERMINATED, AccountStatus.DELETED)))
			.groupBy(policyId);

		return entityManager.createQuery(query)
			.getResultList()
			.stream()
			.collect(Collectors.toMap(result -> result.get(0, Long.class), result -> result.get(1, Long.class)));
	}

	private Predicate[] buildEmployeeStatusPredicates(CriteriaBuilder cb, Root<EmployeeLeavePolicy> root,
			Long employeeId, EmployeeLeavePolicyStatus status) {
		return new Predicate[] {
				cb.equal(root.get(EmployeeLeavePolicy_.employee).get(Employee_.employeeId), employeeId),
				cb.equal(root.get(EmployeeLeavePolicy_.status), status) };
	}

}
