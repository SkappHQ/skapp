package com.skapp.community.peopleplanner.repository;

import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.EmployeeTeam;
import com.skapp.community.peopleplanner.model.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeTeamDao extends JpaRepository<EmployeeTeam, Long>, EmployeeTeamRepository {

	List<EmployeeTeam> findEmployeeTeamsByTeam(Team team);

	List<EmployeeTeam> findEmployeeTeamsByEmployee(Employee employee);

	List<EmployeeTeam> findByEmployee(Employee employee);

	List<EmployeeTeam> findByTeamIn(Collection<Team> teams);

	void deleteAllByIdIn(List<Long> employeeTeamIds);

	List<EmployeeTeam> findByEmployeeAndIsSupervisorTrueAndTeamIsActiveTrue(Employee employee);

	Optional<EmployeeTeam> findByTeamAndEmployee(Team team, Employee employee);

}
