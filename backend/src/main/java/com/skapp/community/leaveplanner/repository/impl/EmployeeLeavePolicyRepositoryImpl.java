package com.skapp.community.leaveplanner.repository.impl;

import com.skapp.community.leaveplanner.model.EmployeeLeavePolicy;
import com.skapp.community.leaveplanner.model.EmployeeLeavePolicy_;
import com.skapp.community.leaveplanner.model.LeavePolicy_;
import com.skapp.community.leaveplanner.repository.EmployeeLeavePolicyRepository;
import com.skapp.community.leaveplanner.type.EmployeeLeavePolicyStatus;
import com.skapp.community.peopleplanner.model.Employee_;
import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Root;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class EmployeeLeavePolicyRepositoryImpl implements EmployeeLeavePolicyRepository {

	private final EntityManager entityManager;

	@Override
	public Optional<EmployeeLeavePolicy> findActiveAssignmentForUpdate(Long employeeId, Long policyId,
			EmployeeLeavePolicyStatus status) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();

		CriteriaQuery<EmployeeLeavePolicy> criteriaQuery = criteriaBuilder.createQuery(EmployeeLeavePolicy.class);
		Root<EmployeeLeavePolicy> root = criteriaQuery.from(EmployeeLeavePolicy.class);

		criteriaQuery.select(root)
			.where(criteriaBuilder.equal(root.get(EmployeeLeavePolicy_.employee).get(Employee_.employeeId), employeeId),
					criteriaBuilder.equal(root.get(EmployeeLeavePolicy_.policy).get(LeavePolicy_.id), policyId),
					criteriaBuilder.equal(root.get(EmployeeLeavePolicy_.status), status));

		return entityManager.createQuery(criteriaQuery)
			.setLockMode(LockModeType.PESSIMISTIC_WRITE)
			.getResultList()
			.stream()
			.findFirst();
	}

}
