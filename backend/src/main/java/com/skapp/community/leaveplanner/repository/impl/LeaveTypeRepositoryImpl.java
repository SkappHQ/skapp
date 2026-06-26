package com.skapp.community.leaveplanner.repository.impl;

import com.skapp.community.leaveplanner.model.LeaveRequest;
import com.skapp.community.leaveplanner.model.LeaveRequest_;
import com.skapp.community.leaveplanner.model.LeaveType;
import com.skapp.community.leaveplanner.model.LeaveType_;
import com.skapp.community.leaveplanner.repository.LeaveTypeRepository;
import com.skapp.community.peopleplanner.model.Employee_;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class LeaveTypeRepositoryImpl implements LeaveTypeRepository {

	@NonNull
	private final EntityManager entityManager;

	@Override
	public List<LeaveType> getLeaveTypesByCarryForwardEnable(boolean carryForward, List<Long> employeeIdList) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();

		CriteriaQuery<LeaveType> criteriaQuery = criteriaBuilder.createQuery(LeaveType.class);
		Root<LeaveType> root = criteriaQuery.from(LeaveType.class);
		List<Predicate> predicates = new ArrayList<>();

		predicates.add(criteriaBuilder.equal(root.get(LeaveType_.IS_CARRY_FORWARD_ENABLED), carryForward));
		predicates.add(criteriaBuilder.equal(root.get(LeaveType_.IS_ACTIVE), Boolean.TRUE));

		if (employeeIdList != null && !employeeIdList.isEmpty())
			predicates.add(root.get(LeaveType_.TYPE_ID).in(employeeIdList));

		Predicate[] predArray = new Predicate[predicates.size()];
		predicates.toArray(predArray);
		criteriaQuery.where(predArray);

		TypedQuery<LeaveType> query = entityManager.createQuery(criteriaQuery);
		return query.getResultList();
	}

	@Override
	public List<LeaveType> getUsedUserLeaveTypes(Long userId, boolean isCarryForward) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();

		CriteriaQuery<LeaveType> criteriaQuery = cb.createQuery(LeaveType.class);
		Root<LeaveType> root = criteriaQuery.from(LeaveType.class);

		Subquery<Long> subquery = criteriaQuery.subquery(Long.class);
		Root<LeaveRequest> subRoot = subquery.from(LeaveRequest.class);
		subquery.select(subRoot.get(LeaveRequest_.leaveRequestId));
		subquery.where(
				cb.equal(subRoot.get(LeaveRequest_.leaveType).get(LeaveType_.typeId), root.get(LeaveType_.typeId)),
				cb.equal(subRoot.get(LeaveRequest_.employee).get(Employee_.employeeId), userId));

		List<Predicate> predicates = new ArrayList<>();
		predicates.add(cb.exists(subquery));
		predicates.add(cb.equal(root.get(LeaveType_.isActive), Boolean.TRUE));
		if (isCarryForward) {
			predicates.add(cb.equal(root.get(LeaveType_.isCarryForwardEnabled), Boolean.TRUE));
		}

		criteriaQuery.where(predicates.toArray(new Predicate[0]));

		return entityManager.createQuery(criteriaQuery).getResultList();
	}

}
