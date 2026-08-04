package com.skapp.community.leaveplanner.repository.impl;

import com.skapp.community.leaveplanner.model.LeavePolicy_;
import com.skapp.community.leaveplanner.model.PolicyLeaveRequest;
import com.skapp.community.leaveplanner.model.PolicyLeaveRequest_;
import com.skapp.community.leaveplanner.payload.request.PolicyLeaveRequestFilterDto;
import com.skapp.community.leaveplanner.repository.PolicyLeaveRequestRepository;
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
import org.springframework.data.jpa.repository.query.QueryUtils;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;

import java.time.LocalDate;
import java.util.ArrayList;
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
		criteriaQuery.where(buildPredicates(criteriaBuilder, root, employeeId, cycleStart, cycleEnd, filterDto)
			.toArray(new Predicate[0]));
		criteriaQuery.orderBy(QueryUtils.toOrders(pageable.getSort(), root, criteriaBuilder));

		TypedQuery<PolicyLeaveRequest> query = entityManager.createQuery(criteriaQuery);
		query.setFirstResult(pageable.getPageNumber() * pageable.getPageSize());
		query.setMaxResults(pageable.getPageSize());

		CriteriaQuery<Long> countQuery = criteriaBuilder.createQuery(Long.class);
		Root<PolicyLeaveRequest> countRoot = countQuery.from(PolicyLeaveRequest.class);
		countQuery.select(criteriaBuilder.count(countRoot));
		countQuery.where(buildPredicates(criteriaBuilder, countRoot, employeeId, cycleStart, cycleEnd, filterDto)
			.toArray(new Predicate[0]));
		long totalRows = entityManager.createQuery(countQuery).getSingleResult();

		return new PageImpl<>(query.getResultList(), pageable, totalRows);
	}

	private List<Predicate> buildPredicates(CriteriaBuilder criteriaBuilder, Root<PolicyLeaveRequest> root,
			Long employeeId, LocalDate cycleStart, LocalDate cycleEnd, PolicyLeaveRequestFilterDto filterDto) {
		List<Predicate> predicates = new ArrayList<>();

		// Scoped to the caller unconditionally — this endpoint never exposes another
		// employee's requests, whatever the caller's role.
		predicates.add(criteriaBuilder
			.equal(root.get(PolicyLeaveRequest_.EMPLOYEE).get(Employee_.EMPLOYEE_ID), employeeId));
		predicates.add(criteriaBuilder.between(root.get(PolicyLeaveRequest_.START_DATE), cycleStart, cycleEnd));

		if (!CollectionUtils.isEmpty(filterDto.getStatus())) {
			predicates.add(root.get(PolicyLeaveRequest_.STATUS).in(filterDto.getStatus()));
		}

		if (!CollectionUtils.isEmpty(filterDto.getPolicyId())) {
			predicates
				.add(root.get(PolicyLeaveRequest_.POLICY).get(LeavePolicy_.ID).in(filterDto.getPolicyId()));
		}

		return predicates;
	}

}
