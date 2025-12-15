package com.skapp.community.leaveplanner.repository.impl;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.skapp.community.common.model.Auditable_;
import com.skapp.community.common.model.OrganizationConfig;
import com.skapp.community.common.model.OrganizationConfig_;
import com.skapp.community.common.model.User;
import com.skapp.community.common.model.User_;
import com.skapp.community.common.type.CriteriaBuilderSqlFunction;
import com.skapp.community.common.type.CriteriaBuilderSqlLiteral;
import com.skapp.community.common.type.OrganizationConfigType;
import com.skapp.community.common.util.DateTimeUtils;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.community.leaveplanner.constant.LeaveMessageConstant;
import com.skapp.community.leaveplanner.constant.LeaveModuleConstant;
import com.skapp.community.leaveplanner.model.CarryForwardInfo;
import com.skapp.community.leaveplanner.model.CarryForwardInfo_;
import com.skapp.community.leaveplanner.model.LeaveEntitlement;
import com.skapp.community.leaveplanner.model.LeaveEntitlement_;
import com.skapp.community.leaveplanner.model.LeaveType;
import com.skapp.community.leaveplanner.model.LeaveType_;
import com.skapp.community.leaveplanner.payload.LeaveCycleDatesDto;
import com.skapp.community.leaveplanner.payload.LeaveEntitlementsFilterDto;
import com.skapp.community.leaveplanner.payload.LeaveReportDto;
import com.skapp.community.leaveplanner.payload.response.EmployeeCustomEntitlementReportExportDto;
import com.skapp.community.leaveplanner.payload.response.EmployeeCustomEntitlementResponseDto;
import com.skapp.community.leaveplanner.payload.response.EmployeeLeaveEntitlementReportExportDto;
import com.skapp.community.leaveplanner.repository.LeaveEntitlementRepository;
import com.skapp.community.leaveplanner.util.LeaveModuleUtil;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.EmployeeTeam;
import com.skapp.community.peopleplanner.model.EmployeeTeam_;
import com.skapp.community.peopleplanner.model.Employee_;
import com.skapp.community.peopleplanner.model.JobFamily;
import com.skapp.community.peopleplanner.model.JobFamily_;
import com.skapp.community.peopleplanner.model.Team;
import com.skapp.community.peopleplanner.model.Team_;
import com.skapp.community.peopleplanner.type.AccountStatus;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Tuple;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Order;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.query.QueryUtils;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static com.skapp.community.leaveplanner.model.LeaveType_.TYPE_ID;

@Component
@RequiredArgsConstructor
public class LeaveEntitlementRepositoryImpl implements LeaveEntitlementRepository {

	private final EntityManager entityManager;

	private final MessageUtil messageUtil;

	@Override
	public List<LeaveEntitlement> findEntitlementsByEmployeeIdAndYear(Long employeeId,
			LeaveEntitlementsFilterDto leaveEntitlementsFilterDto) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();

		CriteriaQuery<LeaveEntitlement> criteriaQuery = criteriaBuilder.createQuery(LeaveEntitlement.class);
		Root<LeaveEntitlement> root = criteriaQuery.from(LeaveEntitlement.class);

		root.fetch(LeaveEntitlement_.employee, JoinType.LEFT);
		root.fetch(LeaveEntitlement_.leaveType, JoinType.LEFT);

		List<Predicate> predicates = new ArrayList<>();
		predicates
			.add(criteriaBuilder.equal(root.get(LeaveEntitlement_.employee).get(Employee_.employeeId), employeeId));
		predicates.add(criteriaBuilder.equal(root.get(LeaveEntitlement_.isActive), true));

		if (leaveEntitlementsFilterDto.getLeaveTypeId() != null) {
			Join<LeaveEntitlement, LeaveType> leaveType = root.join(LeaveEntitlement_.leaveType);
			predicates.add(criteriaBuilder.equal(leaveType.get(LeaveType_.typeId),
					leaveEntitlementsFilterDto.getLeaveTypeId()));
		}

		if (Boolean.FALSE.equals(leaveEntitlementsFilterDto.getIsManual())) {
			predicates.add(criteriaBuilder.equal(root.get(LeaveEntitlement_.isManual), false));
		}

		setYearRangeFiltration(leaveEntitlementsFilterDto, criteriaBuilder, root, predicates);

		Predicate[] predArray = new Predicate[predicates.size()];
		predicates.toArray(predArray);
		criteriaQuery.where(predArray);

