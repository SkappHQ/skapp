package com.skapp.community.leaveplanner.controller.v1;

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
import com.skapp.community.leaveplanner.service.LeaveAnalyticsService;
import com.skapp.community.peopleplanner.payload.request.EmployeeFilterDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/leave/analytics")
public class LeaveAnalyticsController {

	private final LeaveAnalyticsService leaveAnalyticsService;

	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_LEAVE_MANAGER')")
	@GetMapping(value = "/leave-trend", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> getLeaveTrends(@Valid LeaveTrendFilterDto leaveTrendFilterDto) {
		return new ResponseEntity<>(leaveAnalyticsService.getLeaveTrends(leaveTrendFilterDto), HttpStatus.OK);
	}

	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ROLE_LEAVE_MANAGER')")
	@GetMapping(value = "/leave-type-breakdown", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> getLeaveTypeBreakDown(@RequestParam(required = false) List<Long> typeIds,
			@RequestParam(required = false) List<Long> teamIds) {
		return new ResponseEntity<>(leaveAnalyticsService.getLeaveTypeBreakdown(typeIds, teamIds), HttpStatus.OK);
	}

	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_LEAVE_MANAGER')")
	@GetMapping(value = "/onleave", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> getEmployeesOnLeave(
			@Valid EmployeesOnLeaveFilterDto employeesOnLeaveFilterDto) {
		ResponseEntityDto response = leaveAnalyticsService.getEmployeesOnLeave(employeesOnLeaveFilterDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ROLE_LEAVE_MANAGER')")
	@GetMapping(value = "/leave-utilization", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> getEmployeeLeaveUtilization(
			@Valid LeaveUtilizationFilterDto leaveUtilizationFilterDto) {
		ResponseEntityDto response = leaveAnalyticsService.getEmployeeLeaveUtilization(leaveUtilizationFilterDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_LEAVE_MANAGER')")
	@GetMapping(value = "/organization/leave-trend", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> getOrganizationLeaveTrendForTheYear(
			@Valid OrganizationLeaveTrendForTheYearFilterDto organizationLeaveTrendForTheYearFilterDto) {
		ResponseEntityDto response = leaveAnalyticsService
			.getOrganizationLeaveTrendForTheYear(organizationLeaveTrendForTheYearFilterDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ROLE_LEAVE_MANAGER')")
	@GetMapping(value = "/team-leave-trend", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> getTeamLeaveTrendForTheYear(
			@Valid TeamLeaveTrendForTheYearFilterDto teamLeaveTrendForTheYearFilterDto) {
		ResponseEntityDto response = leaveAnalyticsService
			.getTeamLeaveTrendForTheYear(teamLeaveTrendForTheYearFilterDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ROLE_LEAVE_MANAGER')")
	@GetMapping(value = "/team-leave-history/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> getTeamLeaveHistory(@PathVariable Long id,
			@Valid TeamLeaveHistoryFilterDto teamLeaveHistoryFilterDto) {
		ResponseEntityDto response = leaveAnalyticsService.getTeamLeaveHistory(id, teamLeaveHistoryFilterDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ROLE_LEAVE_MANAGER')")
	@GetMapping(value = "/team-leave-summary/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> getTeamLeaveSummary(@PathVariable Long id) {
		ResponseEntityDto response = leaveAnalyticsService.getTeamLeaveSummary(id);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ROLE_LEAVE_MANAGER')")
	@GetMapping(value = "/employee-leave-history/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> getEmployeeLeaveHistory(@PathVariable Long id,
			@Valid EmployeeLeaveHistoryFilterDto employeeLeaveHistoryFilterDto) {
		ResponseEntityDto response = leaveAnalyticsService.getEmployeeLeaveHistory(id, employeeLeaveHistoryFilterDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PreAuthorize("hasAnyRole('ROLE_LEAVE_MANAGER')")
	@GetMapping(value = "/leave-trend-manager", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> getManagerLeaveTrend(
			@Valid ManagerLeaveTrendFilterDto managerLeaveTrendFilterDto) {
		ResponseEntityDto response = leaveAnalyticsService.getManagerLeaveTrend(managerLeaveTrendFilterDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_LEAVE_MANAGER')")
	@GetMapping(value = "/organizational-leave-analytics-rates", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> getUsersLeaveAbsenceAndVacationUsageRate() {
		ResponseEntityDto responseDto = leaveAnalyticsService.getOrganizationalLeaveAnalytics();
		return new ResponseEntity<>(responseDto, HttpStatus.OK);
	}

	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_LEAVE_MANAGER')")
	@GetMapping(value = "/organizational-absence-rates", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> getOrganizationalAbsenceRate(@RequestParam List<Long> teamIds) {
		ResponseEntityDto responseDto = leaveAnalyticsService.getOrganizationalAbsenceRate(teamIds);
		return new ResponseEntity<>(responseDto, HttpStatus.OK);
	}

	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ROLE_LEAVE_MANAGER')")
	@GetMapping(value = "/employee-leave-entitlements/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> getCurrentUserLeaveEntitlements(@PathVariable Long id,
			@Valid LeaveEntitlementsFilterDto leaveEntitlementsFilterDto) {
		ResponseEntityDto responseDto = leaveAnalyticsService.getEmployeeLeaveEntitlements(id,
				leaveEntitlementsFilterDto);
		return new ResponseEntity<>(responseDto, HttpStatus.OK);
	}

	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ROLE_LEAVE_MANAGER')")
	@GetMapping(value = "/employee-entitlement", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> getEntitlementsByLeaveTypeJobRoleTeam(
			@Valid LeaveEntitlementEmployeeDto leaveEntitlementEmployeeDto) {
		ResponseEntityDto responseDto = leaveAnalyticsService
			.getEntitlementsByLeaveTypeJobRoleTeam(leaveEntitlementEmployeeDto);
		return new ResponseEntity<>(responseDto, HttpStatus.OK);
	}

	@PreAuthorize("hasAnyRole('ROLE_LEAVE_MANAGER')")
	@GetMapping(value = "/employee-custom-entitlements")
	public ResponseEntity<ResponseEntityDto> getCustomAllocationsByLeaveTypeJobRoleTeam(
			@Valid LeaveEntitlementEmployeeDto leaveEntitlementEmployeeDto) {
		ResponseEntityDto responseDto = leaveAnalyticsService
			.getCustomEntitlementsByLeaveTypeJobRoleTeam(leaveEntitlementEmployeeDto);
		return new ResponseEntity<>(responseDto, HttpStatus.OK);
	}

	@PreAuthorize("hasAnyRole('ROLE_LEAVE_MANAGER')")
	@GetMapping(value = "/employee-leave-requests")
	public ResponseEntity<ResponseEntityDto> getLeaveRequestsByLeaveTypeJobRoleTeam(
			@Valid LeaveEntitlementEmployeeDto leaveEntitlementEmployeeDto) {
		ResponseEntityDto responseDto = leaveAnalyticsService
			.getLeaveRequestsByLeaveTypeJobRoleTeam(leaveEntitlementEmployeeDto);
		return new ResponseEntity<>(responseDto, HttpStatus.OK);
	}

	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ROLE_LEAVE_MANAGER')")
	@GetMapping(value = "/employee-leave-report-file", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> getLeaveReportFile(
			@Valid LeaveEntitlementEmployeeDto leaveEntitlementEmployeeDto) {
		ResponseEntityDto responseDto = leaveAnalyticsService.getLeaveReportFile(leaveEntitlementEmployeeDto);
		return new ResponseEntity<>(responseDto, HttpStatus.OK);
	}

	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ROLE_LEAVE_MANAGER')")
	@GetMapping(value = "/onleave-by-team", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> getEmployeesOnLeaveByTeam(
			@Valid EmployeesOnLeaveFilterDto employeesOnLeaveFilterDto) {
		ResponseEntityDto response = leaveAnalyticsService.getEmployeesOnLeaveByTeam(employeesOnLeaveFilterDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PreAuthorize("hasAnyRole('ROLE_PEOPLE_MANAGER', 'ROLE_TIME_MANAGER', 'ROLE_LEAVE_MANAGER')")
	@GetMapping(value = "/manager-teams", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> getTeamsByTeamLead(@Valid TeamFilterDto teamFilterDto) {
		ResponseEntityDto response = leaveAnalyticsService.getTeamsByTeamLead(teamFilterDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PreAuthorize("hasAnyRole('ROLE_PEOPLE_MANAGER', 'ROLE_TIME_MANAGER', 'ROLE_LEAVE_MANAGER')")
	@GetMapping(value = "/manager-individuals", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> getIndividualsByManager(@Valid EmployeeFilterDto employeeFilterDto) {
		ResponseEntityDto response = leaveAnalyticsService.getIndividualsByManager(employeeFilterDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PreAuthorize("hasAnyRole('ROLE_PEOPLE_MANAGER', 'ROLE_TIME_MANAGER', 'ROLE_LEAVE_MANAGER')")
	@GetMapping(value = "/manager/team/resources", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> getTeamResourceAvailability(
			@Valid ManagerTeamResourceAvailabilityDto managerTeamResourceAvailabilityDto) {
		ResponseEntityDto responseEntityDto = leaveAnalyticsService
			.getTeamResourceAvailability(managerTeamResourceAvailabilityDto);
		return new ResponseEntity<>(responseEntityDto, HttpStatus.OK);
	}

	@PreAuthorize("hasAnyRole('ROLE_LEAVE_MANAGER')")
	@GetMapping(value = "all/leaves", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> getManagerAssignedLeaves(
			@Valid LeaveRequestFilterDto leaveRequestFilterDto) {
		ResponseEntityDto response = leaveAnalyticsService.getLeaves(leaveRequestFilterDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
