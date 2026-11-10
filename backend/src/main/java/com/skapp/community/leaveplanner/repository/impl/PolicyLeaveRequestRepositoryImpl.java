package com.skapp.community.leaveplanner.repository.impl;

import com.skapp.community.common.model.User;
import com.skapp.community.common.model.User_;
import com.skapp.community.common.model.WorkLocation;
import com.skapp.community.common.model.WorkLocation_;
import com.skapp.community.common.type.CriteriaBuilderSqlFunction;
import com.skapp.community.leaveplanner.model.LeavePolicy;
import com.skapp.community.leaveplanner.model.LeavePolicy_;
import com.skapp.community.leaveplanner.model.PolicyLeaveRequest;
import com.skapp.community.leaveplanner.model.PolicyLeaveRequest_;
import com.skapp.community.leaveplanner.model.PolicyLeaveType_;
import com.skapp.community.leaveplanner.payload.PolicyLeaveDateWindowDto;
import com.skapp.community.leaveplanner.payload.PolicyLeaveMonthlyDurationDto;
import com.skapp.community.leaveplanner.payload.PolicyLeaveSpanDto;
import com.skapp.community.leaveplanner.payload.PolicyLeaveUsageDto;
import com.skapp.community.leaveplanner.payload.request.PolicyLeaveHistoryFilterDto;
import com.skapp.community.leaveplanner.payload.request.PolicyLeaveRequestFilterDto;
import com.skapp.community.leaveplanner.repository.PolicyLeaveRequestRepository;
import com.skapp.community.leaveplanner.type.LeaveRequestStatus;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.EmployeeManager;
import com.skapp.community.peopleplanner.model.EmployeeManager_;
import com.skapp.community.peopleplanner.model.EmployeeRole;
import com.skapp.community.peopleplanner.model.EmployeeTeam;
import com.skapp.community.peopleplanner.model.EmployeeTeam_;
import com.skapp.community.peopleplanner.model.Employee_;
import com.skapp.community.peopleplanner.model.Team_;
import com.skapp.community.peopleplanner.type.AccountStatus;
import com.skapp.community.peopleplanner.util.PeopleUtil;
import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import jakarta.persistence.Tuple;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CompoundSelection;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Fetch;
import jakarta.persistence.criteria.From;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
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
	public Page<PolicyLeaveRequest> findLeaveHistory(Long teamId, Collection<Long> employeeIds, LocalDate startDate,
			LocalDate endDate, PolicyLeaveHistoryFilterDto filterDto, Pageable pageable) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();

		CriteriaQuery<Long> countQuery = criteriaBuilder.createQuery(Long.class);
		Root<PolicyLeaveRequest> countRoot = countQuery.from(PolicyLeaveRequest.class);
		countQuery.select(criteriaBuilder.count(countRoot))
			.where(buildLeaveHistoryPredicates(criteriaBuilder, countQuery, countRoot,
					countRoot.join(PolicyLeaveRequest_.employee), teamId, employeeIds, startDate, endDate, filterDto)
				.toArray(new Predicate[0]));
		long totalRows = entityManager.createQuery(countQuery).getSingleResult();

		if (totalRows == 0) {
			return new PageImpl<>(List.of(), pageable, 0);
		}

		CriteriaQuery<PolicyLeaveRequest> criteriaQuery = criteriaBuilder.createQuery(PolicyLeaveRequest.class);
		Root<PolicyLeaveRequest> root = criteriaQuery.from(PolicyLeaveRequest.class);
		fetchPolicy(root);
		Join<PolicyLeaveRequest, Employee> employee = (Join<PolicyLeaveRequest, Employee>) root
			.fetch(PolicyLeaveRequest_.employee, JoinType.INNER);

		criteriaQuery.select(root)
			.where(buildLeaveHistoryPredicates(criteriaBuilder, criteriaQuery, root, employee, teamId, employeeIds,
					startDate, endDate, filterDto)
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
			List<Long> policyIds, Collection<LeaveRequestStatus> statuses, LocalDate windowStart, LocalDate windowEnd) {
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

	@Override
	public long countSupervisedPendingRequests(Long supervisorEmployeeId, List<Long> teamIds) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();

		CriteriaQuery<Long> countQuery = criteriaBuilder.createQuery(Long.class);
		Root<PolicyLeaveRequest> root = countQuery.from(PolicyLeaveRequest.class);
		Join<PolicyLeaveRequest, Employee> employee = root.join(PolicyLeaveRequest_.employee);

		List<Predicate> predicates = buildSupervisionPredicates(criteriaBuilder, employee,
				employee.join(Employee_.user), supervisorEmployeeId);
		predicates.add(criteriaBuilder.equal(root.get(PolicyLeaveRequest_.status), LeaveRequestStatus.PENDING));

		if (!CollectionUtils.isEmpty(teamIds)) {
			Subquery<Long> teamMembers = countQuery.subquery(Long.class);
			Root<EmployeeTeam> employeeTeam = teamMembers.from(EmployeeTeam.class);
			teamMembers.select(employeeTeam.get(EmployeeTeam_.employee).get(Employee_.employeeId))
				.where(employeeTeam.get(EmployeeTeam_.team).get(Team_.teamId).in(teamIds));

			predicates.add(employee.get(Employee_.employeeId).in(teamMembers));
		}

		countQuery.select(criteriaBuilder.countDistinct(root.get(PolicyLeaveRequest_.id)))
			.where(predicates.toArray(new Predicate[0]));

		return entityManager.createQuery(countQuery).getSingleResult();
	}

	@Override
	public long countEmployeesOnApprovedLeaveOnDate(LocalDate date, List<Long> teamIds, Long supervisorEmployeeId) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();

		CriteriaQuery<Long> criteriaQuery = criteriaBuilder.createQuery(Long.class);
		Root<PolicyLeaveRequest> root = criteriaQuery.from(PolicyLeaveRequest.class);
		Join<PolicyLeaveRequest, Employee> employee = root.join(PolicyLeaveRequest_.employee);

		List<Predicate> predicates = buildEmployeeScopePredicates(criteriaBuilder, criteriaQuery, employee, teamIds,
				supervisorEmployeeId);
		predicates.add(criteriaBuilder.equal(root.get(PolicyLeaveRequest_.status), LeaveRequestStatus.APPROVED));
		predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get(PolicyLeaveRequest_.startDate), date));
		predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get(PolicyLeaveRequest_.endDate), date));

		criteriaQuery.select(criteriaBuilder.countDistinct(employee.get(Employee_.employeeId)))
			.where(predicates.toArray(new Predicate[0]));

		return entityManager.createQuery(criteriaQuery).getSingleResult();
	}

	@Override
	public long countEmployeesInScope(List<Long> teamIds, Long supervisorEmployeeId) {
		return countEmployeesInScope(teamIds, supervisorEmployeeId, false);
	}

	@Override
	public long countEmployeesInScope(List<Long> teamIds, Long supervisorEmployeeId, boolean includeOwnTeams) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();

		CriteriaQuery<Long> criteriaQuery = criteriaBuilder.createQuery(Long.class);
		Root<Employee> root = criteriaQuery.from(Employee.class);

		criteriaQuery.select(criteriaBuilder.countDistinct(root))
			.where(buildEmployeeScopePredicates(criteriaBuilder, criteriaQuery, root, teamIds, supervisorEmployeeId,
					includeOwnTeams)
				.toArray(new Predicate[0]));

		return entityManager.createQuery(criteriaQuery).getSingleResult();
	}

	@Override
	public List<PolicyLeaveRequest> findApprovedRequestsInRange(LocalDate startDate, LocalDate endDate,
			List<Long> teamIds, Long supervisorEmployeeId) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();

		CriteriaQuery<PolicyLeaveRequest> criteriaQuery = criteriaBuilder.createQuery(PolicyLeaveRequest.class);
		Root<PolicyLeaveRequest> root = criteriaQuery.from(PolicyLeaveRequest.class);
		fetchPolicy(root);
		root.fetch(PolicyLeaveRequest_.employee, JoinType.INNER);
		root.fetch(PolicyLeaveRequest_.reviewer, JoinType.LEFT);
		Join<PolicyLeaveRequest, Employee> employee = root.join(PolicyLeaveRequest_.employee);

		List<Predicate> predicates = buildEmployeeScopePredicates(criteriaBuilder, criteriaQuery, employee, teamIds,
				supervisorEmployeeId, true);
		predicates.add(criteriaBuilder.equal(root.get(PolicyLeaveRequest_.status), LeaveRequestStatus.APPROVED));
		predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get(PolicyLeaveRequest_.startDate), endDate));
		predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get(PolicyLeaveRequest_.endDate), startDate));

		criteriaQuery.select(root)
			.where(predicates.toArray(new Predicate[0]))
			.orderBy(criteriaBuilder.asc(root.get(PolicyLeaveRequest_.startDate)),
					criteriaBuilder.asc(root.get(PolicyLeaveRequest_.id)));

		return entityManager.createQuery(criteriaQuery).getResultList();
	}

	@Override
	public List<PolicyLeaveMonthlyDurationDto> findApprovedSingleMonthDurations(LocalDate startDate, LocalDate endDate,
			List<Long> leaveTypeIds, List<Long> teamIds, Long supervisorEmployeeId) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();

		CriteriaQuery<PolicyLeaveMonthlyDurationDto> criteriaQuery = criteriaBuilder
			.createQuery(PolicyLeaveMonthlyDurationDto.class);
		Root<PolicyLeaveRequest> root = criteriaQuery.from(PolicyLeaveRequest.class);
		Join<PolicyLeaveRequest, Employee> employee = root.join(PolicyLeaveRequest_.employee);
		Path<Long> leaveTypeId = root.get(PolicyLeaveRequest_.policy)
			.get(LeavePolicy_.leaveType)
			.get(PolicyLeaveType_.id);
		Expression<Integer> year = criteriaBuilder.function(CriteriaBuilderSqlFunction.YEAR.getFunctionName(),
				Integer.class, root.get(PolicyLeaveRequest_.startDate));
		Expression<Integer> month = criteriaBuilder.function(CriteriaBuilderSqlFunction.MONTH.getFunctionName(),
				Integer.class, root.get(PolicyLeaveRequest_.startDate));

		List<Predicate> predicates = buildApprovedLeaveInWindowPredicates(criteriaBuilder, criteriaQuery, root,
				employee, startDate, endDate, leaveTypeIds, teamIds, supervisorEmployeeId);
		predicates.add(singleMonthWithinWindowPredicate(criteriaBuilder, root, startDate, endDate));

		criteriaQuery
			.select(criteriaBuilder.construct(PolicyLeaveMonthlyDurationDto.class, leaveTypeId, year, month,
					criteriaBuilder.sumAsDouble(root.get(PolicyLeaveRequest_.durationDays))))
			.where(predicates.toArray(new Predicate[0]))
			.groupBy(leaveTypeId, year, month);

		return entityManager.createQuery(criteriaQuery).getResultList();
	}

	@Override
	public List<PolicyLeaveSpanDto> findApprovedMultiMonthSpans(LocalDate startDate, LocalDate endDate,
			List<Long> leaveTypeIds, List<Long> teamIds, Long supervisorEmployeeId) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();

		CriteriaQuery<PolicyLeaveSpanDto> criteriaQuery = criteriaBuilder.createQuery(PolicyLeaveSpanDto.class);
		Root<PolicyLeaveRequest> root = criteriaQuery.from(PolicyLeaveRequest.class);
		Join<PolicyLeaveRequest, Employee> employee = root.join(PolicyLeaveRequest_.employee);
		Join<Employee, WorkLocation> workLocation = employee.join(Employee_.workLocation, JoinType.LEFT);

		List<Predicate> predicates = buildApprovedLeaveInWindowPredicates(criteriaBuilder, criteriaQuery, root,
				employee, startDate, endDate, leaveTypeIds, teamIds, supervisorEmployeeId);
		predicates
			.add(criteriaBuilder.not(singleMonthWithinWindowPredicate(criteriaBuilder, root, startDate, endDate)));

		criteriaQuery
			.select(spanProjection(criteriaBuilder, root,
					root.get(PolicyLeaveRequest_.policy).get(LeavePolicy_.leaveType).get(PolicyLeaveType_.id),
					workLocation))
			.where(predicates.toArray(new Predicate[0]));

		return entityManager.createQuery(criteriaQuery).getResultList();
	}

	@Override
	public double sumApprovedDurationWithinWindow(LocalDate startDate, LocalDate endDate, List<Long> teamIds,
			Long supervisorEmployeeId) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();

		CriteriaQuery<Double> criteriaQuery = criteriaBuilder.createQuery(Double.class);
		Root<PolicyLeaveRequest> root = criteriaQuery.from(PolicyLeaveRequest.class);
		Join<PolicyLeaveRequest, Employee> employee = root.join(PolicyLeaveRequest_.employee);

		List<Predicate> predicates = buildApprovedLeaveInWindowPredicates(criteriaBuilder, criteriaQuery, root,
				employee, startDate, endDate, null, teamIds, supervisorEmployeeId);
		predicates.add(withinWindowPredicate(criteriaBuilder, root, startDate, endDate));

		criteriaQuery.select(criteriaBuilder.sumAsDouble(root.get(PolicyLeaveRequest_.durationDays)))
			.where(predicates.toArray(new Predicate[0]));

		Double durationDays = entityManager.createQuery(criteriaQuery).getSingleResult();
		return durationDays == null ? 0 : durationDays;
	}

	@Override
	public List<PolicyLeaveSpanDto> findApprovedSpansCrossingWindow(LocalDate startDate, LocalDate endDate,
			List<Long> teamIds, Long supervisorEmployeeId) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();

		CriteriaQuery<PolicyLeaveSpanDto> criteriaQuery = criteriaBuilder.createQuery(PolicyLeaveSpanDto.class);
		Root<PolicyLeaveRequest> root = criteriaQuery.from(PolicyLeaveRequest.class);
		Join<PolicyLeaveRequest, Employee> employee = root.join(PolicyLeaveRequest_.employee);
		Join<Employee, WorkLocation> workLocation = employee.join(Employee_.workLocation, JoinType.LEFT);

		List<Predicate> predicates = buildApprovedLeaveInWindowPredicates(criteriaBuilder, criteriaQuery, root,
				employee, startDate, endDate, null, teamIds, supervisorEmployeeId);
		predicates.add(criteriaBuilder.not(withinWindowPredicate(criteriaBuilder, root, startDate, endDate)));

		criteriaQuery
			.select(spanProjection(criteriaBuilder, root, criteriaBuilder.nullLiteral(Long.class), workLocation))
			.where(predicates.toArray(new Predicate[0]));

		return entityManager.createQuery(criteriaQuery).getResultList();
	}

	@Override
	public List<Employee> findEmployeesInScope(List<Long> teamIds, Long supervisorEmployeeId) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();

		CriteriaQuery<Employee> criteriaQuery = criteriaBuilder.createQuery(Employee.class);
		Root<Employee> root = criteriaQuery.from(Employee.class);
		root.fetch(Employee_.workLocation, JoinType.LEFT);

		criteriaQuery.select(root)
			.where(buildEmployeeScopePredicates(criteriaBuilder, criteriaQuery, root, teamIds, supervisorEmployeeId)
				.toArray(new Predicate[0]));

		return entityManager.createQuery(criteriaQuery).getResultList();
	}

	@Override
	public List<PolicyLeaveRequest> findEmployeesRequestsInRange(Collection<Long> employeeIds,
			Collection<LeaveRequestStatus> statuses, LocalDate startDate, LocalDate endDate, boolean activeUsersOnly) {
		if (CollectionUtils.isEmpty(employeeIds)) {
			return List.of();
		}

		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();

		CriteriaQuery<PolicyLeaveRequest> criteriaQuery = criteriaBuilder.createQuery(PolicyLeaveRequest.class);
		Root<PolicyLeaveRequest> root = criteriaQuery.from(PolicyLeaveRequest.class);
		fetchPolicy(root);

		List<Predicate> predicates = buildDateRangePredicates(criteriaBuilder, root, statuses, startDate, endDate);
		predicates.add(root.get(PolicyLeaveRequest_.employee).get(Employee_.employeeId).in(employeeIds));

		if (activeUsersOnly) {
			predicates.add(criteriaBuilder
				.isTrue(root.join(PolicyLeaveRequest_.employee).join(Employee_.user).get(User_.isActive)));
		}

		criteriaQuery.select(root).where(predicates.toArray(new Predicate[0]));

		return entityManager.createQuery(criteriaQuery).getResultList();
	}

	@Override
	public List<PolicyLeaveRequest> findTeamRequestsInRange(Long teamId, Collection<LeaveRequestStatus> statuses,
			LocalDate startDate, LocalDate endDate) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();

		CriteriaQuery<PolicyLeaveRequest> criteriaQuery = criteriaBuilder.createQuery(PolicyLeaveRequest.class);
		Root<PolicyLeaveRequest> root = criteriaQuery.from(PolicyLeaveRequest.class);
		fetchPolicy(root);
		Join<PolicyLeaveRequest, Employee> employee = root.join(PolicyLeaveRequest_.employee);

		Subquery<Long> teamMembers = criteriaQuery.subquery(Long.class);
		Root<EmployeeTeam> employeeTeam = teamMembers.from(EmployeeTeam.class);
		teamMembers.select(employeeTeam.get(EmployeeTeam_.employee).get(Employee_.employeeId))
			.where(criteriaBuilder.equal(employeeTeam.get(EmployeeTeam_.team).get(Team_.teamId), teamId));

		List<Predicate> predicates = buildDateRangePredicates(criteriaBuilder, root, statuses, startDate, endDate);
		predicates.add(criteriaBuilder.isTrue(employee.join(Employee_.user).get(User_.isActive)));
		predicates.add(employee.get(Employee_.employeeId).in(teamMembers));

		criteriaQuery.select(root).where(predicates.toArray(new Predicate[0]));

		return entityManager.createQuery(criteriaQuery).getResultList();
	}

	@Override
	public List<PolicyLeaveDateWindowDto> findUpcomingRequestDateWindows(Collection<LeaveRequestStatus> statuses,
			LocalDate fromDate) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();

		CriteriaQuery<PolicyLeaveDateWindowDto> criteriaQuery = criteriaBuilder
			.createQuery(PolicyLeaveDateWindowDto.class);
		Root<PolicyLeaveRequest> root = criteriaQuery.from(PolicyLeaveRequest.class);
		Join<PolicyLeaveRequest, Employee> employee = root.join(PolicyLeaveRequest_.employee);

		criteriaQuery
			.select(criteriaBuilder.construct(PolicyLeaveDateWindowDto.class, root.get(PolicyLeaveRequest_.startDate),
					root.get(PolicyLeaveRequest_.endDate)))
			.where(criteriaBuilder.isTrue(employee.join(Employee_.user).get(User_.isActive)),
					root.get(PolicyLeaveRequest_.status).in(statuses),
					criteriaBuilder.greaterThanOrEqualTo(root.get(PolicyLeaveRequest_.endDate), fromDate));

		return entityManager.createQuery(criteriaQuery).getResultList();
	}

	@Override
	public List<PolicyLeaveRequest> findUpcomingRequests(Collection<LeaveRequestStatus> statuses, LocalDate fromDate) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();

		CriteriaQuery<PolicyLeaveRequest> criteriaQuery = criteriaBuilder.createQuery(PolicyLeaveRequest.class);
		Root<PolicyLeaveRequest> root = criteriaQuery.from(PolicyLeaveRequest.class);
		fetchPolicy(root);
		Join<PolicyLeaveRequest, Employee> employee = (Join<PolicyLeaveRequest, Employee>) root
			.fetch(PolicyLeaveRequest_.employee, JoinType.INNER);
		Join<Employee, User> user = (Join<Employee, User>) employee.fetch(Employee_.user, JoinType.INNER);

		criteriaQuery.select(root)
			.where(criteriaBuilder.isTrue(user.get(User_.isActive)), root.get(PolicyLeaveRequest_.status).in(statuses),
					criteriaBuilder.greaterThanOrEqualTo(root.get(PolicyLeaveRequest_.endDate), fromDate));

		return entityManager.createQuery(criteriaQuery).getResultList();
	}

	private List<Predicate> buildApprovedLeaveInWindowPredicates(CriteriaBuilder criteriaBuilder,
			CriteriaQuery<?> criteriaQuery, Root<PolicyLeaveRequest> root, Join<PolicyLeaveRequest, Employee> employee,
			LocalDate startDate, LocalDate endDate, List<Long> leaveTypeIds, List<Long> teamIds,
			Long supervisorEmployeeId) {
		List<Predicate> predicates = buildEmployeeScopePredicates(criteriaBuilder, criteriaQuery, employee, teamIds,
				supervisorEmployeeId);
		predicates.add(criteriaBuilder.equal(root.get(PolicyLeaveRequest_.status), LeaveRequestStatus.APPROVED));
		predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get(PolicyLeaveRequest_.startDate), endDate));
		predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get(PolicyLeaveRequest_.endDate), startDate));

		if (!CollectionUtils.isEmpty(leaveTypeIds)) {
			predicates.add(root.get(PolicyLeaveRequest_.policy)
				.get(LeavePolicy_.leaveType)
				.get(PolicyLeaveType_.id)
				.in(leaveTypeIds));
		}

		return predicates;
	}

	private Predicate withinWindowPredicate(CriteriaBuilder criteriaBuilder, Root<PolicyLeaveRequest> root,
			LocalDate startDate, LocalDate endDate) {
		return criteriaBuilder.and(
				criteriaBuilder.greaterThanOrEqualTo(root.get(PolicyLeaveRequest_.startDate), startDate),
				criteriaBuilder.lessThanOrEqualTo(root.get(PolicyLeaveRequest_.endDate), endDate));
	}

	private CompoundSelection<PolicyLeaveSpanDto> spanProjection(CriteriaBuilder criteriaBuilder,
			Root<PolicyLeaveRequest> root, Expression<Long> leaveTypeId, Join<Employee, WorkLocation> workLocation) {
		return criteriaBuilder.construct(PolicyLeaveSpanDto.class, leaveTypeId, root.get(PolicyLeaveRequest_.startDate),
				root.get(PolicyLeaveRequest_.endDate), root.get(PolicyLeaveRequest_.durationDays),
				workLocation.get(WorkLocation_.workLocationId));
	}

	private Predicate singleMonthWithinWindowPredicate(CriteriaBuilder criteriaBuilder, Root<PolicyLeaveRequest> root,
			LocalDate startDate, LocalDate endDate) {
		Path<LocalDate> requestStart = root.get(PolicyLeaveRequest_.startDate);
		Path<LocalDate> requestEnd = root.get(PolicyLeaveRequest_.endDate);

		return criteriaBuilder.and(criteriaBuilder.greaterThanOrEqualTo(requestStart, startDate),
				criteriaBuilder.lessThanOrEqualTo(requestEnd, endDate),
				criteriaBuilder.equal(
						criteriaBuilder.function(CriteriaBuilderSqlFunction.YEAR.getFunctionName(), Integer.class,
								requestStart),
						criteriaBuilder.function(CriteriaBuilderSqlFunction.YEAR.getFunctionName(), Integer.class,
								requestEnd)),
				criteriaBuilder.equal(
						criteriaBuilder.function(CriteriaBuilderSqlFunction.MONTH.getFunctionName(), Integer.class,
								requestStart),
						criteriaBuilder.function(CriteriaBuilderSqlFunction.MONTH.getFunctionName(), Integer.class,
								requestEnd)));
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
		Join<Employee, User> user = employee.join(Employee_.user);
		List<Predicate> predicates = buildSupervisionPredicates(criteriaBuilder, employee, user, supervisorEmployeeId);

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

	private List<Predicate> buildLeaveHistoryPredicates(CriteriaBuilder criteriaBuilder, CriteriaQuery<?> criteriaQuery,
			Root<PolicyLeaveRequest> root, Join<PolicyLeaveRequest, Employee> employee, Long teamId,
			Collection<Long> employeeIds, LocalDate startDate, LocalDate endDate,
			PolicyLeaveHistoryFilterDto filterDto) {
		List<Predicate> predicates = buildEmployeeScopePredicates(criteriaBuilder, criteriaQuery, employee,
				teamId == null ? null : List.of(teamId), null);

		if (!CollectionUtils.isEmpty(employeeIds)) {
			predicates.add(employee.get(Employee_.employeeId).in(employeeIds));
		}

		predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get(PolicyLeaveRequest_.startDate), endDate));
		predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get(PolicyLeaveRequest_.endDate), startDate));

		if (!CollectionUtils.isEmpty(filterDto.getStatus())) {
			predicates.add(root.get(PolicyLeaveRequest_.status).in(filterDto.getStatus()));
		}

		if (!CollectionUtils.isEmpty(filterDto.getLeaveType())) {
			predicates.add(root.get(PolicyLeaveRequest_.policy)
				.get(LeavePolicy_.leaveType)
				.get(PolicyLeaveType_.id)
				.in(filterDto.getLeaveType()));
		}

		return predicates;
	}

	private List<Predicate> buildSupervisionPredicates(CriteriaBuilder criteriaBuilder,
			Join<PolicyLeaveRequest, Employee> employee, Join<Employee, User> user, Long supervisorEmployeeId) {
		List<Predicate> predicates = new ArrayList<>();

		Join<Employee, EmployeeManager> employeeManagers = employee.join(Employee_.employeeManagers);
		Join<EmployeeManager, Employee> supervisor = employeeManagers.join(EmployeeManager_.manager);

		predicates.add(criteriaBuilder.equal(user.get(User_.isActive), true));
		predicates.add(criteriaBuilder
			.not(employee.get(Employee_.ACCOUNT_STATUS).in(AccountStatus.TERMINATED, AccountStatus.DELETED)));
		predicates.add(criteriaBuilder.equal(supervisor.get(Employee_.employeeId), supervisorEmployeeId));

		return predicates;
	}

	private List<Predicate> buildEmployeeScopePredicates(CriteriaBuilder criteriaBuilder,
			CriteriaQuery<?> criteriaQuery, From<?, Employee> employee, List<Long> teamIds, Long supervisorEmployeeId) {
		return buildEmployeeScopePredicates(criteriaBuilder, criteriaQuery, employee, teamIds, supervisorEmployeeId,
				false);
	}

	private List<Predicate> buildEmployeeScopePredicates(CriteriaBuilder criteriaBuilder,
			CriteriaQuery<?> criteriaQuery, From<?, Employee> employee, List<Long> teamIds, Long supervisorEmployeeId,
			boolean includeOwnTeams) {
		List<Predicate> predicates = new ArrayList<>();

		Join<Employee, User> user = employee.join(Employee_.user);
		Join<Employee, EmployeeRole> employeeRole = employee.join(Employee_.employeeRole, JoinType.LEFT);

		predicates.add(criteriaBuilder.equal(user.get(User_.isActive), true));
		predicates.add(criteriaBuilder
			.not(employee.get(Employee_.ACCOUNT_STATUS).in(AccountStatus.TERMINATED, AccountStatus.DELETED)));
		predicates.add(PeopleUtil.notGuestEmployeePredicate(criteriaBuilder, employeeRole));

		if (!CollectionUtils.isEmpty(teamIds)) {
			Subquery<Long> teamMembers = criteriaQuery.subquery(Long.class);
			Root<EmployeeTeam> employeeTeam = teamMembers.from(EmployeeTeam.class);
			teamMembers.select(employeeTeam.get(EmployeeTeam_.employee).get(Employee_.employeeId))
				.where(employeeTeam.get(EmployeeTeam_.team).get(Team_.teamId).in(teamIds));

			predicates.add(employee.get(Employee_.employeeId).in(teamMembers));
		}

		if (supervisorEmployeeId != null) {
			Subquery<Long> managedEmployees = criteriaQuery.subquery(Long.class);
			Root<EmployeeManager> employeeManager = managedEmployees.from(EmployeeManager.class);
			managedEmployees.select(employeeManager.get(EmployeeManager_.employee).get(Employee_.employeeId))
				.where(criteriaBuilder.equal(employeeManager.get(EmployeeManager_.manager).get(Employee_.employeeId),
						supervisorEmployeeId));

			List<Predicate> scopePredicates = new ArrayList<>();
			scopePredicates.add(employee.get(Employee_.employeeId).in(managedEmployees));

			if (includeOwnTeams) {
				Subquery<Long> ownTeams = criteriaQuery.subquery(Long.class);
				Root<EmployeeTeam> memberTeam = ownTeams.from(EmployeeTeam.class);
				ownTeams.select(memberTeam.get(EmployeeTeam_.team).get(Team_.teamId))
					.where(criteriaBuilder.equal(memberTeam.get(EmployeeTeam_.employee).get(Employee_.employeeId),
							supervisorEmployeeId));

				Subquery<Long> ownTeamMembers = criteriaQuery.subquery(Long.class);
				Root<EmployeeTeam> ownTeamMember = ownTeamMembers.from(EmployeeTeam.class);
				ownTeamMembers.select(ownTeamMember.get(EmployeeTeam_.employee).get(Employee_.employeeId))
					.where(ownTeamMember.get(EmployeeTeam_.team).get(Team_.teamId).in(ownTeams));

				scopePredicates.add(employee.get(Employee_.employeeId).in(ownTeamMembers));
				scopePredicates.add(criteriaBuilder.equal(employee.get(Employee_.employeeId), supervisorEmployeeId));
			}
			else {
				Subquery<Long> supervisedTeams = criteriaQuery.subquery(Long.class);
				Root<EmployeeTeam> supervisorTeam = supervisedTeams.from(EmployeeTeam.class);
				supervisedTeams.select(supervisorTeam.get(EmployeeTeam_.team).get(Team_.teamId))
					.where(criteriaBuilder.equal(supervisorTeam.get(EmployeeTeam_.employee).get(Employee_.employeeId),
							supervisorEmployeeId),
							criteriaBuilder.isTrue(supervisorTeam.get(EmployeeTeam_.isSupervisor)));

				Subquery<Long> supervisedTeamMembers = criteriaQuery.subquery(Long.class);
				Root<EmployeeTeam> teamMember = supervisedTeamMembers.from(EmployeeTeam.class);
				supervisedTeamMembers.select(teamMember.get(EmployeeTeam_.employee).get(Employee_.employeeId))
					.where(teamMember.get(EmployeeTeam_.team).get(Team_.teamId).in(supervisedTeams));

				scopePredicates.add(employee.get(Employee_.employeeId).in(supervisedTeamMembers));
			}

			predicates.add(criteriaBuilder.or(scopePredicates.toArray(new Predicate[0])));
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

	private List<Predicate> buildDateRangePredicates(CriteriaBuilder criteriaBuilder, Root<PolicyLeaveRequest> root,
			Collection<LeaveRequestStatus> statuses, LocalDate startDate, LocalDate endDate) {
		List<Predicate> predicates = new ArrayList<>();

		predicates.add(root.get(PolicyLeaveRequest_.status).in(statuses));

		if (startDate != null) {
			predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get(PolicyLeaveRequest_.endDate), startDate));
		}

		if (endDate != null) {
			predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get(PolicyLeaveRequest_.startDate), endDate));
		}

		return predicates;
	}

}