		criteriaQuery.select(root);
		TypedQuery<LeaveEntitlement> typedQuery = entityManager.createQuery(criteriaQuery);
		return typedQuery.getResultList();
	}

	@Override
	public List<LeaveEntitlement> findByIdAndIsActive(Long id) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();

		CriteriaQuery<LeaveEntitlement> criteriaQuery = criteriaBuilder.createQuery(LeaveEntitlement.class);
		Root<LeaveEntitlement> root = criteriaQuery.from(LeaveEntitlement.class);

		List<Predicate> predicates = new ArrayList<>();
		predicates.add(criteriaBuilder.equal(root.get(LeaveEntitlement_.entitlementId), id));
		predicates.add(criteriaBuilder.equal(root.get(LeaveEntitlement_.isActive), true));

		Predicate[] predArray = new Predicate[predicates.size()];
		predicates.toArray(predArray);
		criteriaQuery.where(predArray);

		criteriaQuery.select(root);
		TypedQuery<LeaveEntitlement> typedQuery = entityManager.createQuery(criteriaQuery);
		return typedQuery.getResultList();
	}

	@Override
	public List<LeaveEntitlement> findCustomLeavesById(Long id) {

		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
		CriteriaQuery<LeaveEntitlement> criteriaQuery = criteriaBuilder.createQuery(LeaveEntitlement.class);

		Root<LeaveEntitlement> root = criteriaQuery.from(LeaveEntitlement.class);
		Predicate predicate = criteriaBuilder.equal(root.get(LeaveEntitlement_.entitlementId), id);

		criteriaQuery.where(predicate);

		criteriaQuery.select(root);
		TypedQuery<LeaveEntitlement> typedQuery = entityManager.createQuery(criteriaQuery);
		return typedQuery.getResultList();
	}

	@Override
	public List<Employee> findAllEmployeeIdsWithForwardingEntitlements(Long leaveTypeId, boolean isActive,
			LocalDate leaveCycleEndDate) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
		CriteriaQuery<Employee> criteriaQuery = criteriaBuilder.createQuery(Employee.class);
		Root<LeaveEntitlement> root = criteriaQuery.from(LeaveEntitlement.class);

		List<Predicate> predicates = new ArrayList<>();
		predicates.add(criteriaBuilder.equal(root.get(LeaveEntitlement_.LEAVE_TYPE).get(TYPE_ID), leaveTypeId));
		predicates.add(criteriaBuilder.equal(root.get(LeaveEntitlement_.isActive), isActive));
		predicates.add(criteriaBuilder.equal(root.get(LeaveEntitlement_.validTo), leaveCycleEndDate));
		predicates.add(criteriaBuilder.greaterThan(root.get(LeaveEntitlement_.totalDaysAllocated),
				root.get(LeaveEntitlement_.totalDaysUsed)));

		Predicate[] predArray = new Predicate[predicates.size()];
		predicates.toArray(predArray);
		criteriaQuery.where(predArray);
		criteriaQuery.select(root.get(LeaveEntitlement_.employee)).distinct(true);

		TypedQuery<Employee> typedQuery = entityManager.createQuery(criteriaQuery);
		return typedQuery.getResultList();
	}

	@Override
	public List<LeaveEntitlement> findLeaveEntitlements(Long leaveTypeId, boolean isActive, LocalDate leaveCycleEndDate,
			Long employeeId) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
		CriteriaQuery<LeaveEntitlement> criteriaQuery = criteriaBuilder.createQuery(LeaveEntitlement.class);
		Root<LeaveEntitlement> root = criteriaQuery.from(LeaveEntitlement.class);
		Join<LeaveEntitlement, Employee> employeeJoin = root.join(LeaveEntitlement_.employee);

		List<Predicate> predicates = new ArrayList<>();
		predicates.add(criteriaBuilder.equal(root.get(LeaveEntitlement_.LEAVE_TYPE).get(TYPE_ID), leaveTypeId));
		predicates.add(criteriaBuilder.equal(root.get(LeaveEntitlement_.isActive), isActive));
		predicates.add(criteriaBuilder.equal(root.get(LeaveEntitlement_.validTo), leaveCycleEndDate));
		predicates.add(criteriaBuilder.equal(employeeJoin.get(Employee_.employeeId), employeeId));
		predicates.add(criteriaBuilder.greaterThan(root.get(LeaveEntitlement_.totalDaysAllocated),
				root.get(LeaveEntitlement_.totalDaysUsed)));

		Predicate[] predArray = new Predicate[predicates.size()];
		predicates.toArray(predArray);
		criteriaQuery.where(predArray);

		TypedQuery<LeaveEntitlement> typedQuery = entityManager.createQuery(criteriaQuery);
		return typedQuery.getResultList();
	}

	@Override
	public Page<LeaveEntitlement> findLeaveEntitlementsByLeaveTypesAndActiveState(List<Long> leaveTypeIds,
			boolean isActive, LocalDate leaveCycleEndDate, Pageable page) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
		CriteriaQuery<LeaveEntitlement> criteriaQuery = criteriaBuilder.createQuery(LeaveEntitlement.class);
		Root<LeaveEntitlement> root = criteriaQuery.from(LeaveEntitlement.class);
		Join<LeaveEntitlement, LeaveType> leaveTypeJoin = root.join(LeaveEntitlement_.leaveType);
		Join<LeaveType, CarryForwardInfo> carryForwardInfoJoin = leaveTypeJoin.join(LeaveType_.carryForwardInfos,
				JoinType.LEFT);

		List<Predicate> predicates = getLeaveCarryForwardPredicates(criteriaBuilder, root, carryForwardInfoJoin,
				leaveTypeIds, isActive, leaveCycleEndDate);
		Page<Long> employeeIdsForCarryFoward = getPagedEmployeeIdsForCarryFoward(leaveTypeIds, isActive,
				leaveCycleEndDate, page);

		predicates.add(root.get(LeaveEntitlement_.employee)
			.get(Employee_.employeeId)
			.in(employeeIdsForCarryFoward.getContent()));
		Predicate[] predArray = new Predicate[predicates.size()];
		predicates.toArray(predArray);
		criteriaQuery.where(predArray);

		TypedQuery<LeaveEntitlement> query = entityManager.createQuery(criteriaQuery);
		int totalRows = query.getResultList().size();
		query.setFirstResult(page.getPageNumber() * page.getPageSize());
		query.setMaxResults(page.getPageSize());
		return new PageImpl<>(query.getResultList(), page, totalRows);
	}

	@Override
	public Page<LeaveEntitlement> findAllCustomEntitlements(String search, Pageable page, int year,
			List<Long> leaveTypeIds) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();

		CriteriaQuery<LeaveEntitlement> criteriaQuery = criteriaBuilder.createQuery(LeaveEntitlement.class);
		Root<LeaveEntitlement> root = criteriaQuery.from(LeaveEntitlement.class);
		Join<LeaveEntitlement, Employee> employeeJoin = root.join(LeaveEntitlement_.employee);

		List<Predicate> predicates = new ArrayList<>();
		predicates.add(criteriaBuilder.equal(root.get(LeaveEntitlement_.isManual), true));

		if (search != null) {
			predicates.add(
					criteriaBuilder.or(
							criteriaBuilder.like(
									criteriaBuilder
										.lower(root.get(LeaveEntitlement_.EMPLOYEE).get(Employee_.FIRST_NAME)),
									search.toLowerCase() + "%"),
							criteriaBuilder.like(
									criteriaBuilder
										.lower(root.get(LeaveEntitlement_.EMPLOYEE).get(Employee_.LAST_NAME)),
									search.toLowerCase() + "%"),
							criteriaBuilder.like(
									criteriaBuilder.lower(
											criteriaBuilder.concat(
													criteriaBuilder.concat(root.get(LeaveEntitlement_.EMPLOYEE)
														.get(Employee_.FIRST_NAME), " "),
													root.get(LeaveEntitlement_.EMPLOYEE).get(Employee_.LAST_NAME))),
									search.toLowerCase() + "%")

					));
		}

		if (year > 0) {
			predicates.add(criteriaBuilder.or(
					criteriaBuilder.equal(criteriaBuilder.function(CriteriaBuilderSqlFunction.YEAR.getFunctionName(),
							Integer.class, root.get(LeaveEntitlement_.validFrom)), year),
					criteriaBuilder.equal(criteriaBuilder.function(CriteriaBuilderSqlFunction.YEAR.getFunctionName(),
							Integer.class, root.get(LeaveEntitlement_.validTo)), year)));
		}

		if (leaveTypeIds != null && !leaveTypeIds.isEmpty()) {
			predicates.add(root.get(LeaveEntitlement_.leaveType).get(LeaveType_.typeId).in(leaveTypeIds));
		}

		Predicate[] predArray = new Predicate[predicates.size()];
		predicates.toArray(predArray);
		criteriaQuery.where(predArray);
		if (search != null) {
			criteriaQuery.orderBy(
					criteriaBuilder.asc(criteriaBuilder.selectCase()
						.when(criteriaBuilder.like(criteriaBuilder.lower(employeeJoin.get(Employee_.FIRST_NAME)),
								search.toLowerCase() + "%"), 1)
						.when(criteriaBuilder.like(criteriaBuilder.lower(employeeJoin.get(Employee_.LAST_NAME)),
								search.toLowerCase() + "%"), 2)
						.otherwise(3)),
					criteriaBuilder.asc(root.get(LeaveEntitlement_.EMPLOYEE).get(Employee_.FIRST_NAME)),
					criteriaBuilder.asc(root.get(LeaveEntitlement_.EMPLOYEE).get(Employee_.LAST_NAME)),
					criteriaBuilder.asc(root.get(Auditable_.CREATED_DATE)));
		}
		else {
			criteriaQuery.orderBy(criteriaBuilder.asc(root.get(LeaveEntitlement_.EMPLOYEE).get(Employee_.FIRST_NAME)),
					criteriaBuilder.asc(root.get(LeaveEntitlement_.EMPLOYEE).get(Employee_.LAST_NAME)),
					criteriaBuilder.asc(root.get(Auditable_.CREATED_DATE)));
		}

		TypedQuery<LeaveEntitlement> query = entityManager.createQuery(criteriaQuery);
		int totalRows = query.getResultList().size();
		query.setFirstResult(page.getPageNumber() * page.getPageSize());
		query.setMaxResults(page.getPageSize());
		return new PageImpl<>(query.getResultList(), page, totalRows);
	}

	@Override
	public Float findAllEmployeesAnnualEntitlementDaysByDateRangeQuery(Long leaveTypeId, LocalDate startDate,
			LocalDate endDate) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();

		CriteriaQuery<Float> criteriaQuery = criteriaBuilder.createQuery(Float.class);
		Root<LeaveEntitlement> root = criteriaQuery.from(LeaveEntitlement.class);
		Join<LeaveEntitlement, Employee> employee = root.join(LeaveEntitlement_.employee);
		Join<Employee, User> user = employee.join(Employee_.user);

		List<Predicate> predicates = new ArrayList<>();

		predicates.add(criteriaBuilder.equal(user.get(User_.isActive), true));
		predicates.add(criteriaBuilder
			.not(employee.get(Employee_.ACCOUNT_STATUS).in(AccountStatus.TERMINATED, AccountStatus.DELETED)));
		predicates.add(criteriaBuilder.equal(root.get(LeaveEntitlement_.isActive), true));
		predicates.add(criteriaBuilder.equal(root.get(LeaveEntitlement_.LEAVE_TYPE).get(TYPE_ID), leaveTypeId));
		predicates
			.add(criteriaBuilder.and(criteriaBuilder.lessThanOrEqualTo(root.get(LeaveEntitlement_.validFrom), endDate),
					criteriaBuilder.greaterThanOrEqualTo(root.get(LeaveEntitlement_.validTo), startDate)));

		Predicate[] predArray = new Predicate[predicates.size()];
		predicates.toArray(predArray);
		criteriaQuery.where(predArray);
		criteriaQuery.multiselect(
				criteriaBuilder.coalesce(criteriaBuilder.sum(root.get(LeaveEntitlement_.totalDaysAllocated)), 0));

		TypedQuery<Float> typedQuery = entityManager.createQuery(criteriaQuery);
		return typedQuery.getSingleResult();
	}

	@Override
	public LinkedHashMap<LeaveType, Long> findLeaveTypeAndEmployeeCountForTeam(@NotNull Long teamId) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
		CriteriaQuery<Tuple> criteriaQuery = criteriaBuilder.createTupleQuery();
		Root<LeaveEntitlement> root = criteriaQuery.from(LeaveEntitlement.class);
		Join<LeaveEntitlement, Employee> employee = root.join(LeaveEntitlement_.employee);
		Join<Employee, EmployeeTeam> employeeTeam = employee.join(Employee_.employeeTeams);
		Join<Employee, User> user = employee.join(Employee_.user);

		List<Predicate> predicates = getTeamLeaveSummaryPredicates(criteriaBuilder, root, user, employeeTeam, teamId);

		Predicate[] predArray = new Predicate[predicates.size()];
		predicates.toArray(predArray);
		criteriaQuery.where(predArray);
		criteriaQuery.multiselect(root.get(LeaveEntitlement_.leaveType), criteriaBuilder.countDistinct(employee));
		criteriaQuery.groupBy(root.get(LeaveEntitlement_.leaveType));

		TypedQuery<Tuple> typedQuery = entityManager.createQuery(criteriaQuery);
		List<Tuple> results = typedQuery.getResultList();

		LinkedHashMap<LeaveType, Long> leaveTypeIdEmployeeCountMap = new LinkedHashMap<>();
		for (Tuple result : results) {
			LeaveType leaveType = result.get(0, LeaveType.class);
			Long employeeCount = result.get(1, Long.class);
			leaveTypeIdEmployeeCountMap.put(leaveType, employeeCount);
		}
		return leaveTypeIdEmployeeCountMap;
	}

	@Override
	public Map<Long, Double> findLeaveTypeIdAllocatedLeaveDaysForTeam(@NotNull Long teamId) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
		CriteriaQuery<Tuple> criteriaQuery = criteriaBuilder.createTupleQuery();
		Root<LeaveEntitlement> root = criteriaQuery.from(LeaveEntitlement.class);
		Join<LeaveEntitlement, Employee> employee = root.join(LeaveEntitlement_.employee);
		Join<Employee, EmployeeTeam> employeeTeam = employee.join(Employee_.employeeTeams);
		Join<Employee, User> user = employee.join(Employee_.user);

		List<Predicate> predicates = getTeamLeaveSummaryPredicates(criteriaBuilder, root, user, employeeTeam, teamId);

		Predicate[] predArray = new Predicate[predicates.size()];
		predicates.toArray(predArray);
		criteriaQuery.where(predArray);
		criteriaQuery.multiselect(root.get(LeaveEntitlement_.leaveType).get(TYPE_ID),
				criteriaBuilder.sum(root.get(LeaveEntitlement_.totalDaysAllocated).as(Double.class)));
		criteriaQuery.groupBy(root.get(LeaveEntitlement_.leaveType).get(TYPE_ID));

		TypedQuery<Tuple> typedQuery = entityManager.createQuery(criteriaQuery);
		List<Tuple> results = typedQuery.getResultList();

		Map<Long, Double> leaveTypeIdAllocatedDaysMap = new HashMap<>();
		for (Tuple result : results) {
			Long leaveTypeId = result.get(0, Long.class);
			Double allocatedDaysCount = result.get(1, Double.class);
			leaveTypeIdAllocatedDaysMap.put(leaveTypeId, allocatedDaysCount);
		}
		return leaveTypeIdAllocatedDaysMap;
	}

	public List<LeaveEntitlement> findAllByEmployeeId(Long employeeId,
			@NotNull LeaveEntitlementsFilterDto leaveEntitlementsFilterDto) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
		CriteriaQuery<LeaveEntitlement> criteriaQuery = criteriaBuilder.createQuery(LeaveEntitlement.class);
		Root<LeaveEntitlement> root = criteriaQuery.from(LeaveEntitlement.class);
		root.join(LeaveEntitlement_.EMPLOYEE, JoinType.LEFT);
		Join<LeaveEntitlement, LeaveType> leaveType = root.join(LeaveEntitlement_.LEAVE_TYPE, JoinType.LEFT);
		List<Predicate> predicates = new ArrayList<>();
		predicates
			.add(criteriaBuilder.equal(root.get(LeaveEntitlement_.EMPLOYEE).get(Employee_.EMPLOYEE_ID), employeeId));
		predicates.add(criteriaBuilder.equal(root.get(LeaveEntitlement_.IS_ACTIVE), true));
		if (leaveEntitlementsFilterDto.getLeaveTypeId() != null) {
			predicates.add(criteriaBuilder.equal(leaveType.get(LeaveType_.TYPE_ID),
					leaveEntitlementsFilterDto.getLeaveTypeId()));
		}
		if (Boolean.FALSE.equals(leaveEntitlementsFilterDto.getIsManual())) {
			predicates.add(criteriaBuilder.equal(root.get(LeaveEntitlement_.IS_MANUAL), false));
		}
		setDateRangeFiltration(leaveEntitlementsFilterDto, criteriaBuilder, root, predicates);
		criteriaQuery.where(predicates.toArray(new Predicate[0]));
		criteriaQuery.select(root);
		criteriaQuery.orderBy(QueryUtils.toOrders(Sort.by(Sort.Direction.ASC, "name"), leaveType, criteriaBuilder));
		TypedQuery<LeaveEntitlement> typedQuery = entityManager.createQuery(criteriaQuery);
		return typedQuery.getResultList();
	}

	@Override
	public List<LeaveReportDto> getEmployeeDetailsWithLeaveEntitlements(List<Long> leaveTypeIds, LocalDate startDate,
			LocalDate endDate, Long jobFamilyId, Long teamId, Pageable pageable, List<Long> employeeIds) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
		CriteriaQuery<LeaveReportDto> criteriaQuery = criteriaBuilder.createQuery(LeaveReportDto.class);
		Root<LeaveEntitlement> root = criteriaQuery.from(LeaveEntitlement.class);
		Join<LeaveEntitlement, Employee> employeeJoin = root.join(LeaveEntitlement_.employee);
		Join<Employee, User> user = employeeJoin.join(Employee_.user);

		List<Predicate> predicates = new ArrayList<>();
		CriteriaBuilder.In<Long> inClauseIds = criteriaBuilder
			.in(root.get(LeaveEntitlement_.EMPLOYEE).get(Employee_.EMPLOYEE_ID));
		for (Long id : employeeIds) {
			inClauseIds.value(id);
		}
		predicates.add(inClauseIds);

		if (!leaveTypeIds.isEmpty()) {

			CriteriaBuilder.In<Long> inClause = criteriaBuilder
				.in(root.get(LeaveEntitlement_.LEAVE_TYPE).get(LeaveType_.TYPE_ID));
			for (Long leaveTypeID : leaveTypeIds) {
				inClause.value(leaveTypeID);
			}
			predicates.add(inClause);
		}
		predicates.add(criteriaBuilder.equal(user.get(User_.isActive), true));
		if (teamId != null) {
			Join<Employee, EmployeeTeam> employeeTeam = employeeJoin.join(Employee_.employeeTeams);
			predicates.add(criteriaBuilder.equal(employeeTeam.get(EmployeeTeam_.team).get(Team_.teamId), teamId));
		}
		if (jobFamilyId != null) {
			predicates.add(criteriaBuilder.equal(employeeJoin.get(Employee_.JOB_FAMILY).get(JobFamily_.JOB_FAMILY_ID),
					jobFamilyId));
		}
		predicates.add(criteriaBuilder.equal(root.get(LeaveEntitlement_.isActive), true));
		predicates
			.add(criteriaBuilder.and(criteriaBuilder.lessThanOrEqualTo(root.get(LeaveEntitlement_.validFrom), endDate),
					criteriaBuilder.greaterThanOrEqualTo(root.get(LeaveEntitlement_.validTo), startDate)));

		Predicate[] predArray = new Predicate[predicates.size()];
		predicates.toArray(predArray);
		criteriaQuery.where(predArray);
		criteriaQuery.multiselect(employeeJoin.get(Employee_.employeeId), employeeJoin.get(Employee_.firstName),
				employeeJoin.get(Employee_.lastName), employeeJoin.get(Employee_.authPic),
				root.get(LeaveEntitlement_.LEAVE_TYPE).get(LeaveType_.TYPE_ID),
				criteriaBuilder.coalesce(criteriaBuilder.sum(root.get(LeaveEntitlement_.totalDaysAllocated)), 0),
				criteriaBuilder.coalesce(criteriaBuilder.sum(root.get(LeaveEntitlement_.totalDaysUsed)), 0),
				criteriaBuilder.diff(
						criteriaBuilder.coalesce(criteriaBuilder.sum(root.get(LeaveEntitlement_.totalDaysAllocated)),
								0),
						criteriaBuilder.coalesce(criteriaBuilder.sum(root.get(LeaveEntitlement_.totalDaysUsed)), 0)));
		criteriaQuery.groupBy(employeeJoin.get(Employee_.employeeId), employeeJoin.get(Employee_.firstName),
				employeeJoin.get(Employee_.lastName), employeeJoin.get(Employee_.authPic),
				root.get(LeaveEntitlement_.LEAVE_TYPE).get(LeaveType_.TYPE_ID));
		criteriaQuery.orderBy(QueryUtils.toOrders(pageable.getSort(), employeeJoin, criteriaBuilder));

		TypedQuery<LeaveReportDto> typedQuery = entityManager.createQuery(criteriaQuery);
		return typedQuery.getResultList();
	}

	@Override
	public List<LeaveEntitlement> getEmployeeLeaveBalanceForLeaveType(Long employeeId, Long typeId) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
		CriteriaQuery<LeaveEntitlement> criteriaQuery = criteriaBuilder.createQuery(LeaveEntitlement.class);

		Root<LeaveEntitlement> root = criteriaQuery.from(LeaveEntitlement.class);

		List<Predicate> predicates = new ArrayList<>();
		predicates
			.add(criteriaBuilder.equal(root.get(LeaveEntitlement_.employee).get(Employee_.employeeId), employeeId));
		predicates.add(criteriaBuilder.equal(root.get(LeaveEntitlement_.isActive), true));
		predicates.add(criteriaBuilder.equal(root.get(LeaveEntitlement_.LEAVE_TYPE).get(TYPE_ID), typeId));

		LeaveCycleDatesDto leaveCycleDatesDto = leaveCycleStartAndEndDates();
		Predicate dateBetween = criteriaBuilder.and(
				criteriaBuilder.between(root.get(LeaveEntitlement_.validFrom), leaveCycleDatesDto.getCycleStartDate(),
						leaveCycleDatesDto.getCycleEndDate()),
				criteriaBuilder.between(root.get(LeaveEntitlement_.validTo), leaveCycleDatesDto.getCycleStartDate(),
						leaveCycleDatesDto.getCycleEndDate()));
		predicates.add(dateBetween);

		Predicate[] predArray = new Predicate[predicates.size()];
		predicates.toArray(predArray);
		criteriaQuery.where(predArray);

		TypedQuery<LeaveEntitlement> typedQuery = entityManager.createQuery(criteriaQuery);
		return typedQuery.getResultList();
	}

	private List<Predicate> createPredicatesForLeaveEntitlement(CriteriaBuilder cb,
			Root<LeaveEntitlement> leaveEntitlement, Join<LeaveEntitlement, Employee> employee,
			Join<Employee, User> user, Join<LeaveEntitlement, LeaveType> leaveType, Join<Employee, JobFamily> jobFamily,
			Join<EmployeeTeam, Team> team, List<Long> leaveTypeIds, LocalDate startDate, LocalDate endDate,
			Long jobFamilyId, Long teamId) {
		List<Predicate> predicates = new ArrayList<>();
		predicates.add(cb.equal(user.get(User_.isActive), true));
		predicates.add(cb.equal(leaveEntitlement.get(LeaveEntitlement_.isActive), true));
		predicates.add(cb.equal(leaveEntitlement.get(LeaveEntitlement_.isManual), true));
		predicates.add(cb.equal(leaveType.get(LeaveType_.isActive), true));
		predicates.add(cb.lessThanOrEqualTo(leaveEntitlement.get(LeaveEntitlement_.validFrom), endDate));
		predicates.add(cb.greaterThanOrEqualTo(leaveEntitlement.get(LeaveEntitlement_.validTo), startDate));

		if (leaveTypeIds != null && !leaveTypeIds.isEmpty() && !leaveTypeIds.contains(-1L)) {
			predicates.add(leaveType.get(LeaveType_.typeId).in(leaveTypeIds));
		}

		if (team != null && teamId != null && teamId != -1) {
			Join<Employee, EmployeeTeam> empTeam = employee.join(Employee_.employeeTeams);
			Join<EmployeeTeam, Team> mainTeam = empTeam.join(EmployeeTeam_.team);
			predicates.add(cb.equal(mainTeam.get(Team_.teamId), teamId));
		}

		if (jobFamilyId != null && jobFamilyId != -1) {
			predicates.add(cb.equal(jobFamily.get(JobFamily_.jobFamilyId), jobFamilyId));
		}

		return predicates;
	}

	@Override
	public List<EmployeeCustomEntitlementReportExportDto> generateEmployeeCustomEntitlementDetailedReport(
			List<Long> leaveTypeIds, LocalDate startDate, LocalDate endDate, Long jobFamilyId, Long teamId) {

		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<EmployeeCustomEntitlementReportExportDto> query = cb
			.createQuery(EmployeeCustomEntitlementReportExportDto.class);

		Root<LeaveEntitlement> leaveEntitlement = query.from(LeaveEntitlement.class);
		Join<LeaveEntitlement, Employee> employee = leaveEntitlement.join(LeaveEntitlement_.employee);
		Join<Employee, User> user = employee.join(Employee_.user);
		Join<LeaveEntitlement, LeaveType> leaveType = leaveEntitlement.join(LeaveEntitlement_.leaveType);
		Join<Employee, JobFamily> jobFamily = employee.join(Employee_.jobFamily, JoinType.LEFT);
		Join<Employee, EmployeeTeam> employeeTeam = employee.join(Employee_.employeeTeams, JoinType.LEFT);
		Join<EmployeeTeam, Team> team = employeeTeam.join(EmployeeTeam_.team, JoinType.LEFT);

		Expression<String> employeeName = cb.concat(cb.concat(employee.get(Employee_.firstName), cb.literal(" ")),
				employee.get(Employee_.lastName));

		Expression<String> teams = cb.function(CriteriaBuilderSqlFunction.GROUP_CONCAT.getFunctionName(), String.class,
				cb.function(CriteriaBuilderSqlFunction.DISTINCT.getFunctionName(), String.class,
						team.get(Team_.teamName)));

		query.select(cb.construct(EmployeeCustomEntitlementReportExportDto.class, employee.get(Employee_.employeeId),
				employeeName, teams, leaveType.get(LeaveType_.name),
				leaveEntitlement.get(LeaveEntitlement_.totalDaysAllocated),
				leaveEntitlement.get(LeaveEntitlement_.validFrom), leaveEntitlement.get(LeaveEntitlement_.validTo)));

		List<Predicate> predicates = new ArrayList<>();
		predicates.add(cb.equal(user.get(User_.isActive), true));
		predicates.add(cb.equal(leaveEntitlement.get(LeaveEntitlement_.isActive), true));
		predicates.add(cb.equal(leaveEntitlement.get(LeaveEntitlement_.isManual), true));
		predicates.add(cb.equal(leaveType.get(LeaveType_.isActive), true));
		predicates.add(cb.lessThanOrEqualTo(leaveEntitlement.get(LeaveEntitlement_.validFrom), endDate));
		predicates.add(cb.greaterThanOrEqualTo(leaveEntitlement.get(LeaveEntitlement_.validTo), startDate));

		if (leaveTypeIds != null && !leaveTypeIds.isEmpty() && !leaveTypeIds.contains(-1L)) {
			predicates.add(leaveType.get(LeaveType_.typeId).in(leaveTypeIds));
		}

		if (teamId != null && teamId != -1) {
			Join<Employee, EmployeeTeam> empTeam = employee.join(Employee_.employeeTeams);
			Join<EmployeeTeam, Team> mainTeam = empTeam.join(EmployeeTeam_.team);
			predicates.add(cb.equal(mainTeam.get(Team_.teamId), teamId));
		}

		if (jobFamilyId != null && jobFamilyId != -1) {
			predicates.add(cb.equal(jobFamily.get(JobFamily_.jobFamilyId), jobFamilyId));
		}

		query.where(predicates.toArray(new Predicate[0]));

		query.groupBy(employee.get(Employee_.employeeId), employee.get(Employee_.firstName),
				employee.get(Employee_.lastName), jobFamily.get(JobFamily_.name), leaveType.get(LeaveType_.name),
				leaveEntitlement.get(LeaveEntitlement_.totalDaysAllocated),
				leaveEntitlement.get(LeaveEntitlement_.validFrom), leaveEntitlement.get(LeaveEntitlement_.validTo));

		query.orderBy(cb.asc(employee.get(Employee_.firstName)));

		return entityManager.createQuery(query).getResultList();
	}

	@Override
	public Page<EmployeeCustomEntitlementResponseDto> generateEmployeeCustomEntitlementDetailedReportWithPagination(
			List<Long> leaveTypeIds, LocalDate startDate, LocalDate endDate, Long jobFamilyId, Long teamId,
			Pageable pageable) {

		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<EmployeeCustomEntitlementResponseDto> query = cb
			.createQuery(EmployeeCustomEntitlementResponseDto.class);

		Root<LeaveEntitlement> leaveEntitlement = query.from(LeaveEntitlement.class);
		Join<LeaveEntitlement, Employee> employee = leaveEntitlement.join(LeaveEntitlement_.employee);
		Join<Employee, User> user = employee.join(Employee_.user);
		Join<LeaveEntitlement, LeaveType> leaveType = leaveEntitlement.join(LeaveEntitlement_.leaveType);
		Join<Employee, JobFamily> jobFamily = employee.join(Employee_.jobFamily, JoinType.LEFT);
		Join<Employee, EmployeeTeam> employeeTeam = employee.join(Employee_.employeeTeams, JoinType.LEFT);
		Join<EmployeeTeam, Team> team = employeeTeam.join(EmployeeTeam_.team, JoinType.LEFT);

		Expression<String> teams = cb.function(CriteriaBuilderSqlFunction.GROUP_CONCAT.getFunctionName(), String.class,
				cb.function(CriteriaBuilderSqlFunction.DISTINCT.getFunctionName(), String.class,
						team.get(Team_.teamName)));

		Expression<String> startDateFormatted = cb.function(CriteriaBuilderSqlFunction.CONCAT.getFunctionName(),
				String.class,
				cb.function(CriteriaBuilderSqlFunction.DATE_FORMAT.getFunctionName(), String.class,
						leaveEntitlement.get(LeaveEntitlement_.validFrom),
						cb.literal(CriteriaBuilderSqlLiteral.SPACE_DATE_PATTERN.getValue())));

		Expression<String> endDateFormatted = cb.function(CriteriaBuilderSqlFunction.CONCAT.getFunctionName(),
				String.class,
				cb.function(CriteriaBuilderSqlFunction.DATE_FORMAT.getFunctionName(), String.class,
						leaveEntitlement.get(LeaveEntitlement_.validTo),
						cb.literal(CriteriaBuilderSqlLiteral.SPACE_DATE_PATTERN.getValue())));

		query.select(cb.construct(EmployeeCustomEntitlementResponseDto.class, employee.get(Employee_.employeeId),
				employee.get(Employee_.firstName), employee.get(Employee_.lastName), employee.get(Employee_.authPic),
				teams, leaveType.get(LeaveType_.name), leaveEntitlement.get(LeaveEntitlement_.totalDaysAllocated),
				startDateFormatted, endDateFormatted, leaveType.get(LeaveType_.emojiCode)));

		List<Predicate> predicates = createPredicatesForLeaveEntitlement(cb, leaveEntitlement, employee, user,
				leaveType, jobFamily, team, leaveTypeIds, startDate, endDate, jobFamilyId, teamId);

		query.where(predicates.toArray(new Predicate[0]));

		query.groupBy(employee.get(Employee_.employeeId), employee.get(Employee_.firstName),
				employee.get(Employee_.lastName), jobFamily.get(JobFamily_.name), leaveType.get(LeaveType_.name),
				leaveType.get(LeaveType_.emojiCode), leaveEntitlement.get(LeaveEntitlement_.totalDaysAllocated),
				leaveEntitlement.get(LeaveEntitlement_.validFrom), leaveEntitlement.get(LeaveEntitlement_.validTo));

		query.orderBy(cb.asc(employee.get(Employee_.firstName)));

		TypedQuery<EmployeeCustomEntitlementResponseDto> typedQuery = entityManager.createQuery(query);

		CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
		Root<LeaveEntitlement> countRoot = countQuery.from(LeaveEntitlement.class);
		Join<LeaveEntitlement, Employee> countEmployee = countRoot.join(LeaveEntitlement_.employee);
		Join<Employee, User> countUser = countEmployee.join(Employee_.user);
		Join<LeaveEntitlement, LeaveType> countLeaveType = countRoot.join(LeaveEntitlement_.leaveType);
		Join<Employee, JobFamily> countJobFamily = countEmployee.join(Employee_.jobFamily, JoinType.LEFT);
		Join<Employee, EmployeeTeam> countEmployeeTeam = countEmployee.join(Employee_.employeeTeams, JoinType.LEFT);
		Join<EmployeeTeam, Team> countTeam = countEmployeeTeam.join(EmployeeTeam_.team, JoinType.LEFT);

		List<Predicate> countPredicates = createPredicatesForLeaveEntitlement(cb, countRoot, countEmployee, countUser,
				countLeaveType, countJobFamily, countTeam, leaveTypeIds, startDate, endDate, jobFamilyId, teamId);

		countQuery.select(cb.countDistinct(countRoot));
		countQuery.where(countPredicates.toArray(new Predicate[0]));

		Long total = entityManager.createQuery(countQuery).getSingleResult();

		typedQuery.setFirstResult(pageable.getPageNumber() * pageable.getPageSize());
		typedQuery.setMaxResults(pageable.getPageSize());

		List<EmployeeCustomEntitlementResponseDto> results = typedQuery.getResultList();

		return new PageImpl<>(results, pageable, total);
	}

	@Override
	public List<EmployeeLeaveEntitlementReportExportDto> getEmployeeLeaveEntitlementsDetailedReport(
			List<Long> leaveTypeIds, LocalDate startDate, LocalDate endDate, Long jobFamilyId, Long teamId) {

		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<EmployeeLeaveEntitlementReportExportDto> query = cb
			.createQuery(EmployeeLeaveEntitlementReportExportDto.class);

		Root<LeaveEntitlement> leaveEntitlement = query.from(LeaveEntitlement.class);
		Join<LeaveEntitlement, Employee> employee = leaveEntitlement.join(LeaveEntitlement_.employee);
		Join<Employee, User> user = employee.join(Employee_.user);
		Join<LeaveEntitlement, LeaveType> leaveType = leaveEntitlement.join(LeaveEntitlement_.leaveType);
		Join<Employee, JobFamily> jobFamily = employee.join(Employee_.jobFamily, JoinType.LEFT);

		Subquery<String> teamsSubquery = query.subquery(String.class);
		Root<EmployeeTeam> employeeTeam = teamsSubquery.from(EmployeeTeam.class);
		Join<EmployeeTeam, Team> team = employeeTeam.join(EmployeeTeam_.team);

		teamsSubquery
			.select(cb.function(CriteriaBuilderSqlFunction.GROUP_CONCAT.getFunctionName(), String.class,
					cb.function(CriteriaBuilderSqlFunction.DISTINCT.getFunctionName(), String.class,
							team.get(Team_.teamName))))
			.where(cb.equal(employeeTeam.get(EmployeeTeam_.employee), employee));

		Expression<String> employeeName = cb.concat(cb.concat(employee.get(Employee_.firstName), cb.literal(" ")),
				employee.get(Employee_.lastName));

		Expression<Float> totalDaysAllocated = cb.sum(leaveEntitlement.get(LeaveEntitlement_.totalDaysAllocated));
		Expression<Float> totalDaysUsed = cb.sum(leaveEntitlement.get(LeaveEntitlement_.totalDaysUsed));
		Expression<Float> balanceDays = cb.diff(totalDaysAllocated, totalDaysUsed);

		query.select(cb.construct(EmployeeLeaveEntitlementReportExportDto.class, employee.get(Employee_.employeeId),
				employeeName, teamsSubquery, jobFamily.get(JobFamily_.name), leaveType.get(LeaveType_.name),
				totalDaysAllocated.as(Float.class), totalDaysUsed.as(Float.class), balanceDays.as(Float.class)));

		List<Predicate> predicates = new ArrayList<>();
		predicates.add(cb.equal(user.get(User_.isActive), true));
		predicates.add(cb.equal(leaveEntitlement.get(LeaveEntitlement_.isActive), true));
		predicates.add(cb.equal(leaveType.get(LeaveType_.isActive), true));
		predicates.add(cb.lessThanOrEqualTo(leaveEntitlement.get(LeaveEntitlement_.validFrom), endDate));
		predicates.add(cb.greaterThanOrEqualTo(leaveEntitlement.get(LeaveEntitlement_.validTo), startDate));

		if (leaveTypeIds != null && !leaveTypeIds.isEmpty() && !leaveTypeIds.contains(-1L)) {
			predicates.add(leaveType.get(LeaveType_.typeId).in(leaveTypeIds));
		}

		if (jobFamilyId != null && jobFamilyId != -1) {
			predicates.add(cb.equal(jobFamily.get(JobFamily_.jobFamilyId), jobFamilyId));
		}

		if (teamId != null && teamId != -1) {
			Join<Employee, EmployeeTeam> empTeam = employee.join(Employee_.employeeTeams);
			Join<EmployeeTeam, Team> mainTeam = empTeam.join(EmployeeTeam_.team);
			predicates.add(cb.equal(mainTeam.get(Team_.teamId), teamId));
		}

		query.where(predicates.toArray(new Predicate[0]));

		query.groupBy(employee.get(Employee_.employeeId), employee.get(Employee_.firstName),
				employee.get(Employee_.lastName), jobFamily.get(JobFamily_.name), leaveType.get(LeaveType_.name),
				leaveType.get(LeaveType_.typeId));

		query.orderBy(cb.asc(employee.get(Employee_.firstName)));

		return entityManager.createQuery(query).getResultList();
	}

	@Override
	public Page<Employee> findEmployeesWithEntitlements(LocalDate validFrom, LocalDate validTo, String keyword,
			Pageable pageable) {

		CriteriaBuilder cb = entityManager.getCriteriaBuilder();

		CriteriaQuery<Employee> criteriaQuery = cb.createQuery(Employee.class);
		Root<LeaveEntitlement> root = criteriaQuery.from(LeaveEntitlement.class);
		Join<LeaveEntitlement, Employee> employeeJoin = root.join(LeaveEntitlement_.employee);
		Join<Employee, User> userJoin = employeeJoin.join(Employee_.user);

		List<Predicate> predicates = buildEntitlementPredicates(cb, root, employeeJoin, userJoin, validFrom, validTo,
				keyword);

		criteriaQuery.where(predicates.toArray(new Predicate[0]));
		criteriaQuery.select(employeeJoin).distinct(true);

		List<Order> orderList = buildOrderList(cb, employeeJoin, keyword, pageable.getSort());
		criteriaQuery.orderBy(orderList);

		CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
		Root<LeaveEntitlement> countRoot = countQuery.from(LeaveEntitlement.class);
		Join<LeaveEntitlement, Employee> countEmployeeJoin = countRoot.join(LeaveEntitlement_.employee);
		Join<Employee, User> countUserJoin = countEmployeeJoin.join(Employee_.user);

		List<Predicate> countPredicates = buildEntitlementPredicates(cb, countRoot, countEmployeeJoin, countUserJoin,
				validFrom, validTo, keyword);
		countQuery.where(countPredicates.toArray(new Predicate[0]));
		countQuery.select(cb.countDistinct(countEmployeeJoin));

		Long totalRows = entityManager.createQuery(countQuery).getSingleResult();

		TypedQuery<Employee> query = entityManager.createQuery(criteriaQuery);

		if (pageable.isPaged()) {
			query.setFirstResult(pageable.getPageNumber() * pageable.getPageSize());
			query.setMaxResults(pageable.getPageSize());
		}

		return new PageImpl<>(query.getResultList(), pageable, totalRows);
	}

	private List<Predicate> buildEntitlementPredicates(CriteriaBuilder cb, Root<LeaveEntitlement> root,
			Join<LeaveEntitlement, Employee> employeeJoin, Join<Employee, User> userJoin, LocalDate validFrom,
			LocalDate validTo, String keyword) {

		List<Predicate> predicates = new ArrayList<>();

		predicates.add(cb.between(root.get(LeaveEntitlement_.validFrom), validFrom, validTo));
		predicates.add(cb.between(root.get(LeaveEntitlement_.validTo), validFrom, validTo));
		predicates.add(cb.equal(root.get(LeaveEntitlement_.isActive), true));
		predicates.add(cb.equal(root.get(LeaveEntitlement_.isManual), false));
		predicates.add(cb.equal(userJoin.get(User_.isActive), true));

		if (keyword != null && !keyword.trim().isEmpty()) {
			String searchPattern = keyword.toLowerCase() + "%";
			predicates.add(cb.or(cb.like(cb.lower(employeeJoin.get(Employee_.firstName)), searchPattern),
					cb.like(cb.lower(employeeJoin.get(Employee_.lastName)), searchPattern),
					cb.like(cb.lower(cb.concat(cb.concat(employeeJoin.get(Employee_.firstName), " "),
							employeeJoin.get(Employee_.lastName))), searchPattern)));
		}

		return predicates;
	}

	private List<Order> buildOrderList(CriteriaBuilder cb, Join<LeaveEntitlement, Employee> employeeJoin,
			String keyword, Sort sort) {
		List<Order> orderList = new ArrayList<>();

		if (keyword != null && !keyword.trim().isEmpty()) {
			Order searchOrder = cb.asc(cb.selectCase()
				.when(cb.like(cb.lower(employeeJoin.get(Employee_.firstName)), keyword.toLowerCase() + "%"), 1)
				.when(cb.like(cb.lower(employeeJoin.get(Employee_.lastName)), keyword.toLowerCase() + "%"), 2)
				.otherwise(3));
			orderList.add(searchOrder);
		}

		for (Sort.Order order : sort) {
			String property = order.getProperty();
			if ("firstName".equals(property)) {
				orderList.add(order.isAscending() ? cb.asc(employeeJoin.get(Employee_.firstName))
						: cb.desc(employeeJoin.get(Employee_.firstName)));
			}
			else if ("lastName".equals(property)) {
				orderList.add(order.isAscending() ? cb.asc(employeeJoin.get(Employee_.lastName))
						: cb.desc(employeeJoin.get(Employee_.lastName)));
			}
		}

		if (orderList.isEmpty() || (keyword != null && orderList.size() == 1)) {
			orderList.add(cb.asc(employeeJoin.get(Employee_.firstName)));
			orderList.add(cb.asc(employeeJoin.get(Employee_.lastName)));
		}

		return orderList;
	}

	private void setDateRangeFiltration(LeaveEntitlementsFilterDto leaveEntitlementsFilterDto,
			CriteriaBuilder criteriaBuilder, Root<LeaveEntitlement> root, List<Predicate> predicates) {
		ObjectNode leaveCycleConfig = getLeaveCycleConfig();
		if (leaveCycleConfig == null) {
			throw new IllegalArgumentException(
					messageUtil.getMessage(LeaveMessageConstant.LEAVE_ERROR_LEAVE_CYCLE_CONFIG_NOT_FOUND));
		}
		int startMonth = leaveCycleConfig.get(LeaveModuleConstant.START).get(LeaveModuleConstant.MONTH).intValue();
		int startDate = leaveCycleConfig.get(LeaveModuleConstant.START).get(LeaveModuleConstant.DATE).intValue();
		int endMonth = leaveCycleConfig.get(LeaveModuleConstant.END).get(LeaveModuleConstant.MONTH).intValue();
		int endDate = leaveCycleConfig.get(LeaveModuleConstant.END).get(LeaveModuleConstant.DATE).intValue();

		// int leaveCycleEndYear = LeaveModuleUtil.getLeaveCycleEndYear(startMonth,
		// startDate);
		// int cycleStartYear = startMonth == 1 && startDate == 1 ? leaveCycleEndYear :
		// leaveCycleEndYear - 1;

		LocalDate currentDate = DateTimeUtils.getCurrentUtcDate();
		int cycleStartYear = currentDate.getYear();
		int leaveCycleEndYear = cycleStartYear + 1;

		if (leaveEntitlementsFilterDto != null && (leaveEntitlementsFilterDto.getStartDate() != null
				&& leaveEntitlementsFilterDto.getEndDate() != null)) {
			Predicate dateBetween = criteriaBuilder.or(
					criteriaBuilder.between(root.get(LeaveEntitlement_.VALID_FROM),
							leaveEntitlementsFilterDto.getStartDate(), leaveEntitlementsFilterDto.getEndDate()),
					criteriaBuilder.between(root.get(LeaveEntitlement_.VALID_TO),
							leaveEntitlementsFilterDto.getStartDate(), leaveEntitlementsFilterDto.getEndDate()));
			predicates.add(dateBetween);
		}
		else {
			LocalDate yearStartDate = DateTimeUtils.getUtcLocalDate(cycleStartYear, startMonth, startDate);
			LocalDate yearEndDate = DateTimeUtils.getUtcLocalDate(leaveCycleEndYear, endMonth, endDate);
			predicates.add(criteriaBuilder.and(
					criteriaBuilder.lessThanOrEqualTo(root.get(LeaveEntitlement_.VALID_FROM), yearEndDate),
					criteriaBuilder.greaterThanOrEqualTo(root.get(LeaveEntitlement_.VALID_TO), yearStartDate)));
		}
	}

	private LeaveCycleDatesDto leaveCycleStartAndEndDates() {
		ObjectNode leaveCycleConfig = getLeaveCycleConfig();
		if (leaveCycleConfig == null) {
			throw new IllegalArgumentException(
					messageUtil.getMessage(LeaveMessageConstant.LEAVE_ERROR_LEAVE_CYCLE_CONFIG_NOT_FOUND));
		}

		int startMonth = leaveCycleConfig.get(LeaveModuleConstant.START).get(LeaveModuleConstant.MONTH).intValue();
		int startDate = leaveCycleConfig.get(LeaveModuleConstant.START).get(LeaveModuleConstant.DATE).intValue();
		int endMonth = leaveCycleConfig.get(LeaveModuleConstant.END).get(LeaveModuleConstant.MONTH).intValue();
		int endDate = leaveCycleConfig.get(LeaveModuleConstant.END).get(LeaveModuleConstant.DATE).intValue();

		int leaveCycleEndYear = LeaveModuleUtil.getLeaveCycleEndYear(startMonth, startDate);
		int cycleStartYear = startMonth == 1 && startDate == 1 ? leaveCycleEndYear : leaveCycleEndYear - 1;

		LocalDate yearStartDate = DateTimeUtils.getUtcLocalDate(cycleStartYear, startMonth, startDate);
		LocalDate yearEndDate = DateTimeUtils.getUtcLocalDate(leaveCycleEndYear, endMonth, endDate);

		return new LeaveCycleDatesDto(yearStartDate, yearEndDate);
	}

	private ObjectNode getLeaveCycleConfig() {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
		CriteriaQuery<OrganizationConfig> criteriaQuery = criteriaBuilder.createQuery(OrganizationConfig.class);
		Root<OrganizationConfig> root = criteriaQuery.from(OrganizationConfig.class);
		criteriaQuery.where(criteriaBuilder.equal(root.get(OrganizationConfig_.ORGANIZATION_CONFIG_TYPE),
				OrganizationConfigType.LEAVE_CYCLE.name()));
		TypedQuery<OrganizationConfig> query = entityManager.createQuery(criteriaQuery);
		List<OrganizationConfig> resultList = query.getResultList();
		if (resultList.isEmpty()) {
			return null;
		}
		return LeaveModuleUtil.getLeaveCycleConfigs(resultList.getFirst().getOrganizationConfigValue());
	}

	private List<Predicate> getTeamLeaveSummaryPredicates(CriteriaBuilder criteriaBuilder, Root<LeaveEntitlement> root,
			Join<Employee, User> employee, Join<Employee, EmployeeTeam> employeeTeam, Long teamId) {

		List<Predicate> predicates = new ArrayList<>();

		predicates.add(criteriaBuilder.notEqual(employee.get(User_.isActive), false));
		predicates.add(criteriaBuilder.equal(employeeTeam.get(EmployeeTeam_.team).get(Team_.teamId), teamId));
		LeaveEntitlementsFilterDto leaveEntitlementsFilterDto = new LeaveEntitlementsFilterDto();
		leaveEntitlementsFilterDto.setYear(DateTimeUtils.getCurrentYear());
		leaveEntitlementsFilterDto.setIsFollowingYear(false);
		setYearRangeFiltration(leaveEntitlementsFilterDto, criteriaBuilder, root, predicates);
		return predicates;
	}

	private Page<Long> getPagedEmployeeIdsForCarryFoward(List<Long> leaveTypeIds, Boolean isActive,
			LocalDate leaveCycleEndDate, Pageable page) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
		CriteriaQuery<Long> criteriaQuery = criteriaBuilder.createQuery(Long.class);
		Root<LeaveEntitlement> root = criteriaQuery.from(LeaveEntitlement.class);
		Join<LeaveEntitlement, LeaveType> leaveTypeJoin = root.join(LeaveEntitlement_.leaveType);
		Join<LeaveType, CarryForwardInfo> carryForwardInfoJoin = leaveTypeJoin.join(LeaveType_.carryForwardInfos,
				JoinType.LEFT);

		List<Predicate> predicates = getLeaveCarryForwardPredicates(criteriaBuilder, root, carryForwardInfoJoin,
				leaveTypeIds, isActive, leaveCycleEndDate);

		Predicate[] predArray = new Predicate[predicates.size()];
		predicates.toArray(predArray);
		criteriaQuery.where(predArray);
		criteriaQuery.select(root.get(LeaveEntitlement_.employee).get(Employee_.employeeId)).distinct(true);

		TypedQuery<Long> typedQuery = entityManager.createQuery(criteriaQuery);
		int totalRows = typedQuery.getResultList().size();
		typedQuery.setFirstResult(page.getPageNumber() * page.getPageSize());
		typedQuery.setMaxResults(page.getPageSize());

		return new PageImpl<>(typedQuery.getResultList(), page, totalRows);
	}

	private List<Predicate> getLeaveCarryForwardPredicates(CriteriaBuilder criteriaBuilder, Root<LeaveEntitlement> root,
			Join<LeaveType, CarryForwardInfo> carryForwardInfoJoin, List<Long> leaveTypeIds, Boolean isActive,
			LocalDate leaveCycleEndDate) {

		List<Predicate> predicates = new ArrayList<>();

		carryForwardInfoJoin.on(criteriaBuilder.and(criteriaBuilder
			.equal(carryForwardInfoJoin.get(CarryForwardInfo_.employee), root.get(LeaveEntitlement_.employee))));

		predicates.add(root.get(LeaveEntitlement_.leaveType).get(LeaveType_.typeId).in(leaveTypeIds));
		predicates.add(criteriaBuilder
			.equal(root.get(LeaveEntitlement_.leaveType).get(LeaveType_.IS_CARRY_FORWARD_ENABLED), Boolean.TRUE));
		predicates.add(criteriaBuilder
			.notEqual(root.get(LeaveEntitlement_.leaveType).get(LeaveType_.maxCarryForwardDays), 0F));
		predicates.add(criteriaBuilder.equal(root.get(LeaveEntitlement_.isActive), isActive));
		predicates.add(criteriaBuilder.equal(root.get(LeaveEntitlement_.validTo), leaveCycleEndDate));
		predicates.add(criteriaBuilder.greaterThan(root.get(LeaveEntitlement_.totalDaysAllocated),
				root.get(LeaveEntitlement_.totalDaysUsed)));
		predicates.add(criteriaBuilder.or(
				criteriaBuilder.isTrue(
						root.get(LeaveEntitlement_.leaveType).get(LeaveType_.isCarryForwardRemainingBalanceEnabled)),
				criteriaBuilder.or(
						criteriaBuilder.greaterThan(
								root.get(LeaveEntitlement_.leaveType).get(LeaveType_.maxCarryForwardDays),
								carryForwardInfoJoin.get(CarryForwardInfo_.days)),
						criteriaBuilder.isNull(carryForwardInfoJoin.get(CarryForwardInfo_.days)))));

		return predicates;
	}

	private void setYearRangeFiltration(LeaveEntitlementsFilterDto leaveEntitlementsFilterDto,
			CriteriaBuilder criteriaBuilder, Root<LeaveEntitlement> root, List<Predicate> predicates) {
		Integer year = leaveEntitlementsFilterDto.getYear();
		if (year != null) {
			LocalDate fromDate = DateTimeUtils.getUtcLocalDate(year, DateTimeUtils.JANUARY, DateTimeUtils.FIRST_DAY);
			LocalDate toDate = DateTimeUtils.getUtcLocalDate(
					year + (Boolean.TRUE.equals(leaveEntitlementsFilterDto.getIsFollowingYear()) ? 1 : 0), 12, 31);

			Predicate yearRange = criteriaBuilder.or(
					criteriaBuilder.between(root.get(LeaveEntitlement_.validFrom), fromDate, toDate),
					criteriaBuilder.between(root.get(LeaveEntitlement_.validTo), fromDate, toDate));
			predicates.add(yearRange);
		}
	}

	@Override
	public Long findEmployeeIdsCountCreatedWithValidDates(LocalDate validFrom, LocalDate validDate) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<Long> cq = cb.createQuery(Long.class);
		Root<LeaveEntitlement> root = cq.from(LeaveEntitlement.class);
		Join<LeaveEntitlement, Employee> employeeJoin = root.join(LeaveEntitlement_.employee);
		Join<Employee, User> userJoin = employeeJoin.join(Employee_.user);

		List<Predicate> predicates = new ArrayList<>();
		predicates.add(cb.between(root.get(LeaveEntitlement_.validFrom), validFrom, validDate));
		predicates.add(cb.between(root.get(LeaveEntitlement_.validTo), validFrom, validDate));
		predicates.add(cb.equal(root.get(LeaveEntitlement_.isActive), true));
		predicates.add(cb.equal(userJoin.get(User_.isActive), true));

		cq.select(cb.countDistinct(employeeJoin.get(Employee_.employeeId))).where(predicates.toArray(new Predicate[0]));

		return entityManager.createQuery(cq).getSingleResult();
	}

	@Override
	public List<Long> findEmployeeIdsCreatedWithValidDates(LocalDate validFrom, LocalDate validDate, int limit,
			long offset) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<Long[]> cq = cb.createQuery(Long[].class);
		Root<LeaveEntitlement> root = cq.from(LeaveEntitlement.class);
		Join<LeaveEntitlement, Employee> employeeJoin = root.join(LeaveEntitlement_.employee);
		Join<Employee, User> userJoin = employeeJoin.join(Employee_.user);

		List<Predicate> predicates = new ArrayList<>();
		predicates.add(cb.between(root.get(LeaveEntitlement_.validFrom), validFrom, validDate));
		predicates.add(cb.between(root.get(LeaveEntitlement_.validTo), validFrom, validDate));
		predicates.add(cb.equal(root.get(LeaveEntitlement_.isActive), true));
		predicates.add(cb.equal(userJoin.get(User_.isActive), true));

		cq.multiselect(employeeJoin.get(Employee_.employeeId));
		cq.where(predicates.toArray(new Predicate[0]));
		cq.orderBy(cb.asc(root.get(Auditable_.createdDate)));

		TypedQuery<Long[]> query = entityManager.createQuery(cq);
		query.setFirstResult((int) offset);
		query.setMaxResults(limit);
		List<Long[]> results = query.getResultList();

		Set<Long> employeeIds = new LinkedHashSet<>();
		for (Long[] row : results) {
			employeeIds.add(row[0]);
		}
		return new ArrayList<>(employeeIds);
	}

	@Override
	public List<Long> findEmployeeIdsWithLeaveEntitlement(List<Long> leaveTypeIds, LocalDate startDate,
			LocalDate endDate, Long jobFamilyId, Long teamId, int limit, long offset) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<Long[]> cq = cb.createQuery(Long[].class);
		Root<LeaveEntitlement> root = cq.from(LeaveEntitlement.class);

		Join<LeaveEntitlement, Employee> employeeJoin = root.join(LeaveEntitlement_.employee);
		Join<Employee, User> userJoin = employeeJoin.join(Employee_.user);
		Join<Employee, EmployeeTeam> employeeTeamJoin = employeeJoin.join(Employee_.employeeTeams, JoinType.LEFT);
		Join<EmployeeTeam, Team> teamJoin = employeeTeamJoin.join(EmployeeTeam_.team, JoinType.LEFT);
		Join<Employee, JobFamily> jobFamilyJoin = employeeJoin.join(Employee_.jobFamily, JoinType.LEFT);
		Join<LeaveEntitlement, LeaveType> leaveTypeJoin = root.join(LeaveEntitlement_.leaveType);

		List<Predicate> predicates = new ArrayList<>();

		if (leaveTypeIds != null && !leaveTypeIds.isEmpty()) {
			predicates.add(leaveTypeJoin.get(LeaveType_.typeId).in(leaveTypeIds));
		}

		predicates.add(cb.equal(userJoin.get(User_.isActive), true));
		predicates.add(cb.equal(root.get(LeaveEntitlement_.isActive), true));

		predicates.add(cb.lessThanOrEqualTo(root.get(LeaveEntitlement_.validFrom), endDate));
		predicates.add(cb.greaterThanOrEqualTo(root.get(LeaveEntitlement_.validTo), startDate));
		if (jobFamilyId != null) {
			predicates.add(cb.equal(jobFamilyJoin.get(JobFamily_.jobFamilyId), jobFamilyId));
		}

		if (teamId != null) {
			predicates.add(cb.equal(teamJoin.get(Team_.teamId), teamId));
		}

		cq.multiselect(employeeJoin.get(Employee_.employeeId));
		cq.where(predicates.toArray(new Predicate[0]));
		cq.groupBy(employeeJoin.get(Employee_.employeeId));
		cq.orderBy(cb.asc(employeeJoin.get(Employee_.firstName)));

		TypedQuery<Long[]> query = entityManager.createQuery(cq);
		query.setFirstResult((int) offset);
		query.setMaxResults(limit);
		List<Long[]> results = query.getResultList();

		Set<Long> employeeIds = new LinkedHashSet<>();
		for (Long[] row : results) {
			employeeIds.add(row[0]);
		}
		return new ArrayList<>(employeeIds);
	}

	@Override
	public Long findEmployeeIdsCountWithLeaveEntitlements(List<Long> leaveTypeIds, LocalDate startDate,
			LocalDate endDate, Long jobFamilyId, Long teamId) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<Long> cq = cb.createQuery(Long.class);
		Root<LeaveEntitlement> root = cq.from(LeaveEntitlement.class);

		Join<LeaveEntitlement, Employee> employeeJoin = root.join(LeaveEntitlement_.employee);
		Join<Employee, User> userJoin = employeeJoin.join(Employee_.user);
		Join<Employee, EmployeeTeam> employeeTeamJoin = employeeJoin.join(Employee_.employeeTeams, JoinType.LEFT);
		Join<EmployeeTeam, Team> teamJoin = employeeTeamJoin.join(EmployeeTeam_.team, JoinType.LEFT);
		Join<Employee, JobFamily> jobFamilyJoin = employeeJoin.join(Employee_.jobFamily, JoinType.LEFT);
		Join<LeaveEntitlement, LeaveType> leaveTypeJoin = root.join(LeaveEntitlement_.leaveType);

		List<Predicate> predicates = new ArrayList<>();

		if (leaveTypeIds != null && !leaveTypeIds.isEmpty()) {
			predicates.add(leaveTypeJoin.get(LeaveType_.typeId).in(leaveTypeIds));
		}

		predicates.add(cb.equal(userJoin.get(User_.isActive), true));
		predicates.add(cb.equal(root.get(LeaveEntitlement_.isActive), true));

		predicates.add(cb.lessThanOrEqualTo(root.get(LeaveEntitlement_.validFrom), endDate));
		predicates.add(cb.greaterThanOrEqualTo(root.get(LeaveEntitlement_.validTo), startDate));

		if (jobFamilyId != null) {
			predicates.add(cb.equal(jobFamilyJoin.get(JobFamily_.jobFamilyId), jobFamilyId));
		}

		if (teamId != null) {
			predicates.add(cb.equal(teamJoin.get(Team_.teamId), teamId));
		}

		cq.select(cb.countDistinct(employeeJoin.get(Employee_.employeeId)));
		cq.where(predicates.toArray(new Predicate[0]));

		return entityManager.createQuery(cq).getSingleResult();
	}

}
