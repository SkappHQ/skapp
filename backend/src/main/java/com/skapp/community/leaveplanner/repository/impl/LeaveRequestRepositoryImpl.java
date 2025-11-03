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
import com.skapp.community.common.util.CommonModuleUtils;
import com.skapp.community.common.util.DateTimeUtils;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.community.leaveplanner.constant.LeaveMessageConstant;
import com.skapp.community.leaveplanner.model.LeaveRequest;
import com.skapp.community.leaveplanner.model.LeaveRequest_;
import com.skapp.community.leaveplanner.model.LeaveType;
import com.skapp.community.leaveplanner.model.LeaveType_;
import com.skapp.community.leaveplanner.payload.EmployeeLeaveHistoryFilterDto;
import com.skapp.community.leaveplanner.payload.LeaveRequestFilterDto;
import com.skapp.community.leaveplanner.payload.TeamLeaveHistoryFilterDto;
import com.skapp.community.leaveplanner.payload.request.EmployeesOnLeavePeriodFilterDto;
import com.skapp.community.leaveplanner.payload.response.EmployeeLeaveRequestReportExportDto;
import com.skapp.community.leaveplanner.payload.response.EmployeeLeaveRequestReportQueryDto;
import com.skapp.community.leaveplanner.repository.LeaveRequestRepository;
import com.skapp.community.leaveplanner.repository.projection.LeaveTrendByDay;
import com.skapp.community.leaveplanner.repository.projection.LeaveTrendByMonth;
import com.skapp.community.leaveplanner.repository.projection.LeaveTypeBreakDown;
import com.skapp.community.leaveplanner.repository.projection.LeaveUtilizationByEmployeeMonthly;
import com.skapp.community.leaveplanner.repository.projection.ManagerLeaveTrend;
import com.skapp.community.leaveplanner.repository.projection.OrganizationLeaveTrendForTheYear;
import com.skapp.community.leaveplanner.repository.projection.TeamLeaveCountByType;
import com.skapp.community.leaveplanner.repository.projection.TeamLeaveTrendForTheYear;
import com.skapp.community.leaveplanner.type.LeaveRequestStatus;
import com.skapp.community.leaveplanner.type.LeaveState;
import com.skapp.community.leaveplanner.util.LeaveModuleUtil;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.EmployeeManager;
import com.skapp.community.peopleplanner.model.EmployeeManager_;
import com.skapp.community.peopleplanner.model.EmployeeTeam;
import com.skapp.community.peopleplanner.model.EmployeeTeam_;
import com.skapp.community.peopleplanner.model.Employee_;
import com.skapp.community.peopleplanner.model.JobFamily;
import com.skapp.community.peopleplanner.model.JobFamily_;
import com.skapp.community.peopleplanner.model.Team;
import com.skapp.community.peopleplanner.model.Team_;
import com.skapp.community.peopleplanner.type.AccountStatus;
import com.skapp.community.peopleplanner.type.LeaveCycleConfigField;
import com.skapp.community.peopleplanner.util.PeopleUtil;
import com.skapp.community.timeplanner.model.TimeConfig;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Expression;
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
import org.springframework.data.jpa.repository.query.QueryUtils;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class LeaveRequestRepositoryImpl implements LeaveRequestRepository {

	@NonNull
	private final MessageUtil messageUtil;

	@NonNull
	private EntityManager entityManager;

	public static List<LocalDate> getAllDaysBetween(DayOfWeek day, LocalDate startDate, LocalDate endDate) {
		List<LocalDate> removingDays = new ArrayList<>();

		LocalDate currentDay = startDate.with(TemporalAdjusters.nextOrSame(day));

		while (!currentDay.isAfter(endDate)) {
			removingDays.add(currentDay);
			currentDay = currentDay.plusWeeks(1);
		}

		return removingDays;
	}

	public static float getLeaveCount(List<LeaveRequest> leaveRequests, List<LocalDate> holidays,
			List<TimeConfig> timeConfigs, String organizationTimeZone) {
		float leaveCount = 0;
		for (LeaveRequest leaveRequest : leaveRequests) {
			if (leaveRequest.getLeaveState().equals(LeaveState.FULLDAY)
					&& leaveRequest.getEndDate().isAfter(leaveRequest.getStartDate())) {
				leaveCount = leaveCount + getAllDaysBetween(leaveRequest.getStartDate(), leaveRequest.getEndDate(),
						holidays, timeConfigs, organizationTimeZone);
			}
			else if (!holidays.contains(leaveRequest.getStartDate()) && !CommonModuleUtils
				.checkIfDayIsWorkingDay(leaveRequest.getStartDate(), timeConfigs, organizationTimeZone)) {
				leaveCount = leaveRequest.getLeaveState().equals(LeaveState.FULLDAY) ? leaveCount + 1
						: (float) (leaveCount + 0.5);
			}
		}
		return leaveCount;
	}

	public static Integer getAllDaysBetween(LocalDate startDate, LocalDate endDate, List<LocalDate> holidays,
			List<TimeConfig> timeConfigs, String organizationTimeZone) {
		int daysBetween = 0;

		while (!holidays.contains(startDate)
				&& !CommonModuleUtils.checkIfDayIsWorkingDay(startDate, timeConfigs, organizationTimeZone)
				&& (startDate.isBefore(endDate) || startDate.isEqual(endDate))) {
			daysBetween = daysBetween + 1;
			startDate = startDate.plusDays(1);
		}

		return daysBetween;
	}

	@Override
	public List<EmployeeLeaveRequestReportExportDto> generateLeaveRequestDetailedReport(List<Long> leaveTypeIds,
			LocalDate startDate, LocalDate endDate, Long jobFamilyId, Long teamId, List<String> statuses) {

		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<EmployeeLeaveRequestReportExportDto> query = cb
			.createQuery(EmployeeLeaveRequestReportExportDto.class);

		Root<LeaveRequest> leaveRequest = query.from(LeaveRequest.class);
		Join<LeaveRequest, Employee> employee = leaveRequest.join(LeaveRequest_.employee);
		Join<Employee, User> user = employee.join(Employee_.user);
		Join<LeaveRequest, LeaveType> leaveType = leaveRequest.join(LeaveRequest_.leaveType);
		Join<Employee, JobFamily> jobFamily = employee.join(Employee_.jobFamily, JoinType.LEFT);
		Join<Employee, EmployeeTeam> employeeTeam = employee.join(Employee_.employeeTeams, JoinType.LEFT);
		Join<EmployeeTeam, Team> team = employeeTeam.join(EmployeeTeam_.team, JoinType.LEFT);

		Expression<String> leavePeriod = cb.concat(
				cb.concat(
						cb.function(CriteriaBuilderSqlFunction.DATE_FORMAT.getFunctionName(), String.class,
								leaveRequest.get(LeaveRequest_.startDate),
								cb.literal(CriteriaBuilderSqlLiteral.DASHED_DATE_PATTERN.getValue())),
						cb.literal(CriteriaBuilderSqlLiteral.DASH.getValue())),
				cb.function(CriteriaBuilderSqlFunction.DATE_FORMAT.getFunctionName(), String.class,
						leaveRequest.get(LeaveRequest_.endDate),
						cb.literal(CriteriaBuilderSqlLiteral.DASHED_DATE_PATTERN.getValue())));

		Expression<String> employeeName = cb.concat(cb.concat(employee.get(Employee_.firstName), " "),
				employee.get(Employee_.lastName));

		Expression<String> dateRequested = cb.function(CriteriaBuilderSqlFunction.DATE_FORMAT.getFunctionName(),
				String.class, leaveRequest.get(Auditable_.lastModifiedDate),
				cb.literal(CriteriaBuilderSqlLiteral.DASHED_DATE_PATTERN.getValue()));

		Expression<String> teams = cb.function(CriteriaBuilderSqlFunction.GROUP_CONCAT.getFunctionName(), String.class,
				cb.function(CriteriaBuilderSqlFunction.DISTINCT.getFunctionName(), String.class,
						team.get(Team_.teamName)));

		query.select(cb.construct(EmployeeLeaveRequestReportExportDto.class, employee.get(Employee_.employeeId),
				employeeName, teams, leaveType.get(LeaveType_.name), leaveRequest.get(LeaveRequest_.status),
				leaveRequest.get(LeaveRequest_.durationDays), leavePeriod, dateRequested,
				leaveRequest.get(LeaveRequest_.durationDays), leaveRequest.get(LeaveRequest_.requestDesc)));

		List<Predicate> predicates = createPredicatesForLeaverRequest(cb, leaveRequest, employee, user, leaveType,
				jobFamily, team, leaveTypeIds, startDate, endDate, jobFamilyId, teamId, statuses);

		query.where(predicates.toArray(new Predicate[0]));

		query.groupBy(employee.get(Employee_.employeeId), employee.get(Employee_.firstName),
				employee.get(Employee_.lastName), jobFamily.get(JobFamily_.name),
				leaveRequest.get(LeaveRequest_.startDate), leaveRequest.get(LeaveRequest_.endDate),
				leaveRequest.get(LeaveRequest_.durationDays), leaveType.get(LeaveType_.name),
				leaveRequest.get(Auditable_.lastModifiedDate), leaveRequest.get(LeaveRequest_.status),
				leaveRequest.get(LeaveRequest_.requestDesc));

		query.orderBy(cb.asc(employee.get(Employee_.firstName)));

		return entityManager.createQuery(query).getResultList();
	}

	@Override
	public Page<EmployeeLeaveRequestReportQueryDto> generateLeaveRequestDetailedReportWithPagination(
			List<Long> leaveTypeIds, LocalDate startDate, LocalDate endDate, Long jobFamilyId, Long teamId,
			List<String> statuses, Pageable pageable) {

		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<EmployeeLeaveRequestReportQueryDto> query = cb
			.createQuery(EmployeeLeaveRequestReportQueryDto.class);
		Root<LeaveRequest> leaveRequest = query.from(LeaveRequest.class);

		Join<LeaveRequest, Employee> employee = leaveRequest.join(LeaveRequest_.employee);
		Join<Employee, User> user = employee.join(Employee_.user, JoinType.LEFT);
		Join<LeaveRequest, LeaveType> leaveType = leaveRequest.join(LeaveRequest_.leaveType);
		Join<Employee, JobFamily> jobFamily = employee.join(Employee_.jobFamily, JoinType.LEFT);
		Join<Employee, EmployeeTeam> employeeTeam = employee.join(Employee_.employeeTeams, JoinType.LEFT);
		Join<EmployeeTeam, Team> team = employeeTeam.join(EmployeeTeam_.team, JoinType.LEFT);

		Expression<String> teams = cb.function("GROUP_CONCAT", String.class,
				cb.function("DISTINCT", String.class, cb.coalesce(team.get(Team_.teamName), cb.literal(""))));
		Expression<String> startDateFormatted = cb.function("DATE_FORMAT", String.class,
				leaveRequest.get(LeaveRequest_.startDate), cb.literal("%D %b"));
		Expression<String> endDateFormatted = cb.function("DATE_FORMAT", String.class,
				leaveRequest.get(LeaveRequest_.endDate), cb.literal("%D %b"));

		query.select(cb.construct(EmployeeLeaveRequestReportQueryDto.class, employee.get(Employee_.employeeId),
				cb.coalesce(employee.get(Employee_.authPic), ""), cb.coalesce(employee.get(Employee_.firstName), ""),
				cb.coalesce(employee.get(Employee_.lastName), ""), teams,
				cb.coalesce(leaveType.get(LeaveType_.name), ""),
				cb.coalesce(leaveRequest.get(LeaveRequest_.status).as(String.class), ""), startDateFormatted,
				endDateFormatted, cb.coalesce(leaveType.get(LeaveType_.emojiCode), ""),
				cb.coalesce(leaveRequest.get(LeaveRequest_.durationDays), 0.0f)));

		List<Predicate> predicates = createPredicatesForLeaverRequest(cb, leaveRequest, employee, user, leaveType,
				jobFamily, team, leaveTypeIds, startDate, endDate, jobFamilyId, teamId, statuses);
		query.where(predicates.toArray(new Predicate[0]));

		query.groupBy(employee.get(Employee_.employeeId), employee.get(Employee_.authPic),
				employee.get(Employee_.firstName), employee.get(Employee_.lastName), leaveType.get(LeaveType_.name),
				leaveType.get(LeaveType_.emojiCode), leaveRequest.get(LeaveRequest_.status),
				leaveRequest.get(LeaveRequest_.startDate), leaveRequest.get(LeaveRequest_.endDate),
				leaveRequest.get(LeaveRequest_.durationDays));

		query.orderBy(cb.asc(employee.get(Employee_.firstName)));

		TypedQuery<EmployeeLeaveRequestReportQueryDto> typedQuery = entityManager.createQuery(query);
		typedQuery.setFirstResult((int) pageable.getOffset());
		typedQuery.setMaxResults(pageable.getPageSize());

		CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
		Root<LeaveRequest> countRoot = countQuery.from(LeaveRequest.class);

		Join<LeaveRequest, Employee> countEmployee = countRoot.join(LeaveRequest_.employee);
		Join<Employee, User> countUser = countEmployee.join(Employee_.user, JoinType.LEFT);
		Join<LeaveRequest, LeaveType> countLeaveType = countRoot.join(LeaveRequest_.leaveType);

		List<Predicate> countPredicates = createPredicatesForLeaverRequest(cb, countRoot, countEmployee, countUser,
				countLeaveType, jobFamily, team, leaveTypeIds, startDate, endDate, jobFamilyId, teamId, statuses);
		countQuery.where(countPredicates.toArray(new Predicate[0]));
		countQuery.select(cb.countDistinct(countRoot));

		Long total = entityManager.createQuery(countQuery).getSingleResult();

		List<EmployeeLeaveRequestReportQueryDto> results = typedQuery.getResultList();
		return new PageImpl<>(results, pageable, total);
	}

	@Override
	public Float findAllEmployeeRequestsByWithinThirtyDays(LocalDate startDate, LocalDate endDate,
			List<TimeConfig> timeConfigs, List<LocalDate> holidayDates, List<Long> teamIds,
			String organizationTimeZone) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();

		CriteriaQuery<LeaveRequest> criteriaQuery = criteriaBuilder.createQuery(LeaveRequest.class);
		Root<LeaveRequest> root = criteriaQuery.from(LeaveRequest.class);

		List<Predicate> predicates = new ArrayList<>();

		Join<LeaveRequest, Employee> employeeJoin = root.join(LeaveRequest_.employee);
		Join<Employee, User> userJoin = employeeJoin.join(Employee_.user);

		predicates.add(criteriaBuilder.equal(root.get(LeaveRequest_.status), LeaveRequestStatus.APPROVED));
		predicates.add(criteriaBuilder.equal(userJoin.get(User_.isActive), true));
		predicates
			.add(criteriaBuilder.or(criteriaBuilder.between(root.get(LeaveRequest_.startDate), startDate, endDate),
					criteriaBuilder.between(root.get(LeaveRequest_.endDate), startDate, endDate)));

		if (teamIds != null) {
			Join<Employee, EmployeeTeam> employeeTeamJoin = employeeJoin.join(Employee_.employeeTeams);
			CriteriaBuilder.In<Long> inClauseIds = criteriaBuilder
				.in(employeeTeamJoin.get(EmployeeTeam_.team).get(Team_.teamId));
			for (Long id : teamIds) {
				inClauseIds.value(id);
			}
			predicates.add(inClauseIds);
		}

		criteriaQuery.where(predicates.toArray(new Predicate[0]));
		TypedQuery<LeaveRequest> query = entityManager.createQuery(criteriaQuery);

		return getLeaveCount(query.getResultList(), holidayDates, timeConfigs, organizationTimeZone);
	}

	private List<Predicate> createPredicatesForLeaverRequest(CriteriaBuilder cb, Root<LeaveRequest> leaveRequest,
			Join<LeaveRequest, Employee> employee, Join<Employee, User> user, Join<LeaveRequest, LeaveType> leaveType,
			Join<Employee, JobFamily> jobFamily, Join<EmployeeTeam, Team> team, List<Long> leaveTypeIds,
			LocalDate startDate, LocalDate endDate, Long jobFamilyId, Long teamId, List<String> statuses) {
		List<Predicate> predicates = new ArrayList<>();
		predicates.add(cb.equal(user.get(User_.isActive), true));
		predicates.add(cb.lessThanOrEqualTo(leaveRequest.get(LeaveRequest_.startDate), endDate));
		predicates.add(cb.greaterThanOrEqualTo(leaveRequest.get(LeaveRequest_.endDate), startDate));

		if (leaveTypeIds != null && !leaveTypeIds.isEmpty() && !leaveTypeIds.contains(-1L)) {
			predicates.add(leaveType.get(LeaveType_.typeId).in(leaveTypeIds));
		}

		if (statuses != null && !statuses.isEmpty()) {
			predicates.add(leaveRequest.get(LeaveRequest_.status).in(statuses));
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
	public List<LeaveRequest> findAllLeaveRequestsByDateRange(LeaveRequestFilterDto leaveRequestFilterDto) {
		return findLeaveRequestsByDateRange(leaveRequestFilterDto, null);
	}

	@Override
	public List<LeaveRequest> findLeaveRequestsForTodayByUser(LocalDate currentDate, Long employeeId) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
		CriteriaQuery<LeaveRequest> criteriaQuery = criteriaBuilder.createQuery(LeaveRequest.class);
		Root<LeaveRequest> leaveRequest = criteriaQuery.from(LeaveRequest.class);

		Join<LeaveRequest, Employee> employee = leaveRequest.join(LeaveRequest_.employee);

		Predicate employeePredicate = criteriaBuilder.equal(employee.get(Employee_.employeeId), employeeId);
		Predicate statusPredicate = criteriaBuilder.equal(leaveRequest.get(LeaveRequest_.status),
				LeaveRequestStatus.APPROVED);

		Predicate datePredicate = criteriaBuilder.between(criteriaBuilder.literal(currentDate),
				leaveRequest.get(LeaveRequest_.startDate), leaveRequest.get(LeaveRequest_.endDate));

		criteriaQuery.where(criteriaBuilder.and(employeePredicate, statusPredicate, datePredicate));

		TypedQuery<LeaveRequest> query = entityManager.createQuery(criteriaQuery);

		return query.getResultList();
	}

	@Override
	public List<LeaveRequest> findLeaveRequestAvailabilityForGivenDate(LocalDate date, Long employeeId) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
		CriteriaQuery<LeaveRequest> criteriaQuery = criteriaBuilder.createQuery(LeaveRequest.class);
		Root<LeaveRequest> root = criteriaQuery.from(LeaveRequest.class);
		Join<LeaveRequest, Employee> employee = root.join(LeaveRequest_.employee);
		List<Predicate> predicates = new ArrayList<>();

		predicates.add(criteriaBuilder.equal(employee.get(Employee_.EMPLOYEE_ID), employeeId));
		predicates.add(criteriaBuilder.and(criteriaBuilder.lessThanOrEqualTo(root.get(LeaveRequest_.startDate), date),
				criteriaBuilder.greaterThanOrEqualTo(root.get(LeaveRequest_.endDate), date)));
		predicates
			.add(criteriaBuilder.or(criteriaBuilder.equal(root.get(LeaveRequest_.status), LeaveRequestStatus.PENDING),
					criteriaBuilder.equal(root.get(LeaveRequest_.status), LeaveRequestStatus.APPROVED)));

		Predicate[] predArray = new Predicate[predicates.size()];
		predicates.toArray(predArray);
		criteriaQuery.where(predArray);

		TypedQuery<LeaveRequest> typedQuery = entityManager.createQuery(criteriaQuery);
		return typedQuery.getResultList();
	}

	@Override
	public List<LeaveRequest> findLeaveRequestsByDateRangeAndEmployees(LeaveRequestFilterDto leaveRequestFilterDto,
			List<Long> employeeIds) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();

		CriteriaQuery<LeaveRequest> criteriaQuery = criteriaBuilder.createQuery(LeaveRequest.class);
		Root<LeaveRequest> root = criteriaQuery.from(LeaveRequest.class);

		List<Predicate> predicates = new ArrayList<>();

		Join<LeaveRequest, Employee> employee = root.join(LeaveRequest_.employee);
		Join<Employee, User> user = employee.join(Employee_.user);

		predicates.add(criteriaBuilder.equal(user.get(User_.isActive), true));
		predicates.add(employee.get(Employee_.employeeId).in(employeeIds));
		predicates.add(root.get(LeaveRequest_.status).in(LeaveRequestStatus.APPROVED, LeaveRequestStatus.PENDING));

		setDateRangeFiltration(leaveRequestFilterDto, criteriaBuilder, root, predicates);

		Predicate[] predArray = new Predicate[predicates.size()];
		predicates.toArray(predArray);
		criteriaQuery.where(predArray);

		criteriaQuery.select(root);
		TypedQuery<LeaveRequest> typedQuery = entityManager.createQuery(criteriaQuery);
		return typedQuery.getResultList();
	}

	@Override
	public List<LeaveRequest> getLeaveRequestsByTeamId(
			EmployeesOnLeavePeriodFilterDto employeesOnLeavePeriodFilterDto) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();

		CriteriaQuery<LeaveRequest> criteriaQuery = criteriaBuilder.createQuery(LeaveRequest.class);
		Root<LeaveRequest> root = criteriaQuery.from(LeaveRequest.class);

		List<Predicate> predicates = new ArrayList<>();
		Join<LeaveRequest, Employee> employee = root.join(LeaveRequest_.employee);
		Join<Employee, User> user = employee.join(Employee_.user);
		predicates.add(criteriaBuilder.equal(user.get(User_.isActive), true));

		predicates.add(root.get(LeaveRequest_.status).in(LeaveRequestStatus.APPROVED, LeaveRequestStatus.PENDING));

		LeaveRequestFilterDto leaveRequestFilterDto = new LeaveRequestFilterDto();
		leaveRequestFilterDto.setStartDate(employeesOnLeavePeriodFilterDto.getStartDate());
		leaveRequestFilterDto.setEndDate(employeesOnLeavePeriodFilterDto.getEndDate());
		setDateRangeBetweenFiltration(leaveRequestFilterDto, criteriaBuilder, root, predicates);
		List<Long> teamIds = employeesOnLeavePeriodFilterDto.getTeamIds();

		if (teamIds != null && !teamIds.isEmpty()) {
			Join<Employee, EmployeeTeam> employeeTeamJoin = employee.join(Employee_.employeeTeams);
			predicates.add(employeeTeamJoin.get(EmployeeTeam_.TEAM).get(Team_.TEAM_ID).in(teamIds));
		}

		Predicate[] predArray = new Predicate[predicates.size()];
		predicates.toArray(predArray);
		criteriaQuery.where(predArray);
		criteriaQuery.distinct(true);
		criteriaQuery.select(root);
		TypedQuery<LeaveRequest> typedQuery = entityManager.createQuery(criteriaQuery);
		return typedQuery.getResultList();
	}

	@Override
	public Float findAllEmployeeAnnualDaysByDateRangeQuery(Long leaveTypeId, LocalDate startDate, LocalDate endDate) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();

		CriteriaQuery<Float> criteriaQuery = criteriaBuilder.createQuery(Float.class);
		Root<LeaveRequest> root = criteriaQuery.from(LeaveRequest.class);
		Join<LeaveRequest, Employee> employee = root.join(LeaveRequest_.employee);
		Join<Employee, User> user = employee.join(Employee_.user);

		List<Predicate> predicates = new ArrayList<>();

		predicates.add(criteriaBuilder.equal(user.get(User_.isActive), true));
		predicates.add(criteriaBuilder
			.not(employee.get(Employee_.ACCOUNT_STATUS).in(AccountStatus.TERMINATED, AccountStatus.DELETED)));
		predicates.add(criteriaBuilder.equal(root.get(LeaveRequest_.LEAVE_TYPE).get(LeaveType_.TYPE_ID), leaveTypeId));
		predicates
			.add(criteriaBuilder.and(criteriaBuilder.lessThanOrEqualTo(root.get(LeaveRequest_.startDate), endDate),
					criteriaBuilder.greaterThanOrEqualTo(root.get(LeaveRequest_.endDate), startDate)));
		predicates.add(root.get(LeaveRequest_.status).in(LeaveRequestStatus.APPROVED, LeaveRequestStatus.PENDING));

		Predicate[] predArray = new Predicate[predicates.size()];
		predicates.toArray(predArray);
		criteriaQuery.where(predArray);
		criteriaQuery
			.multiselect(criteriaBuilder.coalesce(criteriaBuilder.sum(root.get(LeaveRequest_.durationDays)), 0));

		TypedQuery<Float> typedQuery = entityManager.createQuery(criteriaQuery);
		return typedQuery.getSingleResult();
	}

	@Override
	public Page<LeaveRequest> getLeaveRequestHistoryByTeam(@NonNull Long id,
			TeamLeaveHistoryFilterDto teamLeaveHistoryFilterDto, Pageable page) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
		CriteriaQuery<LeaveRequest> criteriaQuery = criteriaBuilder.createQuery(LeaveRequest.class);
		Root<LeaveRequest> root = criteriaQuery.from(LeaveRequest.class);
		List<Predicate> predicates = new ArrayList<>();

		LeaveRequestFilterDto leaveRequestFilterDto = new LeaveRequestFilterDto();
		leaveRequestFilterDto.setStartDate(teamLeaveHistoryFilterDto.getStartDate());
		leaveRequestFilterDto.setEndDate(teamLeaveHistoryFilterDto.getEndDate());
		setDateRangeBetweenFiltration(leaveRequestFilterDto, criteriaBuilder, root, predicates);

		if (teamLeaveHistoryFilterDto.getStatus() != null && !teamLeaveHistoryFilterDto.getStatus().isEmpty()) {
			predicates.add(root.get(LeaveRequest_.status).in(teamLeaveHistoryFilterDto.getStatus()));
		}
		if (teamLeaveHistoryFilterDto.getLeaveType() != null && !teamLeaveHistoryFilterDto.getLeaveType().isEmpty()) {
			predicates.add(root.get(LeaveRequest_.leaveType)
				.get(LeaveType_.typeId)
				.in(teamLeaveHistoryFilterDto.getLeaveType()));
		}
		Join<LeaveRequest, Employee> employee = root.join(LeaveRequest_.employee);
		Join<Employee, User> user = employee.join(Employee_.user);
		predicates.add(criteriaBuilder.equal(user.get(User_.isActive), true));
		if (teamLeaveHistoryFilterDto.getTeamMemberIds() != null
				&& !teamLeaveHistoryFilterDto.getTeamMemberIds().isEmpty()) {
			predicates.add(employee.get(Employee_.employeeId).in(teamLeaveHistoryFilterDto.getTeamMemberIds()));
		}
		Join<Employee, EmployeeTeam> employeeTeamJoin = employee.join(Employee_.employeeTeams);
		Join<EmployeeTeam, Team> teamJoin = employeeTeamJoin.join(EmployeeTeam_.team);
		predicates.add(criteriaBuilder.equal(teamJoin.get(Team_.TEAM_ID), id));

		Predicate[] predArray = new Predicate[predicates.size()];
		predicates.toArray(predArray);
		criteriaQuery.where(predArray);
		criteriaQuery.orderBy(QueryUtils.toOrders(page.getSort(), root, criteriaBuilder));
		TypedQuery<LeaveRequest> query = entityManager.createQuery(criteriaQuery);
		int totalRows = query.getResultList().size();
		query.setFirstResult(page.getPageNumber() * page.getPageSize());
		query.setMaxResults(page.getPageSize());

		return new PageImpl<>(query.getResultList(), page, totalRows);
	}

	@Override
	public Page<LeaveRequest> findAllLeaveRequestsByEmployeeId(@NonNull Long employeeId,
			EmployeeLeaveHistoryFilterDto employeeLeaveHistoryFilterDto, Pageable page) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();

		CriteriaQuery<LeaveRequest> criteriaQuery = criteriaBuilder.createQuery(LeaveRequest.class);
		Root<LeaveRequest> root = criteriaQuery.from(LeaveRequest.class);
		Join<LeaveRequest, Employee> employee = root.join(LeaveRequest_.employee);
		Join<Employee, User> user = employee.join(Employee_.user);

		List<Predicate> predicates = new ArrayList<>();
		predicates.add(criteriaBuilder.equal(user.get(User_.isActive), true));
		predicates.add(criteriaBuilder.equal(employee.get(Employee_.employeeId), employeeId));

		if (!CollectionUtils.isEmpty(employeeLeaveHistoryFilterDto.getLeaveType())) {
			predicates.add(root.get(LeaveRequest_.leaveType)
				.get(LeaveType_.typeId)
				.in(employeeLeaveHistoryFilterDto.getLeaveType()));
		}
		if (!CollectionUtils.isEmpty(employeeLeaveHistoryFilterDto.getStatus())) {
			predicates.add(root.get(LeaveRequest_.status).in(employeeLeaveHistoryFilterDto.getStatus()));
		}
		if (employeeLeaveHistoryFilterDto.getStartDate() != null
				&& employeeLeaveHistoryFilterDto.getEndDate() != null) {
			LeaveRequestFilterDto leaveRequestFilterDto = new LeaveRequestFilterDto();
			leaveRequestFilterDto.setStartDate(employeeLeaveHistoryFilterDto.getStartDate());
			leaveRequestFilterDto.setEndDate(employeeLeaveHistoryFilterDto.getEndDate());
			setDateRangeBetweenFiltration(leaveRequestFilterDto, criteriaBuilder, root, predicates);
		}

		Predicate[] predArray = new Predicate[predicates.size()];
		predicates.toArray(predArray);
		criteriaQuery.where(predArray);
		criteriaQuery.orderBy(QueryUtils.toOrders(page.getSort(), root, criteriaBuilder));
		TypedQuery<LeaveRequest> query = entityManager.createQuery(criteriaQuery);
		int totalRows = query.getResultList().size();
		query.setFirstResult(page.getPageNumber() * page.getPageSize());
		query.setMaxResults(page.getPageSize());
		return new PageImpl<>(query.getResultList(), page, totalRows);
	}

	@Override
	public List<LeaveRequest> findAllFutureLeaveRequestsForTheDay(DayOfWeek day) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();

		CriteriaQuery<LeaveRequest> criteriaQuery = criteriaBuilder.createQuery(LeaveRequest.class);
		Root<LeaveRequest> root = criteriaQuery.from(LeaveRequest.class);

		List<Predicate> addPredicates = new ArrayList<>();
		List<Predicate> orPredicates = new ArrayList<>();

		Join<LeaveRequest, Employee> employee = root.join(LeaveRequest_.employee);
		Join<Employee, User> user = employee.join(Employee_.user);

		addPredicates.add(criteriaBuilder.equal(user.get(User_.isActive), true));
		addPredicates.add(root.get(LeaveRequest_.status).in(LeaveRequestStatus.APPROVED, LeaveRequestStatus.PENDING));

		ObjectNode leaveCycleConfig = getLeaveCycleConfig();
		if (leaveCycleConfig == null) {
			throw new IllegalArgumentException(
					messageUtil.getMessage(LeaveMessageConstant.LEAVE_ERROR_LEAVE_CYCLE_NOT_FOUND));
		}

		int startMonth = leaveCycleConfig.get(LeaveCycleConfigField.START.getField())
			.get(LeaveCycleConfigField.MONTH.getField())
			.intValue();
		int startDate = leaveCycleConfig.get(LeaveCycleConfigField.START.getField())
			.get(LeaveCycleConfigField.DATE.getField())
			.intValue();
		int endMonth = leaveCycleConfig.get(LeaveCycleConfigField.END.getField())
			.get(LeaveCycleConfigField.MONTH.getField())
			.intValue();
		int endDate = leaveCycleConfig.get(LeaveCycleConfigField.END.getField())
			.get(LeaveCycleConfigField.DATE.getField())
			.intValue();

		int leaveCycleEndYear = LeaveModuleUtil.getLeaveCycleEndYear(startMonth, startDate);
		LocalDate leaveCycleEndDate = DateTimeUtils.getUtcLocalDate(leaveCycleEndYear, endMonth, endDate);
		LocalDate today = DateTimeUtils.getCurrentUtcDate();

		List<LocalDate> allFutureLeaves = getAllDaysBetween(day, today, leaveCycleEndDate);

		for (LocalDate date : allFutureLeaves) {
			orPredicates
				.add(criteriaBuilder.and(criteriaBuilder.lessThanOrEqualTo(root.get(LeaveRequest_.startDate), date),
						criteriaBuilder.greaterThanOrEqualTo(root.get(LeaveRequest_.endDate), date)));
		}

		addPredicates.add(criteriaBuilder.or(orPredicates.toArray(new Predicate[0])));

		Predicate[] predArray = new Predicate[addPredicates.size()];
		addPredicates.toArray(predArray);
		criteriaQuery.where(predArray);

		criteriaQuery.select(root);
		TypedQuery<LeaveRequest> typedQuery = entityManager.createQuery(criteriaQuery);
		return typedQuery.getResultList();
	}

	private void setDateRangeFiltration(LeaveRequestFilterDto leaveRequestFilterDto, CriteriaBuilder criteriaBuilder,
			Root<LeaveRequest> root, List<Predicate> predicates) {
		if (leaveRequestFilterDto != null) {
			if (leaveRequestFilterDto.getStartDate() == null || leaveRequestFilterDto.getEndDate() == null) {

				ObjectNode leaveCycleConfig = getLeaveCycleConfig();
				if (leaveCycleConfig == null) {
					throw new IllegalArgumentException(
							messageUtil.getMessage(LeaveMessageConstant.LEAVE_ERROR_LEAVE_CYCLE_NOT_FOUND));
				}

				int startMonth = leaveCycleConfig.get(LeaveCycleConfigField.START.getField())
					.get(LeaveCycleConfigField.MONTH.getField())
					.intValue();
				int startDate = leaveCycleConfig.get(LeaveCycleConfigField.START.getField())
					.get(LeaveCycleConfigField.DATE.getField())
					.intValue();
				int endMonth = leaveCycleConfig.get(LeaveCycleConfigField.END.getField())
					.get(LeaveCycleConfigField.MONTH.getField())
					.intValue();
				int endDate = leaveCycleConfig.get(LeaveCycleConfigField.END.getField())
					.get(LeaveCycleConfigField.DATE.getField())
					.intValue();
				int leaveCycleEndYear = LeaveModuleUtil.getLeaveCycleEndYear(startMonth, startDate);

				leaveRequestFilterDto.setStartDate(DateTimeUtils.getUtcLocalDate(
						startMonth == 1 && startDate == 1 ? leaveCycleEndYear : leaveCycleEndYear - 1, startMonth,
						startDate));

				leaveRequestFilterDto.setEndDate(DateTimeUtils.getUtcLocalDate(leaveCycleEndYear, endMonth, endDate));

			}

			Predicate dateOverlap = criteriaBuilder.and(
					criteriaBuilder.lessThanOrEqualTo(root.get(LeaveRequest_.startDate),
							leaveRequestFilterDto.getEndDate()),
					criteriaBuilder.greaterThanOrEqualTo(root.get(LeaveRequest_.endDate),
							leaveRequestFilterDto.getStartDate()));
			predicates.add(dateOverlap);
		}
	}

	private void setDateRangeBetweenFiltration(LeaveRequestFilterDto leaveRequestFilterDto,
			CriteriaBuilder criteriaBuilder, Root<LeaveRequest> root, List<Predicate> predicates) {
		if (leaveRequestFilterDto != null) {
			if (leaveRequestFilterDto.getStartDate() == null || leaveRequestFilterDto.getEndDate() == null) {
				ObjectNode leaveCycleConfig = getLeaveCycleConfig();
				if (leaveCycleConfig == null) {
					throw new IllegalArgumentException(
							messageUtil.getMessage(LeaveMessageConstant.LEAVE_ERROR_LEAVE_CYCLE_NOT_FOUND));
				}

				int startMonth = leaveCycleConfig.get(LeaveCycleConfigField.START.getField())
					.get(LeaveCycleConfigField.MONTH.getField())
					.intValue();
				int startDate = leaveCycleConfig.get(LeaveCycleConfigField.START.getField())
					.get(LeaveCycleConfigField.DATE.getField())
					.intValue();
				int endMonth = leaveCycleConfig.get(LeaveCycleConfigField.END.getField())
					.get(LeaveCycleConfigField.MONTH.getField())
					.intValue();
				int endDate = leaveCycleConfig.get(LeaveCycleConfigField.END.getField())
					.get(LeaveCycleConfigField.DATE.getField())
					.intValue();

				int leaveCycleEndYear = LeaveModuleUtil.getLeaveCycleEndYear(startMonth - 1, startDate);

				if (leaveRequestFilterDto.getStartDate() == null) {
					leaveRequestFilterDto.setStartDate(DateTimeUtils.getUtcLocalDate(
							startMonth == 1 && startDate == 1 ? leaveCycleEndYear : leaveCycleEndYear - 1,
							startMonth - 1, startDate));
				}

				if (leaveRequestFilterDto.getEndDate() == null) {
					leaveRequestFilterDto
						.setEndDate(DateTimeUtils.getUtcLocalDate(leaveCycleEndYear, endMonth - 1, endDate));
				}
			}

			Predicate dateRangePredicate = criteriaBuilder.or(
					criteriaBuilder.and(
							criteriaBuilder.lessThanOrEqualTo(root.get(LeaveRequest_.endDate),
									leaveRequestFilterDto.getEndDate()),
							criteriaBuilder.greaterThanOrEqualTo(root.get(LeaveRequest_.startDate),
									leaveRequestFilterDto.getStartDate())),
					criteriaBuilder.and(
							criteriaBuilder.lessThanOrEqualTo(root.get(LeaveRequest_.startDate),
									leaveRequestFilterDto.getStartDate()),
							criteriaBuilder.greaterThanOrEqualTo(root.get(LeaveRequest_.endDate),
									leaveRequestFilterDto.getEndDate())),
					criteriaBuilder.and(
							criteriaBuilder.between(root.get(LeaveRequest_.endDate),
									leaveRequestFilterDto.getStartDate(), leaveRequestFilterDto.getEndDate()),
							criteriaBuilder.lessThanOrEqualTo(root.get(LeaveRequest_.startDate),
									leaveRequestFilterDto.getStartDate())),
					criteriaBuilder.and(
							criteriaBuilder.between(root.get(LeaveRequest_.startDate),
									leaveRequestFilterDto.getStartDate(), leaveRequestFilterDto.getEndDate()),
							criteriaBuilder.greaterThanOrEqualTo(root.get(LeaveRequest_.endDate),
									leaveRequestFilterDto.getEndDate())));
			predicates.add(dateRangePredicate);
		}
	}

	@Override
	public List<LeaveRequest> findLeaveRequestsByDateRange(LeaveRequestFilterDto leaveRequestFilterDto,
			Long employeeId) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();

		CriteriaQuery<LeaveRequest> criteriaQuery = criteriaBuilder.createQuery(LeaveRequest.class);
		Root<LeaveRequest> root = criteriaQuery.from(LeaveRequest.class);

		List<Predicate> predicates = new ArrayList<>();

		Join<LeaveRequest, Employee> employee = root.join(LeaveRequest_.employee);
		Join<Employee, User> user = employee.join(Employee_.user);

		predicates.add(criteriaBuilder.equal(user.get(User_.isActive), true));
		if (employeeId != null) {
			predicates.add(criteriaBuilder.equal(employee.get(Employee_.employeeId), employeeId));
		}
		predicates.add(root.get(LeaveRequest_.status).in(LeaveRequestStatus.APPROVED, LeaveRequestStatus.PENDING));

		if (employeeId != null) {
			setDateRangeFiltration(leaveRequestFilterDto, criteriaBuilder, root, predicates);
		}
		else {
			setDateRangeBetweenFiltration(leaveRequestFilterDto, criteriaBuilder, root, predicates);
		}

		Predicate[] predArray = new Predicate[predicates.size()];
		predicates.toArray(predArray);
		criteriaQuery.where(predArray);

		criteriaQuery.select(root);
		TypedQuery<LeaveRequest> typedQuery = entityManager.createQuery(criteriaQuery);
		return typedQuery.getResultList();
	}

	public Page<LeaveRequest> findAllRequestsByEmployee(Long employeeId, LeaveRequestFilterDto leaveRequestFilterDto,
			Pageable page) {

		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();

		CriteriaQuery<LeaveRequest> criteriaQuery = criteriaBuilder.createQuery(LeaveRequest.class);
		Root<LeaveRequest> root = criteriaQuery.from(LeaveRequest.class);

		List<Predicate> predicates = new ArrayList<>();

		Join<LeaveRequest, Employee> employee = root.join(LeaveRequest_.EMPLOYEE);
		predicates.add(criteriaBuilder.equal(employee.get(Employee_.EMPLOYEE_ID), employeeId));

		if (!CollectionUtils.isEmpty(leaveRequestFilterDto.getLeaveType())) {
			predicates.add(root.get(LeaveRequest_.LEAVE_TYPE)
				.get(LeaveType_.TYPE_ID)
				.in(leaveRequestFilterDto.getLeaveType()));
		}

		if (!CollectionUtils.isEmpty(leaveRequestFilterDto.getStatus())) {
			predicates.add(root.get(LeaveRequest_.STATUS).in(leaveRequestFilterDto.getStatus()));
		}

		if (leaveRequestFilterDto.getStartDate() != null && leaveRequestFilterDto.getEndDate() != null) {
			Predicate dateBetween = criteriaBuilder.or(
					criteriaBuilder.between(root.get(LeaveRequest_.START_DATE), leaveRequestFilterDto.getStartDate(),
							leaveRequestFilterDto.getEndDate()),
					criteriaBuilder.between(root.get(LeaveRequest_.END_DATE), leaveRequestFilterDto.getStartDate(),
							leaveRequestFilterDto.getEndDate()));
			predicates.add(dateBetween);
		}

		Predicate[] predArray = new Predicate[predicates.size()];
		predicates.toArray(predArray);
		criteriaQuery.where(predArray);
		criteriaQuery.orderBy(QueryUtils.toOrders(page.getSort(), root, criteriaBuilder));

		TypedQuery<LeaveRequest> query = entityManager.createQuery(criteriaQuery);

		int totalRows = query.getResultList().size();
		query.setFirstResult(page.getPageNumber() * page.getPageSize());
		query.setMaxResults(page.getPageSize());

		return new PageImpl<>(query.getResultList(), page, totalRows);
	}

	@Override
	public LeaveRequest findByEmployeeAndDate(Long employeeId, LocalDate date) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
		CriteriaQuery<LeaveRequest> criteriaQuery = criteriaBuilder.createQuery(LeaveRequest.class);
		Root<LeaveRequest> leaveRequestRoot = criteriaQuery.from(LeaveRequest.class);

		Join<LeaveRequest, Employee> employeeJoin = leaveRequestRoot.join(LeaveRequest_.employee);

		List<Predicate> predicates = new ArrayList<>();
		predicates.add(criteriaBuilder.equal(employeeJoin.get(Employee_.employeeId), employeeId));
		predicates.add(criteriaBuilder.and(
				criteriaBuilder.lessThanOrEqualTo(leaveRequestRoot.get(LeaveRequest_.startDate), date),
				criteriaBuilder.greaterThanOrEqualTo(leaveRequestRoot.get(LeaveRequest_.endDate), date)));
		predicates.add(
				leaveRequestRoot.get(LeaveRequest_.status).in(LeaveRequestStatus.APPROVED, LeaveRequestStatus.PENDING));

		criteriaQuery.where(predicates.toArray(new Predicate[0]));
		TypedQuery<LeaveRequest> query = entityManager.createQuery(criteriaQuery);
		List<LeaveRequest> result = query.getResultList();

		return result.isEmpty() ? null : result.getFirst();
	}

	@Override
	public Page<LeaveRequest> findAllLeaveRequests(Long managerEmployeeId, LeaveRequestFilterDto leaveRequestFilterDto,
			Pageable page) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
		CriteriaQuery<LeaveRequest> criteriaQuery = criteriaBuilder.createQuery(LeaveRequest.class);
		Root<LeaveRequest> root = criteriaQuery.from(LeaveRequest.class);

		List<Predicate> predicates = new ArrayList<>();
		Join<LeaveRequest, Employee> employee = root.join(LeaveRequest_.employee);
		Join<Employee, User> user = employee.join(Employee_.user);

		predicates.add(criteriaBuilder.equal(user.get(User_.isActive), true));

		if (!CollectionUtils.isEmpty(leaveRequestFilterDto.getLeaveType())) {
			predicates
				.add(root.get(LeaveRequest_.leaveType).get(LeaveType_.typeId).in(leaveRequestFilterDto.getLeaveType()));
		}

		if (!CollectionUtils.isEmpty(leaveRequestFilterDto.getStatus())) {
			predicates.add(root.get(LeaveRequest_.status).in(leaveRequestFilterDto.getStatus()));
		}

		setDateRangeFiltration(leaveRequestFilterDto, criteriaBuilder, root, predicates);

		Subquery<Long> managedEmployeesSubquery = criteriaQuery.subquery(Long.class);
		Root<EmployeeManager> managerRoot = managedEmployeesSubquery.from(EmployeeManager.class);
		managedEmployeesSubquery.select(managerRoot.get(EmployeeManager_.employee).get(Employee_.employeeId))
			.where(criteriaBuilder.equal(managerRoot.get(EmployeeManager_.manager).get(Employee_.employeeId),
					managerEmployeeId));

		predicates.add(criteriaBuilder.or(employee.get(Employee_.employeeId).in(managedEmployeesSubquery)));

		if (leaveRequestFilterDto.getSearchKeyword() != null && !leaveRequestFilterDto.getSearchKeyword().isBlank()) {
			predicates.add(findByEmailName(leaveRequestFilterDto.getSearchKeyword(), criteriaBuilder, employee, user));
		}

		if (leaveRequestFilterDto.getTeamIds() != null && !leaveRequestFilterDto.getTeamIds().isEmpty()
				&& leaveRequestFilterDto.getTeamIds().getFirst() != -1) {
			Join<Employee, EmployeeTeam> employeeTeamJoin = employee.join(Employee_.employeeTeams);
			predicates
				.add(employeeTeamJoin.get(EmployeeTeam_.team).get(Team_.teamId).in(leaveRequestFilterDto.getTeamIds()));
		}

		Predicate[] predArray = predicates.toArray(new Predicate[0]);
		criteriaQuery.where(predArray);
		criteriaQuery.select(root).distinct(true);
		criteriaQuery.orderBy(QueryUtils.toOrders(page.getSort(), root, criteriaBuilder));

		TypedQuery<LeaveRequest> query = entityManager.createQuery(criteriaQuery);

		int totalRows = query.getResultList().size();
		query.setFirstResult(page.getPageNumber() * page.getPageSize());
		query.setMaxResults(page.getPageSize());

		return new PageImpl<>(query.getResultList(), page, totalRows);
	}

	@Override
	public Page<LeaveRequest> findAllRequestAssignedToManager(Long managerEmployeeId,
			LeaveRequestFilterDto leaveRequestFilterDto, Pageable page) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();

		CriteriaQuery<LeaveRequest> criteriaQuery = criteriaBuilder.createQuery(LeaveRequest.class);
		Root<LeaveRequest> root = criteriaQuery.from(LeaveRequest.class);

		List<Predicate> predicates = new ArrayList<>();

		Join<LeaveRequest, Employee> employee = root.join(LeaveRequest_.employee);
		Join<Employee, EmployeeManager> managers = employee.join(Employee_.employeeManagers);
		Join<EmployeeManager, Employee> manEmp = managers.join(EmployeeManager_.manager);
		Join<Employee, User> user = employee.join(Employee_.user);

		predicates.add(criteriaBuilder.equal(user.get(User_.isActive), true));
		predicates.add(criteriaBuilder.equal(manEmp.get(Employee_.employeeId), managerEmployeeId));

		if (!CollectionUtils.isEmpty(leaveRequestFilterDto.getLeaveType())) {
			predicates
				.add(root.get(LeaveRequest_.leaveType).get(LeaveType_.typeId).in(leaveRequestFilterDto.getLeaveType()));
		}

		if (!CollectionUtils.isEmpty(leaveRequestFilterDto.getStatus())) {
			predicates.add(root.get(LeaveRequest_.status).in(leaveRequestFilterDto.getStatus()));
		}
		setDateRangeFiltration(leaveRequestFilterDto, criteriaBuilder, root, predicates);

		if (!CollectionUtils.isEmpty(leaveRequestFilterDto.getManagerType())) {
			predicates.add(managers.get(EmployeeManager_.managerType).in(leaveRequestFilterDto.getManagerType()));
		}

		Predicate[] predArray = new Predicate[predicates.size()];
		predicates.toArray(predArray);
		criteriaQuery.where(predArray);
		criteriaQuery.select(root).distinct(true);
		criteriaQuery.orderBy(QueryUtils.toOrders(page.getSort(), root, criteriaBuilder));

		TypedQuery<LeaveRequest> query = entityManager.createQuery(criteriaQuery);

		int totalRows = query.getResultList().size();
		query.setFirstResult(page.getPageNumber() * page.getPageSize());
		query.setMaxResults(page.getPageSize());

		return new PageImpl<>(query.getResultList(), page, totalRows);
	}

	@Override
	public List<LeaveRequest> findPendingLeaveRequestsByManager(Long managerEmployeeId, String searchKeyword) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
		CriteriaQuery<LeaveRequest> criteriaQuery = criteriaBuilder.createQuery(LeaveRequest.class);
		Root<LeaveRequest> root = criteriaQuery.from(LeaveRequest.class);

		List<Predicate> predicates = new ArrayList<>();

		Join<LeaveRequest, Employee> employee = root.join(LeaveRequest_.employee);
		Join<Employee, User> user = employee.join(Employee_.user);
		Join<Employee, EmployeeManager> employeeManager = employee.join(Employee_.employeeManagers);
		Join<EmployeeManager, Employee> manager = employeeManager.join(EmployeeManager_.manager);

		predicates.add(criteriaBuilder.equal(user.get(User_.isActive), true));
		predicates.add(criteriaBuilder
			.not(employee.get(Employee_.ACCOUNT_STATUS).in(AccountStatus.TERMINATED, AccountStatus.DELETED)));

		predicates.add(criteriaBuilder.equal(manager.get(Employee_.employeeId), managerEmployeeId));
		predicates.add(criteriaBuilder.equal(root.get(LeaveRequest_.status), LeaveRequestStatus.PENDING));

		if (searchKeyword != null && !searchKeyword.trim().isEmpty()) {
			String pattern = "%" + searchKeyword.trim().toLowerCase() + "%";
			Predicate firstNamePredicate = criteriaBuilder
				.like(criteriaBuilder.lower(employee.get(Employee_.firstName)), pattern);
			Predicate middleNamePredicate = criteriaBuilder
				.like(criteriaBuilder.lower(employee.get(Employee_.middleName)), pattern);
			Predicate lastNamePredicate = criteriaBuilder.like(criteriaBuilder.lower(employee.get(Employee_.lastName)),
					pattern);
			Predicate namePredicate = criteriaBuilder.or(firstNamePredicate, middleNamePredicate, lastNamePredicate);
			predicates.add(namePredicate);
		}

		criteriaQuery.where(predicates.toArray(new Predicate[0]));

		TypedQuery<LeaveRequest> query = entityManager.createQuery(criteriaQuery);
		return query.getResultList();
	}

	@Override
	public List<LeaveRequest> getEmployeesOnLeaveByTeamAndDate(List<Long> teams, LocalDate current, Long currentUserId,
			boolean isLeaveAdmin) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
		CriteriaQuery<LeaveRequest> criteriaQuery = criteriaBuilder.createQuery(LeaveRequest.class);
		Root<LeaveRequest> leaveRequestRoot = criteriaQuery.from(LeaveRequest.class);

		Join<LeaveRequest, Employee> employeeJoin = leaveRequestRoot.join(LeaveRequest_.employee);
		List<Predicate> predicates = new ArrayList<>();

		if (teams != null && !teams.isEmpty() && teams.contains(-1L)) {
			if (isLeaveAdmin) {
				Predicate leaveDatePredicate = criteriaBuilder.and(
						criteriaBuilder.lessThanOrEqualTo(leaveRequestRoot.get(LeaveRequest_.startDate), current),
						criteriaBuilder.greaterThanOrEqualTo(leaveRequestRoot.get(LeaveRequest_.endDate), current));
				predicates.add(leaveDatePredicate);

				Predicate leaveStatusPredicate = leaveRequestRoot.get(LeaveRequest_.status)
					.in(LeaveRequestStatus.APPROVED, LeaveRequestStatus.PENDING);
				predicates.add(leaveStatusPredicate);
			}
			else {
				Subquery<Long> managedEmployeesSubquery = criteriaQuery.subquery(Long.class);
				Root<EmployeeManager> managerRoot = managedEmployeesSubquery.from(EmployeeManager.class);
				managedEmployeesSubquery.select(managerRoot.get(EmployeeManager_.employee).get(Employee_.employeeId))
					.where(criteriaBuilder.equal(managerRoot.get(EmployeeManager_.manager).get(Employee_.employeeId),
							currentUserId));

				Subquery<Long> supervisedTeamsSubquery = criteriaQuery.subquery(Long.class);
				Root<EmployeeTeam> teamRoot = supervisedTeamsSubquery.from(EmployeeTeam.class);
				supervisedTeamsSubquery.select(teamRoot.get(EmployeeTeam_.employee).get(Employee_.employeeId))
					.where(criteriaBuilder.and(criteriaBuilder
						.equal(teamRoot.get(EmployeeTeam_.employee).get(Employee_.employeeId), currentUserId),
							criteriaBuilder.isTrue(teamRoot.get(EmployeeTeam_.isSupervisor))));

				predicates.add(criteriaBuilder.or(employeeJoin.get(Employee_.employeeId).in(managedEmployeesSubquery),
						employeeJoin.get(Employee_.employeeId).in(supervisedTeamsSubquery)));
			}

		}
		else if (teams != null && !teams.isEmpty()) {
			Join<Employee, EmployeeTeam> employeeTeamJoin = employeeJoin.join(Employee_.employeeTeams);
			Predicate teamPredicate = employeeTeamJoin.get(EmployeeTeam_.team).get(Team_.teamId).in(teams);
			predicates.add(teamPredicate);
		}

		Predicate leaveDatePredicate = criteriaBuilder.and(
				criteriaBuilder.lessThanOrEqualTo(leaveRequestRoot.get(LeaveRequest_.startDate), current),
				criteriaBuilder.greaterThanOrEqualTo(leaveRequestRoot.get(LeaveRequest_.endDate), current));
		predicates.add(leaveDatePredicate);

		Predicate leaveStatusPredicate = leaveRequestRoot.get(LeaveRequest_.status)
			.in(LeaveRequestStatus.APPROVED, LeaveRequestStatus.PENDING);
		predicates.add(leaveStatusPredicate);

		criteriaQuery.select(leaveRequestRoot).where(predicates.toArray(new Predicate[0]));
		return entityManager.createQuery(criteriaQuery).getResultList();
	}

	public Optional<LeaveRequest> findAuthLeaveRequestById(Long id, User user, Boolean isManager) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();

		CriteriaQuery<LeaveRequest> criteriaQuery = criteriaBuilder.createQuery(LeaveRequest.class);
		Root<LeaveRequest> root = criteriaQuery.from(LeaveRequest.class);

		List<Predicate> predicates = new ArrayList<>();
		predicates.add(criteriaBuilder.equal(root.get(LeaveRequest_.LEAVE_REQUEST_ID), id));

		Join<LeaveRequest, Employee> employee = root.join(LeaveRequest_.EMPLOYEE);

		if (Boolean.TRUE.equals(isManager)) {
			Join<Employee, EmployeeManager> managers = employee.join(Employee_.employeeManagers);
			Join<EmployeeManager, Employee> manEmp = managers.join(EmployeeManager_.MANAGER);
			predicates
				.add(criteriaBuilder.equal(manEmp.get(Employee_.EMPLOYEE_ID), user.getEmployee().getEmployeeId()));
		}
		else {
			predicates
				.add(criteriaBuilder.equal(employee.get(Employee_.EMPLOYEE_ID), user.getEmployee().getEmployeeId()));
		}

		Predicate[] predArray = new Predicate[predicates.size()];
		predicates.toArray(predArray);
		criteriaQuery.where(predArray);

		TypedQuery<LeaveRequest> query = entityManager.createQuery(criteriaQuery);
		return query.getResultList().stream().findFirst();
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

	private Predicate findByEmailName(String keyword, CriteriaBuilder criteriaBuilder,
			Join<LeaveRequest, Employee> employee, Join<Employee, User> userJoin) {
		keyword = PeopleUtil.getSearchString(keyword);
		return criteriaBuilder.or(
				criteriaBuilder.like(criteriaBuilder
					.lower(criteriaBuilder.concat(criteriaBuilder.concat(employee.get(Employee_.FIRST_NAME), " "),
							employee.get(Employee_.LAST_NAME))),
						keyword),
				criteriaBuilder.like(criteriaBuilder.lower(userJoin.get(User_.EMAIL)), keyword),
				criteriaBuilder.like(criteriaBuilder.lower(employee.get(Employee_.LAST_NAME)), keyword));
	}

	@Override
	public List<LeaveTrendByDay> findLeaveTrendAwayByDay(LocalDate startDate, LocalDate endDate,
			List<Integer> workingDaysIndex, List<LocalDate> holidayDates) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();

		List<LocalDate> allDates = startDate.datesUntil(endDate.plusDays(1)).filter(date -> {

			if (workingDaysIndex != null && !workingDaysIndex.isEmpty()) {
				int dayOfWeek = date.getDayOfWeek().getValue() % 7;
				if (!workingDaysIndex.contains(dayOfWeek)) {
					return false;
				}
			}
			return holidayDates == null || !holidayDates.contains(date);
		}).toList();

		List<LeaveTrendByDay> result = new ArrayList<>();

		for (LocalDate date : allDates) {
			CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
			Root<LeaveRequest> leaveRequest = countQuery.from(LeaveRequest.class);
			Join<LeaveRequest, Employee> employee = leaveRequest.join(LeaveRequest_.employee);
			Join<Employee, User> user = employee.join(Employee_.user);

			List<Predicate> predicates = new ArrayList<>();

			predicates.add(cb.lessThanOrEqualTo(leaveRequest.get(LeaveRequest_.startDate), date));
			predicates.add(cb.greaterThanOrEqualTo(leaveRequest.get(LeaveRequest_.endDate), date));

			predicates.add(
					leaveRequest.get(LeaveRequest_.status).in(LeaveRequestStatus.APPROVED, LeaveRequestStatus.PENDING));

			predicates.add(cb.equal(user.get(User_.isActive), true));

			countQuery.select(cb.countDistinct(employee.get(Employee_.employeeId)));
			countQuery.where(predicates.toArray(new Predicate[0]));

			Long count = entityManager.createQuery(countQuery).getSingleResult();

			final LocalDate finalDate = date;
			final Integer employeeCount = count.intValue();

			result.add(new LeaveTrendByDay() {
				public LocalDate getLeaveDate() {
					return finalDate;
				}

				public Integer getEmployeeCount() {
					return employeeCount;
				}
			});
		}

		result.sort(Comparator.comparing(LeaveTrendByDay::getLeaveDate));
		return result;
	}

	@Override
	public List<LeaveTrendByMonth> findLeaveTrendAwayByMonth(LocalDate startDate, LocalDate endDate,
			List<Integer> workingDaysIndex, List<LocalDate> holidayDates) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();

		List<LocalDate> allDates = startDate.datesUntil(endDate.plusDays(1)).filter(date -> {
			if (workingDaysIndex != null && !workingDaysIndex.isEmpty()) {
				int dayOfWeek = date.getDayOfWeek().getValue() % 7;
				if (!workingDaysIndex.contains(dayOfWeek)) {
					return false;
				}
			}
			return holidayDates == null || !holidayDates.contains(date);
		}).toList();

		Map<Integer, Set<Long>> employeesByMonth = new HashMap<>();

		for (LocalDate date : allDates) {
			CriteriaQuery<Long> employeeQuery = cb.createQuery(Long.class);
			Root<LeaveRequest> leaveRequest = employeeQuery.from(LeaveRequest.class);
			Join<LeaveRequest, Employee> employee = leaveRequest.join(LeaveRequest_.employee);
			Join<Employee, User> user = employee.join(Employee_.user);

			List<Predicate> predicates = new ArrayList<>();

			predicates.add(cb.lessThanOrEqualTo(leaveRequest.get(LeaveRequest_.startDate), date));
			predicates.add(cb.greaterThanOrEqualTo(leaveRequest.get(LeaveRequest_.endDate), date));

			predicates.add(
					leaveRequest.get(LeaveRequest_.status).in(LeaveRequestStatus.APPROVED, LeaveRequestStatus.PENDING));

			predicates.add(cb.equal(user.get(User_.isActive), true));

			employeeQuery.select(employee.get(Employee_.employeeId));
			employeeQuery.where(predicates.toArray(new Predicate[0]));
			employeeQuery.distinct(true);

			List<Long> employeesOnLeave = entityManager.createQuery(employeeQuery).getResultList();

			int month = date.getMonthValue();
			employeesByMonth.computeIfAbsent(month, k -> new HashSet<>()).addAll(employeesOnLeave);
		}

		List<LeaveTrendByMonth> result = new ArrayList<>();
		for (Map.Entry<Integer, Set<Long>> entry : employeesByMonth.entrySet()) {
			final Integer month = entry.getKey();
			final Integer count = entry.getValue().size();

			result.add(new LeaveTrendByMonth() {
				public Integer getKeyValue() {
					return month;
				}

				public Integer getEmployeeCount() {
					return count;
				}
			});
		}

		result.sort(Comparator.comparing(LeaveTrendByMonth::getKeyValue));
		return result;
	}

	public List<LeaveTypeBreakDown> findLeaveTypeBreakDown(List<Integer> workingDaysIndex, List<LocalDate> holidayDates,
			LocalDate startDate, LocalDate endDate, List<Long> typeIds, List<Long> teamIds) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();

		List<LocalDate> allDates = startDate.datesUntil(endDate.plusDays(1)).toList();

		Map<String, Double> leaveCountsByTypeAndMonth = new HashMap<>();

		for (LocalDate date : allDates) {

			if (workingDaysIndex != null && !workingDaysIndex.isEmpty()
					&& !workingDaysIndex.contains(date.getDayOfWeek().getValue() % 7)) {
				continue;
			}

			if (holidayDates != null && holidayDates.contains(date)) {
				continue;
			}

			CriteriaQuery<Object[]> leaveQuery = cb.createQuery(Object[].class);
			Root<LeaveRequest> leaveRequest = leaveQuery.from(LeaveRequest.class);
			Join<LeaveRequest, Employee> employee = leaveRequest.join(LeaveRequest_.employee);
			Join<Employee, User> user = employee.join(Employee_.user);
			Join<LeaveRequest, LeaveType> leaveType = leaveRequest.join(LeaveRequest_.leaveType);

			Join<Employee, EmployeeTeam> employeeTeam = null;
			if (teamIds != null && !teamIds.isEmpty()) {
				employeeTeam = employee.join(Employee_.employeeTeams, JoinType.LEFT);
			}

			List<Predicate> predicates = new ArrayList<>();

			predicates.add(cb.lessThanOrEqualTo(leaveRequest.get(LeaveRequest_.startDate), date));
			predicates.add(cb.greaterThanOrEqualTo(leaveRequest.get(LeaveRequest_.endDate), date));

			predicates.add(cb.equal(leaveRequest.get(LeaveRequest_.status), LeaveRequestStatus.APPROVED));

			predicates.add(cb.equal(user.get(User_.isActive), true));

			if (typeIds != null && !typeIds.isEmpty()) {
				predicates.add(leaveType.get(LeaveType_.typeId).in(typeIds));
			}

			if (teamIds != null && !teamIds.isEmpty() && employeeTeam != null) {
				predicates.add(employeeTeam.get(EmployeeTeam_.team).get(Team_.teamId).in(teamIds));
			}

			predicates.add(cb.equal(leaveType.get(LeaveType_.isActive), true));

			leaveQuery.multiselect(leaveType.get(LeaveType_.typeId), leaveRequest.get(LeaveRequest_.leaveState));
			leaveQuery.where(predicates.toArray(new Predicate[0]));

			List<Object[]> results = entityManager.createQuery(leaveQuery).getResultList();

			for (Object[] result : results) {
				Long leaveTypeId = (Long) result[0];
				LeaveState leaveState = (LeaveState) result[1];

				double leaveCount = 1.0;
				if (leaveState == LeaveState.HALFDAY_MORNING || leaveState == LeaveState.HALFDAY_EVENING) {
					leaveCount = 0.5;
				}

				int month = date.getMonthValue();
				String key = leaveTypeId + ":" + month;

				leaveCountsByTypeAndMonth.put(key, leaveCountsByTypeAndMonth.getOrDefault(key, 0.0) + leaveCount);
			}
		}

		List<LeaveTypeBreakDown> result = new ArrayList<>();
		for (Map.Entry<String, Double> entry : leaveCountsByTypeAndMonth.entrySet()) {
			String[] keyParts = entry.getKey().split(":");
			final Integer leaveTypeId = Integer.parseInt(keyParts[0]);
			final Integer month = Integer.parseInt(keyParts[1]);
			final Double leaveCount = entry.getValue();

			result.add(new LeaveTypeBreakDown() {
				public Integer getLeaveType() {
					return leaveTypeId;
				}

				public Integer getKeyValue() {
					return month;
				}

				public Double getLeaveCount() {
					return leaveCount;
				}
			});
		}

		result.sort(
				Comparator.comparing(LeaveTypeBreakDown::getKeyValue).thenComparing(LeaveTypeBreakDown::getLeaveType));

		return result;
	}

	@Override
	public List<LeaveUtilizationByEmployeeMonthly> findLeaveUtilizationByEmployeeMonthly(LocalDate startDate,
			LocalDate endDate, List<Integer> workingDaysIndex, List<LocalDate> holidayDates, Long employeeId,
			List<Long> typeIds) {

		CriteriaBuilder cb = entityManager.getCriteriaBuilder();

		List<LocalDate> allDates = startDate.datesUntil(endDate.plusDays(1))
			.filter(date -> isValidLeaveDate(date, workingDaysIndex, holidayDates))
			.toList();

		Map<String, Float> leaveCountsByTypeAndMonth = new HashMap<>();

		for (LocalDate date : allDates) {

			CriteriaQuery<Object[]> leaveQuery = cb.createQuery(Object[].class);
			Root<LeaveRequest> leaveRequest = leaveQuery.from(LeaveRequest.class);
			Join<LeaveRequest, Employee> employee = leaveRequest.join(LeaveRequest_.employee);
			Join<Employee, User> user = employee.join(Employee_.user);

			List<Predicate> predicates = new ArrayList<>();

			predicates.add(cb.lessThanOrEqualTo(leaveRequest.get(LeaveRequest_.startDate), date));
			predicates.add(cb.greaterThanOrEqualTo(leaveRequest.get(LeaveRequest_.endDate), date));

			predicates.add(cb.equal(employee.get(Employee_.employeeId), employeeId));

			predicates.add(
					leaveRequest.get(LeaveRequest_.status).in(LeaveRequestStatus.APPROVED, LeaveRequestStatus.PENDING));
			predicates.add(cb.equal(user.get(User_.isActive), true));

			if (typeIds != null && !typeIds.isEmpty()) {
				predicates.add(leaveRequest.get(LeaveRequest_.leaveType).get(LeaveType_.typeId).in(typeIds));
			}

			leaveQuery.multiselect(leaveRequest.get(LeaveRequest_.leaveType).get(LeaveType_.typeId),
					leaveRequest.get(LeaveRequest_.leaveState));
			leaveQuery.where(predicates.toArray(new Predicate[0]));

			List<Object[]> results = entityManager.createQuery(leaveQuery).getResultList();

			for (Object[] result : results) {
				Long leaveTypeId = (Long) result[0];
				LeaveState leaveState = (LeaveState) result[1];

				float leaveCount = (leaveState == LeaveState.HALFDAY_MORNING
						|| leaveState == LeaveState.HALFDAY_EVENING) ? 0.5f : 1.0f;

				int month = date.getMonthValue();
				String key = leaveTypeId + ":" + month;

				leaveCountsByTypeAndMonth.put(key, leaveCountsByTypeAndMonth.getOrDefault(key, 0.0f) + leaveCount);
			}
		}

		return convertToResultList(leaveCountsByTypeAndMonth);
	}

	private boolean isValidLeaveDate(LocalDate date, List<Integer> workingDaysIndex, List<LocalDate> holidayDates) {

		if (workingDaysIndex != null && !workingDaysIndex.isEmpty()
				&& !workingDaysIndex.contains(date.getDayOfWeek().getValue() % 7)) {
			return false;
		}

		return holidayDates == null || !holidayDates.contains(date);
	}

	private List<LeaveUtilizationByEmployeeMonthly> convertToResultList(Map<String, Float> leaveCountsByTypeAndMonth) {

		List<LeaveUtilizationByEmployeeMonthly> result = new ArrayList<>();

		for (Map.Entry<String, Float> entry : leaveCountsByTypeAndMonth.entrySet()) {
			String[] keyParts = entry.getKey().split(":");
			final Integer leaveTypeId = Integer.parseInt(keyParts[0]);
			final Integer month = Integer.parseInt(keyParts[1]);
			final Float leaveCount = entry.getValue();

			result.add(new LeaveUtilizationByEmployeeMonthly() {
				public Integer getLeaveType() {
					return leaveTypeId;
				}

				public Integer getMonthValue() {
					return month;
				}

				public Float getLeaveCount() {
					return leaveCount;
				}
			});
		}

		result.sort(Comparator.comparing(LeaveUtilizationByEmployeeMonthly::getMonthValue)
			.thenComparing(LeaveUtilizationByEmployeeMonthly::getLeaveType));

		return result;
	}

	@Override
	public List<OrganizationLeaveTrendForTheYear> findOrganizationLeaveTrendForTheYear(List<Integer> workingDaysIndex,
			List<LocalDate> holidayDates, List<Long> leaveTypeIds, LocalDate startDate, LocalDate endDate) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();

		List<LocalDate> allDates = startDate.datesUntil(endDate.plusDays(1))
			.filter(date -> isValidWorkingDay(date, workingDaysIndex, holidayDates))
			.toList();

		Map<String, Float> leaveCountsByTypeAndMonth = new HashMap<>();

		for (LocalDate date : allDates) {

			CriteriaQuery<Object[]> leaveQuery = cb.createQuery(Object[].class);
			Root<LeaveRequest> leaveRequest = leaveQuery.from(LeaveRequest.class);
			Join<LeaveRequest, Employee> employee = leaveRequest.join(LeaveRequest_.EMPLOYEE);
			Join<Employee, User> user = employee.join(Employee_.USER);
			Join<LeaveRequest, LeaveType> leaveType = leaveRequest.join(LeaveRequest_.LEAVE_TYPE);

			List<Predicate> predicates = new ArrayList<>();

			predicates.add(cb.lessThanOrEqualTo(leaveRequest.get(LeaveRequest_.START_DATE), date));
			predicates.add(cb.greaterThanOrEqualTo(leaveRequest.get(LeaveRequest_.END_DATE), date));

			predicates.add(
					leaveRequest.get(LeaveRequest_.STATUS).in(LeaveRequestStatus.APPROVED, LeaveRequestStatus.PENDING));

			predicates.add(cb.equal(user.get(User_.IS_ACTIVE), true));

			if (leaveTypeIds != null && !leaveTypeIds.isEmpty()) {
				predicates.add(leaveType.get(LeaveType_.TYPE_ID).in(leaveTypeIds));
			}

			predicates.add(cb.equal(leaveType.get(LeaveType_.IS_ACTIVE), true));

			leaveQuery.multiselect(leaveType.get(LeaveType_.TYPE_ID), leaveRequest.get(LeaveRequest_.LEAVE_STATE));
			leaveQuery.where(predicates.toArray(new Predicate[0]));

			List<Object[]> results = entityManager.createQuery(leaveQuery).getResultList();

			int month = date.getMonthValue();
			for (Object[] result : results) {
				Long typeId = (Long) result[0];
				LeaveState leaveState = (LeaveState) result[1];

				String key = typeId + ":" + month;

				float leaveCount = 1.0f;
				if (leaveState == LeaveState.HALFDAY_MORNING || leaveState == LeaveState.HALFDAY_EVENING) {
					leaveCount = 0.5f;
				}

				leaveCountsByTypeAndMonth.merge(key, leaveCount, Float::sum);
			}
		}

		List<OrganizationLeaveTrendForTheYear> result = new ArrayList<>();
		for (Map.Entry<String, Float> entry : leaveCountsByTypeAndMonth.entrySet()) {
			String[] keyParts = entry.getKey().split(":");
			final Integer leaveTypeId = Integer.parseInt(keyParts[0]);
			final Integer month = Integer.parseInt(keyParts[1]);
			final Float leaveCount = entry.getValue();

			result.add(new OrganizationLeaveTrendForTheYear() {
				public Integer getLeaveType() {
					return leaveTypeId;
				}

				public Integer getKeyValue() {
					return month;
				}

				public Float getLeaveRequestCount() {
					return leaveCount;
				}
			});
		}

		result.sort(Comparator.comparing(OrganizationLeaveTrendForTheYear::getKeyValue)
			.thenComparing(OrganizationLeaveTrendForTheYear::getLeaveType));

		return result;
	}

	private boolean isValidWorkingDay(LocalDate date, List<Integer> workingDaysIndex, List<LocalDate> holidayDates) {
		if (holidayDates != null && !holidayDates.isEmpty()) {
			if (holidayDates.contains(date)) {
				return false;
			}
		}

		if (workingDaysIndex != null && !workingDaysIndex.isEmpty()) {
			int weekday = (date.getDayOfWeek().getValue() - 1) % 7;
			return workingDaysIndex.contains(weekday);
		}

		return true;
	}

	@Override
	public List<TeamLeaveTrendForTheYear> findTeamLeaveTrendForTheYear(Long teamId, List<Integer> workingDays,
			List<LocalDate> holidayDates, List<Long> leaveTypeIds, LocalDate startDate, LocalDate endDate) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();

		List<LocalDate> allDates = startDate.datesUntil(endDate.plusDays(1))
			.filter(date -> isValidWorkingDay(date, workingDays, holidayDates))
			.toList();

		Map<String, Float> leaveCountsByTypeAndMonth = new HashMap<>();

		for (LocalDate date : allDates) {
			CriteriaQuery<Object[]> leaveQuery = cb.createQuery(Object[].class);
			Root<LeaveRequest> leaveRequest = leaveQuery.from(LeaveRequest.class);
			Join<LeaveRequest, Employee> employee = leaveRequest.join(LeaveRequest_.EMPLOYEE);
			Join<Employee, User> user = employee.join(Employee_.USER);
			Join<LeaveRequest, LeaveType> leaveType = leaveRequest.join(LeaveRequest_.LEAVE_TYPE);
			Join<Employee, EmployeeTeam> employeeTeam = employee.join(Employee_.EMPLOYEE_TEAMS);
			Join<EmployeeTeam, Team> team = employeeTeam.join(EmployeeTeam_.TEAM);

			List<Predicate> predicates = new ArrayList<>();

			predicates.add(cb.equal(team.get(Team_.TEAM_ID), teamId));

			predicates.add(cb.lessThanOrEqualTo(leaveRequest.get(LeaveRequest_.START_DATE), date));
			predicates.add(cb.greaterThanOrEqualTo(leaveRequest.get(LeaveRequest_.END_DATE), date));

			predicates.add(
					leaveRequest.get(LeaveRequest_.STATUS).in(LeaveRequestStatus.APPROVED, LeaveRequestStatus.PENDING));

			predicates.add(cb.equal(user.get(User_.IS_ACTIVE), true));

			if (leaveTypeIds != null && !leaveTypeIds.isEmpty()) {
				predicates.add(leaveType.get(LeaveType_.TYPE_ID).in(leaveTypeIds));
			}

			predicates.add(cb.equal(leaveType.get(LeaveType_.IS_ACTIVE), true));

			leaveQuery.multiselect(leaveType.get(LeaveType_.TYPE_ID), leaveRequest.get(LeaveRequest_.LEAVE_STATE));
			leaveQuery.where(predicates.toArray(new Predicate[0]));

			List<Object[]> results = entityManager.createQuery(leaveQuery).getResultList();

			int month = date.getMonthValue();
			for (Object[] result : results) {
				Long typeId = (Long) result[0];
				LeaveState leaveState = (LeaveState) result[1];

				String key = typeId + ":" + month;

				float leaveCount = 1.0f;
				if (leaveState == LeaveState.HALFDAY_MORNING || leaveState == LeaveState.HALFDAY_EVENING) {
					leaveCount = 0.5f;
				}

				leaveCountsByTypeAndMonth.merge(key, leaveCount, Float::sum);
			}
		}

		List<TeamLeaveTrendForTheYear> result = new ArrayList<>();
		for (Map.Entry<String, Float> entry : leaveCountsByTypeAndMonth.entrySet()) {
			String[] keyParts = entry.getKey().split(":");
			final Integer leaveTypeId = Integer.parseInt(keyParts[0]);
			final Integer month = Integer.parseInt(keyParts[1]);
			final Float leaveCount = entry.getValue();

			result.add(new TeamLeaveTrendForTheYear() {

				public Integer getLeaveType() {
					return leaveTypeId;
				}

				public Integer getKeyValue() {
					return month;
				}

				public Float getLeaveRequestCount() {
					return leaveCount;
				}
			});
		}

		result.sort(Comparator.comparing(TeamLeaveTrendForTheYear::getKeyValue)
			.thenComparing(TeamLeaveTrendForTheYear::getLeaveType));

		return result;
	}

	@Override
	public List<ManagerLeaveTrend> findLeaveTrendForTheManager(List<Long> teamIds, List<Integer> workingDays,
			List<LocalDate> holidayDates, List<Long> leaveTypeIds, LocalDate startDate, LocalDate endDate,
			List<Long> employeeIds) {

		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<LeaveRequest> query = cb.createQuery(LeaveRequest.class);
		Root<LeaveRequest> leaveRequest = query.from(LeaveRequest.class);

		Join<LeaveRequest, Employee> employee = leaveRequest.join(LeaveRequest_.EMPLOYEE);
		Join<Employee, User> user = employee.join(Employee_.USER);
		Join<LeaveRequest, LeaveType> leaveType = leaveRequest.join(LeaveRequest_.LEAVE_TYPE);

		List<Predicate> predicates = new ArrayList<>();

		List<Predicate> teamOrEmployeePredicates = new ArrayList<>();

		if (teamIds != null && !teamIds.isEmpty()) {
			Join<Employee, EmployeeTeam> employeeTeam = employee.join(Employee_.EMPLOYEE_TEAMS);
			Join<EmployeeTeam, Team> team = employeeTeam.join(EmployeeTeam_.TEAM);
			teamOrEmployeePredicates.add(team.get(Team_.TEAM_ID).in(teamIds));
		}

		if (employeeIds != null && !employeeIds.isEmpty()) {
			teamOrEmployeePredicates.add(employee.get(Employee_.EMPLOYEE_ID).in(employeeIds));
		}

		if (!teamOrEmployeePredicates.isEmpty()) {
			predicates.add(cb.or(teamOrEmployeePredicates.toArray(new Predicate[0])));
		}

		predicates.add(cb.lessThanOrEqualTo(leaveRequest.get(LeaveRequest_.END_DATE), endDate));
		predicates.add(cb.greaterThanOrEqualTo(leaveRequest.get(LeaveRequest_.START_DATE), startDate));

		predicates
			.add(leaveRequest.get(LeaveRequest_.STATUS).in(LeaveRequestStatus.APPROVED, LeaveRequestStatus.PENDING));
		predicates.add(cb.equal(user.get(User_.IS_ACTIVE), true));
		predicates.add(cb.equal(leaveType.get(LeaveType_.IS_ACTIVE), true));

		if (leaveTypeIds != null && !leaveTypeIds.isEmpty()) {
			predicates.add(leaveType.get(LeaveType_.TYPE_ID).in(leaveTypeIds));
		}

		query.select(leaveRequest).where(predicates.toArray(new Predicate[0]));

		List<LeaveRequest> leaveRequests = entityManager.createQuery(query).getResultList();

		Set<LocalDate> validDates = startDate.datesUntil(endDate.plusDays(1))
			.filter(date -> isValidWorkingDay(date, workingDays, holidayDates))
			.collect(Collectors.toSet());

		Map<Long, Map<Integer, Float>> leaveCountsByTypeAndMonth = new HashMap<>();

		for (LeaveRequest lr : leaveRequests) {
			LocalDate leaveStart = lr.getStartDate().isBefore(startDate) ? startDate : lr.getStartDate();
			LocalDate leaveEnd = lr.getEndDate().isAfter(endDate) ? endDate : lr.getEndDate();

			for (LocalDate date = leaveStart; !date.isAfter(leaveEnd); date = date.plusDays(1)) {
				if (!validDates.contains(date))
					continue;

				Long leaveTypeId = lr.getLeaveType().getTypeId();
				int month = date.getMonthValue();
				float leaveCount = (lr.getLeaveState() == LeaveState.HALFDAY_MORNING
						|| lr.getLeaveState() == LeaveState.HALFDAY_EVENING) ? 0.5f : 1.0f;

				leaveCountsByTypeAndMonth.computeIfAbsent(leaveTypeId, k -> new HashMap<>())
					.merge(month, leaveCount, Float::sum);
			}
		}

		List<ManagerLeaveTrend> result = new ArrayList<>();

		for (Map.Entry<Long, Map<Integer, Float>> outer : leaveCountsByTypeAndMonth.entrySet()) {
			Long leaveTypeId = outer.getKey();
			for (Map.Entry<Integer, Float> inner : outer.getValue().entrySet()) {
				Integer month = inner.getKey();
				Float count = inner.getValue();
				result.add(new ManagerLeaveTrend() {
					public Integer getLeaveType() {
						return leaveTypeId.intValue();
					}

					public Integer getKeyValue() {
						return month;
					}

					public Float getLeaveRequestCount() {
						return count;
					}
				});
			}
		}

		result
			.sort(Comparator.comparing(ManagerLeaveTrend::getKeyValue).thenComparing(ManagerLeaveTrend::getLeaveType));

		return result;
	}

	@Override
	public Float findAllEmployeeRequestsByDateRangeQuery(LocalDate startDate, LocalDate endDate,
			List<Integer> workingDaysIndex, List<LocalDate> holidayDates) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();

		List<LocalDate> allDates = startDate.datesUntil(endDate.plusDays(1))
			.filter(date -> isValidWorkingDay(date, workingDaysIndex, holidayDates))
			.toList();

		float totalLeaveCount = 0.0f;

		for (LocalDate date : allDates) {
			CriteriaQuery<Float> leaveQuery = cb.createQuery(Float.class);
			Root<LeaveRequest> leaveRequest = leaveQuery.from(LeaveRequest.class);
			Join<LeaveRequest, Employee> employee = leaveRequest.join(LeaveRequest_.EMPLOYEE);
			Join<Employee, User> user = employee.join(Employee_.USER);

			List<Predicate> predicates = new ArrayList<>();

			predicates.add(cb.lessThanOrEqualTo(leaveRequest.get(LeaveRequest_.START_DATE), date));
			predicates.add(cb.greaterThanOrEqualTo(leaveRequest.get(LeaveRequest_.END_DATE), date));

			predicates.add(
					leaveRequest.get(LeaveRequest_.STATUS).in(LeaveRequestStatus.APPROVED, LeaveRequestStatus.PENDING));

			predicates.add(cb.equal(user.get(User_.IS_ACTIVE), true));

			Expression<Float> leaveCountExpression = cb.<Float>selectCase()
				.when(cb.or(cb.equal(leaveRequest.get(LeaveRequest_.LEAVE_STATE), LeaveState.HALFDAY_MORNING),
						cb.equal(leaveRequest.get(LeaveRequest_.LEAVE_STATE), LeaveState.HALFDAY_EVENING)), 0.5f)
				.otherwise(1.0f);

			leaveQuery.select(cb.coalesce(cb.sum(leaveCountExpression), 0.0f));
			leaveQuery.where(predicates.toArray(new Predicate[0]));

			Float dayLeaveCount = entityManager.createQuery(leaveQuery).getSingleResult();
			if (dayLeaveCount != null) {
				totalLeaveCount += dayLeaveCount;
			}
		}

		return totalLeaveCount;
	}

	@Override
	public List<TeamLeaveCountByType> findTeamLeaveCountByType(Long teamId, List<Integer> workingDays,
			List<LocalDate> holidayDates, LocalDate startDate, LocalDate endDate) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();

		List<LocalDate> allDates = startDate.datesUntil(endDate.plusDays(1))
			.filter(date -> isValidWorkingDay(date, workingDays, holidayDates))
			.toList();

		Map<Integer, Float> leaveCountsByType = new HashMap<>();

		for (LocalDate date : allDates) {
			CriteriaQuery<Object[]> leaveQuery = cb.createQuery(Object[].class);
			Root<LeaveRequest> leaveRequest = leaveQuery.from(LeaveRequest.class);
			Join<LeaveRequest, Employee> employee = leaveRequest.join(LeaveRequest_.EMPLOYEE);
			Join<Employee, User> user = employee.join(Employee_.USER);
			Join<Employee, EmployeeTeam> employeeTeam = employee.join(Employee_.EMPLOYEE_TEAMS);
			Join<EmployeeTeam, Team> team = employeeTeam.join(EmployeeTeam_.TEAM);
			Join<LeaveRequest, LeaveType> leaveType = leaveRequest.join(LeaveRequest_.LEAVE_TYPE);

			List<Predicate> predicates = new ArrayList<>();

			predicates.add(cb.equal(team.get(Team_.TEAM_ID), teamId));

			predicates.add(cb.lessThanOrEqualTo(leaveRequest.get(LeaveRequest_.START_DATE), date));
			predicates.add(cb.greaterThanOrEqualTo(leaveRequest.get(LeaveRequest_.END_DATE), date));

			predicates.add(
					leaveRequest.get(LeaveRequest_.STATUS).in(LeaveRequestStatus.APPROVED, LeaveRequestStatus.PENDING));

			predicates.add(cb.equal(user.get(User_.IS_ACTIVE), true));

			leaveQuery.multiselect(leaveType.get(LeaveType_.TYPE_ID).as(Integer.class),
					leaveRequest.get(LeaveRequest_.LEAVE_STATE));
			leaveQuery.where(predicates.toArray(new Predicate[0]));

			List<Object[]> results = entityManager.createQuery(leaveQuery).getResultList();

			for (Object[] result : results) {
				Integer typeId = (Integer) result[0];
				LeaveState leaveState = (LeaveState) result[1];

				float leaveCount = (leaveState == LeaveState.HALFDAY_MORNING
						|| leaveState == LeaveState.HALFDAY_EVENING) ? 0.5f : 1.0f;

				leaveCountsByType.merge(typeId, leaveCount, Float::sum);
			}
		}

		List<TeamLeaveCountByType> result = new ArrayList<>();
		for (Map.Entry<Integer, Float> entry : leaveCountsByType.entrySet()) {
			final Integer leaveTypeId = entry.getKey();
			final Float leaveCount = entry.getValue();

			result.add(new TeamLeaveCountByType() {
				public Integer getLeaveType() {
					return leaveTypeId;
				}

				public Float getLeaveDaysCount() {
					return leaveCount;
				}
			});
		}

		result.sort(Comparator.comparing(TeamLeaveCountByType::getLeaveType));

		return result;
	}

}
