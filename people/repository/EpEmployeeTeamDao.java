package com.skapp.enterprise.people.repository;

import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.EmployeeTeam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EpEmployeeTeamDao extends JpaRepository<EmployeeTeam, Long> {

	List<EmployeeTeam> findByEmployeeInAndIsSupervisorTrue(List<Employee> employees);

}
