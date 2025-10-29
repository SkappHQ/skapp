package com.skapp.community.leaveplanner.repository;

import com.skapp.community.leaveplanner.model.LeaveEntitlement;
import com.skapp.community.leaveplanner.model.LeaveType;
import com.skapp.community.leaveplanner.payload.LeaveEntitlementsFilterDto;
import com.skapp.community.leaveplanner.payload.LeaveReportDto;
import com.skapp.community.leaveplanner.payload.response.EmployeeCustomEntitlementReportExportDto;
import com.skapp.community.leaveplanner.payload.response.EmployeeCustomEntitlementResponseDto;
import com.skapp.community.leaveplanner.payload.response.EmployeeLeaveEntitlementReportExportDto;
import com.skapp.community.leaveplanner.payload.response.EntitlementBasicDetailsDto;
import com.skapp.community.peopleplanner.model.Employee;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public interface LeaveEntitlementRepository {

	List<LeaveEntitlement> findEntitlementsByEmployeeIdAndYear(Long employeeId,
			LeaveEntitlementsFilterDto leaveEntitlementsFilterDto);

	List<LeaveEntitlement> findByIdAndIsActive(Long id);

	List<LeaveEntitlement> findCustomLeavesById(Long id);

	List<Employee> findAllEmployeeIdsWithForwardingEntitlements(Long typeId, boolean isActive,
			LocalDate leaveCycleEndDate);

	List<LeaveEntitlement> findLeaveEntitlements(Long typeId, boolean isActive, LocalDate leaveCycleEndDate,
			Long employeeId);

	Page<LeaveEntitlement> findLeaveEntitlementsByLeaveTypesAndActiveState(List<Long> leaveTypes, boolean isActive,
			LocalDate leaveCycleEndDate, Pageable page);

	Page<LeaveEntitlement> findAllCustomEntitlements(String keyword, Pageable pageable, int year,
			List<Long> leaveTypeIds);

	Float findAllEmployeesAnnualEntitlementDaysByDateRangeQuery(Long typeId, LocalDate firstDateOfYear,
			LocalDate lastDateOfYear);

	LinkedHashMap<LeaveType, Long> findLeaveTypeAndEmployeeCountForTeam(Long id);

	Map<Long, Double> findLeaveTypeIdAllocatedLeaveDaysForTeam(Long id);

	List<LeaveEntitlement> findAllByEmployeeId(Long employeeId, LeaveEntitlementsFilterDto leaveEntitlementsFilterDto);

	List<LeaveReportDto> getEmployeeDetailsWithLeaveEntitlements(List<Long> leaveTypeIds, LocalDate cycleStartDay,
			LocalDate cycleEndDay, Long jobFamilyId, Long teamId, Pageable pageable, List<Long> employeeIds);

	List<LeaveEntitlement> getEmployeeLeaveBalanceForLeaveType(Long employeeId, Long typeId);

	List<EmployeeCustomEntitlementReportExportDto> generateEmployeeCustomEntitlementDetailedReport(
			List<Long> leaveTypeIds, LocalDate startDate, LocalDate endDate, Long jobFamilyId, Long teamId);

	Page<EmployeeCustomEntitlementResponseDto> generateEmployeeCustomEntitlementDetailedReportWithPagination(
			List<Long> leaveTypeIds, LocalDate startDate, LocalDate endDate, Long jobFamilyId, Long teamId,
			Pageable pageable);

	List<EmployeeLeaveEntitlementReportExportDto> getEmployeeLeaveEntitlementsDetailedReport(List<Long> leaveTypeIds,
			LocalDate startDate, LocalDate endDate, Long jobFamilyId, Long teamId);

	Long findEmployeeIdsCountCreatedWithValidDates(LocalDate validFrom, LocalDate validDate);

	List<Long> findEmployeeIdsCreatedWithValidDates(LocalDate validFrom, LocalDate validDate, int limit, long offset);

	List<Long> findEmployeeIdsWithLeaveEntitlement(List<Long> leaveTypeIds, LocalDate startDate, LocalDate endDate,
			Long jobFamilyId, Long teamId, int limit, long offset);

	Long findEmployeeIdsCountWithLeaveEntitlements(List<Long> leaveTypeIds, LocalDate startDate, LocalDate endDate,
			Long jobFamilyId, Long teamId);

	Page<Employee> findEmployeesWithEntitlements(LocalDate validFrom, LocalDate validTo, String keyword,
			Pageable pageable);

}
