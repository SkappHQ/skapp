package com.skapp.community.peopleplanner.util;

import com.skapp.community.common.exception.EntityNotFoundException;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.model.User;
import com.skapp.community.common.model.User_;
import com.skapp.community.common.type.Role;
import com.skapp.community.common.type.RoleLevel;
import com.skapp.community.peopleplanner.constant.PeopleMessageConstant;
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
import com.skapp.community.peopleplanner.type.AccountStatus;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.From;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import org.springframework.util.CollectionUtils;

import java.util.ArrayList;
import java.util.EnumSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

public class PeopleUtil {

	private static final String RESTRICTION_SEPARATOR = ",";

	private PeopleUtil() {
		throw new IllegalStateException("Illegal instantiate");
	}

	/**
	 * return the given word with first letter uppercase
	 * @param word input word
	 * @return word
	 */
	public static String makeFirstLetterUpper(String word) {
		return word.substring(0, 1).toUpperCase() + word.substring(1).toLowerCase();
	}

	public static String getSearchString(String keyword) {
		return keyword.toLowerCase() + "%";
	}

	public static Predicate notGuestEmployeePredicate(CriteriaBuilder criteriaBuilder,
			Join<Employee, EmployeeRole> roleJoin) {
		return criteriaBuilder.or(roleJoin.get(EmployeeRole_.pmRole).isNull(),
				criteriaBuilder.notEqual(roleJoin.get(EmployeeRole_.pmRole), Role.PM_GUEST_EMPLOYEE));
	}

	public static List<Predicate> buildEmployeeScopePredicates(CriteriaBuilder criteriaBuilder,
			CriteriaQuery<?> criteriaQuery, From<?, Employee> employee, List<Long> teamIds, Long supervisorEmployeeId) {
		return buildEmployeeScopePredicates(criteriaBuilder, criteriaQuery, employee, teamIds, supervisorEmployeeId,
				false);
	}

	public static List<Predicate> buildEmployeeScopePredicates(CriteriaBuilder criteriaBuilder,
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

	public static void validateUserIsSupervisor(List<Team> teams, User user) {
		List<Long> notSupervisingTeams = teams.stream()
			.filter(team -> team.getEmployees()
				.stream()
				.noneMatch(emp -> emp.getEmployee().getEmployeeId().equals(user.getEmployee().getEmployeeId())
						&& emp.getIsSupervisor()))
			.map(Team::getTeamId)
			.toList();
		if (!notSupervisingTeams.isEmpty()) {
			throw new ModuleException(PeopleMessageConstant.PEOPLE_ERROR_USER_IS_NOT_SUPERVISOR_FOR_SELECTED_TEAMS,
					new String[] { notSupervisingTeams.toString() });
		}
	}

	public static void validateTeamsExist(List<Long> teamIds, List<Team> teams) {
		List<Long> unavailableTeams = teamIds.stream()
			.filter(teamId -> teams.stream().noneMatch(t -> t.getTeamId().equals(teamId)))
			.toList();
		if (!unavailableTeams.isEmpty()) {
			throw new EntityNotFoundException(PeopleMessageConstant.PEOPLE_ERROR_TEAM_NOT_FOUND,
					new String[] { unavailableTeams.toString() });
		}
	}

	public static List<EmployeeManager> filterManagersByRoles(List<EmployeeManager> managers, List<Role> roles) {
		if (roles == null || roles.isEmpty()) {
			return List.of();
		}
		return managers.stream().filter(manager -> {
			if (manager == null || manager.getManager() == null || manager.getManager().getEmployeeRole() == null) {
				return false;
			}
			var employeeRole = manager.getManager().getEmployeeRole();
			return (employeeRole.getPeopleRole() != null && roles.contains(employeeRole.getPeopleRole()))
					|| (employeeRole.getAttendanceRole() != null && roles.contains(employeeRole.getAttendanceRole()))
					|| (employeeRole.getLeaveRole() != null && roles.contains(employeeRole.getLeaveRole()))
					|| (employeeRole.getEsignRole() != null && roles.contains(employeeRole.getEsignRole()))
					|| (employeeRole.getOkrRole() != null && roles.contains(employeeRole.getOkrRole()));
		}).toList();
	}

	public static List<EmployeeManager> filterManagersByLeaveRoles(List<EmployeeManager> managers) {
		return filterManagersByRoles(managers, List.of(Role.LEAVE_ADMIN, Role.LEAVE_MANAGER));
	}

	public static List<EmployeeManager> filterManagersByAttendanceRoles(List<EmployeeManager> managers) {
		return filterManagersByRoles(managers, List.of(Role.ATTENDANCE_ADMIN, Role.ATTENDANCE_MANAGER));
	}

	public static Set<RoleLevel> parseRestrictions(String restrictions) {
		Set<RoleLevel> roleLevels = EnumSet.noneOf(RoleLevel.class);
		if (restrictions == null || restrictions.isBlank()) {
			return roleLevels;
		}

		for (String restriction : restrictions.split(RESTRICTION_SEPARATOR)) {
			String roleLevel = restriction.trim();
			if (roleLevel.isEmpty()) {
				continue;
			}
			roleLevels.add(RoleLevel.valueOf(roleLevel));
		}

		return roleLevels;
	}

	public static String toRestrictionsString(Set<RoleLevel> roleLevels) {
		if (roleLevels == null || roleLevels.isEmpty()) {
			return null;
		}

		return roleLevels.stream().map(RoleLevel::name).collect(Collectors.joining(RESTRICTION_SEPARATOR));
	}

	public static boolean isPermissionsChanged(EmployeeRole oldRole, EmployeeRole newRole) {
		if (oldRole == null || newRole == null) {
			return false;
		}
		return !Objects.equals(oldRole.getPeopleRole(), newRole.getPeopleRole())
				|| !Objects.equals(oldRole.getLeaveRole(), newRole.getLeaveRole())
				|| !Objects.equals(oldRole.getAttendanceRole(), newRole.getAttendanceRole())
				|| !Objects.equals(oldRole.getEsignRole(), newRole.getEsignRole())
				|| !Objects.equals(oldRole.getPmRole(), newRole.getPmRole())
				|| !Objects.equals(oldRole.getOkrRole(), newRole.getOkrRole())
				|| !Objects.equals(oldRole.getInvoiceRole(), newRole.getInvoiceRole())
				|| !Objects.equals(oldRole.getCrmRole(), newRole.getCrmRole())
				|| !Objects.equals(oldRole.getIsSuperAdmin(), newRole.getIsSuperAdmin());
	}

	public static void validateBillableRate(Double billableRate) {
		if (billableRate != null && billableRate <= 0) {
			throw new ModuleException(PeopleMessageConstant.PEOPLE_ERROR_INVALID_BILLABLE_RATE);
		}
	}

}
