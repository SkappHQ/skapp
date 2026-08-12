package com.skapp.community.leaveplanner.repository.impl;

import com.skapp.community.leaveplanner.model.EmployeeLeavePolicy;
import com.skapp.community.leaveplanner.model.EmployeeLeavePolicy_;
import com.skapp.community.leaveplanner.model.LeavePolicy;
import com.skapp.community.leaveplanner.model.LeavePolicy_;
import com.skapp.community.leaveplanner.repository.EmployeeLeavePolicyRepository;
import com.skapp.community.leaveplanner.type.EmployeeLeavePolicyStatus;
import com.skapp.community.peopleplanner.model.Employee_;
import jakarta.persistence.EntityManager;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Fetch;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

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

}
