package com.skapp.community.peopleplanner.repository;

import com.skapp.community.peopleplanner.model.EmployeePeriod;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeePeriodDao extends JpaRepository<EmployeePeriod, Long> {

	List<EmployeePeriod> findEmployeePeriodByEmployee_EmployeeId(Long employeeId, Sort sort);

	Optional<EmployeePeriod> findEmployeePeriodByEmployee_EmployeeIdAndIsActiveTrue(Long employeeId);

	void deleteAllByIdIn(List<Long> periodIds);

}
