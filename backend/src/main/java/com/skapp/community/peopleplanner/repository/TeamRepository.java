package com.skapp.community.peopleplanner.repository;

import com.skapp.community.common.model.User;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.EmployeeTeam;
import com.skapp.community.peopleplanner.model.Team;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface TeamRepository {

	List<Long> findSupervisorIdsByTeamId(Long id);

	List<Long> findMemberIdsByTeamId(Long id);

	List<EmployeeTeam> findSupervisorTeamsByTeamId(Long teamId, List<Long> employeeId);

	List<EmployeeTeam> findMemberTeamsByTeamId(Long teamId, List<Long> employeeId);

	List<Long> findLeadingTeamIdsByManagerId(Long employeeId);

	List<Team> findLeadingTeamsByManagerId(Long employeeId);

	Page<Employee> findEmployeesInManagerLeadingTeams(List<Long> teamIds, Pageable page, User currentUser);

	List<Employee> findEmployeesInTeamByTeamId(Long teamId, Pageable page);

	List<Team> findTeamsManagedByUser(Long userId, boolean isActive);

	List<Employee> findEmployeesByTeamIds(List<Long> teamIds);

	List<Team> findTeamsByName(String keyword);

	void deleteTeamById(Long teamId);

}
