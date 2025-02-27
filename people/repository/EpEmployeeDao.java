package com.skapp.enterprise.people.repository;

import com.skapp.community.peopleplanner.model.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface EpEmployeeDao
		extends JpaRepository<Employee, Long>, JpaSpecificationExecutor<Employee>, EpEmployeeRepository {

}
