package com.skapp.community.leaveplanner.repository.impl;

import com.skapp.community.common.model.User;
import com.skapp.community.common.model.User_;
import com.skapp.community.leaveplanner.model.LeavePolicy;
import com.skapp.community.leaveplanner.model.LeavePolicy_;
import com.skapp.community.leaveplanner.model.PolicyLeaveRequest;
import com.skapp.community.leaveplanner.model.PolicyLeaveRequest_;
import com.skapp.community.leaveplanner.model.PolicyLeaveType_;
import com.skapp.community.leaveplanner.payload.PolicyLeaveUsageDto;
import com.skapp.community.leaveplanner.payload.request.PolicyLeaveRequestFilterDto;
import com.skapp.community.leaveplanner.repository.PolicyLeaveRequestRepository;
import com.skapp.community.leaveplanner.type.LeaveRequestStatus;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.EmployeeManager;
import com.skapp.community.peopleplanner.model.EmployeeManager_;
import com.skapp.community.peopleplanner.model.Employee_;
import com.skapp.community.peopleplanner.type.AccountStatus;
import com.skapp.community.peopleplanner.util.PeopleUtil;
import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
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
import org.springframework.data.jpa.repository.query.QueryUtils;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

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
		fetchPolicy(root);
		root.fetch(PolicyLeaveRequest_.reviewer, JoinType.LEFT);

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
	public Page<PolicyLeaveRequest> findSupervisedRequests(Long supervisorEmployeeId,
			PolicyLeaveRequestFilterDto filterDto, Pageable pageable) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();

		CriteriaQuery<Long> countQuery = criteriaBuilder.createQuery(Long.class);
		Root<PolicyLeaveRequest> countRoot = countQuery.from(PolicyLeaveRequest.class);
		countQuery.select(criteriaBuilder.countDistinct(countRoot.get(PolicyLeaveRequest_.id)))
			.where(buildSupervisorPredicates(criteriaBuilder, countRoot, countRoot.join(PolicyLeaveRequest_.employee),
					supervisorEmployeeId, filterDto)
				.toArray(new Predicate[0]));
		long totalRows = entityManager.createQuery(countQuery).getSingleResult();

		if (totalRows == 0) {
			return new PageImpl<>(List.of(), pageable, 0);
		}

		CriteriaQuery<PolicyLeaveRequest> criteriaQuery = criteriaBuilder.createQuery(PolicyLeaveRequest.class);
		Root<PolicyLeaveRequest> root = criteriaQuery.from(PolicyLeaveRequest.class);
		fetchPolicy(root);
		root.fetch(PolicyLeaveRequest_.employee, JoinType.INNER);
		root.fetch(PolicyLeaveRequest_.reviewer, JoinType.LEFT);

		criteriaQuery.select(root)
			.distinct(true)
			.where(buildSupervisorPredicates(criteriaBuilder, root, root.join(PolicyLeaveRequest_.employee),
					supervisorEmployeeId, filterDto)
				.toArray(new Predicate[0]));
		criteriaQuery.orderBy(QueryUtils.toOrders(pageable.getSort(), root, criteriaBuilder));

		TypedQuery<PolicyLeaveRequest> query = entityManager.createQuery(criteriaQuery);
		if (pageable.isPaged()) {
			query.setFirstResult((int) pageable.getOffset());
			query.setMaxResults(pageable.getPageSize());
		}

		return new PageImpl<>(query.getResultList(), pageable, totalRows);
	}

	@Override
	public Optional<PolicyLeaveRequest> findByIdForUpdate(Long id) {
		return Optional.ofNullable(entityManager.find(PolicyLeaveRequest.class, id, LockModeType.PESSIMISTIC_WRITE));
	}

	@Override
	public List<PolicyLeaveUsageDto> findCommittedUsageForPolicyInWindow(Long employeeId, Long policyId,
			Collection<LeaveRequestStatus> statuses, LocalDate windowStart, LocalDate windowEnd) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();

		CriteriaQuery<PolicyLeaveUsageDto> criteriaQuery = criteriaBuilder.createQuery(PolicyLeaveUsageDto.class);
		Root<PolicyLeaveRequest> root = criteriaQuery.from(PolicyLeaveRequest.class);

		criteriaQuery
			.select(criteriaBuilder.construct(PolicyLeaveUsageDto.class, root.get(PolicyLeaveRequest_.startDate),
					root.get(PolicyLeaveRequest_.durationDays)))
			.where(criteriaBuilder.equal(root.get(PolicyLeaveRequest_.employee).get(Employee_.employeeId), employeeId),
					criteriaBuilder.equal(root.get(PolicyLeaveRequest_.policy).get(LeavePolicy_.id), policyId),
					root.get(PolicyLeaveRequest_.status).in(statuses),
					criteriaBuilder.between(root.get(PolicyLeaveRequest_.startDate), windowStart, windowEnd));

		return entityManager.createQuery(criteriaQuery).getResultList();
	}

	@Override
	public Map<Long, List<PolicyLeaveUsageDto>> findCommittedUsageForPoliciesInWindow(Long employeeId,
			Collection<Long> policyIds, Collection<LeaveRequestStatus> statuses, LocalDate windowStart,
			LocalDate windowEnd) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();

		CriteriaQuery<Tuple> criteriaQuery = criteriaBuilder.createTupleQuery();
		Root<PolicyLeaveRequest> root = criteriaQuery.from(PolicyLeaveRequest.class);
		Path<Long> policyId = root.get(PolicyLeaveRequest_.policy).get(LeavePolicy_.id);

		criteriaQuery
			.multiselect(policyId, root.get(PolicyLeaveRequest_.startDate), root.get(PolicyLeaveRequest_.durationDays))
			.where(criteriaBuilder.equal(root.get(PolicyLeaveRequest_.employee).get(Employee_.employeeId), employeeId),
					policyId.in(policyIds), root.get(PolicyLeaveRequest_.status).in(statuses),
					criteriaBuilder.between(root.get(PolicyLeaveRequest_.startDate), windowStart, windowEnd));

		Map<Long, List<PolicyLeaveUsageDto>> usagesByPolicyId = new HashMap<>();
		for (Tuple result : entityManager.createQuery(criteriaQuery).getResultList()) {
			usagesByPolicyId.computeIfAbsent(result.get(0, Long.class), key -> new ArrayList<>())
				.add(new PolicyLeaveUsageDto(result.get(1, LocalDate.class), result.get(2, Float.class)));
		}
		return usagesByPolicyId;
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

	private void fetchPolicy(Root<PolicyLeaveRequest> root) {
		Fetch<PolicyLeaveRequest, LeavePolicy> policy = root.fetch(PolicyLeaveRequest_.policy, JoinType.LEFT);
		policy.fetch(LeavePolicy_.leaveType, JoinType.LEFT);
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

	private List<Predicate> buildSupervisorPredicates(CriteriaBuilder criteriaBuilder, Root<PolicyLeaveRequest> root,
			Join<PolicyLeaveRequest, Employee> employee, Long supervisorEmployeeId,
			PolicyLeaveRequestFilterDto filterDto) {
		List<Predicate> predicates = new ArrayList<>();

		Join<Employee, User> user = employee.join(Employee_.user);
		Join<Employee, EmployeeManager> employeeManagers = employee.join(Employee_.employeeManagers);
		Join<EmployeeManager, Employee> supervisor = employeeManagers.join(EmployeeManager_.manager);

		predicates.add(criteriaBuilder.equal(user.get(User_.isActive), true));
		predicates.add(criteriaBuilder
			.not(employee.get(Employee_.ACCOUNT_STATUS).in(AccountStatus.TERMINATED, AccountStatus.DELETED)));
		predicates.add(criteriaBuilder.equal(supervisor.get(Employee_.employeeId), supervisorEmployeeId));

		if (!CollectionUtils.isEmpty(filterDto.getStatus())) {
			predicates.add(root.get(PolicyLeaveRequest_.status).in(filterDto.getStatus()));
		}

		if (!CollectionUtils.isEmpty(filterDto.getLeaveTypeId())) {
			predicates.add(root.get(PolicyLeaveRequest_.policy)
				.get(LeavePolicy_.leaveType)
				.get(PolicyLeaveType_.id)
				.in(filterDto.getLeaveTypeId()));
		}

		if (filterDto.getStartDate() != null) {
			predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get(PolicyLeaveRequest_.endDate),
					filterDto.getStartDate()));
		}

		if (filterDto.getEndDate() != null) {
			predicates.add(
					criteriaBuilder.lessThanOrEqualTo(root.get(PolicyLeaveRequest_.startDate), filterDto.getEndDate()));
		}

		if (filterDto.getSearchKeyword() != null && !filterDto.getSearchKeyword().trim().isEmpty()) {
			predicates.add(findByEmailName(filterDto.getSearchKeyword().trim(), criteriaBuilder, employee, user));
		}

		return predicates;
	}

	private Predicate findByEmailName(String keyword, CriteriaBuilder criteriaBuilder,
			Join<PolicyLeaveRequest, Employee> employee, Join<Employee, User> user) {
		String searchString = PeopleUtil.getSearchString(keyword);
		return criteriaBuilder.or(
				criteriaBuilder.like(criteriaBuilder
					.lower(criteriaBuilder.concat(criteriaBuilder.concat(employee.get(Employee_.FIRST_NAME), " "),
							employee.get(Employee_.LAST_NAME))),
						searchString),
				criteriaBuilder.like(criteriaBuilder.lower(user.get(User_.EMAIL)), searchString),
				criteriaBuilder.like(criteriaBuilder.lower(employee.get(Employee_.LAST_NAME)), searchString));
	}

}
