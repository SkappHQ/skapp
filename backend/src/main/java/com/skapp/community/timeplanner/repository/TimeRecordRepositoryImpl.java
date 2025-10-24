package com.skapp.community.timeplanner.repository;

import com.skapp.community.common.model.User_;
import com.skapp.community.common.type.Role;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.EmployeeManager;
import com.skapp.community.peopleplanner.model.EmployeeManager_;
import com.skapp.community.peopleplanner.model.EmployeeRole;
import com.skapp.community.peopleplanner.model.EmployeeRole_;
import com.skapp.community.peopleplanner.model.EmployeeTeam;
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
import com.skapp.community.timeplanner.payload.projection.impl.EmployeeWorkHoursImpl;
import com.skapp.community.timeplanner.payload.request.AttendanceSummaryDto;
import com.skapp.community.timeplanner.payload.response.TimeSheetSummaryData;
import com.skapp.community.timeplanner.repository.projection.EmployeeTimeRecord;
import com.skapp.community.timeplanner.repository.projection.EmployeeTimeRecordImpl;
import jakarta.persistence.EntityManager;
import jakarta.persistence.NoResultException;
import jakarta.persistence.Tuple;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.Month;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Map;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
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
		long totalDays = ChronoUnit.DAYS.between(startDate, endDate) + 1;

		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<Long> query = cb.createQuery(Long.class);
		Root<Employee> employeeRoot = query.from(Employee.class);

		List<Predicate> predicates = new ArrayList<>();
		predicates.add(employeeRoot.get(Employee_.employeeId).in(employeeIds));

		query.select(cb.countDistinct(employeeRoot.get(Employee_.employeeId)));
		query.where(predicates.toArray(new Predicate[0]));

		Long validEmployeeCount = entityManager.createQuery(query).getSingleResult();

		return totalDays * validEmployeeCount;
	}

	@Override
	public List<EmployeeTimeRecord> findEmployeesTimeRecords(List<Long> employeeIds, LocalDate startDate,
			LocalDate endDate, int limit, long offset) {

		List<LocalDate> dateRange = startDate.datesUntil(endDate.plusDays(1)).collect(Collectors.toList());

		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<Employee> empQuery = cb.createQuery(Employee.class);
		Root<Employee> empRoot = empQuery.from(Employee.class);
		empQuery.select(empRoot).where(empRoot.get(Employee_.employeeId).in(employeeIds));
		List<Employee> employees = entityManager.createQuery(empQuery).getResultList();

		CriteriaQuery<Tuple> query = cb.createTupleQuery();
		Root<TimeRecord> timeRecord = query.from(TimeRecord.class);
		Join<TimeRecord, TimeSlot> timeSlot = timeRecord.join(TimeRecord_.timeSlots, JoinType.LEFT);

		query.multiselect(timeRecord.get(TimeRecord_.timeRecordId),
				timeRecord.get(TimeRecord_.employee).get(Employee_.employeeId), timeRecord.get(TimeRecord_.date),
				cb.coalesce(cb.round(timeRecord.get(TimeRecord_.workedHours), 2), cb.literal(0.0f)),
				cb.coalesce(cb.round(timeRecord.get(TimeRecord_.breakHours), 2), cb.literal(0.0f)),
				cb.function("JSON_ARRAYAGG", String.class, cb.function("JSON_OBJECT", String.class,
						cb.literal("timeSlotId"), timeSlot.get(TimeSlot_.timeSlotId), cb.literal("startTime"),
						timeSlot.get(TimeSlot_.startTime), cb.literal("endTime"), timeSlot.get(TimeSlot_.endTime),
						cb.literal("slotType"), timeSlot.get(TimeSlot_.slotType), cb.literal("isActiveRightNow"),
						timeSlot.get(TimeSlot_.isActiveRightNow), cb.literal("isManualEntry"),
						timeSlot.get(TimeSlot_.isManualEntry))));

		query.where(timeRecord.get(TimeRecord_.employee).get(Employee_.employeeId).in(employeeIds),
				cb.between(timeRecord.get(TimeRecord_.date), startDate, endDate));

		query.groupBy(timeRecord.get(TimeRecord_.date), timeRecord.get(TimeRecord_.employee).get(Employee_.employeeId),
				timeRecord.get(TimeRecord_.timeRecordId));

		List<Tuple> timeRecords = entityManager.createQuery(query).getResultList();
		Map<String, EmployeeTimeRecord> existingRecords = timeRecords.stream()
			.collect(Collectors.toMap(tuple -> tuple.get(2, LocalDate.class) + "_" + tuple.get(1, Long.class),
					tuple -> new EmployeeTimeRecordImpl(tuple.get(0, Long.class), tuple.get(1, Long.class),
							tuple.get(2, LocalDate.class), tuple.get(3, Float.class), tuple.get(4, Float.class),
							tuple.get(5, String.class))));

		List<EmployeeTimeRecord> allRecords = new ArrayList<>();
		for (LocalDate date : dateRange) {
			for (Employee employee : employees) {
				String key = date + "_" + employee.getEmployeeId();
				EmployeeTimeRecord record = existingRecords.get(key);

				if (record == null) {
					record = new EmployeeTimeRecordImpl(null, employee.getEmployeeId(), date, 0.0f, 0.0f, null);
				}
				allRecords.add(record);
			}
		}

		allRecords.sort((a, b) -> {
			int dateCompare = a.getDate().compareTo(b.getDate());
			if (dateCompare != 0)
				return dateCompare;
			return a.getEmployeeId().compareTo(b.getEmployeeId());
		});

		return allRecords.stream().skip(offset).limit(limit).collect(Collectors.toList());
	}

	@Override
	public List<EmployeeTimeRecord> findEmployeesTimeRecordsWithTeams(List<Long> employeeIds, List<Long> teamIds,
			LocalDate startDate, LocalDate endDate, int limit, long offset) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();

		List<LocalDate> dateRange = startDate.datesUntil(endDate.plusDays(1)).collect(Collectors.toList());

		List<EmployeeTimeRecord> allResults = new ArrayList<>();

		for (Long employeeId : employeeIds) {
			if (teamIds != null && !teamIds.isEmpty() && !isEmployeeInTeams(employeeId, teamIds)) {
				continue;
			}

			for (LocalDate currentDate : dateRange) {
				CriteriaQuery<Tuple> query = cb.createTupleQuery();
				Root<TimeRecord> timeRecord = query.from(TimeRecord.class);
				Join<TimeRecord, Employee> employee = timeRecord.join(TimeRecord_.employee, JoinType.LEFT);

				List<Predicate> predicates = new ArrayList<>();
				predicates.add(cb.equal(timeRecord.get(TimeRecord_.employee).get(Employee_.employeeId), employeeId));
				predicates.add(cb.equal(timeRecord.get(TimeRecord_.date), currentDate));

				query.multiselect(cb.coalesce(timeRecord.get(TimeRecord_.timeRecordId), cb.nullLiteral(Long.class)),
						cb.literal(employeeId), cb.literal(currentDate),
						cb.coalesce(timeRecord.get(TimeRecord_.workedHours), 0.0),
						cb.coalesce(timeRecord.get(TimeRecord_.breakHours), 0.0), cb.nullLiteral(String.class));

				query.where(predicates.toArray(new Predicate[0]));

				List<Tuple> results = entityManager.createQuery(query).getResultList();

				if (results.isEmpty()) {
					allResults.add(new EmployeeTimeRecordImpl(null, employeeId, currentDate, 0.0f, 0.0f, null));
				}
				else {

					Tuple tuple = results.get(0);
					allResults.add(new EmployeeTimeRecordImpl(tuple.get(0, Long.class), tuple.get(1, Long.class),
							tuple.get(2, LocalDate.class), tuple.get(3, Float.class), tuple.get(4, Float.class),
							tuple.get(5, String.class)));
				}
			}
		}

		return allResults.stream().skip(offset).limit(limit).collect(Collectors.toList());
	}

	private boolean isEmployeeInTeams(Long employeeId, List<Long> teamIds) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<Long> query = cb.createQuery(Long.class);
		Root<EmployeeTeam> employeeTeam = query.from(EmployeeTeam.class);

		query.select(cb.count(employeeTeam));
		query.where(cb.equal(employeeTeam.get(EmployeeTeam_.employee).get(Employee_.employeeId), employeeId),
				employeeTeam.get(EmployeeTeam_.team).get(Team_.teamId).in(teamIds));

		return entityManager.createQuery(query).getSingleResult() > 0;
	}

	@Override
	public List<TimeRecordsByEmployeesDto> getTimeRecordsByEmployees(List<Long> employeeIds, LocalDate startDate,
			LocalDate endDate) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<Tuple> query = cb.createTupleQuery();

		Root<Employee> employee = query.from(Employee.class);
		Root<TimeRecord> timeRecord = query.from(TimeRecord.class);

		List<Predicate> joinPredicates = new ArrayList<>();
		joinPredicates.add(cb.equal(timeRecord.get(TimeRecord_.employee), employee));
		joinPredicates.add(cb.between(timeRecord.get(TimeRecord_.date), startDate, endDate));

		List<Predicate> predicates = new ArrayList<>();
		predicates.add(employee.get(Employee_.employeeId).in(employeeIds));
		predicates.add(cb.or(cb.and(joinPredicates.toArray(new Predicate[0])),
				cb.isNull(timeRecord.get(TimeRecord_.timeRecordId))));

		query.multiselect(cb.coalesce(timeRecord.get(TimeRecord_.timeRecordId), cb.nullLiteral(Long.class)),
				timeRecord.get(TimeRecord_.date), employee.get(Employee_.employeeId),
				cb.coalesce(timeRecord.get(TimeRecord_.workedHours), 0.0));

		query.where(predicates.toArray(new Predicate[0]));
		query.orderBy(cb.asc(timeRecord.get(TimeRecord_.date)));

		TypedQuery<Tuple> typedQuery = entityManager.createQuery(query);

		return typedQuery.getResultList().stream().map(tuple -> new TimeRecordsByEmployeesDto() {

			public Long getTimeRecordId() {
				return tuple.get(0, Long.class);
			}

			public LocalDate getDate() {
				return tuple.get(1, LocalDate.class);
			}

			public Long getEmployeeId() {
				return tuple.get(2, Long.class);
			}

			public float getWorkedHours() {
				return tuple.get(3, Float.class);
			}
		}).collect(Collectors.toList());
	}

	@Override
	public List<EmployeeWorkHours> getAllWorkHoursOfEmployee(Long employeeId, LocalDate startDate, LocalDate endDate) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();

		List<LocalDate> dateRange = startDate.datesUntil(endDate.plusDays(1)).collect(Collectors.toList());

		List<EmployeeWorkHours> allResults = new ArrayList<>();

		for (LocalDate currentDate : dateRange) {
			CriteriaQuery<Tuple> dateQuery = cb.createTupleQuery();
			Root<TimeRecord> trRoot = dateQuery.from(TimeRecord.class);

			dateQuery.multiselect(cb.literal(currentDate).alias("date"),
					cb.coalesce(trRoot.get(TimeRecord_.workedHours), 0.0).alias("workedHours"));

			Predicate employeeFilter = cb.equal(trRoot.get(TimeRecord_.employee).get(Employee_.employeeId), employeeId);
			Predicate dateFilter = cb.equal(trRoot.get(TimeRecord_.date), currentDate);

			dateQuery.where(cb.and(employeeFilter, dateFilter));

			List<Tuple> dateResults = entityManager.createQuery(dateQuery).getResultList();

			if (dateResults.isEmpty()) {
				allResults.add(new EmployeeWorkHoursImpl(currentDate, 0.0));
			}
			else {
				for (Tuple tuple : dateResults) {
					Float workedHours = tuple.get("workedHours", Float.class);
					allResults.add(new EmployeeWorkHoursImpl(currentDate,
							workedHours != null ? workedHours.doubleValue() : 0.0));
				}
			}
		}
		return allResults;
	}

	@Override
	public List<TimeRecordTrendDto> getEmployeeClockInTrend(List<Long> teams, String timeZone, LocalDate date) {
		log.info("getEmployeeClockInTrend: Starting execution with teams={}, timeZone={}, date={}", teams, timeZone,
				date);

		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<Tuple> dataQuery = cb.createTupleQuery();
		Root<TimeRecord> timeRecord = dataQuery.from(TimeRecord.class);
		Join<TimeRecord, Employee> employee = timeRecord.join(TimeRecord_.employee);

		List<Predicate> dataPredicates = new ArrayList<>();

		if (teams.contains(-1L)) {
			dataPredicates.add(cb.isNotNull(employee.get(Employee_.employeeId)));
		}
		else {
			Join<Employee, EmployeeTeam> employeeTeam = employee.join(Employee_.employeeTeams, JoinType.LEFT);
			dataPredicates.add(employeeTeam.get(EmployeeTeam_.team).get(Team_.teamId).in(teams));
		}

		dataPredicates.add(cb.equal(timeRecord.get(TimeRecord_.date), date));
		dataPredicates.add(cb.isNotNull(timeRecord.get(TimeRecord_.clockInTime)));

		dataQuery.multiselect(employee.get(Employee_.employeeId), timeRecord.get(TimeRecord_.clockInTime));
		dataQuery.where(dataPredicates.toArray(new Predicate[0]));

		List<Tuple> records = entityManager.createQuery(dataQuery).getResultList();

		java.time.ZoneId targetZone = java.time.ZoneId.of(timeZone);

		List<String> timeSlots = java.util.stream.IntStream.range(0, 24)
			.boxed()
			.flatMap(hour -> java.util.stream.IntStream.range(0, 2).mapToObj(halfHour -> {
				LocalTime slotStart = LocalTime.of(hour, halfHour * 30);
				LocalTime slotEnd = slotStart.plusMinutes(30);
				return slotStart.format(DateTimeFormatter.ofPattern("HH:mm")) + " - "
						+ slotEnd.format(DateTimeFormatter.ofPattern("HH:mm"));
			}))
			.collect(java.util.stream.Collectors.toList());

		Map<String, Long> slotCounts = records.stream()
			.map(record -> record.get(1, Long.class))
			.filter(java.util.Objects::nonNull)
			.map(clockInTimeMillis -> {
				java.time.Instant instant = java.time.Instant.ofEpochMilli(clockInTimeMillis);
				return instant.atZone(targetZone).toLocalTime();
			})
			.map(clockInLocalTime -> findTimeSlot(clockInLocalTime))
			.filter(java.util.Objects::nonNull)
			.collect(java.util.stream.Collectors.groupingBy(java.util.function.Function.identity(),
					java.util.stream.Collectors.counting()));

		List<TimeRecordTrendDto> result = timeSlots.stream().map(slotLabel -> new TimeRecordTrendDto() {
			@Override
			public String getSlot() {
				return slotLabel;
			}

			@Override
			public int getCount() {
				return slotCounts.getOrDefault(slotLabel, 0L).intValue();
			}
		}).collect(java.util.stream.Collectors.toList());

		long totalCount = slotCounts.values().stream().mapToLong(Long::longValue).sum();
		log.info("getEmployeeClockInTrend: Completed execution. Total clock-ins found: {} across all time slots",
				totalCount);

		return result;
	}

	@Override
	public List<TimeRecordTrendDto> getEmployeeClockOutTrend(List<Long> teams, String timeZone, LocalDate date) {
		log.info("getEmployeeClockOutTrend: Starting execution with teams={}, timeZone={}, date={}", teams, timeZone,
				date);

		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<Tuple> dataQuery = cb.createTupleQuery();
		Root<TimeRecord> timeRecord = dataQuery.from(TimeRecord.class);
		Join<TimeRecord, Employee> employee = timeRecord.join(TimeRecord_.employee);

		List<Predicate> dataPredicates = new ArrayList<>();

		if (teams.contains(-1L)) {
			dataPredicates.add(cb.isNotNull(employee.get(Employee_.employeeId)));
		}
		else {
			Join<Employee, EmployeeTeam> employeeTeam = employee.join(Employee_.employeeTeams, JoinType.LEFT);
			dataPredicates.add(employeeTeam.get(EmployeeTeam_.team).get(Team_.teamId).in(teams));
		}

		dataPredicates.add(cb.equal(timeRecord.get(TimeRecord_.date), date));
		dataPredicates.add(cb.isNotNull(timeRecord.get(TimeRecord_.clockOutTime)));

		dataQuery.multiselect(employee.get(Employee_.employeeId), timeRecord.get(TimeRecord_.clockOutTime));
		dataQuery.where(dataPredicates.toArray(new Predicate[0]));

		List<Tuple> records = entityManager.createQuery(dataQuery).getResultList();

		java.time.ZoneId targetZone = java.time.ZoneId.of(timeZone);

		List<String> timeSlots = java.util.stream.IntStream.range(0, 24)
			.boxed()
			.flatMap(hour -> java.util.stream.IntStream.range(0, 2).mapToObj(halfHour -> {
				LocalTime slotStart = LocalTime.of(hour, halfHour * 30);
				LocalTime slotEnd = slotStart.plusMinutes(30);
				return slotStart.format(DateTimeFormatter.ofPattern("HH:mm")) + " - "
						+ slotEnd.format(DateTimeFormatter.ofPattern("HH:mm"));
			}))
			.collect(java.util.stream.Collectors.toList());

		Map<String, Long> slotCounts = records.stream()
			.map(record -> record.get(1, Long.class))
			.filter(java.util.Objects::nonNull)
			.map(clockOutTimeMillis -> {
				java.time.Instant instant = java.time.Instant.ofEpochMilli(clockOutTimeMillis);
				return instant.atZone(targetZone).toLocalTime();
			})
			.map(clockOutLocalTime -> findTimeSlot(clockOutLocalTime))
			.filter(java.util.Objects::nonNull)
			.collect(java.util.stream.Collectors.groupingBy(java.util.function.Function.identity(),
					java.util.stream.Collectors.counting()));

		List<TimeRecordTrendDto> result = timeSlots.stream().map(slotLabel -> new TimeRecordTrendDto() {
			@Override
			public String getSlot() {
				return slotLabel;
			}

			@Override
			public int getCount() {
				return slotCounts.getOrDefault(slotLabel, 0L).intValue();
			}
		}).collect(java.util.stream.Collectors.toList());

		long totalCount = slotCounts.values().stream().mapToLong(Long::longValue).sum();
		log.info("getEmployeeClockOutTrend: Completed execution. Total clock-outs found: {} across all time slots",
				totalCount);

		return result;
	}

	private String findTimeSlot(LocalTime time) {
		return java.util.stream.IntStream.range(0, 24)
			.boxed()
			.flatMap(hour -> java.util.stream.IntStream.range(0, 2).mapToObj(halfHour -> {
				LocalTime slotStart = LocalTime.of(hour, halfHour * 30);
				LocalTime slotEnd = slotStart.plusMinutes(30);

				if (!time.isBefore(slotStart) && time.isBefore(slotEnd)) {
					return slotStart.format(DateTimeFormatter.ofPattern("HH:mm")) + " - "
							+ slotEnd.format(DateTimeFormatter.ofPattern("HH:mm"));
				}
				return null;
			}))
			.filter(java.util.Objects::nonNull)
			.findFirst()
			.orElse(null);
	}

}
