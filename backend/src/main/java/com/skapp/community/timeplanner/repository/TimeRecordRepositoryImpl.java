package com.skapp.community.timeplanner.repository;

import com.skapp.community.common.model.User_;
import com.skapp.community.common.type.Role;
import com.skapp.community.peopleplanner.model.*;
import com.skapp.community.peopleplanner.model.EmployeeManager_;
import com.skapp.community.peopleplanner.model.EmployeeRole_;
import com.skapp.community.peopleplanner.model.EmployeeTeam_;
import com.skapp.community.peopleplanner.model.Employee_;
import com.skapp.community.peopleplanner.model.Team_;
import com.skapp.community.timeplanner.model.TimeRecord;
import com.skapp.community.timeplanner.model.TimeRecord_;
import com.skapp.community.timeplanner.model.TimeSlot;
import com.skapp.community.timeplanner.model.TimeSlot_;
import com.skapp.community.timeplanner.payload.projection.EmployeeWorkHours;
import com.skapp.community.timeplanner.payload.projection.TimeRecordTrendDto;
import com.skapp.community.timeplanner.payload.projection.TimeRecordsByEmployeesDto;
import com.skapp.community.timeplanner.payload.request.AttendanceSummaryDto;
import com.skapp.community.timeplanner.payload.response.TimeSheetSummaryData;
import com.skapp.community.timeplanner.repository.projection.EmployeeTimeRecord;
import com.skapp.community.timeplanner.repository.projection.EmployeeTimeRecordImpl;
import jakarta.persistence.*;
import jakarta.persistence.criteria.*;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.Month;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class TimeRecordRepositoryImpl implements TimeRecordRepository {

	@NonNull
	private final EntityManager entityManager;

	@Override
	public AttendanceSummaryDto getEmployeeAttendanceSummary(List<Long> employeeIds, LocalDate startDate,
			LocalDate endDate) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
		CriteriaQuery<AttendanceSummaryDto> criteriaQuery = criteriaBuilder.createQuery(AttendanceSummaryDto.class);
		Root<TimeRecord> root = criteriaQuery.from(TimeRecord.class);

		List<Predicate> predicates = new ArrayList<>();
		predicates.add((root.get(TimeRecord_.employee).get(Employee_.employeeId).in(employeeIds)));
		predicates.add(criteriaBuilder.between(root.get(TimeRecord_.date), startDate, endDate));

		Predicate[] predArray = new Predicate[predicates.size()];
		predicates.toArray(predArray);
		criteriaQuery.where(predArray);
		criteriaQuery.select(criteriaBuilder.construct(AttendanceSummaryDto.class,
				criteriaBuilder.coalesce(criteriaBuilder.sum(root.get(TimeRecord_.workedHours)), 0.0),
				criteriaBuilder.coalesce(criteriaBuilder.sum(root.get(TimeRecord_.breakHours)), 0.0)));
		TypedQuery<AttendanceSummaryDto> typedQuery = entityManager.createQuery(criteriaQuery);
		return typedQuery.getSingleResult();
	}


	@Override
	public Optional<TimeRecord> findIncompleteClockoutTimeRecords(LocalDate lastClockInDate, Long employeeId) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
		CriteriaQuery<TimeRecord> criteriaQuery = criteriaBuilder.createQuery(TimeRecord.class);
		Root<TimeRecord> root = criteriaQuery.from(TimeRecord.class);

		List<Predicate> predicates = new ArrayList<>();
		predicates.add(criteriaBuilder.isNull(root.get(TimeRecord_.clockOutTime)));
		predicates.add(criteriaBuilder.equal(root.get(TimeRecord_.isCompleted), false));
		predicates.add(criteriaBuilder.equal(root.get(TimeRecord_.employee).get(Employee_.employeeId), employeeId));
		predicates
			.add(criteriaBuilder.equal(root.get(TimeRecord_.employee).get(Employee_.user).get(User_.IS_ACTIVE), true));
		predicates.add(criteriaBuilder.equal(root.get(TimeRecord_.date), lastClockInDate));

		Predicate[] predArray = new Predicate[predicates.size()];
		predicates.toArray(predArray);
		criteriaQuery.where(predArray);

		TypedQuery<TimeRecord> typedQuery = entityManager.createQuery(criteriaQuery);
		return typedQuery.getResultList().stream().findFirst();
	}

	@Override
	public AttendanceSummaryDto findManagerAssignUsersAttendanceSummary(Long managerId, List<Long> teamIds,
			LocalDate startDate, LocalDate endDate, List<Long> employeeIds) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();

		CriteriaQuery<AttendanceSummaryDto> criteriaQuery = criteriaBuilder.createQuery(AttendanceSummaryDto.class);
		Root<TimeRecord> root = criteriaQuery.from(TimeRecord.class);

		// Predicates for the main query
		List<Predicate> predicates = new ArrayList<>();
		predicates.add(criteriaBuilder.between(root.get(TimeRecord_.date), startDate, endDate));
		if (!employeeIds.isEmpty()) {

			CriteriaBuilder.In<Long> inClause = criteriaBuilder
				.in(root.get(TimeRecord_.employee).get(Employee_.employeeId));
			for (Long employeeID : employeeIds) {
				inClause.value(employeeID);
			}
			predicates.add(inClause);
		}

		criteriaQuery.select(criteriaBuilder.construct(AttendanceSummaryDto.class,
				criteriaBuilder.coalesce(criteriaBuilder.sum(root.get(TimeRecord_.workedHours)), 0.0),
				criteriaBuilder.coalesce(criteriaBuilder.sum(root.get(TimeRecord_.breakHours)), 0.0)));
		criteriaQuery.where(predicates.toArray(new Predicate[0]));

		TypedQuery<AttendanceSummaryDto> typedQuery = entityManager.createQuery(criteriaQuery);
		try {
			return typedQuery.getSingleResult();
		}
		catch (NoResultException e) {
			return new AttendanceSummaryDto(0.0F, 0.0F);
		}
	}

	@Override
	public TimeSheetSummaryData findTimeSheetSummaryData(LocalDate startDate, LocalDate endDate,
			List<Long> employeeIds) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
		CriteriaQuery<TimeSheetSummaryData> criteriaQuery = criteriaBuilder.createQuery(TimeSheetSummaryData.class);
		Root<TimeRecord> root = criteriaQuery.from(TimeRecord.class);

		List<Predicate> predicates = new ArrayList<>();
		predicates.add(root.get(TimeRecord_.employee).get(Employee_.employeeId).in(employeeIds));
		predicates.add(criteriaBuilder.between(root.get(TimeRecord_.date), startDate, endDate));

		Predicate[] predArray = new Predicate[predicates.size()];
		predicates.toArray(predArray);
		criteriaQuery.where(predArray);

		criteriaQuery
			.select(criteriaBuilder.construct(TimeSheetSummaryData.class,
					criteriaBuilder.coalesce(criteriaBuilder.sum(root.get(TimeRecord_.workedHours)).as(Double.class),
							0.0),
					criteriaBuilder.coalesce(criteriaBuilder.avg(root.get(TimeRecord_.clockInTime)), 0.0),
					criteriaBuilder.coalesce(criteriaBuilder.avg(root.get(TimeRecord_.clockOutTime)), 0.0)));

		TypedQuery<TimeSheetSummaryData> typedQuery = entityManager.createQuery(criteriaQuery);
		return typedQuery.getSingleResult();
	}

	@Override
	public List<TimeRecord> getTimeRecordsByTeam(List<Long> teamsFilter) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
		CriteriaQuery<TimeRecord> criteriaQuery = criteriaBuilder.createQuery(TimeRecord.class);
		Root<TimeRecord> root = criteriaQuery.from(TimeRecord.class);

		Subquery<Long> teamSubquery = criteriaQuery.subquery(Long.class);
		Root<EmployeeTeam> employeeTeamRoot = teamSubquery.from(EmployeeTeam.class);
		teamSubquery.select(employeeTeamRoot.get(EmployeeTeam_.employee).get(Employee_.employeeId))
			.where(employeeTeamRoot.get(EmployeeTeam_.team).get(Team_.teamId).in(teamsFilter));

		criteriaQuery.select(root).where(root.get(TimeRecord_.employee).get(Employee_.employeeId).in(teamSubquery));

		TypedQuery<TimeRecord> typedQuery = entityManager.createQuery(criteriaQuery);
		return typedQuery.getResultList();
	}

	@Override
	public List<TimeRecord> getTimeRecordsByTeamAndMonth(List<Long> teamsFilter, Month selectedMonth,
			Long currentUserId) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
		CriteriaQuery<TimeRecord> criteriaQuery = criteriaBuilder.createQuery(TimeRecord.class);
		Root<TimeRecord> root = criteriaQuery.from(TimeRecord.class);

		Subquery<String> attendanceRoleSubquery = criteriaQuery.subquery(String.class);
		Root<EmployeeRole> employeeRoleRoot = attendanceRoleSubquery.from(EmployeeRole.class);
		attendanceRoleSubquery.select(employeeRoleRoot.get(EmployeeRole_.attendanceRole).as(String.class))
			.where(criteriaBuilder.equal(employeeRoleRoot.get(EmployeeRole_.employee).get(Employee_.employeeId),
					currentUserId));

		Predicate isAdminPredicate = criteriaBuilder.equal(attendanceRoleSubquery,
				criteriaBuilder.literal(Role.ATTENDANCE_ADMIN.name()));

		List<Predicate> predicates = new ArrayList<>();

		Predicate monthPredicate = criteriaBuilder.equal(
				criteriaBuilder.function("MONTH", Integer.class, root.get(TimeRecord_.date)), selectedMonth.getValue());

		if (teamsFilter.contains(-1L)) {
			Subquery<Long> employeesSubquery = criteriaQuery.subquery(Long.class);
			Root<Employee> employeeSubqueryRoot = employeesSubquery.from(Employee.class);

			Subquery<Long> managedEmployeesSubquery = criteriaQuery.subquery(Long.class);
			Root<EmployeeManager> managerRoot = managedEmployeesSubquery.from(EmployeeManager.class);
			managedEmployeesSubquery.select(managerRoot.get(EmployeeManager_.employee).get(Employee_.employeeId))
				.where(criteriaBuilder.equal(managerRoot.get(EmployeeManager_.manager).get(Employee_.employeeId),
						currentUserId));

			Subquery<Long> supervisedTeamsSubquery = criteriaQuery.subquery(Long.class);
			Root<EmployeeTeam> supervisorTeamRoot = supervisedTeamsSubquery.from(EmployeeTeam.class);
			supervisedTeamsSubquery.select(supervisorTeamRoot.get(EmployeeTeam_.team).get(Team_.teamId))
				.where(criteriaBuilder.equal(supervisorTeamRoot.get(EmployeeTeam_.employee).get(Employee_.employeeId),
						currentUserId));

			Subquery<Long> teamMembersSubquery = criteriaQuery.subquery(Long.class);
			Root<EmployeeTeam> teamRoot = teamMembersSubquery.from(EmployeeTeam.class);
			teamMembersSubquery.select(teamRoot.get(EmployeeTeam_.employee).get(Employee_.employeeId))
				.where(teamRoot.get(EmployeeTeam_.team).get(Team_.teamId).in(supervisedTeamsSubquery));

			employeesSubquery.select(employeeSubqueryRoot.get(Employee_.employeeId))
				.where(criteriaBuilder.or(employeeSubqueryRoot.get(Employee_.employeeId).in(managedEmployeesSubquery),
						employeeSubqueryRoot.get(Employee_.employeeId).in(teamMembersSubquery)))
				.distinct(true);

			predicates.add(criteriaBuilder.or(isAdminPredicate,
					root.get(TimeRecord_.employee).get(Employee_.employeeId).in(employeesSubquery)));
		}
		else {
			Subquery<Long> teamSubquery = criteriaQuery.subquery(Long.class);
			Root<EmployeeTeam> employeeTeamRoot = teamSubquery.from(EmployeeTeam.class);
			teamSubquery.select(employeeTeamRoot.get(EmployeeTeam_.employee).get(Employee_.employeeId))
				.where(employeeTeamRoot.get(EmployeeTeam_.team).get(Team_.teamId).in(teamsFilter));

			predicates.add(criteriaBuilder.or(isAdminPredicate,
					root.get(TimeRecord_.employee).get(Employee_.employeeId).in(teamSubquery)));
		}

		predicates.add(monthPredicate);

		criteriaQuery.select(root).where(predicates.toArray(new Predicate[0]));

		TypedQuery<TimeRecord> typedQuery = entityManager.createQuery(criteriaQuery);
		return typedQuery.getResultList();
	}

	@Override
	public List<TimeRecord> getTimeRecordsByEmployeeAndMonth(Long employeeId, Month selectedMonth) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
		CriteriaQuery<TimeRecord> criteriaQuery = criteriaBuilder.createQuery(TimeRecord.class);
		Root<TimeRecord> root = criteriaQuery.from(TimeRecord.class);

		List<Predicate> predicates = new ArrayList<>();
		predicates
			.add(criteriaBuilder.equal(criteriaBuilder.function("MONTH", Integer.class, root.get(TimeRecord_.date)),
					selectedMonth.getValue()));
		predicates.add(criteriaBuilder.equal(root.get(TimeRecord_.EMPLOYEE).get(Employee_.EMPLOYEE_ID), employeeId));

		criteriaQuery.where(predicates.toArray(new Predicate[0]));
		return entityManager.createQuery(criteriaQuery).getResultList();
	}

	@Override
	public List<TimeRecord> getTimeRecordsByTeamAndDate(List<Long> teamsFilter, LocalDate currentDate,
			Long currentUserId) {
		if (teamsFilter == null || teamsFilter.isEmpty()) {
			return Collections.emptyList();
		}

		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
		CriteriaQuery<TimeRecord> criteriaQuery = criteriaBuilder.createQuery(TimeRecord.class);
		Root<TimeRecord> timeRecordRoot = criteriaQuery.from(TimeRecord.class);

		Join<TimeRecord, Employee> employeeJoin = timeRecordRoot.join(TimeRecord_.employee);
		List<Predicate> predicates = new ArrayList<>();
		predicates.add(criteriaBuilder.equal(timeRecordRoot.get(TimeRecord_.date), currentDate));

		Subquery<String> attendanceRoleSubquery = criteriaQuery.subquery(String.class);
		Root<EmployeeRole> employeeRoleRoot = attendanceRoleSubquery.from(EmployeeRole.class);
		attendanceRoleSubquery.select(employeeRoleRoot.get(EmployeeRole_.attendanceRole).as(String.class))
			.where(criteriaBuilder.equal(employeeRoleRoot.get(EmployeeRole_.employee).get(Employee_.employeeId),
					currentUserId));

		Predicate isAdminPredicate = criteriaBuilder.equal(attendanceRoleSubquery,
				criteriaBuilder.literal(Role.ATTENDANCE_ADMIN.name()));

		if (teamsFilter.contains(-1L)) {
			Subquery<Long> employeesSubquery = criteriaQuery.subquery(Long.class);
			Root<Employee> employeeRoot = employeesSubquery.from(Employee.class);

			Subquery<Long> managedEmployeesSubquery = criteriaQuery.subquery(Long.class);
			Root<EmployeeManager> managerRoot = managedEmployeesSubquery.from(EmployeeManager.class);
			managedEmployeesSubquery.select(managerRoot.get(EmployeeManager_.employee).get(Employee_.employeeId))
				.where(criteriaBuilder.equal(managerRoot.get(EmployeeManager_.manager).get(Employee_.employeeId),
						currentUserId));

			Subquery<Long> supervisedTeamsSubquery = criteriaQuery.subquery(Long.class);
			Root<EmployeeTeam> supervisorTeamRoot = supervisedTeamsSubquery.from(EmployeeTeam.class);
			supervisedTeamsSubquery.select(supervisorTeamRoot.get(EmployeeTeam_.team).get(Team_.teamId))
				.where(criteriaBuilder.equal(supervisorTeamRoot.get(EmployeeTeam_.employee).get(Employee_.employeeId),
						currentUserId));

			Subquery<Long> teamMembersSubquery = criteriaQuery.subquery(Long.class);
			Root<EmployeeTeam> teamRoot = teamMembersSubquery.from(EmployeeTeam.class);
			teamMembersSubquery.select(teamRoot.get(EmployeeTeam_.employee).get(Employee_.employeeId))
				.where(teamRoot.get(EmployeeTeam_.team).get(Team_.teamId).in(supervisedTeamsSubquery));

			employeesSubquery.select(employeeRoot.get(Employee_.employeeId))
				.where(criteriaBuilder.or(employeeRoot.get(Employee_.employeeId).in(managedEmployeesSubquery),
						employeeRoot.get(Employee_.employeeId).in(teamMembersSubquery)))
				.distinct(true);

			predicates.add(
					criteriaBuilder.or(isAdminPredicate, employeeJoin.get(Employee_.employeeId).in(employeesSubquery)));
		}
		else {
			Join<Employee, EmployeeTeam> employeeTeamJoin = employeeJoin.join(Employee_.employeeTeams);
			predicates.add(criteriaBuilder.and(criteriaBuilder.not(isAdminPredicate),
					employeeTeamJoin.get(EmployeeTeam_.team).get(Team_.teamId).in(teamsFilter)));
		}

		criteriaQuery.select(timeRecordRoot);
		criteriaQuery.where(predicates.toArray(new Predicate[0]));

		return entityManager.createQuery(criteriaQuery).getResultList();
	}



	@Override
	public Long getTotalEmployeesTimeRecordCount(List<Long> employeeIds, LocalDate startDate, LocalDate endDate) {
		// Calculate total days in range
		long totalDays = ChronoUnit.DAYS.between(startDate, endDate) + 1;

		// Get count of distinct employees that exist in the database and match criteria
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<Long> query = cb.createQuery(Long.class);
		Root<Employee> employeeRoot = query.from(Employee.class);

		List<Predicate> predicates = new ArrayList<>();
		predicates.add(employeeRoot.get(Employee_.employeeId).in(employeeIds));

		query.select(cb.countDistinct(employeeRoot.get(Employee_.employeeId)));
		query.where(predicates.toArray(new Predicate[0]));

		Long validEmployeeCount = entityManager.createQuery(query).getSingleResult();

		// Total combinations = days * valid employees
		return totalDays * validEmployeeCount;
	}

	@Override
	public List<EmployeeTimeRecord> findEmployeesTimeRecords(List<Long> employeeIds, LocalDate startDate, LocalDate endDate, int limit, long offset) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<Tuple> query = cb.createTupleQuery();

		// Main roots
		Root<TimeRecord> timeRecord = query.from(TimeRecord.class);
		Root<Employee> employee = query.from(Employee.class);

		// Joins
		Join<TimeRecord, TimeSlot> timeSlot = timeRecord.join(TimeRecord_.timeSlots, JoinType.LEFT);

		// Predicates
		List<Predicate> predicates = new ArrayList<>();
		predicates.add(employee.get(Employee_.employeeId).in(employeeIds));
		predicates.add(cb.between(timeRecord.get(TimeRecord_.date), startDate, endDate));
		predicates.add(cb.equal(timeRecord.get(TimeRecord_.employee), employee));

		// Select clause
		query.multiselect(
				timeRecord.get(TimeRecord_.timeRecordId),
				employee.get(Employee_.employeeId),
				timeRecord.get(TimeRecord_.date),
				cb.coalesce(cb.round(timeRecord.get(TimeRecord_.workedHours), 2), 0.0f),
				cb.coalesce(cb.round(timeRecord.get(TimeRecord_.breakHours), 2), 0.0f),
				cb.function("JSON_ARRAYAGG",
						String.class,
						cb.function("JSON_OBJECT",
								String.class,
								cb.literal("timeSlotId"), timeSlot.get(TimeSlot_.timeSlotId),
								cb.literal("startTime"), timeSlot.get(TimeSlot_.startTime),
								cb.literal("endTime"), timeSlot.get(TimeSlot_.endTime),
								cb.literal("slotType"), timeSlot.get(TimeSlot_.slotType),
								cb.literal("isActiveRightNow"), timeSlot.get(TimeSlot_.isActiveRightNow),
								cb.literal("isManualEntry"), timeSlot.get(TimeSlot_.isManualEntry)
						)
				)
		);

		query.where(predicates.toArray(new Predicate[0]));
		query.groupBy(
				timeRecord.get(TimeRecord_.date),
				employee.get(Employee_.employeeId),
				timeRecord.get(TimeRecord_.timeRecordId),
				employee.get(Employee_.firstName)
		);
		query.orderBy(
				cb.asc(timeRecord.get(TimeRecord_.date)),
				cb.asc(employee.get(Employee_.firstName))
		);

		TypedQuery<Tuple> typedQuery = entityManager.createQuery(query)
				.setMaxResults(limit)
				.setFirstResult((int) offset);

		return typedQuery.getResultList().stream()
				.map(tuple -> new EmployeeTimeRecordImpl(
						tuple.get(0, Long.class),
						tuple.get(1, Long.class),
						tuple.get(2, LocalDate.class),
						tuple.get(3, Float.class),
						tuple.get(4, Float.class),
						tuple.get(5, String.class)
				))
				.collect(Collectors.toList());
	}

	@Override
	public List<EmployeeTimeRecord> findEmployeesTimeRecordsWithTeams(List<Long> employeeIds, List<Long> teamIds,
																	  LocalDate startDate, LocalDate endDate, int limit, long offset) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<Tuple> query = cb.createTupleQuery();

		// Main roots
		Root<TimeRecord> timeRecord = query.from(TimeRecord.class);
		Root<Employee> employee = query.from(Employee.class);

		// Joins for team filtering
		Join<Employee, EmployeeTeam> employeeTeam = employee.join(Employee_.employeeTeams, JoinType.LEFT);
		Join<EmployeeTeam, Team> team = employeeTeam.join(EmployeeTeam_.team, JoinType.LEFT);

		// Time slot joins
		Join<TimeRecord, TimeSlot> timeSlot = timeRecord.join(TimeRecord_.timeSlots, JoinType.LEFT);

		// Predicates
		List<Predicate> predicates = new ArrayList<>();
		predicates.add(employee.get(Employee_.employeeId).in(employeeIds));
		predicates.add(cb.equal(timeRecord.get(TimeRecord_.employee), employee));
		predicates.add(cb.between(timeRecord.get(TimeRecord_.date), startDate, endDate));

		// Team filter
		if (teamIds != null && !teamIds.isEmpty()) {
			predicates.add(team.get(Team_.teamId).in(teamIds));
		}

		// Select clause
		query.multiselect(
				cb.coalesce(timeRecord.get(TimeRecord_.timeRecordId), null),
				employee.get(Employee_.employeeId),
				timeRecord.get(TimeRecord_.date),
				cb.coalesce(cb.round(timeRecord.get(TimeRecord_.workedHours), 2), 0.0f),
				cb.coalesce(cb.round(timeRecord.get(TimeRecord_.breakHours), 2), 0.0f),
				cb.function("JSON_ARRAYAGG",
						String.class,
						cb.function("JSON_OBJECT",
								String.class,
								cb.literal("timeSlotId"), timeSlot.get(TimeSlot_.timeSlotId),
								cb.literal("startTime"), timeSlot.get(TimeSlot_.startTime),
								cb.literal("endTime"), timeSlot.get(TimeSlot_.endTime),
								cb.literal("slotType"), timeSlot.get(TimeSlot_.slotType),
								cb.literal("isActiveRightNow"), timeSlot.get(TimeSlot_.isActiveRightNow),
								cb.literal("isManualEntry"), timeSlot.get(TimeSlot_.isManualEntry)
						)
				)
		);

		query.where(predicates.toArray(new Predicate[0]));
		query.groupBy(
				timeRecord.get(TimeRecord_.date),
				employee.get(Employee_.employeeId),
				timeRecord.get(TimeRecord_.timeRecordId),
				employee.get(Employee_.firstName)
		);
		query.orderBy(
				cb.asc(timeRecord.get(TimeRecord_.date)),
				cb.asc(employee.get(Employee_.firstName))
		);

		TypedQuery<Tuple> typedQuery = entityManager.createQuery(query)
				.setMaxResults(limit)
				.setFirstResult((int) offset);

		return typedQuery.getResultList().stream()
				.map(tuple -> new EmployeeTimeRecordImpl(
						tuple.get(0, Long.class),      // timeRecordId
						tuple.get(1, Long.class),      // employeeId
						tuple.get(2, LocalDate.class), // date
						tuple.get(3, Float.class),     // workedHours
						tuple.get(4, Float.class),     // breakHours
						tuple.get(5, String.class)     // timeSlots JSON
				))
				.collect(Collectors.toList());
	}

	@Override
	public List<TimeRecordsByEmployeesDto> getTimeRecordsByEmployees(List<Long> employeeIds, LocalDate startDate, LocalDate endDate) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<Tuple> query = cb.createTupleQuery();

		// Main roots
		Root<Employee> employee = query.from(Employee.class);
		Root<TimeRecord> timeRecord = query.from(TimeRecord.class);

		// Join conditions
		List<Predicate> joinPredicates = new ArrayList<>();
		joinPredicates.add(cb.equal(timeRecord.get(TimeRecord_.employee), employee));
		joinPredicates.add(cb.between(timeRecord.get(TimeRecord_.date), startDate, endDate));

		// Main predicates
		List<Predicate> predicates = new ArrayList<>();
		predicates.add(employee.get(Employee_.employeeId).in(employeeIds));
		predicates.add(cb.or(
				cb.and(joinPredicates.toArray(new Predicate[0])),
				cb.isNull(timeRecord.get(TimeRecord_.timeRecordId))
		));

		// Select clause
		query.multiselect(
				cb.coalesce(timeRecord.get(TimeRecord_.timeRecordId), null),
				timeRecord.get(TimeRecord_.date),
				employee.get(Employee_.employeeId),
				cb.coalesce(timeRecord.get(TimeRecord_.workedHours), 0.0f)
		);

		query.where(predicates.toArray(new Predicate[0]));
		query.orderBy(cb.asc(timeRecord.get(TimeRecord_.date)));

		TypedQuery<Tuple> typedQuery = entityManager.createQuery(query);

		return typedQuery.getResultList().stream()
				.map(tuple -> new TimeRecordsByEmployeesDto() {
					@Override
					public Long getTimeRecordId() {
						return tuple.get(0, Long.class);
					}

					@Override
					public LocalDate getDate() {
						return tuple.get(1, LocalDate.class);
					}

					@Override
					public Long getEmployeeId() {
						return tuple.get(2, Long.class);
					}

					@Override
					public float getWorkedHours() {
						return tuple.get(3, Float.class);
					}
				})
				.collect(Collectors.toList());
	}


	@Override
	public List<EmployeeWorkHours> getAllWorkHoursOfEmployee(Long employeeId, LocalDate startDate, LocalDate endDate) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();

		// Generate date range programmatically
		List<LocalDate> dateRange = startDate.datesUntil(endDate.plusDays(1)).collect(Collectors.toList());

		// Create a cross join simulation by collecting results for each date
		List<Tuple> allResults = new ArrayList<>();

		for (LocalDate currentDate : dateRange) {
			CriteriaQuery<Tuple> dateQuery = cb.createTupleQuery();
			Root<TimeRecord> trRoot = dateQuery.from(TimeRecord.class);

			dateQuery.multiselect(
					cb.literal(currentDate).alias("date"),
					cb.coalesce(trRoot.get(TimeRecord_.workedHours), 0.0f).alias("workedHours")
			);

			Predicate employeeFilter = cb.equal(trRoot.get(TimeRecord_.employee).get(Employee_.employeeId), employeeId);
			Predicate dateFilter = cb.equal(trRoot.get(TimeRecord_.date), currentDate);

			dateQuery.where(cb.and(employeeFilter, dateFilter));

			List<Tuple> dateResults = entityManager.createQuery(dateQuery).getResultList();

			// If no time record exists for this date, add a default entry with 0 worked hours
			if (dateResults.isEmpty()) {
				allResults.add(createTuple(currentDate, 0.0));
			} else {
				allResults.addAll(dateResults);
			}
		}

		// Convert to EmployeeWorkHours
		return allResults.stream()
				.map(tuple -> new EmployeeWorkHours() {
					@Override
					public LocalDate getDate() {
						return tuple.get("date", LocalDate.class);
					}

					@Override
					public Double getWorkedHours() {
						Float workedHours = tuple.get("workedHours", Float.class);
						return workedHours != null ? workedHours.doubleValue() : 0.0;
					}
				})
				.collect(Collectors.toList());
	}

	// Helper method to create manual tuple for missing dates
	private Tuple createTuple(Object... values) {
		return new Tuple() {
			private final Map<String, Object> aliasMap = new HashMap<>();
			private final List<Object> valueList = Arrays.asList(values);

			{
				if (values.length == 2) {
					aliasMap.put("date", values[0]);
					aliasMap.put("workedHours", values[1]);
				} else if (values.length == 4) {
					aliasMap.put("timeRecordId", values[0]);
					aliasMap.put("date", values[1]);
					aliasMap.put("employeeId", values[2]);
					aliasMap.put("workedHours", values[3]);
				}
			}

			@Override
			public <X> X get(String alias, Class<X> type) {
				return type.cast(aliasMap.get(alias));
			}

			@Override
			public Object get(String alias) {
				return aliasMap.get(alias);
			}

			@Override
			public <X> X get(int i, Class<X> type) {
				return type.cast(valueList.get(i));
			}

			@Override
			public Object get(int i) {
				return valueList.get(i);
			}

			@Override
			public Object[] toArray() {
				return valueList.toArray();
			}

			@Override
			public List<TupleElement<?>> getElements() {
				return Collections.emptyList();
			}

			@Override
			public <X> X get(TupleElement<X> tupleElement) {
				return null;
			}
		};
	}

	@Override
	public List<TimeRecordTrendDto> getEmployeeClockInTrend(List<Long> teams, String timeZone, LocalDate date) {
		// Generate time slots (30-minute intervals throughout the day)
		List<TimeRecordTrendDto> result = new ArrayList<>();
		LocalDateTime baseDateTime = date.atStartOfDay();

		// Create 48 time slots (30-minute intervals for 24 hours)
		for (int hour = 0; hour < 24; hour++) {
			for (int halfHour = 0; halfHour < 2; halfHour++) {
				LocalTime slotStart = LocalTime.of(hour, halfHour * 30);
				LocalTime slotEnd = slotStart.plusMinutes(30);

				// Query for employees who clocked in during this time slot
				CriteriaBuilder cb = entityManager.getCriteriaBuilder();
				CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
				Root<TimeRecord> timeRecord = countQuery.from(TimeRecord.class);
				Join<TimeRecord, Employee> employee = timeRecord.join(TimeRecord_.employee);
				Join<Employee, EmployeeTeam> employeeTeam = employee.join(Employee_.employeeTeams);

				List<Predicate> predicates = new ArrayList<>();

				// Filter by teams (including -1 for all teams)
				if (teams.contains(-1L)) {
					// Include all employees if -1 is in teams list
					predicates.add(cb.isNotNull(employee.get(Employee_.employeeId)));
				} else {
					predicates.add(employeeTeam.get(EmployeeTeam_.team).get(Team_.teamId).in(teams));
				}

				// Filter by date and time slot
				predicates.add(cb.equal(cb.function("DATE", LocalDate.class, timeRecord.get(TimeRecord_.date)), date));
				predicates.add(cb.isNotNull(timeRecord.get(TimeRecord_.clockInTime)));

				// Convert timestamp to local time and check if it falls within the slot
				Expression<LocalTime> clockInLocalTime = cb.function("TIME", LocalTime.class,
						cb.function("CONVERT_TZ", String.class,
								cb.function("FROM_UNIXTIME", String.class,
										cb.quot(timeRecord.get(TimeRecord_.clockInTime), 1000)),
								cb.literal("@@session.time_zone"),
								cb.literal(timeZone)));

				predicates.add(cb.greaterThanOrEqualTo(clockInLocalTime, slotStart));
				predicates.add(cb.lessThan(clockInLocalTime, slotEnd));

				countQuery.select(cb.countDistinct(employee.get(Employee_.employeeId)));
				countQuery.where(predicates.toArray(new Predicate[0]));

				Long count = entityManager.createQuery(countQuery).getSingleResult();

				// Create the result object
				String slotStartTime = slotStart.format(DateTimeFormatter.ofPattern("HH:mm"));
				String slotEndTime = slotEnd.format(DateTimeFormatter.ofPattern("HH:mm"));
				String slot = slotStartTime + " - " + slotEndTime;

				result.add(new TimeRecordTrendDto() {
					@Override
					public String getSlot() {
						return slot;
					}

					@Override
					public int getCount() {
						return count != null ? count.intValue() : 0;
					}
				});
			}
		}

		return result;
	}

	@Override
	public List<TimeRecordTrendDto> getEmployeeClockOutTrend(List<Long> teams, String timeZone, LocalDate date) {
		// Generate time slots (30-minute intervals throughout the day)
		List<TimeRecordTrendDto> result = new ArrayList<>();
		LocalDateTime baseDateTime = date.atStartOfDay();

		// Create 48 time slots (30-minute intervals for 24 hours)
		for (int hour = 0; hour < 24; hour++) {
			for (int halfHour = 0; halfHour < 2; halfHour++) {
				LocalTime slotStart = LocalTime.of(hour, halfHour * 30);
				LocalTime slotEnd = slotStart.plusMinutes(30);

				// Query for employees who clocked out during this time slot
				CriteriaBuilder cb = entityManager.getCriteriaBuilder();
				CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
				Root<TimeRecord> timeRecord = countQuery.from(TimeRecord.class);
				Join<TimeRecord, Employee> employee = timeRecord.join(TimeRecord_.employee);
				Join<Employee, EmployeeTeam> employeeTeam = employee.join(Employee_.employeeTeams);

				List<Predicate> predicates = new ArrayList<>();

				// Filter by teams (including -1 for all teams)
				if (teams.contains(-1L)) {
					// Include all employees if -1 is in teams list
					predicates.add(cb.isNotNull(employee.get(Employee_.employeeId)));
				} else {
					predicates.add(employeeTeam.get(EmployeeTeam_.team).get(Team_.teamId).in(teams));
				}

				// Filter by date and time slot - using clockOutTime instead of clockInTime
				predicates.add(cb.equal(cb.function("DATE", LocalDate.class, timeRecord.get(TimeRecord_.date)), date));
				predicates.add(cb.isNotNull(timeRecord.get(TimeRecord_.clockOutTime)));

				// Convert timestamp to local time and check if it falls within the slot
				Expression<LocalTime> clockOutLocalTime = cb.function("TIME", LocalTime.class,
						cb.function("CONVERT_TZ", String.class,
								cb.function("FROM_UNIXTIME", String.class,
										cb.quot(timeRecord.get(TimeRecord_.clockOutTime), 1000)),
								cb.literal("@@session.time_zone"),
								cb.literal(timeZone)));

				predicates.add(cb.greaterThanOrEqualTo(clockOutLocalTime, slotStart));
				predicates.add(cb.lessThan(clockOutLocalTime, slotEnd));

				countQuery.select(cb.countDistinct(employee.get(Employee_.employeeId)));
				countQuery.where(predicates.toArray(new Predicate[0]));

				Long count = entityManager.createQuery(countQuery).getSingleResult();

				// Create the result
				String slotStartTime = slotStart.format(DateTimeFormatter.ofPattern("HH:mm"));
				String slotEndTime = slotEnd.format(DateTimeFormatter.ofPattern("HH:mm"));
				String slot = slotStartTime + " - " + slotEndTime;

				result.add(new TimeRecordTrendDto() {
					@Override
					public String getSlot() {
						return slot;
					}

					@Override
					public int getCount() {
						return count != null ? count.intValue() : 0;
					}
				});
			}
		}

		return result;
	}

	}