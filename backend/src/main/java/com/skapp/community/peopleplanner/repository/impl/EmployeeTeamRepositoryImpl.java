package com.skapp.community.peopleplanner.repository.impl;

import com.skapp.community.common.model.User;
import com.skapp.community.common.model.User_;
import com.skapp.community.common.type.Role;
import com.skapp.community.leaveplanner.model.LeaveRequest;
import com.skapp.community.leaveplanner.model.LeaveRequest_;
import com.skapp.community.leaveplanner.type.LeaveRequestStatus;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.EmployeeManager;
import com.skapp.community.peopleplanner.model.EmployeeManager_;
import com.skapp.community.peopleplanner.model.EmployeeRole;
import com.skapp.community.peopleplanner.model.EmployeeRole_;
import com.skapp.community.peopleplanner.model.EmployeeTeam;
import com.skapp.community.peopleplanner.model.EmployeeTeam_;
import com.skapp.community.peopleplanner.model.Employee_;
import com.skapp.community.peopleplanner.model.Team;
import com.skapp.community.peopleplanner.model.Team_;
import com.skapp.community.peopleplanner.repository.EmployeeTeamRepository;
import com.skapp.community.peopleplanner.type.AccountStatus;
import com.skapp.community.timeplanner.model.TimeRecord;
import com.skapp.community.timeplanner.model.TimeRecord_;
import com.skapp.community.timeplanner.type.ClockInType;
import jakarta.persistence.EntityManager;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaDelete;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class EmployeeTeamRepositoryImpl implements EmployeeTeamRepository {

	private final EntityManager entityManager;

	@Override
	public Long countAvailableEmployeesByTeamIdsAndDate(List<Long> teamsFilter, LocalDate currentDate,
			Long currentUserId) {
		if (teamsFilter == null || teamsFilter.isEmpty()) {
			return 0L;
		}

		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
		CriteriaQuery<Long> criteriaQuery = criteriaBuilder.createQuery(Long.class);
		Root<Employee> employeeRoot = criteriaQuery.from(Employee.class);

		Subquery<String> attendanceRoleSubquery = criteriaQuery.subquery(String.class);
		Root<EmployeeRole> employeeRoleRoot = attendanceRoleSubquery.from(EmployeeRole.class);
		attendanceRoleSubquery.select(employeeRoleRoot.get(EmployeeRole_.attendanceRole).as(String.class))
			.where(criteriaBuilder.equal(employeeRoleRoot.get(EmployeeRole_.employee).get(Employee_.employeeId),
					currentUserId));

		Predicate isAdminPredicate = criteriaBuilder.equal(attendanceRoleSubquery,
				criteriaBuilder.literal(Role.ATTENDANCE_ADMIN.name()));

		List<Predicate> predicates = new ArrayList<>();

		predicates.add(criteriaBuilder.isTrue(employeeRoot.get(Employee_.user).get(User_.isActive)));
		predicates.add(criteriaBuilder.equal(employeeRoot.get(Employee_.ACCOUNT_STATUS), AccountStatus.ACTIVE));

		if (teamsFilter.contains(-1L)) {
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

			predicates.add(criteriaBuilder.or(isAdminPredicate,
					employeeRoot.get(Employee_.employeeId).in(managedEmployeesSubquery),
					employeeRoot.get(Employee_.employeeId).in(teamMembersSubquery)));
		}
		else {
			Join<Employee, EmployeeTeam> employeeTeamJoin = employeeRoot.join(Employee_.employeeTeams);
			predicates.add(employeeTeamJoin.get(EmployeeTeam_.team).get(Team_.teamId).in(teamsFilter));
		}

		Subquery<Long> leaveSubquery = criteriaQuery.subquery(Long.class);
		Root<LeaveRequest> leaveRequestRoot = leaveSubquery.from(LeaveRequest.class);
		leaveSubquery.select(leaveRequestRoot.get(LeaveRequest_.employee).get(Employee_.employeeId))
			.where(criteriaBuilder.and(
					criteriaBuilder.lessThanOrEqualTo(leaveRequestRoot.get(LeaveRequest_.startDate), currentDate),
					criteriaBuilder.greaterThanOrEqualTo(leaveRequestRoot.get(LeaveRequest_.endDate), currentDate),
					leaveRequestRoot.get(LeaveRequest_.status)
						.in(LeaveRequestStatus.APPROVED, LeaveRequestStatus.PENDING)));

		predicates.add(criteriaBuilder.not(employeeRoot.get(Employee_.employeeId).in(leaveSubquery)));

		criteriaQuery.select(criteriaBuilder.countDistinct(employeeRoot.get(Employee_.employeeId)));
		criteriaQuery.where(predicates.toArray(new Predicate[0]));

		return entityManager.createQuery(criteriaQuery).getSingleResult();
	}

	@Override
	public List<Employee> getEmployeesByTeamIds(String searchKeyword, List<Long> teams, List<ClockInType> clockInType,
			LocalDate date, Long currentUserId) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
		CriteriaQuery<Employee> criteriaQuery = criteriaBuilder.createQuery(Employee.class);
		Root<Employee> employeeRoot = criteriaQuery.from(Employee.class);

		Join<Employee, User> userJoin = employeeRoot.join(Employee_.user, JoinType.LEFT);
		Join<Employee, EmployeeTeam> employeeTeamJoin = employeeRoot.join(Employee_.employeeTeams, JoinType.LEFT);

		List<Predicate> predicates = new ArrayList<>();

		if (searchKeyword != null && !searchKeyword.trim().isEmpty()) {
			String pattern = "%" + searchKeyword.trim().toLowerCase() + "%";
			Predicate firstNamePredicate = criteriaBuilder
				.like(criteriaBuilder.lower(employeeRoot.get(Employee_.firstName)), pattern);
			Predicate middleNamePredicate = criteriaBuilder
				.like(criteriaBuilder.lower(employeeRoot.get(Employee_.middleName)), pattern);
			Predicate lastNamePredicate = criteriaBuilder
				.like(criteriaBuilder.lower(employeeRoot.get(Employee_.lastName)), pattern);
			Predicate namePredicate = criteriaBuilder.or(firstNamePredicate, middleNamePredicate, lastNamePredicate);
			predicates.add(namePredicate);
		}

		predicates.add(criteriaBuilder.isTrue(userJoin.get(User_.isActive)));

		Subquery<String> attendanceRoleSubquery = criteriaQuery.subquery(String.class);
		Root<EmployeeRole> employeeRoleRoot = attendanceRoleSubquery.from(EmployeeRole.class);
		attendanceRoleSubquery.select(employeeRoleRoot.get(EmployeeRole_.attendanceRole).as(String.class))
			.where(criteriaBuilder.equal(employeeRoleRoot.get(EmployeeRole_.employee).get(Employee_.employeeId),
					currentUserId));

		Predicate isAdminPredicate = criteriaBuilder.equal(attendanceRoleSubquery,
				criteriaBuilder.literal(Role.ATTENDANCE_ADMIN.name()));

		if (teams.contains(-1L)) {
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

			predicates.add(
					criteriaBuilder.or(isAdminPredicate, employeeRoot.get(Employee_.employeeId).in(employeesSubquery)));
		}
		else {
			predicates.add(employeeTeamJoin.get(EmployeeTeam_.team).get(Team_.teamId).in(teams));
		}

		if (clockInType.contains(ClockInType.NOT_CLOCKED_INS) && !clockInType.contains(ClockInType.LATE_CLOCK_INS)) {
			Subquery<Long> clockInSubquery = criteriaQuery.subquery(Long.class);
			Root<TimeRecord> timeRecordRoot = clockInSubquery.from(TimeRecord.class);
			clockInSubquery.select(timeRecordRoot.get(TimeRecord_.employee).get(Employee_.employeeId))
				.where(criteriaBuilder.equal(timeRecordRoot.get(TimeRecord_.date), date));
			predicates.add(criteriaBuilder.not(employeeRoot.get(Employee_.employeeId).in(clockInSubquery)));
		}

		criteriaQuery.where(predicates.toArray(new Predicate[0]));
		criteriaQuery.select(employeeRoot).distinct(true);

		Subquery<Long> clockInExistsSubquery = criteriaQuery.subquery(Long.class);
		Root<TimeRecord> clockInExistsRoot = clockInExistsSubquery.from(TimeRecord.class);
		clockInExistsSubquery.select(criteriaBuilder.literal(1L))
			.where(criteriaBuilder.equal(clockInExistsRoot.get(TimeRecord_.employee).get(Employee_.employeeId),
					employeeRoot.get(Employee_.employeeId)),
					criteriaBuilder.equal(clockInExistsRoot.get(TimeRecord_.date), date),
					criteriaBuilder.isNotNull(clockInExistsRoot.get(TimeRecord_.clockInTime)));

		criteriaQuery.orderBy(
				criteriaBuilder.desc(criteriaBuilder.selectCase()
					.when(criteriaBuilder.exists(clockInExistsSubquery), 1)
					.otherwise(0)
					.as(Integer.class)),
				criteriaBuilder.asc(employeeRoot.get(Employee_.firstName)),
				criteriaBuilder.asc(employeeRoot.get(Employee_.lastName)));

		return entityManager.createQuery(criteriaQuery).getResultList();
	}

	@Override
	public List<Team> findTeamsByEmployeeId(Long employeeId) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
		CriteriaQuery<Team> criteriaQuery = criteriaBuilder.createQuery(Team.class);

		Root<EmployeeTeam> root = criteriaQuery.from(EmployeeTeam.class);
		Join<EmployeeTeam, Team> teamJoin = root.join(EmployeeTeam_.team);

		Predicate employeePredicate = criteriaBuilder.equal(root.get(EmployeeTeam_.employee).get(Employee_.employeeId),
				employeeId);

		criteriaQuery.select(teamJoin).where(employeePredicate).distinct(true);
		return entityManager.createQuery(criteriaQuery).getResultList();
	}

	@Override
	public boolean existsEmployeeInSupervisedTeam(Long employeeId, Long supervisorId) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
		CriteriaQuery<Long> criteriaQuery = criteriaBuilder.createQuery(Long.class);

		Root<EmployeeTeam> empTeam = criteriaQuery.from(EmployeeTeam.class);

		Subquery<Long> supervisorTeams = criteriaQuery.subquery(Long.class);
		Root<EmployeeTeam> supTeam = supervisorTeams.from(EmployeeTeam.class);
		supervisorTeams.select(supTeam.get(EmployeeTeam_.team).get(Team_.teamId))
			.where(criteriaBuilder.equal(supTeam.get(EmployeeTeam_.employee).get(Employee_.employeeId), supervisorId),
					criteriaBuilder.isTrue(supTeam.get(EmployeeTeam_.isSupervisor)),
					criteriaBuilder.isTrue(supTeam.get(EmployeeTeam_.team).get(Team_.isActive)));

		criteriaQuery.select(criteriaBuilder.literal(1L))
			.where(criteriaBuilder.equal(empTeam.get(EmployeeTeam_.employee).get(Employee_.employeeId), employeeId),
					empTeam.get(EmployeeTeam_.team).get(Team_.teamId).in(supervisorTeams));

		List<Long> result = entityManager.createQuery(criteriaQuery).setMaxResults(1).getResultList();
		return !result.isEmpty();
	}

	@Override
	public List<Employee> getEmployeesByTeamIds(List<Long> teams, Long currentUserId, boolean isAdmin) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
		CriteriaQuery<Employee> criteriaQuery = criteriaBuilder.createQuery(Employee.class);
		Root<Employee> employeeRoot = criteriaQuery.from(Employee.class);
		List<Predicate> predicates = new ArrayList<>();

		predicates.add(criteriaBuilder.isTrue(employeeRoot.get(Employee_.user).get(User_.isActive)));
		predicates.add(criteriaBuilder.equal(employeeRoot.get(Employee_.ACCOUNT_STATUS), AccountStatus.ACTIVE));

		if (teams != null && !teams.isEmpty() && teams.contains(-1L)) {
			if (isAdmin) {
				Join<Employee, User> userJoin = employeeRoot.join(Employee_.user);
				Predicate isActivePredicate = criteriaBuilder.isTrue(userJoin.get(User_.isActive));
				predicates.add(isActivePredicate);
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

				predicates.add(criteriaBuilder.or(employeeRoot.get(Employee_.employeeId).in(managedEmployeesSubquery),
						employeeRoot.get(Employee_.employeeId).in(supervisedTeamsSubquery)));
			}
		}
		else if (teams != null && !teams.isEmpty()) {
			Join<Employee, EmployeeTeam> employeeTeamJoin = employeeRoot.join(Employee_.employeeTeams, JoinType.LEFT);
			Predicate teamPredicate = employeeTeamJoin.get(EmployeeTeam_.team).get(Team_.teamId).in(teams);
			predicates.add(teamPredicate);
		}

		Join<Employee, User> userJoin = employeeRoot.join(Employee_.user);
		Predicate isActivePredicate = criteriaBuilder.isTrue(userJoin.get(User_.isActive));
		predicates.add(isActivePredicate);

		criteriaQuery.select(employeeRoot).where(predicates.toArray(new Predicate[0])).distinct(true);

		return entityManager.createQuery(criteriaQuery).getResultList();
	}

	@Override
	public void deleteEmployeeTeamByTeamId(Long teamId) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaDelete<EmployeeTeam> delete = cb.createCriteriaDelete(EmployeeTeam.class);
		Root<EmployeeTeam> root = delete.from(EmployeeTeam.class);

		delete.where(cb.equal(root.get(EmployeeTeam_.team).get(Team_.teamId), teamId));
		entityManager.createQuery(delete).executeUpdate();
	}

	@Override
	public void deleteEmployeeTeamByTeamIdAndEmployeeIds(Long teamId, List<Long> employeeIds) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaDelete<EmployeeTeam> delete = cb.createCriteriaDelete(EmployeeTeam.class);
		Root<EmployeeTeam> root = delete.from(EmployeeTeam.class);

		delete.where(cb.and(cb.equal(root.get(EmployeeTeam_.team).get(Team_.teamId), teamId),
				root.get(EmployeeTeam_.employee).get(Employee_.employeeId).in(employeeIds)));
		entityManager.createQuery(delete).executeUpdate();
	}

}
