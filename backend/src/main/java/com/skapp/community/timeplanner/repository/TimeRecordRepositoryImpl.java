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
import com.skapp.community.timeplanner.payload.projection.EmployeeWorkHours;
import com.skapp.community.timeplanner.payload.projection.TimeRecordTrendDto;
import com.skapp.community.timeplanner.payload.projection.TimeRecordsByEmployeesDto;
import com.skapp.community.timeplanner.payload.request.AttendanceSummaryDto;
import com.skapp.community.timeplanner.payload.response.TimeSheetSummaryData;
import com.skapp.community.timeplanner.repository.projection.EmployeeTimeRecord;
import jakarta.persistence.EntityManager;
import jakarta.persistence.NoResultException;
import jakarta.persistence.Tuple;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.*;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;

import java.security.Timestamp;
import java.time.LocalDate;
import java.time.Month;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

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
	public Long getTotalEmployeesTimeRecordCount(List<Long> employeeId, LocalDate startDate, LocalDate endDate) {
		return 0L;
	}

	@Override
	public List<EmployeeTimeRecord> findEmployeesTimeRecords(List<Long> employeeId, LocalDate startDate, LocalDate endDate, int limit, long offset) {
		return List.of();
	}

	@Override
	public List<EmployeeTimeRecord> findEmployeesTimeRecordsWithTeams(List<Long> employeeId, List<Long> teamIds, LocalDate startDate, LocalDate endDate, int limit, long offset) {
		return List.of();
	}

	@Override
	public List<TimeRecordsByEmployeesDto> getTimeRecordsByEmployees(List<Long> employeeId, LocalDate startDate, LocalDate endDate) {
		return List.of();
	}

	@Override
	public List<EmployeeWorkHours> getAllWorkHoursOfEmployee(Long employeeId, LocalDate startDate, LocalDate endDate) {
		return List.of();
	}

	@Override
	public List<TimeRecordTrendDto> getEmployeeClockInTrend(List<Long> teams, String timeZone, LocalDate date) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<TimeRecordTrendDto> query = cb.createQuery(TimeRecordTrendDto.class);

		// Create time slots subquery
		Subquery<Tuple> timeSlots = query.subquery(Tuple.class);
		Root<TimeRecord> dummy = timeSlots.from(TimeRecord.class);

		Expression<String> slotStart = cb
				.function("TIMESTAMPADD", Timestamp.class, cb.literal("MINUTE"),
						cb.prod(cb.literal(30),
								cb.function("MOD", Integer.class, cb.literal("@row := @row + 1"), cb.literal(8))),
						cb.parameter(LocalDate.class, "date"))
				.as(String.class);

		Expression<String> slotEnd = cb
				.function("TIMESTAMPADD", Timestamp.class, cb.literal("MINUTE"),
						cb.sum(cb.prod(cb.literal(30),
								cb.function("MOD", Integer.class, cb.literal("@row"), cb.literal(8))), cb.literal(30)),
						cb.parameter(LocalDate.class, "date"))
				.as(String.class);

		timeSlots.select((Expression<Tuple>) cb.tuple(slotStart, slotEnd));

		// Main query
		Root<TimeRecord> timeRecord = query.from(TimeRecord.class);
		Join<TimeRecord, Employee> employee = timeRecord.join(TimeRecord_.employee);
		Join<Employee, EmployeeTeam> employeeTeam = employee.join(Employee_.employeeTeams);

		// Convert clock in time to timezone
		Expression<Timestamp> convertedTime = cb.function("CONVERT_TZ", Timestamp.class,
				timeRecord.get(TimeRecord_.clockInTime), cb.literal("@@session.time_zone"),
				cb.parameter(String.class, "timeZone"));

		// Predicates
		List<Predicate> predicates = new ArrayList<>();
		predicates
				.add(cb.or(employeeTeam.get(EmployeeTeam_.team).get(Team_.teamId).in(teams), cb.literal(-1L).in(teams)));

		// Select
		query.multiselect(cb.function("TIME_FORMAT", String.class, cb.literal("slot_start"), cb.literal("%H:%i")),
				cb.function("TIME_FORMAT", String.class, cb.literal("slot_end"), cb.literal("%H:%i")),
				cb.concat(cb.function("TIME_FORMAT", String.class, cb.literal("slot_start"), cb.literal("%H:%i")),
						cb.concat(cb.literal(" - "),
								cb.function("TIME_FORMAT", String.class, cb.literal("slot_end"), cb.literal("%H:%i")))),
				cb.countDistinct(employee.get(Employee_.employeeId)));

		// Where clause
		query.where(predicates.toArray(new Predicate[0]));

		// Group by and Order by
		query.groupBy(cb.literal("slot_start"), cb.literal("slot_end")).orderBy(cb.asc(cb.literal("slot_start")));

		return entityManager.createQuery(query)
				.setParameter("timeZone", timeZone)
				.setParameter("date", date)
				.getResultList();
	}

	@Override
	public List<TimeRecordTrendDto> getEmployeeClockOutTrend(List<Long> teams, String timeZone, LocalDate date) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<TimeRecordTrendDto> query = cb.createQuery(TimeRecordTrendDto.class);

		// Create time slots subquery
		Subquery<Tuple> timeSlots = query.subquery(Tuple.class);
		Root<TimeRecord> dummy = timeSlots.from(TimeRecord.class);

		Expression<String> slotStart = cb
				.function("TIMESTAMPADD", Timestamp.class, cb.literal("MINUTE"),
						cb.prod(cb.literal(30),
								cb.function("MOD", Integer.class, cb.literal("@row := @row + 1"), cb.literal(8))),
						cb.parameter(LocalDate.class, "date"))
				.as(String.class);

		Expression<String> slotEnd = cb
				.function("TIMESTAMPADD", Timestamp.class, cb.literal("MINUTE"),
						cb.sum(cb.prod(cb.literal(30),
								cb.function("MOD", Integer.class, cb.literal("@row"), cb.literal(8))), cb.literal(30)),
						cb.parameter(LocalDate.class, "date"))
				.as(String.class);

		timeSlots.select((Expression<Tuple>) cb.tuple(slotStart, slotEnd));

		// Main query
		Root<TimeRecord> timeRecord = query.from(TimeRecord.class);
		Join<TimeRecord, Employee> employee = timeRecord.join(TimeRecord_.employee);
		Join<Employee, EmployeeTeam> employeeTeam = employee.join(Employee_.employeeTeams);

		// Convert clock out time to timezone
		Expression<Timestamp> convertedTime = cb.function("CONVERT_TZ", Timestamp.class,
				timeRecord.get(TimeRecord_.clockOutTime), // Using clockOutTime instead of
				// clockInTime
				cb.literal("@@session.time_zone"), cb.parameter(String.class, "timeZone"));

		// Predicates
		List<Predicate> predicates = new ArrayList<>();
		predicates
				.add(cb.or(employeeTeam.get(EmployeeTeam_.team).get(Team_.teamId).in(teams), cb.literal(-1L).in(teams)));

		// Select
		query.multiselect(cb.function("TIME_FORMAT", String.class, cb.literal("slot_start"), cb.literal("%H:%i")),
				cb.function("TIME_FORMAT", String.class, cb.literal("slot_end"), cb.literal("%H:%i")),
				cb.concat(cb.function("TIME_FORMAT", String.class, cb.literal("slot_start"), cb.literal("%H:%i")),
						cb.concat(cb.literal(" - "),
								cb.function("TIME_FORMAT", String.class, cb.literal("slot_end"), cb.literal("%H:%i")))),
				cb.countDistinct(employee.get(Employee_.employeeId)));

		// Where clause
		query.where(predicates.toArray(new Predicate[0]));

		// Group by and Order by
		query.groupBy(cb.literal("slot_start"), cb.literal("slot_end")).orderBy(cb.asc(cb.literal("slot_start")));

		return entityManager.createQuery(query)
				.setParameter("timeZone", timeZone)
				.setParameter("date", date)
				.getResultList();
	}

}
