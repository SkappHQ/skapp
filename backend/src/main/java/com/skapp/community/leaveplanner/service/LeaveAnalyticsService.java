package com.skapp.community.leaveplanner.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.leaveplanner.payload.EmployeeLeaveHistoryFilterDto;
import com.skapp.community.leaveplanner.payload.EmployeesOnLeaveFilterDto;
import com.skapp.community.leaveplanner.payload.LeaveEntitlementEmployeeDto;
import com.skapp.community.leaveplanner.payload.LeaveEntitlementsFilterDto;
import com.skapp.community.leaveplanner.payload.LeaveRequestFilterDto;
import com.skapp.community.leaveplanner.payload.LeaveTrendFilterDto;
import com.skapp.community.leaveplanner.payload.LeaveUtilizationFilterDto;
import com.skapp.community.leaveplanner.payload.ManagerLeaveTrendFilterDto;
import com.skapp.community.leaveplanner.payload.ManagerTeamResourceAvailabilityDto;
import com.skapp.community.leaveplanner.payload.OrganizationLeaveTrendForTheYearFilterDto;
import com.skapp.community.leaveplanner.payload.TeamFilterDto;
import com.skapp.community.leaveplanner.payload.TeamLeaveHistoryFilterDto;
import com.skapp.community.leaveplanner.payload.TeamLeaveTrendForTheYearFilterDto;
import com.skapp.community.peopleplanner.payload.request.EmployeeFilterDto;
import jakarta.validation.Valid;
import lombok.NonNull;

import java.util.List;

public interface LeaveAnalyticsService {

	ResponseEntityDto getLeaveTrends(LeaveTrendFilterDto leaveTrendFilterDto);

	ResponseEntityDto getLeaveTypeBreakdown(List<Long> typeIds, List<Long> teamIds);

	ResponseEntityDto getEmployeesOnLeave(EmployeesOnLeaveFilterDto employeesOnLeaveFilterDto);

	ResponseEntityDto getEmployeeLeaveUtilization(LeaveUtilizationFilterDto leaveUtilizationFilterDto);

	ResponseEntityDto getOrganizationLeaveTrendForTheYear(
			OrganizationLeaveTrendForTheYearFilterDto organizationLeaveTrendForTheYearFilterDto);

	ResponseEntityDto getManagerLeaveTrend(ManagerLeaveTrendFilterDto managerLeaveTrendFilterDto);

	ResponseEntityDto getTeamLeaveHistory(Long id, TeamLeaveHistoryFilterDto teamLeaveHistoryFilterDto);

	ResponseEntityDto getTeamLeaveSummary(Long id);

	ResponseEntityDto getEmployeeLeaveHistory(@NonNull Long id,
			EmployeeLeaveHistoryFilterDto employeeLeaveHistoryFilterDto);

	ResponseEntityDto getTeamsByTeamLead(TeamFilterDto teamFilterDto);

	ResponseEntityDto getIndividualsByManager(EmployeeFilterDto employeeFilterDto);

	ResponseEntityDto getEmployeeLeaveEntitlements(@NonNull Long employeeId,
			LeaveEntitlementsFilterDto leaveEntitlementsFilterDto);

	ResponseEntityDto getOrganizationalLeaveAnalytics();

	ResponseEntityDto getOrganizationalAbsenceRate(List<Long> teamIds);

	ResponseEntityDto getTeamLeaveTrendForTheYear(TeamLeaveTrendForTheYearFilterDto teamLeaveTrendForTheYearFilterDto);

	ResponseEntityDto getTeamResourceAvailability(
			ManagerTeamResourceAvailabilityDto managerTeamResourceAvailabilityDto);

	ResponseEntityDto getEntitlementsByLeaveTypeJobRoleTeam(LeaveEntitlementEmployeeDto leaveEntitlementEmployeeDto);

	ResponseEntityDto getLeaveReportFile(LeaveEntitlementEmployeeDto leaveEntitlementEmployeeDto);

	ResponseEntityDto getEmployeesOnLeaveByTeam(@Valid EmployeesOnLeaveFilterDto employeesOnLeaveFilterDto);

	ResponseEntityDto getLeaves(LeaveRequestFilterDto leaveRequestFilterDto);

	ResponseEntityDto getCustomEntitlementsByLeaveTypeJobRoleTeam(
			LeaveEntitlementEmployeeDto leaveEntitlementEmployeeDto);

	ResponseEntityDto getLeaveRequestsByLeaveTypeJobRoleTeam(LeaveEntitlementEmployeeDto leaveEntitlementEmployeeDto);

}
