package com.skapp.enterprise.people.repository;

import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.EmployeeTeam;
import com.skapp.community.peopleplanner.model.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EpEmployeeTeamDao extends JpaRepository<EmployeeTeam, Long> {

	List<EmployeeTeam> findByEmployeeInAndIsSupervisorTrue(List<Employee> employees);

	List<EmployeeTeam> findByEmployeeAndIsSupervisorTrue(Employee currentSupervisor);

	Optional<EmployeeTeam> findByEmployeeAndTeam(Employee newSupervisor, Team team);

}
