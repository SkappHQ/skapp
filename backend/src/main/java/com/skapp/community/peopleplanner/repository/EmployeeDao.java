package com.skapp.community.peopleplanner.repository;

import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.JobFamily;
import com.skapp.community.peopleplanner.model.JobTitle;
import com.skapp.community.peopleplanner.type.AccountStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface EmployeeDao
		extends JpaRepository<Employee, Long>, JpaSpecificationExecutor<Employee>, EmployeeRepository {

	List<Employee> findByJobFamilyAndJobTitle(JobFamily jobFamily, JobTitle jobTitle);

	Optional<Employee> findByEmployeeId(Long employeeId);

	Employee findEmployeeByEmployeeId(Long employeeId);

	List<Employee> findByIdentificationNo(String identificationNo);

	Employee findEmployeeByEmployeeIdAndUserIsActiveTrue(Long primaryManager);

	Employee getEmployeeByEmployeeId(long employeeId);

	long countByAccountStatus(AccountStatus accountStatus);

	long countByAccountStatusIn(Set<AccountStatus> accountStatuses);

	boolean existsByEmployeeIdAndAccountStatusIn(Long userId, Set<AccountStatus> accountStatuses);

	List<Employee> findByAccountStatusIn(Set<AccountStatus> accountStatuses);

	List<Employee> findByEmployeeIdInAndAccountStatusIn(List<Long> userIds, Set<AccountStatus> active);

}
