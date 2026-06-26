package com.skapp.community.peopleplanner.repository.impl;

import com.skapp.community.common.model.User;
import com.skapp.community.common.model.User_;
import com.skapp.community.common.type.Role;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.EmployeeManager;
import com.skapp.community.peopleplanner.model.EmployeeManager_;
import com.skapp.community.peopleplanner.model.EmployeeTeam;
import com.skapp.community.peopleplanner.model.EmployeeTeam_;
import com.skapp.community.peopleplanner.model.Employee_;
import com.skapp.community.peopleplanner.model.Team;
import com.skapp.community.peopleplanner.model.Team_;
import com.skapp.community.peopleplanner.repository.TeamRepository;
import com.skapp.community.peopleplanner.type.AccountStatus;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaDelete;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.query.QueryUtils;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class TeamRepositoryImpl implements TeamRepository {

	private final EntityManager entityManager;

	@Override
	public List<Long> findSupervisorIdsByTeamId(Long id) {
		return findEmployeeIdsByTeamId(id, true);
	}

	@Override
	public List<Long> findMemberIdsByTeamId(Long id) {
		return findEmployeeIdsByTeamId(id, false);
	}

	public List<Long> findEmployeeIdsByTeamId(Long id, boolean isSupervisor) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
		CriteriaQuery<Long> criteriaQuery = criteriaBuilder.createQuery(Long.class);
		Root<EmployeeTeam> root = criteriaQuery.from(EmployeeTeam.class);
		List<Predicate> predicates = new ArrayList<>();
		predicates.add(criteriaBuilder.equal(root.get(EmployeeTeam_.team).get(Team_.teamId), id));
		if (isSupervisor) {
			predicates.add(criteriaBuilder.equal(root.get(EmployeeTeam_.isSupervisor), true));
		}

		Predicate[] predArray = new Predicate[predicates.size()];
		predicates.toArray(predArray);
		criteriaQuery.where(predArray);
		Path<Long> employeeId = root.get(EmployeeTeam_.employee).get(Employee_.employeeId);
		criteriaQuery.select(employeeId);
		TypedQuery<Long> typedQuery = entityManager.createQuery(criteriaQuery);
		return typedQuery.getResultList();
	}

	public List<EmployeeTeam> findSupervisorTeamsByTeamId(Long teamId, List<Long> employeeId) {
		return findEmployeeTeamsByTeamId(teamId, employeeId, true);
	}

	@Override
	public List<EmployeeTeam> findMemberTeamsByTeamId(Long teamId, List<Long> employeeId) {
		return findEmployeeTeamsByTeamId(teamId, employeeId, false);
	}

	@Override
	public List<Long> findLeadingTeamIdsByManagerId(Long employeeId) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();

		CriteriaQuery<Long> criteriaQuery = criteriaBuilder.createQuery(Long.class);
		Root<EmployeeTeam> root = criteriaQuery.from(EmployeeTeam.class);

		Join<EmployeeTeam, Team> teamJoin = root.join(EmployeeTeam_.TEAM);
		List<Predicate> predicates = new ArrayList<>();
		leadingTeamsByManagerIdFilter(predicates, criteriaBuilder, teamJoin, root, employeeId);

		criteriaQuery.select(teamJoin.get(Team_.TEAM_ID)).where(predicates.toArray(new Predicate[0]));
		TypedQuery<Long> typedQuery = entityManager.createQuery(criteriaQuery);

		return typedQuery.getResultList();
	}

	@Override
	public List<Team> findLeadingTeamsByManagerId(Long employeeId) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();

		CriteriaQuery<Team> criteriaQuery = criteriaBuilder.createQuery(Team.class);
		Root<EmployeeTeam> root = criteriaQuery.from(EmployeeTeam.class);

		Join<EmployeeTeam, Team> teamJoin = root.join(EmployeeTeam_.TEAM);
		List<Predicate> predicates = new ArrayList<>();
		leadingTeamsByManagerIdFilter(predicates, criteriaBuilder, teamJoin, root, employeeId);

		criteriaQuery.select(teamJoin).where(predicates.toArray(new Predicate[0]));
		criteriaQuery.orderBy(criteriaBuilder.asc(teamJoin.get(Team_.TEAM_NAME)));

		TypedQuery<Team> typedQuery = entityManager.createQuery(criteriaQuery);

		return typedQuery.getResultList();
	}

	@Override
	public Page<Employee> findEmployeesInManagerLeadingTeams(List<Long> teamIds, Pageable page, User currentUser) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
		CriteriaQuery<Employee> criteriaQuery = criteriaBuilder.createQuery(Employee.class);
		Root<Employee> root = criteriaQuery.from(Employee.class);
		Join<Employee, User> user = root.join(Employee_.user);

		List<Predicate> predicates = new ArrayList<>();
		predicates.add(criteriaBuilder.equal(user.get(User_.isActive), Boolean.TRUE));
		predicates.add(criteriaBuilder.equal(root.get(Employee_.ACCOUNT_STATUS), AccountStatus.ACTIVE));

		if (currentUser.getEmployee().getEmployeeRole().getAttendanceRole() == Role.ATTENDANCE_MANAGER) {
			Subquery<Long> managedEmployeesSubquery = criteriaQuery.subquery(Long.class);
			Root<EmployeeManager> managerRoot = managedEmployeesSubquery.from(EmployeeManager.class);
			managedEmployeesSubquery.select(managerRoot.get(EmployeeManager_.employee).get(Employee_.employeeId))
				.where(criteriaBuilder.equal(managerRoot.get(EmployeeManager_.manager).get(Employee_.employeeId),
						currentUser.getEmployee().getEmployeeId()));

			Subquery<Long> supervisedTeamsSubquery = criteriaQuery.subquery(Long.class);
			Root<EmployeeTeam> supervisorTeamRoot = supervisedTeamsSubquery.from(EmployeeTeam.class);
			supervisedTeamsSubquery.select(supervisorTeamRoot.get(EmployeeTeam_.team).get(Team_.teamId))
				.where(criteriaBuilder.equal(supervisorTeamRoot.get(EmployeeTeam_.employee).get(Employee_.employeeId),
						currentUser.getEmployee().getEmployeeId()));

			Subquery<Long> teamMembersSubquery = criteriaQuery.subquery(Long.class);
			Root<EmployeeTeam> teamRoot = teamMembersSubquery.from(EmployeeTeam.class);
			teamMembersSubquery.select(teamRoot.get(EmployeeTeam_.employee).get(Employee_.employeeId))
				.where(teamRoot.get(EmployeeTeam_.team).get(Team_.teamId).in(supervisedTeamsSubquery));

			predicates.add(criteriaBuilder.or(root.get(Employee_.employeeId).in(managedEmployeesSubquery),
					root.get(Employee_.employeeId).in(teamMembersSubquery)));
		}

		if (!teamIds.isEmpty() && !teamIds.contains(-1L)) {
			Join<Employee, EmployeeTeam> employeeTeamJoin = root.join(Employee_.employeeTeams);
			predicates.add(employeeTeamJoin.get(EmployeeTeam_.team).get(Team_.teamId).in(teamIds));
		}

		Predicate[] predArray = new Predicate[predicates.size()];
		predicates.toArray(predArray);
		criteriaQuery.where(predArray);

		criteriaQuery.groupBy(root.get(Employee_.employeeId));
		criteriaQuery.orderBy(QueryUtils.toOrders(Sort.by(Sort.Direction.ASC, "firstName"), root, criteriaBuilder));

		TypedQuery<Employee> query = entityManager.createQuery(criteriaQuery);
		int totalRows = query.getResultList().size();
		query.setFirstResult(page.getPageNumber() * page.getPageSize());
		query.setMaxResults(page.getPageSize());
		return new PageImpl<>(query.getResultList(), page, totalRows);
	}

	@Override
	public List<Employee> findEmployeesInTeamByTeamId(Long teamId, Pageable page) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
		CriteriaQuery<Employee> criteriaQuery = criteriaBuilder.createQuery(Employee.class);
		Root<Employee> root = criteriaQuery.from(Employee.class);
		Join<Employee, EmployeeTeam> employeeTeamJoin = root.join(Employee_.employeeTeams);
		Join<Employee, User> user = root.join(Employee_.user);

		List<Predicate> predicates = new ArrayList<>();

		predicates.add(criteriaBuilder.equal(root.get(Employee_.ACCOUNT_STATUS), AccountStatus.ACTIVE));
		predicates.add(criteriaBuilder.equal(user.get(User_.isActive), true));
		predicates.add(criteriaBuilder.equal(employeeTeamJoin.get(EmployeeTeam_.team).get(Team_.teamId), teamId));

		Predicate[] predArray = new Predicate[predicates.size()];
		predicates.toArray(predArray);
		criteriaQuery.where(predArray);

		criteriaQuery.groupBy(root.get(Employee_.employeeId));
		criteriaQuery.orderBy(QueryUtils.toOrders(Sort.by(Sort.Direction.ASC, "firstName"), root, criteriaBuilder));

		TypedQuery<Employee> query = entityManager.createQuery(criteriaQuery);
		query.setFirstResult(page.getPageNumber() * page.getPageSize());
		query.setMaxResults(page.getPageSize());
		return query.getResultList();
	}

	@Override
	public List<Team> findTeamsManagedByUser(Long userId, boolean isActive) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
		CriteriaQuery<Team> criteriaQuery = criteriaBuilder.createQuery(Team.class);
		Root<EmployeeTeam> root = criteriaQuery.from(EmployeeTeam.class);

		Join<EmployeeTeam, Team> teamJoin = root.join(EmployeeTeam_.TEAM);

		List<Predicate> predicates = new ArrayList<>();
		predicates.add(
				criteriaBuilder.equal(root.get(EmployeeTeam_.EMPLOYEE).get(Employee_.USER).get(User_.USER_ID), userId));
		predicates.add(criteriaBuilder.isTrue(root.get(EmployeeTeam_.IS_SUPERVISOR)));

		predicates.add(criteriaBuilder.equal(teamJoin.get(Team_.IS_ACTIVE), isActive));

		criteriaQuery.select(teamJoin)
			.where(predicates.toArray(new Predicate[0]))
			.orderBy(criteriaBuilder.asc(teamJoin.get(Team_.TEAM_NAME)));

		TypedQuery<Team> typedQuery = entityManager.createQuery(criteriaQuery);
		return typedQuery.getResultList();
	}

	@Override
	public List<Employee> findEmployeesByTeamIds(List<Long> teamIds) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
		CriteriaQuery<Employee> criteriaQuery = criteriaBuilder.createQuery(Employee.class);
		Root<Employee> root = criteriaQuery.from(Employee.class);
		Join<Employee, EmployeeTeam> employeeTeamJoin = root.join(Employee_.employeeTeams);
		Join<Employee, User> user = root.join(Employee_.user);

		List<Predicate> predicates = new ArrayList<>();
		predicates.add(criteriaBuilder.equal(user.get(User_.isActive), true));
		predicates.add(criteriaBuilder.equal(root.get(Employee_.ACCOUNT_STATUS), AccountStatus.ACTIVE));
		predicates.add(employeeTeamJoin.get(EmployeeTeam_.team).get(Team_.teamId).in(teamIds));

		Predicate[] predArray = new Predicate[predicates.size()];
		predicates.toArray(predArray);
		criteriaQuery.where(predArray);

		TypedQuery<Employee> query = entityManager.createQuery(criteriaQuery);
		return query.getResultList();
	}

	@Override
	public List<Team> findTeamsByName(String keyword) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();

		CriteriaQuery<Team> criteriaQuery = criteriaBuilder.createQuery(Team.class);
		Root<Team> root = criteriaQuery.from(Team.class);

		List<Predicate> predicates = new ArrayList<>();
		predicates.add(criteriaBuilder.or(
				criteriaBuilder.like(criteriaBuilder.lower(root.get(Team_.teamName)), keyword.toLowerCase() + "%"),
				criteriaBuilder.like(criteriaBuilder.lower(root.get(Team_.teamName)),
						"% " + keyword.toLowerCase() + "%")));
		predicates.add(criteriaBuilder.equal(root.get(Team_.isActive), true));

		Predicate[] predArray = new Predicate[predicates.size()];
		predicates.toArray(predArray);
		criteriaQuery.where(predArray);
		TypedQuery<Team> typedQuery = entityManager.createQuery(criteriaQuery);
		return typedQuery.getResultList();
	}

	@Override
	public void deleteTeamById(Long teamId) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaDelete<Team> delete = cb.createCriteriaDelete(Team.class);
		Root<Team> root = delete.from(Team.class);

		delete.where(cb.equal(root.get(Team_.teamId), teamId));
		entityManager.createQuery(delete).executeUpdate();
	}

	public List<EmployeeTeam> findEmployeeTeamsByTeamId(Long teamId, List<Long> employeeId, boolean isSupervisor) {
		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
		CriteriaQuery<EmployeeTeam> criteriaQuery = criteriaBuilder.createQuery(EmployeeTeam.class);
		Root<EmployeeTeam> root = criteriaQuery.from(EmployeeTeam.class);

		List<Predicate> predicates = new ArrayList<>();
		predicates.add(criteriaBuilder.equal(root.get(EmployeeTeam_.team).get(Team_.teamId), teamId));
		if (isSupervisor) {
			predicates.add(criteriaBuilder.equal(root.get(EmployeeTeam_.isSupervisor), true));
		}
		CriteriaBuilder.In<Long> inClause = criteriaBuilder
			.in(root.get(EmployeeTeam_.employee).get(Employee_.employeeId));
		for (Long id : employeeId) {
			inClause.value(id);
		}
		predicates.add(inClause);

		Predicate[] predArray = new Predicate[predicates.size()];
		predicates.toArray(predArray);
		criteriaQuery.where(predArray);
		TypedQuery<EmployeeTeam> typedQuery = entityManager.createQuery(criteriaQuery);
		return typedQuery.getResultList();
	}

	/**
	 * This method adds predicates to find the leading teams for an employee.
	 * @param predicates A list of predicates to apply in the query.
	 * @param criteriaBuilder The CriteriaBuilder to build the query.
	 * @param teamJoin The join between EmployeeTeam and Team entities.
	 * @param root The root of the criteria query.
	 * @param employeeId The ID of the employee (manager) to filter the teams.
	 */
	private void leadingTeamsByManagerIdFilter(List<Predicate> predicates, CriteriaBuilder criteriaBuilder,
			Join<EmployeeTeam, Team> teamJoin, Root<EmployeeTeam> root, Long employeeId) {
		Join<EmployeeTeam, Employee> employeeJoin = root.join(EmployeeTeam_.EMPLOYEE);

		predicates.add(criteriaBuilder.equal(employeeJoin.get(Employee_.EMPLOYEE_ID), employeeId));
		predicates.add(criteriaBuilder.isTrue(root.get(EmployeeTeam_.IS_SUPERVISOR)));
		predicates.add(criteriaBuilder.isTrue(teamJoin.get(Team_.IS_ACTIVE)));

	}

}
