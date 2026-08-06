package com.skapp.community.leaveplanner.repository;

import com.skapp.community.leaveplanner.model.PolicyLeaveRequest;
import com.skapp.community.leaveplanner.type.LeaveRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;

@Repository
public interface PolicyLeaveRequestDao extends JpaRepository<PolicyLeaveRequest, Long>, PolicyLeaveRequestRepository {

	@Query("""
			SELECT SUM(plr.durationDays)
			FROM PolicyLeaveRequest plr
			WHERE plr.employee.employeeId = :employeeId
			AND plr.policy.id = :policyId
			AND plr.status IN :statuses
			AND plr.startDate BETWEEN :cycleStart AND :cycleEnd
			""")
	Double sumCommittedDaysForPolicyInCycle(@Param("employeeId") Long employeeId, @Param("policyId") Long policyId,
			@Param("statuses") Collection<LeaveRequestStatus> statuses, @Param("cycleStart") LocalDate cycleStart,
			@Param("cycleEnd") LocalDate cycleEnd);

	@Query("""
			SELECT plr
			FROM PolicyLeaveRequest plr
			WHERE plr.employee.employeeId = :employeeId
			AND plr.status IN :statuses
			AND plr.startDate <= :endDate
			AND plr.endDate >= :startDate
			""")
	List<PolicyLeaveRequest> findOverlappingRequests(@Param("employeeId") Long employeeId,
			@Param("statuses") Collection<LeaveRequestStatus> statuses, @Param("startDate") LocalDate startDate,
			@Param("endDate") LocalDate endDate);

	List<PolicyLeaveRequest> findByEmployee_EmployeeIdAndStartDateBetweenOrderByStartDateDesc(Long employeeId,
			LocalDate startDate, LocalDate endDate);

}
