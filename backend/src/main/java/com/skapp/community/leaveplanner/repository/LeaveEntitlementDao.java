package com.skapp.community.leaveplanner.repository;

import com.skapp.community.leaveplanner.model.LeaveEntitlement;
import com.skapp.community.leaveplanner.model.LeaveType;
import com.skapp.community.peopleplanner.model.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface LeaveEntitlementDao extends JpaRepository<LeaveEntitlement, Long>,
		JpaSpecificationExecutor<LeaveEntitlement>, LeaveEntitlementRepository {

	List<LeaveEntitlement> findByEmployeeAndValidFromAndValidToAndLeaveType(Employee employee, LocalDate validFrom,
			LocalDate validTo, LeaveType leaveType);

	@Query(nativeQuery = true,
			value = """
					SELECT COUNT(DISTINCT(employee)) FROM ( SELECT en.employee_id AS employee FROM  leave_entitlement en JOIN user ur ON en.employee_id = ur.user_id WHERE en.valid_from BETWEEN ?1 AND ?2  AND en.valid_to BETWEEN ?1 AND ?2 AND en.is_active = 1 AND ur.is_active = 1 ) le
					""")
	Long findEmployeeIdsCountCreatedWithValidDates(LocalDate validFrom, LocalDate validDate);

	@Query(nativeQuery = true,
			value = """
					SELECT DISTINCT(employee) FROM ( SELECT en.employee_id AS employee FROM leave_entitlement en JOIN user ur ON en.employee_id = ur.user_id WHERE en.valid_from BETWEEN ?1 AND ?2  AND en.valid_to BETWEEN ?1 AND ?2 AND en.is_active = 1 AND ur.is_active = 1 ORDER BY en.created_date ) le LIMIT ?3 OFFSET ?4
					""")
	List<Long> findEmployeeIdsCreatedWithValidDates(LocalDate validFrom, LocalDate validDate, int limit, long offset);

	@Query(nativeQuery = true, value = """
			SELECT
			 employeeId
			FROM (
			  SELECT
			    DISTINCT le.employee_id AS employeeId,
			    e.first_name AS name
			  FROM employee e
			  JOIN leave_entitlement le ON e.employee_id = le.employee_id
			  JOIN user u ON e.employee_id = u.user_id
			  LEFT JOIN employee_team et ON e.employee_id = et.employee_id
			  LEFT JOIN team t ON et.team_id = t.team_id
			  LEFT JOIN job_family j ON e.job_family_id = j.job_family_id
			  JOIN leave_type lt ON le.leave_type_id = lt.type_id
			  WHERE
			    le.leave_type_id IN (?1)
			    AND u.is_active = 1
			    AND (e.job_family_id = ?4 or ?4 is null)
			    AND (t.team_id = ?5 or ?5 is null)
			    AND le.is_active = 1
			    AND le.valid_from <= ?3
			    AND le.valid_to >= ?2
			  GROUP BY e.employee_id, e.first_name
			  ORDER BY e.first_name
			  LIMIT ?6 OFFSET ?7 ) AS employees
			""")
	List<Long> findEmployeeIdsWithLeaveEntitlement(List<Long> leaveTypeIds, LocalDate startDate, LocalDate endDate,
			Long jobFamilyId, Long teamId, int limit, long offset);

	@Query(nativeQuery = true, value = """
			SELECT
			  COUNT(DISTINCT(e.employee_id))
			FROM employee e
			  JOIN leave_entitlement le ON e.employee_id = le.employee_id
			  JOIN user u ON e.employee_id = u.user_id
			  JOIN employee_team et ON e.employee_id = et.employee_id
			  JOIN team t ON et.team_id = t.team_id
			  JOIN job_family j ON e.job_family_id = j.job_family_id
			  JOIN leave_type lt ON le.leave_type_id = lt.type_id
			WHERE
			  le.leave_type_id IN (?1)
			  AND u.is_active = 1
			  AND (e.job_family_id = ?4 or ?4 is null)
				AND (t.team_id = ?5 or ?5 is null)
				AND le.is_active = 1
				AND le.valid_from <= ?3
				AND le.valid_to >= ?2
			""")
	Long findEmployeeIdsCountWithLeaveEntitlements(List<Long> leaveTypeIds, LocalDate startDate, LocalDate endDate,
			Long jobFamilyId, Long teamId);

	List<LeaveEntitlement> findAllByEmployeeAndLeaveTypeAndIsActiveTrue(Employee employee, LeaveType leaveType);

	List<LeaveEntitlement> findAllByLeaveType(LeaveType leaveType);

	List<LeaveEntitlement> findByEmployee_EmployeeId(Long employeeId);

}
