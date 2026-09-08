package com.skapp.community.leaveplanner.repository.impl;

import com.skapp.community.common.util.StringUtils;
import com.skapp.community.leaveplanner.model.EmployeeLeavePolicy;
import com.skapp.community.leaveplanner.model.EmployeeLeavePolicy_;
import com.skapp.community.leaveplanner.model.LeavePolicy;
import com.skapp.community.leaveplanner.model.LeavePolicy_;
import com.skapp.community.leaveplanner.model.PolicyLeaveType;
import com.skapp.community.leaveplanner.model.PolicyLeaveType_;
import com.skapp.community.leaveplanner.payload.LeavePolicyAssignedEmployeeCountDto;
import com.skapp.community.leaveplanner.payload.request.LeavePolicyFilterDto;
import com.skapp.community.leaveplanner.repository.LeavePolicyRepository;
import com.skapp.community.leaveplanner.type.EmployeeLeavePolicyStatus;
import com.skapp.community.leaveplanner.type.LeavePolicyStatus;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.Employee_;
import com.skapp.community.peopleplanner.type.AccountStatus;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Tuple;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class LeavePolicyRepositoryImpl implements LeavePolicyRepository {

	private final EntityManager entityManager;

	@Override
	public Page<LeavePolicyAssignedEmployeeCountDto> findLeavePolicies(LeavePolicyFilterDto filterDto,
			Pageable pageable) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();

		CriteriaQuery<Tuple> query = cb.createTupleQuery();
		Root<LeavePolicy> root = query.from(LeavePolicy.class);
		Join<LeavePolicy, PolicyLeaveType> leaveType = root.join(LeavePolicy_.leaveType, JoinType.LEFT);

		query.multiselect(root, leaveType, buildAssignedEmployeeCountSubquery(cb, query, root))
			.where(buildPredicates(cb, root, filterDto).toArray(new Predicate[0]));
		query.orderBy(cb.asc(cb.lower(root.get(LeavePolicy_.name))));

		TypedQuery<Tuple> typedQuery = entityManager.createQuery(query);
		if (pageable.isPaged()) {
			typedQuery.setFirstResult((int) pageable.getOffset());
			typedQuery.setMaxResults(pageable.getPageSize());
		}

		List<Tuple> results = typedQuery.getResultList();
		List<LeavePolicyAssignedEmployeeCountDto> content = new ArrayList<>();
		for (Tuple result : results) {
			content.add(new LeavePolicyAssignedEmployeeCountDto(result.get(0, LeavePolicy.class),
					result.get(2, Long.class)));
		}

		CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
		Root<LeavePolicy> countRoot = countQuery.from(LeavePolicy.class);
		countQuery.select(cb.count(countRoot))
			.where(buildPredicates(cb, countRoot, filterDto).toArray(new Predicate[0]));
		Long total = entityManager.createQuery(countQuery).getSingleResult();

		return new PageImpl<>(content, pageable, total);
	}

	@Override
	public List<LeavePolicy> findByNamesIgnoreCaseAndStatus(Set<String> names, LeavePolicyStatus status) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<LeavePolicy> query = cb.createQuery(LeavePolicy.class);
		Root<LeavePolicy> root = query.from(LeavePolicy.class);
		root.fetch(LeavePolicy_.leaveType, JoinType.LEFT);

		Predicate namePredicate = cb.lower(root.get(LeavePolicy_.name)).in(names);
		Predicate statusPredicate = cb.equal(root.get(LeavePolicy_.status), status);

		query.select(root).where(cb.and(namePredicate, statusPredicate)).distinct(true);
		return entityManager.createQuery(query).getResultList();
	}

	private Subquery<Long> buildAssignedEmployeeCountSubquery(CriteriaBuilder cb, CriteriaQuery<Tuple> query,
			Root<LeavePolicy> policyRoot) {
		Subquery<Long> subquery = query.subquery(Long.class);
		Root<EmployeeLeavePolicy> assignment = subquery.from(EmployeeLeavePolicy.class);
		Join<EmployeeLeavePolicy, Employee> employee = assignment.join(EmployeeLeavePolicy_.employee);

		subquery.select(cb.countDistinct(employee))
			.where(cb.equal(assignment.get(EmployeeLeavePolicy_.policy), policyRoot),
					cb.equal(assignment.get(EmployeeLeavePolicy_.status), EmployeeLeavePolicyStatus.ACTIVE),
					cb.not(employee.get(Employee_.ACCOUNT_STATUS).in(AccountStatus.TERMINATED, AccountStatus.DELETED)));

		return subquery;
	}

	private List<Predicate> buildPredicates(CriteriaBuilder cb, Root<LeavePolicy> root,
			LeavePolicyFilterDto filterDto) {
		List<Predicate> predicates = new ArrayList<>();

		String searchKeyword = filterDto.getSearchKeyword();
		if (searchKeyword != null && !searchKeyword.isBlank()) {
			String escaped = StringUtils.escapeLikePattern(searchKeyword.toLowerCase());
			predicates.add(cb.like(cb.lower(root.get(LeavePolicy_.name)), "%" + escaped + "%", '\\'));
		}

		if (filterDto.getLeaveTypeId() != null) {
			predicates
				.add(cb.equal(root.get(LeavePolicy_.leaveType).get(PolicyLeaveType_.id), filterDto.getLeaveTypeId()));
		}

		return predicates;
	}

}
