package com.skapp.community.peopleplanner.util;

import com.skapp.community.common.exception.EntityNotFoundException;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.model.User;
import com.skapp.community.common.type.Role;
import com.skapp.community.peopleplanner.constant.PeopleMessageConstant;
import com.skapp.community.peopleplanner.model.EmployeeManager;
import com.skapp.community.peopleplanner.model.Team;

import java.util.List;

public class PeopleUtil {

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
		return managers.stream()
			.filter(manager -> roles.contains(manager.getManager().getEmployeeRole().getPeopleRole())
					|| roles.contains(manager.getManager().getEmployeeRole().getAttendanceRole())
					|| roles.contains(manager.getManager().getEmployeeRole().getLeaveRole())
					|| roles.contains(manager.getManager().getEmployeeRole().getEsignRole())
					|| roles.contains((manager.getManager().getEmployeeRole().getOkrRole())))
			.toList();
	}

	public static List<EmployeeManager> filterManagersByLeaveRoles(List<EmployeeManager> managers) {
		return filterManagersByRoles(managers, List.of(Role.LEAVE_ADMIN, Role.LEAVE_MANAGER));
	}

	public static List<EmployeeManager> filterManagersByAttendanceRoles(List<EmployeeManager> managers) {
		return filterManagersByRoles(managers, List.of(Role.ATTENDANCE_ADMIN, Role.ATTENDANCE_MANAGER));
	}

}
