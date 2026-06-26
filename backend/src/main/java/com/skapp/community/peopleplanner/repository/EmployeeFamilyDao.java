package com.skapp.community.peopleplanner.repository;

import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.EmployeeFamily;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmployeeFamilyDao
		extends JpaRepository<EmployeeFamily, Long>, JpaSpecificationExecutor<EmployeeFamily> {

	void deleteAllByEmployee(Employee employee);

	void deleteAllByFamilyIdIn(List<Long> familyIds);

}
