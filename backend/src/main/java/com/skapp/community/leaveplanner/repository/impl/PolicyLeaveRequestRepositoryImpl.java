package com.skapp.community.leaveplanner.repository.impl;

import com.skapp.community.leaveplanner.model.LeavePolicy_;
import com.skapp.community.leaveplanner.model.PolicyLeaveRequest;
import com.skapp.community.leaveplanner.model.PolicyLeaveRequest_;
import com.skapp.community.leaveplanner.payload.request.PolicyLeaveRequestFilterDto;
import com.skapp.community.leaveplanner.repository.PolicyLeaveRequestRepository;
import com.skapp.community.leaveplanner.type.LeaveRequestStatus;
import com.skapp.community.peopleplanner.model.Employee_;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.query.QueryUtils;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@Component
@RequiredArgsConstructor
public class PolicyLeaveRequestRepositoryImpl implements PolicyLeaveRequestRepository {

	private final EntityManager entityManager;

	@Override
	public Page<PolicyLeaveRequest> findMyRequests(Long employeeId, LocalDate cycleStart, LocalDate cycleEnd,
			PolicyLeaveRequestFilterDto filterDto, Pageable pageable) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();

		CriteriaQuery<PolicyLeaveRequest> criteriaQuery = criteriaBuilder.createQuery(PolicyLeaveRequest.class);
		Root<PolicyLeaveRequest> root = criteriaQuery.from(PolicyLeaveRequest.class);
		root.fetch(PolicyLeaveRequest_.policy, JoinType.LEFT).fetch(LeavePolicy_.leaveType, JoinType.LEFT);

		criteriaQuery.select(root)
			.where(buildPredicates(criteriaBuilder, root, employeeId, cycleStart, cycleEnd, filterDto)
				.toArray(new Predicate[0]));
		criteriaQuery.orderBy(QueryUtils.toOrders(pageable.getSort(), root, criteriaBuilder));

		TypedQuery<PolicyLeaveRequest> query = entityManager.createQuery(criteriaQuery);
		if (pageable.isPaged()) {
			query.setFirstResult((int) pageable.getOffset());
			query.setMaxResults(pageable.getPageSize());
		}

		CriteriaQuery<Long> countQuery = criteriaBuilder.createQuery(Long.class);
		Root<PolicyLeaveRequest> countRoot = countQuery.from(PolicyLeaveRequest.class);
		countQuery.select(criteriaBuilder.count(countRoot));
		countQuery.where(buildPredicates(criteriaBuilder, countRoot, employeeId, cycleStart, cycleEnd, filterDto)
			.toArray(new Predicate[0]));
		long totalRows = entityManager.createQuery(countQuery).getSingleResult();

		return new PageImpl<>(query.getResultList(), pageable, totalRows);
	}

	@Override
	public Double sumCommittedDaysForPolicyInCycle(Long employeeId, Long policyId,
			Collection<LeaveRequestStatus> statuses, LocalDate cycleStart, LocalDate cycleEnd) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();

		CriteriaQuery<Double> criteriaQuery = criteriaBuilder.createQuery(Double.class);
		Root<PolicyLeaveRequest> root = criteriaQuery.from(PolicyLeaveRequest.class);

		criteriaQuery.select(criteriaBuilder.sumAsDouble(root.get(PolicyLeaveRequest_.durationDays)))
			.where(criteriaBuilder.equal(root.get(PolicyLeaveRequest_.employee).get(Employee_.employeeId), employeeId),
					criteriaBuilder.equal(root.get(PolicyLeaveRequest_.policy).get(LeavePolicy_.id), policyId),
					root.get(PolicyLeaveRequest_.status).in(statuses),
					criteriaBuilder.between(root.get(PolicyLeaveRequest_.startDate), cycleStart, cycleEnd));

		return entityManager.createQuery(criteriaQuery).getSingleResult();
	}

	@Override
	public List<PolicyLeaveRequest> findOverlappingRequests(Long employeeId, Collection<LeaveRequestStatus> statuses,
			LocalDate startDate, LocalDate endDate) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();

		CriteriaQuery<PolicyLeaveRequest> criteriaQuery = criteriaBuilder.createQuery(PolicyLeaveRequest.class);
		Root<PolicyLeaveRequest> root = criteriaQuery.from(PolicyLeaveRequest.class);

		criteriaQuery.select(root)
			.where(criteriaBuilder.equal(root.get(PolicyLeaveRequest_.employee).get(Employee_.employeeId), employeeId),
					root.get(PolicyLeaveRequest_.status).in(statuses),
					criteriaBuilder.lessThanOrEqualTo(root.get(PolicyLeaveRequest_.startDate), endDate),
					criteriaBuilder.greaterThanOrEqualTo(root.get(PolicyLeaveRequest_.endDate), startDate));

		return entityManager.createQuery(criteriaQuery).getResultList();
	}

	private List<Predicate> buildPredicates(CriteriaBuilder criteriaBuilder, Root<PolicyLeaveRequest> root,
			Long employeeId, LocalDate cycleStart, LocalDate cycleEnd, PolicyLeaveRequestFilterDto filterDto) {
		List<Predicate> predicates = new ArrayList<>();

		predicates
			.add(criteriaBuilder.equal(root.get(PolicyLeaveRequest_.employee).get(Employee_.employeeId), employeeId));
		predicates.add(criteriaBuilder.between(root.get(PolicyLeaveRequest_.startDate), cycleStart, cycleEnd));

		if (!CollectionUtils.isEmpty(filterDto.getStatus())) {
			predicates.add(root.get(PolicyLeaveRequest_.status).in(filterDto.getStatus()));
		}

		if (!CollectionUtils.isEmpty(filterDto.getPolicyId())) {
			predicates.add(root.get(PolicyLeaveRequest_.policy).get(LeavePolicy_.id).in(filterDto.getPolicyId()));
		}

		return predicates;
	}

}
